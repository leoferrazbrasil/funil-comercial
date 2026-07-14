const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'pages');

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx') && f.includes('Landing'));

files.push('LocalCityLanding.tsx', 'ConsultoriaLanding.tsx'); // Make sure

for (const file of new Set(files)) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has analytics
  if (content.includes('lib/analytics')) continue;
  
  // Inject import
  const importStatement = `import { trackEvent } from "../lib/analytics";\n`;
  content = content.replace(/(import .* from ".*";\n)/, `$1${importStatement}`);
  
  // Replace href={whatsappLink} with tracking
  // Using a regex to find all <a> tags that have href={whatsappLink}
  // This is a bit tricky if they already have onClick.
  // We can just add onClick to it if it doesn't have one, or modify existing.
  
  // Let's just find href={whatsappLink} and append onClick
  // Actually, we can replace href={whatsappLink} with onClick={() => trackEvent("generate_lead", { method: "whatsapp" })} href={whatsappLink}
  content = content.replace(/href=\{whatsappLink\}/g, `href={whatsappLink} onClick={(e) => { trackEvent("generate_lead", { method: "whatsapp" }); }}`);
  
  // Handle whatsappInfoLink
  content = content.replace(/href=\{whatsappInfoLink\}/g, `href={whatsappInfoLink} onClick={(e) => { trackEvent("generate_lead", { method: "whatsapp_info" }); }}`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
