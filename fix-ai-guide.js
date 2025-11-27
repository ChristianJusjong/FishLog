const fs = require('fs');
const path = 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/ai-guide.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace literal \r\n with actual newlines
content = content.replace(/\\r\\n/g, '\n');

fs.writeFileSync(path, content);
console.log('Fixed line endings in ai-guide.tsx');
