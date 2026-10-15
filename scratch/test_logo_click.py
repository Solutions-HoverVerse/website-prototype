# Simulating the exact router logic currently in the JS files

knownSlugs = set([
    '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
    'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
    'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
])

slugAliasMap = {
    'biosafety': 'hover-biosafety',
    'living-heritage': 'hover-living'
}

test_scenarios = [
    ("https://hoververseai.wixstudio.com/my-site/platform", "/"),
    ("https://hoververseai.wixstudio.com/my-site/solutions", "/"),
    ("https://hoververseai.wixstudio.com/my-site/resources", "/"),
    ("https://hoververseai.wixstudio.com/my-site/about", "/"),
    ("https://hoververseai.wixstudio.com/my-site", "/"),
    ("https://www.hoververse.ai/platform", "/"),
]

for curr_url, raw_href in test_scenarios:
    # pathname extraction
    import urllib.parse
    parsed = urllib.parse.urlparse(curr_url)
    p = parsed.path
    
    topPathParts = [x for x in p.split('/') if x]
    sitePrefix = ('/' + topPathParts[0]) if (len(topPathParts) > 0 and topPathParts[0] not in knownSlugs) else ''
    
    # 1. Preprocessor
    # shadow.querySelectorAll('a[href]').forEach(a => {
    #   if (sitePrefix && h.startsWith('/')) {
    #     if (!h.startsWith(sitePrefix + '/') && h !== sitePrefix) {
    #       a.setAttribute('href', h === '/' ? sitePrefix : sitePrefix + h);
    #     }
    #   }
    # });
    h = raw_href
    if sitePrefix and h.startswith('/'):
        if not h.startswith(sitePrefix + '/') and h != sitePrefix:
            h = sitePrefix if h == '/' else sitePrefix + h
    
    preprocessed_href = h
    
    # 2. Click handler
    clicked_rawHref = preprocessed_href
    hashIndex = clicked_rawHref.find('#')
    hasHash = hashIndex != -1
    targetHash = clicked_rawHref[hashIndex + 1:] if hasHash else ''
    targetPath = clicked_rawHref[:hashIndex] if hasHash else clicked_rawHref
    
    currPath = p
    currSlug = currPath.replace(sitePrefix, '').strip('/')
    cleanTargetSlugRaw = targetPath.replace(sitePrefix, '').strip('/')
    cleanTargetSlug = slugAliasMap.get(cleanTargetSlugRaw, cleanTargetSlugRaw)
    
    # Cross-page navigation block
    fullDest = clicked_rawHref
    if cleanTargetSlugRaw in slugAliasMap:
        mappedTarget = (sitePrefix if sitePrefix else '') + '/' + cleanTargetSlug
        fullDest = mappedTarget + ('#' + targetHash if targetHash else '')
    elif sitePrefix and clicked_rawHref.startswith('/') and not clicked_rawHref.startswith(sitePrefix + '/'):
        fullDest = sitePrefix if clicked_rawHref == '/' else sitePrefix + clicked_rawHref
        
    print(f"Current: {curr_url}")
    print(f"  sitePrefix: '{sitePrefix}'")
    print(f"  preprocessed href: '{preprocessed_href}'")
    print(f"  final fullDest: '{fullDest}'")
    print(f"  Target URL: {parsed.scheme}://{parsed.netloc}{fullDest}")
    print()
