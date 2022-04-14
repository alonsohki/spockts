import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { GeneratorInput } from '../generators';
import { createState } from './state';
import { processLabeledStatement } from './process-labeled-statement';

export type BlockType = 'given' | 'then' | 'expect' | 'when' | 'where';

const processor = (_context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): GeneratorInput => {
  const state = createState();
  tsquery(block, 'LabeledStatement:has(Identifier[name=/given|then|expect|when|where/])').forEach((labeledStatement: ts.LabeledStatement) => {
    processLabeledStatement(labeledStatement, state);
  });

  return {
    title,
    state,
  };
};

export default processor;
