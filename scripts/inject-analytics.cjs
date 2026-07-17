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
  
  // Clique de WhatsApp = whatsapp_click (evento de OBSERVAÇÃO), não generate_lead.
  // generate_lead é reservado ao envio de formulário (LeadCaptureForm) — lead real
  // com client_id. Misturar clique aqui poluiria o alvo de lance do Google Ads.
  content = content.replace(/href=\{whatsappLink\}/g, `href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}`);

  // Handle whatsappInfoLink
  content = content.replace(/href=\{whatsappInfoLink\}/g, `href={whatsappInfoLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp_info" }); }}`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
