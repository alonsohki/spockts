import ts from 'typescript';
import minimatch from 'minimatch';
import path from 'path';
import processor from './processor';
import { Framework, getDefaultFramework, getFrameworkSpec, getKnownFrameworks, isKnownFramework } from './frameworks';
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
    const spec = getFrameworkSpec(framework);

    return spec.parser(sourceFile, context, (title, block, node) => {
      const processorOutput = processor(context, title, block);
      return processorOutput ? spec.generator(context, processorOutput, node) : node;
    });
  };
