import ts from 'typescript';
import { Generator, GeneratorInput } from '.';

const generator: Generator = (context: ts.TransformationContext, input: GeneratorInput): ts.Node => {
  const factory = context.factory;

  const root = factory.createBlock([...input.state.blocks.flatMap((x) => x.statements)], true);
  return root;
};

export default generator;
