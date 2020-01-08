import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { createDirectory } from '@nrwl/workspace/src/utils/fileutils';
import { writeFileSync } from 'fs';
import { getProjectRoot } from '../../utils/get-project-root';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { fork } from 'child_process';

export interface ReactNativeBuildOptions extends JsonObject {
  dev: boolean;
  platform: string;
  entryFile: string;
  outputPath: string;
  maxWorkers: number;
  sourceMap: boolean;
}

export interface ReactNativeBuildOutput {
  success: boolean;
}

export default createBuilder<ReactNativeBuildOptions>(run);

function run(
  options: ReactNativeBuildOptions,
  context: BuilderContext
): Observable<ReactNativeBuildOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) => runCliBuild(context.workspaceRoot, root, options)),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

function runCliBuild(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['bundle'],
      { cwd: projectRoot }
    );
    cp.on('error', (err) => {
      reject(err);
    });
    cp.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}
