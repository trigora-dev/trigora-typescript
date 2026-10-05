import fs from 'node:fs';

const rootPath = 'package.json';
const root = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
if (root.pnpm?.overrides?.['@trigora/contracts'] !== 'link:../trigora/packages/contracts') {
  console.error('expected the local contracts override');
  process.exit(1);
}
delete root.pnpm.overrides['@trigora/contracts'];
if (Object.keys(root.pnpm.overrides).length === 0) {
  delete root.pnpm.overrides;
}
if (Object.keys(root.pnpm).length === 0) {
  delete root.pnpm;
}
fs.writeFileSync(rootPath, `${JSON.stringify(root, null, 2)}\n`);

const examplePath = 'examples/approval/package.json';
const example = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
if (example.devDependencies?.trigora !== 'link:../../../trigora/packages/cli') {
  console.error('expected the local CLI link on the approval example');
  process.exit(1);
}
delete example.devDependencies.trigora;
fs.writeFileSync(examplePath, `${JSON.stringify(example, null, 2)}\n`);
