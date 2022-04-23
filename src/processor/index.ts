import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { createState, State } from './state';
import { processLabeledStatement } from './process-labeled-statement';
import { isSpocktsBlock } from './is-spockts-block';
import { validate } from './validate';
import { CleanupInfo, ProcessorOutput, WhenThenBlock, WhereInfo } from './output';
import { mergeSetupBlocks, processSetupBlock, SetupBlockInfo } from './process-setup-block';
import { looksLikeACondition, processCondition } from './conditions';
import { Block } from './block';
import { preprocess } from './preprocess';

const processSetup = (context: ts.TransformationContext, state: State): SetupBlockInfo => {
  const setupBlocks = state.blocks.filter((block) => block.type === 'setup').flatMap((block) => block.statements);
  return processSetupBlock(context, setupBlocks);
};

const processWhen =
  (context: ts.TransformationContext, whenThenBlocks: Block[]) =>
  (target: WhenThenBlock[], block: Block, index: number): void => {
    if (index > 0 && whenThenBlocks[index - 1].type === 'when') {
      // This was originally an 'and' block
      const prev = target[target.length - 1];
      prev.when = mergeSetupBlocks(prev.when, processSetupBlock(context, block.statements));
    } else {
      target.push({
        title: block.title,
        when: processSetupBlock(context, block.statements),
        then: [],
      });
    }
  };

const processThen =
  (context: ts.TransformationContext) =>
  (target: WhenThenBlock[], block: Block): void => {
    const thenConditions = block.statements.filter((s) => looksLikeACondition(s));
    const thenStatements = block.statements.filter((s) => !looksLikeACondition(s));
    const conditions = thenConditions.map(processCondition);
    const async = conditions.some((condition) => condition.async);

    target[target.length - 1].then.push({
      title: block.title,
      async,
      setup: processSetupBlock(context, thenStatements),
      conditions,
    });
  };

const processWhenThen = (context: ts.TransformationContext, state: State): WhenThenBlock[] => {
  const whenThenBlocks = state.blocks.filter((block) => ['when', 'then'].includes(block.type));
  const when = processWhen(context, whenThenBlocks);
  const then = processThen(context);

  return whenThenBlocks.reduce((target, block, index) => {
    if (block.type === 'when') when(target, block, index);
    else if (block.type === 'then') then(target, block);
    return target;
  }, [] as WhenThenBlock[]);
};

const processCleanup = (state: State): CleanupInfo => {
  const cleanupStatements = state.blocks.filter((block) => block.type === 'cleanup').flatMap((block) => block.statements);
  return {
    statements: cleanupStatements,
    async: cleanupStatements.some((statement) => tsquery(statement, 'AwaitExpression').length > 0),
  };
};

const processWhere = (context: ts.TransformationContext, state: State): WhereInfo => {
  const factory = context.factory;
  const whereBlocks = state.blocks.filter((block) => block.type === 'where');
  return {
    cases: [],
  };
};

const processor = (context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): ProcessorOutput | null => {
  if (!isSpocktsBlock(block)) return null;

  let state = createState();
  tsquery(block, 'LabeledStatement:has(Identifier[name=/^(given|setup|when|then|expect|cleanup|where|and)$/])').forEach(
    (labeledStatement: ts.LabeledStatement) => {
      processLabeledStatement(labeledStatement, state);
    }
  );

  validate(state, context);
  const processedState = preprocess(state);

  return {
    title,
    setup: processSetup(context, processedState),
    cleanup: processCleanup(processedState),
    whenThen: processWhenThen(context, processedState),
    where: processWhere(context, processedState),
  };
};

export default processor;
