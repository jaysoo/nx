import {
  chain,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';
import {
  addDepsToPackageJson,
  formatFiles,
  insert,
  updateJsonInTree
} from '@nrwl/workspace';
import {
  createSourceFile,
  isImportDeclaration,
  isStringLiteral,
  ScriptTarget
} from 'typescript';
import { ReplaceChange } from '@nrwl/workspace/src/utils/ast-utils';
import { relative } from 'path';
import { testingLibraryVersion } from '../../utils/versions';

const ignore = require('ignore');

export default function update(): Rule {
  return chain([
    displayInformation,
    updateDependencies,
    updateImports,
    formatFiles()
  ]);
}

function displayInformation(host: Tree, context: SchematicContext) {
  context.logger.info(stripIndents`
    React Testing Library has been repackaged as \`@testing-library/react\` as of version 8.
    
    We are replacing your \`react-testing-library\` imports with \`@testing-library/react\`.
    
    See: https://github.com/testing-library/react-testing-library/releases/tag/v8.0.0
  `);
}

function updateDependencies() {
  const removeOld = updateJsonInTree(
    'package.json',
    (json, context: SchematicContext) => {
      json.dependencies = json.dependencies || {};
      json.devDependencies = json.devDependencies || {};
      // Just in case user installed it to dependencies instead of devDependencies.
      delete json.dependencies['react-testing-library'];
      delete json.devDependencies['react-testing-library'];
      context.logger.info(`Removing \`react-testing-library\` as a dependency`);
      return json;
    }
  );
  const addNew = addDepsToPackageJson(
    {},
    { '@testing-library/react': testingLibraryVersion }
  );

  return chain([removeOld, addNew]);
}

function updateImports(host: Tree) {
  let ig = ignore().add(['*', '!*.ts']); // include only .ts files

  if (host.exists('.gitignore')) {
    ig = ig.add(host.read('.gitignore').toString());
  }

  host.visit(path => {
    if (ig && ig.ignores(relative('/', path))) {
      return;
    }

    const sourceFile = createSourceFile(
      path,
      host.read(path).toString(),
      ScriptTarget.Latest,
      true
    );
    const changes = [];
    sourceFile.statements.forEach(statement => {
      if (
        isImportDeclaration(statement) &&
        isStringLiteral(statement.moduleSpecifier)
      ) {
        const nodeText = statement.moduleSpecifier.getText(sourceFile);
        const modulePath = statement.moduleSpecifier
          .getText(sourceFile)
          .substr(1, nodeText.length - 2);
        if (modulePath === 'react-testing-library') {
          changes.push(
            new ReplaceChange(
              path,
              statement.moduleSpecifier.getStart(sourceFile),
              nodeText,
              `'@testing-library/react'`
            )
          );
        }
      }
    });
    insert(host, path, changes);
  });
}
