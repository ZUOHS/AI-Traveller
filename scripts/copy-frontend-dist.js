import fs from 'node:fs';
import path from 'node:path';

const sourceDir = path.resolve('frontend', 'dist');
const targetDir = path.resolve('backend', 'public');

const copyRecursive = (src, dest) => {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

if (!fs.existsSync(sourceDir)) {
  console.error(`Frontend build not found at ${sourceDir}. Run "npm run build:frontend" first.`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

copyRecursive(sourceDir, targetDir);

console.log(`Copied frontend build from ${sourceDir} to ${targetDir}`);
