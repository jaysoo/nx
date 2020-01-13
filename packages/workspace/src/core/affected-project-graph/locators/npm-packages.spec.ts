import { getTouchedNpmPackages } from './npm-packages';
import { NxJson } from '../../shared-interfaces';
import { WholeFileChange } from '../..//file-utils';
import { DiffType } from '../../../utils/json-diff';
import { AllProjectsTouched } from '../affected-project-graph-models';

describe('getTouchedNpmPackages', () => {
  let workspaceJson;
  let nxJson: NxJson<string[]>;
  beforeEach(() => {
    workspaceJson = {
      projects: {
        proj1: {},
        proj2: {}
      }
    };
    nxJson = {
      implicitDependencies: {
        'package.json': {
          dependencies: ['proj1'],
          some: {
            'deep-field': ['proj2']
          }
        }
      },
      npmScope: 'scope',
      projects: {
        proj1: {},
        proj2: {}
      }
    };
  });

  it('should handle json changes', () => {
    const result = getTouchedNpmPackages(
      [
        {
          file: 'package.json',
          mtime: 0,
          ext: '.json',
          getChanges: () => [
            {
              type: DiffType.Modified,
              path: ['dependencies', 'happy-nrwl'],
              value: {
                lhs: '0.0.1',
                rhs: '0.0.2'
              }
            }
          ]
        }
      ],
      workspaceJson,
      nxJson,
      {
        dependencies: {
          'happy-nrwl': '0.0.2'
        }
      }
    );
    expect(result).toMatchObject({ projects: ['happy-nrwl'] });
  });

  it('should handle whole file changes', () => {
    const result = getTouchedNpmPackages(
      [
        {
          file: 'package.json',
          mtime: 0,
          ext: '.json',
          getChanges: () => [new WholeFileChange()]
        }
      ],
      workspaceJson,
      nxJson,
      {
        dependencies: {
          'happy-nrwl': '0.0.1',
          'awesome-nrwl': '0.0.1'
        }
      }
    );
    expect(result).toMatchObject({ projects: ['happy-nrwl', 'awesome-nrwl'] });
  });

  it('should mark all projects as touched if a package was deleted', () => {
    const result = getTouchedNpmPackages(
      [
        {
          file: 'package.json',
          mtime: 0,
          ext: '.json',
          getChanges: () => [
            {
              type: DiffType.Deleted,
              path: ['dependencies', 'sad-nrwl'],
              value: {
                lhs: '0.0.1',
                rhs: undefined
              }
            }
          ]
        }
      ],
      workspaceJson,
      nxJson
    );
    expect(result).toBeInstanceOf(AllProjectsTouched);
  });
});
