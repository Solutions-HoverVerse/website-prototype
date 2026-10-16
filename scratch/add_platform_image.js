const fs = require('fs');
const path = require('path');

const platformPath = path.resolve(__dirname, '..', 'platform.html');
let content = fs.readFileSync(platformPath, 'utf-8');

// Target the terminal box in Section 4: Hover OS
const target = `<div style="border-radius:var(--r-xl);border:1px solid var(--line);overflow:hidden;background:var(--dark);box-shadow:0 30px 70px -42px rgba(16,21,27,.6)">`;

if (!content.includes(target)) {
  console.error('Target terminal block not found in platform.html');
  process.exit(1);
}

const imageBlock = `<!-- Aim, Hold, Commit Natural Interaction Visual -->
        <div style="border-radius:var(--r-xl);border:1px solid var(--line);overflow:hidden;background:var(--dark);box-shadow:0 24px 60px -35px rgba(16,21,27,.4);margin-bottom:24px;">
          <img src="assets/uploads/exec_1792077036365_Aim-hold-commit.jpg" alt="Aim, Hold, Commit Gesture Interaction Model" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;display:block;" loading="lazy" />
        </div>
        `;

content = content.replace(target, imageBlock + target);
fs.writeFileSync(platformPath, content, 'utf-8');
console.log('Successfully added Aim-hold-commit.jpg to platform.html');
