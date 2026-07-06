const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

function removeFunction(source, funcName) {
  const startStr = `function ${funcName}(`;
  const startIndex = source.indexOf(startStr);
  if (startIndex === -1) {
    console.log(`Could not find ${funcName}`);
    return source;
  }

  let braceCount = 0;
  let hasStarted = false;
  let endIndex = -1;

  for (let i = startIndex; i < source.length; i++) {
    if (source[i] === '{') {
      braceCount++;
      hasStarted = true;
    } else if (source[i] === '}') {
      braceCount--;
    }

    if (hasStarted && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }

  if (endIndex !== -1) {
    console.log(`Removed ${funcName}`);
    return source.substring(0, startIndex) + source.substring(endIndex);
  }
  
  console.log(`Could not find end of ${funcName}`);
  return source;
}

// Remove the inline page components
content = removeFunction(content, 'Dashboard');
content = removeFunction(content, 'InboxPage');
content = removeFunction(content, 'ContactsPage');
content = removeFunction(content, 'LeadsPage');

// Also PipelineCard and PipelineColumn since they were left behind previously
content = removeFunction(content, 'PipelineCard');
content = removeFunction(content, 'PipelineColumn');

// Add imports
const importsToAdd = `
import Dashboard from "./pages/Dashboard";
import InboxPage from "./pages/Inbox";
import ContactsPage from "./pages/Contacts";
import LeadsPage from "./pages/Leads";
`.trim() + '\n';

// Insert imports after the last import from "./pages/..."
const lastPageImport = 'import ProfilePage from "./pages/Profile";\n';
const importIndex = content.indexOf(lastPageImport);

if (importIndex !== -1) {
  content = content.substring(0, importIndex + lastPageImport.length) + importsToAdd + content.substring(importIndex + lastPageImport.length);
  console.log('Added imports');
} else {
  console.log('Could not find ProfilePage import');
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('Done.');
