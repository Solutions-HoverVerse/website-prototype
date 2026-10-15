const knownPages = new Set([
  '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
  'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
  'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
]);

function getPrefix(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && !knownPages.has(parts[0])) {
    return '/' + parts[0];
  }
  return '';
}

function resolveHref(href, pathname) {
  const prefix = getPrefix(pathname);
  if (!prefix) return href;
  if (href.startsWith(prefix + '/') || href === prefix) return href;
  if (href === '/') return prefix;
  if (href.startsWith('/')) return prefix + href;
  return href;
}

console.log('Test 1 (Preview Home):', resolveHref('/platform', '/my-site'));
console.log('Test 2 (Preview Solutions):', resolveHref('/platform#surfaceware', '/my-site/solutions'));
console.log('Test 3 (Preview Home Link):', resolveHref('/', '/my-site/solutions'));
console.log('Test 4 (Custom Domain Home):', resolveHref('/platform', '/'));
console.log('Test 5 (Custom Domain Platform):', resolveHref('/solutions', '/platform'));
console.log('Test 6 (External):', resolveHref('https://portal.hoververse.ai', '/my-site'));
console.log('Test 7 (Anchor):', resolveHref('#demo', '/my-site'));
