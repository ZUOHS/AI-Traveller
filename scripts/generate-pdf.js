import fs from 'node:fs';
import path from 'node:path';

import { mdToPdf } from 'md-to-pdf';

const repoUrl =
  process.env.REPO_URL ?? 'https://github.com/<your-account>/ai-traveller';

const readmePath = path.resolve('README.md');
const docsDir = path.resolve('docs');
const outputPath = path.join(docsDir, 'submission.pdf');

if (!fs.existsSync(readmePath)) {
  console.error('README.md not found，无法生成 PDF。');
  process.exit(1);
}

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const readmeContent = fs.readFileSync(readmePath, 'utf-8');
const composedMarkdown = `
# AI Traveller 提交材料

- 仓库地址：${repoUrl}
- 生成时间：${new Date().toISOString()}

---

${readmeContent}
`;

mdToPdf({ content: composedMarkdown }, { dest: outputPath })
  .then(() => {
    console.log(`PDF 已写入 ${outputPath}`);
  })
  .catch((error) => {
    console.error('生成 PDF 失败', error);
    process.exit(1);
  });
