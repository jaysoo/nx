import * as metroResolver from 'metro-resolver';
import { loadConfig, createMatchPath } from 'tsconfig-paths';
import type { MatchPath } from 'tsconfig-paths';

export function resolveRequest(
  _context: any,
  moduleName: string,
  platform: string | null
) {
  const { resolveRequest, ...context } = _context;
  try {
    return metroResolver.resolve(context, moduleName, platform);
  } catch {}
  const matcher = getMatcher();
  const match = matcher(moduleName);
  if (match) {
    return {
      type: 'sourceFile',
      filePath: match,
    };
  }
}

let matcher: MatchPath;
function getMatcher() {
  if (!matcher) {
    const result = loadConfig();
    if (result.resultType === 'success') {
      const { absoluteBaseUrl, paths } = result;
      matcher = createMatchPath(absoluteBaseUrl, paths);
    } else {
      throw new Error(`Could not load tsconfig for project`);
    }
  }
  return matcher;
}
