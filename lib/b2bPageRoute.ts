export function encodeB2BPageId(route: string) {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').split('/').filter(Boolean).join('__');
}

export function decodeB2BPageId(pageId: string) {
  if (pageId === 'home') return '/';
  const path = pageId.split('__').filter(Boolean).join('/');
  return path ? `/${path}` : '/';
}
