import ts from 'typescript';

export type Block = {
  readonly title?: ts.StringLiteral;
} & (
  | {
      readonly type: 'where';
      readonly statements: ts.ExpressionStatement[];
    }
  | {
      readonly type: 'expect' | 'when' | 'then' | 'setup' | 'given' | 'cleanup' | 'and';
      readonly statements: ts.Statement[];
    }
);

export type BlockType = Block['type'];
