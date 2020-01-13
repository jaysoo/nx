import { isWholeFileChange, WholeFileChange } from '../../file-utils';
import { DiffType, isJsonChange, JsonChange } from '../../../utils/json-diff';
import {
  AllProjectsTouched,
  NoProjectsTouched,
  SubsetOfProjectsTouched,
  TouchedProjectLocator
} from '../affected-project-graph-models';

export const getTouchedNpmPackages: TouchedProjectLocator<
  WholeFileChange | JsonChange
> = (touchedFiles, workspaceJson, nxJson, packageJson) => {
  const packageJsonChange = touchedFiles.find(f => f.file === 'package.json');
  if (!packageJsonChange) return new NoProjectsTouched();

  const touched = [];
  const changes = packageJsonChange.getChanges();

  for (const c of changes) {
    if (
      isJsonChange(c) &&
      (c.path[0] === 'dependencies' || c.path[0] === 'devDependencies')
    ) {
      // If a package was deleted then a project could potentially
      // be affected but we just cannot locate the dependency.
      if (c.type === DiffType.Deleted) {
        return new AllProjectsTouched();
      } else {
        touched.push(c.path[1]);
      }
    } else if (isWholeFileChange(c)) {
      Object.keys({
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      }).forEach(p => {
        touched.push(p);
      });
    }
  }

  return new SubsetOfProjectsTouched(touched);
};
