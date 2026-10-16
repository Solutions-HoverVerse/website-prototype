const { execSync } = require('child_process');
const code = execSync('git -C wix-repo show fc170d2419543a38905cc881b605ce959ddf17e9~1:src/public/custom-elements/hoververse-platform.js', { encoding: 'utf-8' });
const matches = code.match(/src=["'][^"']+["']/g);
console.log('Image src in original Wix component:', matches);
