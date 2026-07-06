const { Project } = require("ts-morph");
const path = require("path");

const project = new Project();
const sourceFile = project.addSourceFileAtPath(path.join(__dirname, "src", "App.tsx"));

const functionsToRemove = [
  "Dashboard",
  "InboxPage",
  "ContactsPage",
  "LeadsPage",
  "PipelineCard",
  "PipelineColumn",
  "PipelineSignalCard",
  "PipelineRiskItem",
  "HeroPanel",
  "PageIntro",
  "MetricCard",
  "Panel",
  "ActionItem",
  "TablePanel",
  "EmptyState"
];

for (const name of functionsToRemove) {
  const func = sourceFile.getFunction(name);
  if (func) {
    console.log(`Removing function: ${name}`);
    func.remove();
  } else {
    console.log(`Function not found: ${name}`);
  }
}

// Ensure the imports are inserted correctly
sourceFile.addImportDeclarations([
  { defaultImport: "Dashboard", moduleSpecifier: "./pages/Dashboard" },
  { defaultImport: "InboxPage", moduleSpecifier: "./pages/Inbox" },
  { defaultImport: "ContactsPage", moduleSpecifier: "./pages/Contacts" },
  { defaultImport: "LeadsPage", moduleSpecifier: "./pages/Leads" }
]);
console.log("Added imports");

sourceFile.saveSync();
console.log("Done.");
