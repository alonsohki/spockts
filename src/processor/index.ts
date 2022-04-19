import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { createState } from './state';
import { processLabeledStatement } from './process-labeled-statement';
import { isSpocktsBlock } from './is-spockts-block';
import { validate } from './validate';
import { CleanupInfo, ProcessorOutput, WhenThenBlock } from './output';
import { mergeSetupBlocks, processSetupBlock } from './process-setup-block';
import { looksLikeACondition, processCondition } from './conditions';
import { Block } from './block';
import { preprocess } from './preprocess';

const processor = (context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): ProcessorOutput | null => {
  if (!isSpocktsBlock(block)) return null;

  let state = createState();
  tsquery(block, 'LabeledStatement:has(Identifier[name=/^(given|setup|when|then|expect|cleanup|where|and)$/])').forEach(
    (labeledStatement: ts.LabeledStatement) => {
      processLabeledStatement(labeledStatement, state);
    }
  );

  validate(state, context);
  state = preprocess(state);

  //---------------------------------------------------------------------------
  // Setup
  const setupBlocks = state.blocks.filter((block) => block.type === 'setup').flatMap((block) => block.statements);
  const setup = processSetupBlock(context, setupBlocks);

  //---------------------------------------------------------------------------
  // When-Then
  const whenThenBlocks = state.blocks.filter((block) => ['when', 'then'].includes(block.type));
  const whenThen = whenThenBlocks.reduce((target, block, index) => {
    if (block.type === 'when') {
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
    } else if (block.type === 'then') {
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
    }
    return target;
  }, [] as WhenThenBlock[]);

  //---------------------------------------------------------------------------
  // Cleanup
  const cleanupStatements = state.blocks.filter((block) => block.type === 'cleanup').flatMap((block) => block.statements);
  const cleanup: CleanupInfo = {
    statements: cleanupStatements,
    async: cleanupStatements.some((statement) => tsquery(statement, 'AwaitExpression').length > 0),
  };

  return {
    title,
    setup,
    cleanup,
    whenThen,
    state,
  };
};

export default processor;
