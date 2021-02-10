import { normalize } from '@angular-devkit/core';
import { Tree, updateJson } from '@nrwl/devkit';

export function updateTsConfigsToJs(
  host: Tree,
  options: { projectRoot: string }
) {
  let updateConfigPath: string;

  const paths = {
    tsConfig: normalize(`${options.projectRoot}/tsconfig.json`),
    tsConfigLib: normalize(`${options.projectRoot}/tsconfig.lib.json`),
    tsConfigApp: normalize(`${options.projectRoot}/tsconfig.app.json`),
  };

  const getProjectType = (tree: Tree) => {
    if (tree.exists(paths.tsConfigApp)) {
      return 'application';
    }
    if (tree.exists(paths.tsConfigLib)) {
      return 'library';
    }

    throw new Error(
      `project is missing tsconfig.lib.json or tsconfig.app.json`
    );
  };

  updateJson(host, paths.tsConfig, (json) => {
    if (json.compilerOptions) {
      json.compilerOptions.allowJs = true;
    } else {
      json.compilerOptions = { allowJs: true };
    }
    return json;
  });

  const projectType = getProjectType(host);

  if (projectType === 'library') {
    updateConfigPath = paths.tsConfigLib;
  }
  if (projectType === 'application') {
    updateConfigPath = paths.tsConfigApp;
  }

  updateJson(host, updateConfigPath, (json) => {
    json.include = uniq([...json.include, '**/*.js']);
    json.exclude = uniq([...json.exclude, '**/*.spec.js']);

    return json;
  });
}

const uniq = <T extends string[]>(value: T) => [...new Set(value)] as T;
