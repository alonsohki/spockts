import ts from 'typescript';

export type Block = { title?: ts.StringLiteral } & (
  | {
      type: 'then' | 'expect' | 'where';
      statements: ts.ExpressionStatement[];
    }
  | {
      type: 'when' | 'setup' | 'given' | 'cleanup';
      statements: ts.Statement[];
    }
  | {
      type: 'and';
      statements: never;
    }
);

export type BlockType = Block['type'];
