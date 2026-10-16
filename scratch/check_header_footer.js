const { execSync } = require('child_process');
const code = execSync('git -C wix-repo show fc170d2419543a38905cc881b605ce959ddf17e9~1:src/public/custom-elements/hoververse-platform.js', { encoding: 'utf-8' });
console.log('Has <header>:', code.includes('<header'));
console.log('Has <footer id="contact">:', code.includes('<footer'));
console.log('Has <main>:', code.includes('<main'));
