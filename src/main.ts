import ts from 'typescript';
import minimatch from 'minimatch';
import parsers from './parsers';
import path from 'path';
import processor from './processor';
import generators from './generators';
import { Framework, getDefaultFramework, getKnownFrameworks, isKnownFramework } from './frameworks';
import { Options } from './options';

export default (_program: ts.Program, options?: Options): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (sourceFile) => {
    if (options?.filePattern) {
      const filePattern = options.filePattern.startsWith('/') ? options.filePattern : path.resolve(process.cwd(), options.filePattern);
      const re = minimatch.makeRe(filePattern);
      if (!sourceFile.fileName.match(re)) return sourceFile;
    }

    if (options?.framework && !isKnownFramework(options.framework))
      throw new Error(`Unknown framework: "${options.framework}". Possible frameworks are: "${getKnownFrameworks().join('", "')}"`);
    const framework = (options?.framework as Framework) || getDefaultFramework();

    const parser = parsers[framework];
    const generator = generators[framework];

    return parser(sourceFile, context, (title, block) => generator(context, processor(context, title, block)));
  };
