knownSlugs = set([
    '', 'home', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
    'hover-health', 'biosafety', 'hover-biosafety', 'living-heritage', 'hover-living', 'hover-sr',
    'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
])
slugAliasMap = {
    'biosafety': 'hover-biosafety',
    'living-heritage': 'hover-living'
}

def resolve(curr_url, raw_href):
    import urllib.parse
    p = urllib.parse.urlparse(curr_url).path
    parts = [x for x in p.split('/') if x]
    sitePrefix = ('/' + parts[0]) if (len(parts) > 0 and parts[0] not in knownSlugs) else ''
    
    hashIndex = raw_href.find('#')
    hasHash = hashIndex != -1
    targetHash = raw_href[hashIndex + 1:] if hasHash else ''
    targetPath = raw_href[:hashIndex] if hasHash else raw_href
    
    cleanTargetSlugRaw = targetPath.replace(sitePrefix, '').strip('/')
    
    if cleanTargetSlugRaw == '' or cleanTargetSlugRaw == 'home':
        fullDest = (sitePrefix + ('#' + targetHash if targetHash else '/')) if sitePrefix else ('/' + ('#' + targetHash if targetHash else ''))
    else:
        destSlug = slugAliasMap.get(cleanTargetSlugRaw, cleanTargetSlugRaw)
        fullDest = (sitePrefix if sitePrefix else '') + '/' + destSlug + ('#' + targetHash if targetHash else '')
    return fullDest

tests = [
    ('https://hoververseai.wixstudio.com/my-site/platform', '/'),
    ('https://hoververseai.wixstudio.com/my-site/solutions', '/'),
    ('https://hoververseai.wixstudio.com/my-site/resources', '/'),
    ('https://hoververseai.wixstudio.com/my-site/about', '/'),
    ('https://hoververseai.wixstudio.com/my-site/hover-biosafety', '/'),
    ('https://hoververseai.wixstudio.com/my-site/hover-living', '/'),
    ('https://hoververseai.wixstudio.com/my-site/platform', '/my-site/'),
    ('https://hoververseai.wixstudio.com/my-site/platform', '/my-site'),
    ('https://hoververseai.wixstudio.com/my-site/platform', '/solutions'),
    ('https://hoververseai.wixstudio.com/my-site/platform', '/biosafety'),
    ('https://hoververseai.wixstudio.com/my-site/platform', '/living-heritage'),
    ('https://www.hoververse.ai/platform', '/'),
    ('https://www.hoververse.ai/hover-biosafety', '/'),
    ('https://www.hoververse.ai/platform', '/solutions'),
]

for url, href in tests:
    dest = resolve(url, href)
    print(f'{url} + click \"{href}\" => \"{dest}\"')
