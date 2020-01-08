import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import * as stripJsonComments from 'strip-json-comments';
import { readJsonInTree, NxJson } from '@nrwl/workspace';
import { runSchematic } from '../../utils/testing';

describe('app', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should update workspace.json', async () => {
    const tree = await runSchematic('app', { name: 'myApp' }, appTree);
    const workspaceJson = readJsonInTree(tree, '/workspace.json');

    expect(workspaceJson.projects['my-app'].root).toEqual('apps/my-app');
    expect(workspaceJson.projects['my-app-e2e'].root).toEqual(
      'apps/my-app-e2e'
    );
    expect(workspaceJson.defaultProject).toEqual('my-app');
  });

  it('should update nx.json', async () => {
    const tree = await runSchematic(
      'app',
      { name: 'myApp', tags: 'one,two' },
      appTree
    );
    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson).toEqual({
      npmScope: 'proj',
      projects: {
        'my-app': {
          tags: ['one', 'two'],
        },
        'my-app-e2e': {
          tags: [],
        },
      },
    });
  });

  it('should generate files', async () => {
    const tree = await runSchematic('app', { name: 'myApp' }, appTree);
    expect(tree.exists('apps/my-app/src/main.tsx')).toBeTruthy();
    expect(tree.exists('apps/my-app/src/app/app.tsx')).toBeTruthy();
    expect(tree.exists('apps/my-app/src/app/app.spec.tsx')).toBeTruthy();
    expect(tree.exists('apps/my-app/src/app/app.css')).toBeTruthy();

    const jestConfig = tree.readContent('apps/my-app/jest.config.js');
    expect(jestConfig).toContain('@nrwl/react/plugins/jest');

    const tsconfig = readJsonInTree(tree, 'apps/my-app/tsconfig.json');
    expect(tsconfig.extends).toEqual('../../tsconfig.json');
    expect(tsconfig.compilerOptions.types).toContain('jest');

    const tsconfigApp = JSON.parse(
      stripJsonComments(tree.readContent('apps/my-app/tsconfig.app.json'))
    );
    expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc');
    expect(tsconfigApp.extends).toEqual('./tsconfig.json');

    const tslintJson = JSON.parse(
      stripJsonComments(tree.readContent('apps/my-app/tslint.json'))
    );
    expect(tslintJson.extends).toEqual('../../tslint.json');

    expect(tree.exists('apps/my-app-e2e/cypress.json')).toBeTruthy();
    const tsconfigE2E = JSON.parse(
      stripJsonComments(tree.readContent('apps/my-app-e2e/tsconfig.e2e.json'))
    );
    expect(tsconfigE2E.compilerOptions.outDir).toEqual('../../dist/out-tsc');
    expect(tsconfigE2E.extends).toEqual('./tsconfig.json');
  });
});
