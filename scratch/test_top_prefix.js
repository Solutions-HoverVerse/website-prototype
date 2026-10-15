function detectPrefix(testTopPath) {
  const knownPages = new Set([
    '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
    'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
    'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
  ]);
  const parts = testTopPath.split('/').filter(Boolean);
  if (parts.length > 0 && !knownPages.has(parts[0])) {
    return '/' + parts[0];
  }
  return '';
}

console.log('Case 1 (/my-site):', detectPrefix('/my-site'));
console.log('Case 2 (/my-site/):', detectPrefix('/my-site/'));
console.log('Case 3 (/my-site/platform):', detectPrefix('/my-site/platform'));
console.log('Case 4 (custom domain /):', detectPrefix('/'));
console.log('Case 5 (custom domain /platform):', detectPrefix('/platform'));
