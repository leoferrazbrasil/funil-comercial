const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZES = [1080, 400, 320, 180];
const OUT_DIR = path.join(__dirname, '../public/brand/avatars');

const THEMES = {
  escuro: {
    name: 'principal',
    bg: '#09090B',
    primary: '#F59E0B' // Mostarda
  },
  claro: {
    name: 'fundo-claro',
    bg: '#FFFFFF',
    primary: '#000000'
  }
};

const getSvg = (size, color) => {
  // O ícone ocupa exatos 50% do canvas
  const iconSize = Math.floor(size / 2);
  
  return `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="40" height="10" rx="4" fill="${color}" fill-opacity="0.3" />
      <rect x="12" y="20" width="24" height="10" rx="4" fill="${color}" fill-opacity="0.6" />
      <rect x="20" y="34" width="8" height="10" rx="4" fill="${color}" />
    </svg>
  `;
};

async function generate() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const [themeKey, theme] of Object.entries(THEMES)) {
    for (const size of SIZES) {
      const fileName = `funil-comercial-avatar-${theme.name}-${size}.png`;
      const filePath = path.join(OUT_DIR, fileName);
      
      const svgBuffer = Buffer.from(getSvg(size, theme.primary));
      
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: theme.bg
        }
      })
      .composite([
        {
          input: svgBuffer,
          gravity: 'center'
        }
      ])
      .png({ compressionLevel: 9, effort: 10 }) // lossless max quality
      .toFile(filePath);
      
      console.log(`[SUCCESS] Generated: ${fileName}`);
    }
  }
}

generate().catch(console.error);
