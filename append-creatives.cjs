const fs = require('fs');

// 1. Update types.ts
let typesPath = 'src/lib/types.ts';
let typesContent = fs.readFileSync(typesPath, 'utf8');
typesContent = typesContent.replace(
  "| 'funil' | 'perfil'",
  "| 'funil' | 'perfil' | 'criativos' | 'brandbook'"
);
fs.writeFileSync(typesPath, typesContent);

// 2. Update navigation.ts
let navPath = 'src/lib/navigation.ts';
let navContent = fs.readFileSync(navPath, 'utf8');
navContent = navContent.replace(
  "UsersRound,",
  "UsersRound,\n  Palette,"
);
navContent = navContent.replace(
  "description: \"Oportunidades por etapa do pipeline.\",\n  },",
  "description: \"Oportunidades por etapa do pipeline.\",\n  },\n  {\n    id: \"criativos\",\n    label: \"Criativos\",\n    icon: Palette,\n    description: \"Gerador de artes para Social Media.\",\n  },"
);
fs.writeFileSync(navPath, navContent);

console.log('Routes updated!');
