import { join, normalize, Path } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  formatFiles,
  generateProjectLint,
  Linter,
  names,
  NxJson,
  offsetFromRoot,
  toClassName,
  toFileName,
  updateJsonInTree,
} from '@nrwl/workspace';
import { updateWorkspaceInTree } from '@nrwl/workspace/src/utils/ast-utils';
import { toJS } from '@nrwl/workspace/src/utils/rules/to-js';
import init from '../init/init';
import { Schema } from './schema';
import { podInstallTask } from '../../utils/pod-install-task';

interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: Path;
  parsedTags: string[];
  className: string;
  lowerCaseName: string;
}

export default function (schema: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const options = normalizeOptions(host, schema);

    return chain([
      init({
        skipFormat: true,
      }),
      createApplicationFiles(options),
      updateNxJson(options),
      addProject(options),
      addJest(options),
      podInstallTask(join(options.appProjectRoot, 'ios')),
      formatFiles(options),
    ]);
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files/app`), [
      template({
        ...names(options.name),
        ...options,
        tmpl: '',
        offsetFromRoot: offsetFromRoot(options.appProjectRoot),
      }),
      options.unitTestRunner === 'none'
        ? filter((file) => file !== `/src/app/App.spec.tsx`)
        : noop(),
      move(options.appProjectRoot),
      options.js ? toJS() : noop(),
    ])
  );
}

function updateNxJson(options: NormalizedSchema): Rule {
  return updateJsonInTree<NxJson>('nx.json', (json) => {
    json.projects[options.projectName] = { tags: options.parsedTags };
    return json;
  });
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree((json) => {
    const architect: { [key: string]: any } = {};

    architect.build = {
      builder: '@nrwl/react-native:build',
      options: {
        entryFile: 'index.js',
        outputPath: join(normalize('dist'), options.appProjectRoot),
      },
    };

    architect.serve = {
      builder: '@nrwl/react-native:dev-server',
      options: {
        port: 8081,
      },
    };

    architect['run-ios'] = {
      builder: '@nrwl/react-native:run-ios',
      options: {
        port: 8081,
      },
    };

    architect.lint = generateProjectLint(
      normalize(options.appProjectRoot),
      join(normalize(options.appProjectRoot), 'tsconfig.app.json'),
      Linter.EsLint
    );

    json.projects[options.projectName] = {
      root: options.appProjectRoot,
      sourceRoot: join(options.appProjectRoot, 'src'),
      projectType: 'application',
      schematics: {},
      architect,
    };

    json.defaultProject = json.defaultProject || options.projectName;

    return json;
  });
}

function addJest(options: NormalizedSchema): Rule {
  return options.unitTestRunner === 'jest'
    ? externalSchematic('@nrwl/jest', 'jest-project', {
        project: options.projectName,
        supportTsx: true,
        skipSerializers: true,
        setupFile: 'none',
      })
    : noop();
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const appDirectory = options.directory
    ? `${toFileName(options.directory)}/${toFileName(options.name)}`
    : toFileName(options.name);

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = normalize(`apps/${appDirectory}`);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const className = toClassName(options.name);

  return {
    ...options,
    className,
    lowerCaseName: className.toLowerCase(),
    name: toFileName(options.name),
    projectName: appProjectName,
    appProjectRoot,
    parsedTags,
  };
}
