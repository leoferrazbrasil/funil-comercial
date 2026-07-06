const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.startsWith('function PipelinePage({'));
if (startIndex === -1) throw new Error("Could not find PipelinePage");
let endIndex = startIndex;
while (!lines[endIndex].startsWith('}')) {
  endIndex++;
}
while (!lines[endIndex].startsWith('function HeroPanel')) {
  endIndex++;
}

const newLines = [
  ...lines.slice(0, 48),
  'import PipelinePage from "./pages/Pipeline";',
  ...lines.slice(48, startIndex),
  ...lines.slice(endIndex)
];

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log("Replaced PipelinePage in App.tsx!");
