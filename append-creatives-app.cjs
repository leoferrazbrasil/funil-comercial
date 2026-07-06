const fs = require('fs');

let appPath = 'src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// 1. Add import
appContent = appContent.replace(
  "import LeadsPage from \"./pages/Leads\";",
  "import LeadsPage from \"./pages/Leads\";\nimport CreativesPage from \"./pages/Creatives\";"
);

// 2. Add route inside AppContent
appContent = appContent.replace(
  "<Route path=\"/funil\" element={<PipelinePage",
  "<Route path=\"/criativos\" element={<CreativesPage snapshot={snapshot} onOpenModal={openModal} />} />\n            <Route path=\"/funil\" element={<PipelinePage"
);

fs.writeFileSync(appPath, appContent);

console.log('App.tsx updated!');
