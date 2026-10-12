const fs = require('fs');
let lines = fs.readFileSync('src/app/teacher/dashboard/tests/practice/page.tsx', 'utf-8').split('\n');
lines[250] = '                  <Link href="/teacher/dashboard/tests/create?mode=bulk"';
lines[251] = '';
lines[252] = '';
fs.writeFileSync('src/app/teacher/dashboard/tests/practice/page.tsx', lines.join('\n'));
