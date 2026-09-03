const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Node.Js/proj/boilerplate/packages/layout/src';

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Check if file uses alpha( but doesn't import it
  if (content.includes('alpha(') && !content.includes('alpha }') && !content.includes('{ alpha }') && !content.includes('alpha,')) {
    if (content.includes("'@mui/material/styles'")) {
      content = content.replace(/import\s+{([^}]*)}\s+from\s+'@mui\/material\/styles'/, (match, p1) => {
        return `import { ${p1.trim()}, alpha } from '@mui/material/styles'`;
      });
    } else {
      content = `import { alpha } from '@mui/material/styles'\n` + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
}

walk(targetDir, function(err, results) {
  if (err) throw err;
  results.forEach(processFile);
  console.log('Done!');
});
