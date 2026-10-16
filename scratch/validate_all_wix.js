const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirs = [
  path.join(__dirname, '..', 'wix-repo', 'src', 'public'),
  path.join(__dirname, '..', 'wix-repo', 'src', 'public', 'custom-elements')
];

let checked = 0;
for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const fullPath = path.join(dir, f);
    execSync(`node --check "${fullPath}"`);
    checked++;
  }
}

console.log(`Verified syntax for all ${checked} Wix custom element files! All clean.`);
