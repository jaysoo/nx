import {
  Rule,
  SchematicContext,
  TaskConfiguration,
  TaskConfigurationGenerator,
  TaskExecutorFactory,
  Tree,
} from '@angular-devkit/schematics';
import { Observable, of } from 'rxjs';
import { spawn } from 'child_process';
import * as os from 'os';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function podInstallTask(cwd: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    const engineHost = (context.engine.workflow as any)._engineHost;
    engineHost.registerTaskExecutor(createRunPodInstallTask());
    const packageInstall = context.addTask(new NodePackageInstallTask());
    context.addTask(new RunPodInstallTask(cwd), [packageInstall]);
  };
}

interface PodInstallTaskOptions {
  cwd: string;
}

class RunPodInstallTask
  implements TaskConfigurationGenerator<PodInstallTaskOptions> {
  constructor(private cwd: string) {}

  toConfiguration(): TaskConfiguration<PodInstallTaskOptions> {
    return {
      name: 'RunPodInstall',
      options: {
        cwd: this.cwd,
      },
    };
  }
}

function createRunPodInstallTask(): TaskExecutorFactory<PodInstallTaskOptions> {
  return {
    name: 'RunPodInstall',
    create: () => {
      return Promise.resolve(
        (options: PodInstallTaskOptions, context: SchematicContext) => {
          if (os.platform() !== 'darwin') {
            context.logger.info(
              'Skipping `pod install` on non-darwin platform'
            );
            return of();
          }

          context.logger.info(`Running \`pod install\` from "${options.cwd}"`);

          return new Observable((obs) => {
            spawn('pod', ['install'], {
              cwd: options.cwd,
              stdio: [0, 1, 2],
            }).on('close', (code: number) => {
              if (code === 0) {
                obs.next();
                obs.complete();
              } else {
                const message = `Running \`pod install\` failed, see above.\nDo you have CocoaPods (https://cocoapods.org/) installed?`;
                obs.error(new Error(message));
              }
            });
          });
        }
      );
    },
  };
}
