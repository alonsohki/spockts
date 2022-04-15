import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { createState } from './state';
import { processLabeledStatement } from './process-labeled-statement';
import { isSpocktsBlock } from './is-spockts-block';
import { validate } from './validate';
import { ProcessorOutput } from './output';

const processor = (context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): ProcessorOutput | null => {
  if (!isSpocktsBlock(block)) return null;

  const state = createState();
  tsquery(block, 'LabeledStatement:has(Identifier[name=/given|setup|when|then|expect|cleanup|where|and/])').forEach(
    (labeledStatement: ts.LabeledStatement) => {
      processLabeledStatement(labeledStatement, state);
    }
  );

  validate(state, context);

  return {
    title,
    state,
  };
};

export default processor;
