import ts from 'typescript';
import { BlockType } from '.';

const isKnownLabel: { [K in BlockType]: boolean } & { [K: string]: boolean } = {
  given: true,
  then: true,
  expect: true,
  when: true,
  where: true,
};

export const isSpocktsBlock = (block: ts.Block): boolean =>
  block.statements.length > 0 &&
  ts.isLabeledStatement(block.statements[0]) &&
  block.statements.every(
    (statement) => ts.isExpressionStatement(statement) || (ts.isLabeledStatement(statement) && isKnownLabel[statement.label.text])
  );
