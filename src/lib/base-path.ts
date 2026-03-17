export const BASE_PATH: string = '/sports';

export function withBasePath(path: string): string {
  if (!path.startsWith('/') || BASE_PATH === '/' || BASE_PATH === '') {
    return path;
  }

  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }

  return `${BASE_PATH}${path}`;
}
