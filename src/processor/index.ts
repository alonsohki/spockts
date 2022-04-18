import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { createState } from './state';
import { processLabeledStatement } from './process-labeled-statement';
import { isSpocktsBlock } from './is-spockts-block';
import { validate } from './validate';
import { ProcessorOutput, WhenThenBlock } from './output';
import { processSetupBlock } from './process-setup-block';
import { looksLikeACondition, processCondition } from './conditions';

const processor = (context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): ProcessorOutput | null => {
  if (!isSpocktsBlock(block)) return null;

  const state = createState();
  tsquery(block, 'LabeledStatement:has(Identifier[name=/^(given|setup|when|then|expect|cleanup|where|and)$/])').forEach(
    (labeledStatement: ts.LabeledStatement) => {
      processLabeledStatement(labeledStatement, state);
    }
  );

  validate(state, context);

  const setupBlocks = state.blocks.filter((block) => ['given', 'setup'].includes(block.type as string)).flatMap((block) => block.statements);
  const setup = processSetupBlock(context, setupBlocks);

  const whenThen = state.blocks.reduce((target, when, index) => {
    if (when.type === 'when') {
      const then = state.blocks[index + 1];
      if (then.type !== 'then') throw new Error(`Unexpected block type 'then' after a 'when' block`);

      const thenConditions = then.statements.filter((s) => looksLikeACondition(s));
      const thenStatements = then.statements.filter((s) => !looksLikeACondition(s));
      target.push({
        title: when.title,
        when: processSetupBlock(context, when.statements),
        then: {
          setup: processSetupBlock(context, thenStatements),
          conditions: thenConditions.map(processCondition),
        },
      });
    }
    return target;
  }, [] as WhenThenBlock[]);

  return {
    title,
    setup,
    whenThen,
    state,
  };
};

export default processor;
