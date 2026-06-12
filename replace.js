const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

let count = 0;
walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/Themes & Motifs(?! The Wedding App)/gi, 'Themes & Motifs The Wedding App');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    count++;
    console.log('Updated:', filePath);
  }
});
console.log('Total files updated:', count);
