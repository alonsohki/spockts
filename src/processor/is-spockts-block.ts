import ts from 'typescript';
import { BlockType } from '../block-types';

const isKnownLabel: { [K in BlockType]: boolean } & { [K: string]: boolean } = {
  given: true,
  setup: true,
  when: true,
  then: true,
  expect: true,
  cleanup: true,
  where: true,
  and: true,
};

export const isSpocktsBlock = (block: ts.Block): boolean =>
  block.statements.length > 0 &&
  ts.isLabeledStatement(block.statements[0]) &&
  block.statements.every(
    (statement) => ts.isExpressionStatement(statement) || (ts.isLabeledStatement(statement) && isKnownLabel[statement.label.text])
  );
