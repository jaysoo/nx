import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import { names, offsetFromRoot } from '@nrwl/workspace';
import { toJS } from '@nrwl/workspace/src/utils/rules/to-js';
import { NormalizedSchema } from '../schema';
import {
  createAppJsx,
  createStyleRules,
} from './create-application-files.helpers';

export function createApplicationFiles(options: NormalizedSchema): Rule {
  let styleSolutionSpecificAppFiles: string;
  if (options.styledModule) {
    styleSolutionSpecificAppFiles = './files/styled-module';
  } else if (options.style === 'styled-jsx') {
    styleSolutionSpecificAppFiles = './files/styled-jsx';
  } else if (options.globalCss) {
    styleSolutionSpecificAppFiles = './files/global-css';
  } else {
    styleSolutionSpecificAppFiles = './files/css-module';
  }

  const templateVariables = {
    ...names(options.name),
    ...options,
    tmpl: '',
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
    appContent: createAppJsx(options.name),
    styleContent: createStyleRules({
      isUsingJsxBasedSolution: !!options.styledModule,
      createHostBlock:
        !options.styledModule || options.styledModule === 'styled-jsx',
    }),
  };

  return chain([
    mergeWith(
      apply(url(`./files/common`), [
        template(templateVariables),
        move(options.appProjectRoot),
        options.js ? toJS() : noop(),
      ])
    ),
    mergeWith(
      apply(url(styleSolutionSpecificAppFiles), [
        template(templateVariables),
        move(options.appProjectRoot),
        options.unitTestRunner === 'none'
          ? filter((file) => file !== `/src/app/${options.fileName}.spec.tsx`)
          : noop(),
        options.js ? toJS() : noop(),
      ])
    ),
  ]);
}
