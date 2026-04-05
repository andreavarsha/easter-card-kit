Run the extraction pipeline against a client's images and print a brand.json summary. The client slug is: $ARGUMENTS

1. **Check folder** — confirm `clients/$ARGUMENTS/` exists. If it does not, tell the user to run `/scaffold-client $ARGUMENTS` first and stop.

2. **Check images** — list all `.png`, `.jpg`, and `.jpeg` files in `clients/$ARGUMENTS/`. Identify which ones map to:
   - Logo: a file named `logo.png` or `logo.jpg`
   - About: a file named `about.png` or `about.jpg`
   - Collection: any files named `collection_*.png` or `collection_*.jpg`
   
   If no logo file is found, warn the user and stop — the pipeline requires at least a logo.

3. **Run extraction** — execute the following Node.js script inline to run the pipeline against the client's images:

```bash
MOCK_AI=false node -e "
const path = require('path');
const fs = require('fs');
const { extractColors } = require('./lib/extractColors');
const { getBrandFromImages } = require('./lib/claudeVision');

async function run() {
  const clientDir = path.join(process.cwd(), 'clients', '$ARGUMENTS');
  const files = fs.readdirSync(clientDir);

  const logoFile = files.find(f => /^logo\.(png|jpg|jpeg)$/i.test(f));
  const aboutFile = files.find(f => /^about\.(png|jpg|jpeg)$/i.test(f));
  const collectionFiles = files.filter(f => /^collection_\d+\.(png|jpg|jpeg)$/i.test(f));

  const logoBuffer = fs.readFileSync(path.join(clientDir, logoFile));
  const collectionBuffers = collectionFiles.map(f => fs.readFileSync(path.join(clientDir, f)));

  console.log('Extracting colours...');
  const colors = await extractColors(logoBuffer, collectionBuffers);
  console.log('Dominant:', colors.dominant);
  console.log('Palette:', colors.palette.join(', '));

  console.log('Calling Claude Vision...');
  const allBuffers = [logoBuffer, ...collectionBuffers];
  const aboutBuffer = aboutFile ? fs.readFileSync(path.join(clientDir, aboutFile)) : null;
  const brand = await getBrandFromImages(allBuffers, aboutBuffer, null, colors);

  fs.writeFileSync(path.join(clientDir, 'brand.json'), JSON.stringify(brand, null, 2));
  console.log(JSON.stringify(brand, null, 2));
}

run().catch(console.error);
"
```

4. **Print summary** — after the script runs, read `clients/$ARGUMENTS/brand.json` and print a human-readable summary:

```
Client:        <client_name>
Industry:      <industry>
Tagline:       <tagline>
Headline font: <typography.headline_font> (<font_confidence> confidence)
Body font:     <typography.body_font>
Background:    <colors.semantic.background>
Headline:      <colors.semantic.headline>
CTA:           <colors.semantic.cta>
Accent:        <colors.semantic.accent>
Card variants: <list variant ids>
Voice:         <voice.description>
```

Tell the user whether the extraction looks complete or if any fields are empty and need manual review.
