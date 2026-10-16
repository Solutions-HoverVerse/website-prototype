const { execSync } = require('child_process');
const code = execSync('git -C wix-repo show fc170d2419543a38905cc881b605ce959ddf17e9~1:src/public/custom-elements/hoververse-platform.js', { encoding: 'utf-8' });
const lines = code.split('\n');
console.log('Total lines:', lines.length);
console.log('=== FIRST 40 LINES ===');
console.log(lines.slice(0, 40).join('\n'));
console.log('=== LAST 120 LINES ===');
console.log(lines.slice(-120).join('\n'));
