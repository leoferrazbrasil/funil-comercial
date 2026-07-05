const { Project } = require('ts-morph');
const fs = require('fs');
const { execSync } = require('child_process');

// 1. Restore App.tsx
execSync('git checkout HEAD src/App.tsx');

// 2. Remove extracted components from App.tsx
const project = new Project();
const sourceFile = project.addSourceFileAtPath('src/App.tsx');

const componentsToRemove = [
  'PageIntro', 'Panel', 'EmptyState', 'MetricCard', 'ActionItem', 'TablePanel', 'HeroPanel',
  'Dashboard', 'InboxPage', 'ContactsPage', 'LeadsPage', 'PipelinePage', 'PipelineColumn', 'LeadCard', 'PipelineCard'
];

componentsToRemove.forEach(name => {
  const f = sourceFile.getFunction(name);
  if (f) f.remove();
});

let importsToAdd = `
import { PageIntro, Panel, EmptyState, MetricCard, ActionItem, TablePanel, HeroPanel } from "./components/SharedUI";
import Dashboard from "./pages/Dashboard";
import InboxPage from "./pages/Inbox";
import ContactsPage from "./pages/Contacts";
import LeadsPage from "./pages/Leads";
import PipelinePage from "./pages/Pipeline";
`;

sourceFile.insertStatements(0, importsToAdd);
sourceFile.saveSync();

// 3. Apply layout classes to App.tsx
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('<main className="main-content">', '<main className="flex-1 flex flex-col h-screen overflow-hidden">');
content = content.replace('<section className="content-area">', '<section className="flex-1 overflow-y-auto p-4 md:p-8">');
content = content.replace(
  '<header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">',
  '<header className="h-16 px-4 md:px-8 flex items-center justify-between shrink-0">'
);
content = content.replace(
  '<div className="shell">',
  '<div className="flex h-screen w-full bg-background">'
);

fs.writeFileSync('src/App.tsx', content);

// 4. Fix SharedUI.tsx
let sharedUI = fs.readFileSync('src/components/SharedUI.tsx', 'utf8');
sharedUI = sharedUI.replace(/iconClassName = "text-\\[#00E5A0\\],\s*/g, '');
sharedUI = sharedUI.replace('icon: Icon,', 'iconClassName = "text-[#00E5A0]",\n  icon: Icon,');
fs.writeFileSync('src/components/SharedUI.tsx', sharedUI);

console.log('All fixed!');
