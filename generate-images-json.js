// ./generate-images-json-recursive.js
const fs = require('fs');
const path = require('path');

const galleryDir = path.resolve(__dirname, './images/gallery');
const outputFile = path.resolve(__dirname, './images/images.json');

function isImage(name) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}

function walkFolderCollectImages(folderPath, prefix = '') {
  // возвращаем пути относительно корня папки (prefix может быть '')
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  let out = [];
  for (const it of items) {
    const full = path.join(folderPath, it.name);
    if (it.isDirectory()) {
      out = out.concat(walkFolderCollectImages(full, path.posix.join(prefix, it.name)));
    } else if (it.isFile() && isImage(it.name)) {
      const rel = prefix ? path.posix.join(prefix, it.name) : it.name;
      out.push(rel);
    }
  }
  return out;
}

if (!fs.existsSync(galleryDir)) {
  console.error(`Gallery directory not found: ${galleryDir}`);
  process.exit(1);
}

const entries = fs.readdirSync(galleryDir, { withFileTypes: true });
const result = {};

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const folderName = entry.name;
  const folderPath = path.join(galleryDir, folderName);
  const images = walkFolderCollectImages(folderPath).map(s => s.trim()).sort((a,b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
  result[folderName] = images;
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');

console.log(`✅ Wrote ${outputFile} — folders: ${Object.keys(result).length}`);


