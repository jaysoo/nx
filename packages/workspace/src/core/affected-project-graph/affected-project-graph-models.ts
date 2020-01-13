import { NxJson } from '../shared-interfaces';
import { Change, FileChange } from '../file-utils';

export interface AffectedProjectGraphContext {
  workspaceJson: any;
  nxJson: NxJson<string[]>;
  touchedProjects: string[];
}

export class AllProjectsTouched {}

export class SubsetOfProjectsTouched {
  constructor(public projects: string[]) {}
}

export class NoProjectsTouched {}

export interface TouchedProjectLocator<T extends Change = Change> {
  (
    fileChanges: FileChange<T>[],
    workspaceJson?: any,
    nxJson?: NxJson<string[]>,
    packageJson?: any
  ): AllProjectsTouched | SubsetOfProjectsTouched | NoProjectsTouched;
}
