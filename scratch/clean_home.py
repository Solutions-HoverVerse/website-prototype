import re

home_files = [
    r"wix-repo\src\public\custom-elements\hoververse-home.js",
    r"wix-repo\src\public\hoververse-home.js"
]

for path in home_files:
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    # 1. Remove isFooterContainer check at top of connectedCallback
    guard_regex = re.compile(
        r'\s*// Detection: If <hoververse-home> is mistakenly mounted in Wix master footer container\s*const isFooterContainer = Boolean\(.*?\);\s*if \(isFooterContainer\) \{\s*this\.renderFooterOnly\(shadow\);\s*return;\s*\}',
        re.DOTALL
    )
    c = guard_regex.sub('', c)

    # 2. Remove renderFooterOnly method before closing of class HoververseHome
    method_regex = re.compile(
        r'\s*renderFooterOnly\(shadow\) \{.*?\}\s*(?=\}\s*\n\s*if \(!customElements\.get\(\'hoververse-home\'\)\))',
        re.DOTALL
    )
    c = method_regex.sub('\n', c)

    with open(path, "w", encoding="utf-8") as f:
        f.write(c)

    print(f"Cleaned {path}")
