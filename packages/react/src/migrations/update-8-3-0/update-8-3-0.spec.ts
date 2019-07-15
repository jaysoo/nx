import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { updateJsonInTree, readJsonInTree } from '@nrwl/workspace';

import * as path from 'path';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';

describe('Update 8-0-0', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    tree = Tree.empty();
    schematicRunner = new SchematicTestRunner(
      '@nrwl/react',
      path.join(__dirname, '../../../migrations.json')
    );
    tree = await schematicRunner
      .callRule(
        updateJsonInTree('package.json', () => ({
          dependencies: {},
          devDependencies: {
            'react-testing-library': '5.0.0'
          }
        })),
        tree
      )
      .toPromise();
  });

  describe('imports', () => {
    it(`should be migrate 'react-testing-library' to '@testing-library/react`, async () => {
      tree.create(
        'Hello.spec.ts',
        `
        import Hello from './Hello';
        import React from 'react';
        import { render } from 'react-testing-library';
        `
      );

      tree = await schematicRunner
        .runSchematicAsync('update-8.3.0', {}, tree)
        .toPromise();

      expect(tree.read('Hello.spec.ts').toString('utf-8')).toContain(stripIndents`
        import Hello from './Hello';
        import React from 'react';
        import { render } from '@testing-library/react';
      `);
    });
  });

  describe('dependencies', () => {
    it('should update dependencies', async () => {
      tree = await schematicRunner
        .runSchematicAsync('update-8.3.0', {}, tree)
        .toPromise();

      const result = readJsonInTree(tree, 'package.json');

      expect(result).toEqual(
        expect.objectContaining({
          devDependencies: expect.objectContaining({
            '@testing-library/react': '8.0.5'
          })
        })
      );

      expect(result.devDependencies['react-testing-library']).not.toBeDefined();
    });
  });
});
