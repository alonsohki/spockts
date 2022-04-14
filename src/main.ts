import ts from 'typescript';
import parsers from './parsers';
import generators from './generators';
import Framework from './frameworks';

export default (_program: ts.Program): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (sourceFile) => {
    const framework: Framework = 'jest';
    const parser = parsers[framework];
    const generator = generators[framework].bind(null, context);
    return parser(sourceFile, context, generator);
  };
