const fs = require('fs');
const content = fs.readFileSync('src/types/graph.ts', 'utf8');
const updated = content.replace(
  "| 'relates_to';",
  `| 'relates_to'
  // Celestial hierarchy edges (Act XXXI cosmology)
  | 'generates'        // Sun generates light
  | 'delegates_via'    // Earth delegates via Theia/Life
  | 'manifests_as'     // Life manifests as Human
  | 'reflects_through' // Moon reflects through Swordsman
  | 'remembers';       // Moonkeeper remembers the forgetting`
);
fs.writeFileSync('src/types/graph.ts', updated);
console.log('Done');
