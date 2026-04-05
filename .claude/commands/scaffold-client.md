Set up a new client workspace. The client slug is: $ARGUMENTS

1. **Create folder** — create the directory `clients/$ARGUMENTS/` in the project root if it does not already exist.

2. **Placeholder brand.json** — write `clients/$ARGUMENTS/brand.json` with this exact v2 stub (all fields empty/default, ready to be filled by the pipeline):

```json
{
  "_version": "2.0",
  "client_name": "",
  "tagline": "",
  "mission": "",
  "vision": "",
  "industry": "",
  "colors": {
    "primitive": {},
    "semantic": { "background": "", "headline": "", "cta": "", "accent": "" }
  },
  "typography": {
    "headline_font": "",
    "body_font": "",
    "font_confidence": "low"
  },
  "voice": {
    "description": "",
    "good_examples": [],
    "bad_examples": [],
    "avoid": []
  },
  "seasonal": {
    "easter": { "themes": [], "imagery_words": [], "avoid_imagery": [] }
  },
  "card_variants": [],
  "hook_rules": {
    "required_colors": [],
    "forbidden_fonts": [],
    "max_exclamation_marks": 1
  }
}
```

3. **Instructions file** — write `clients/$ARGUMENTS/README.txt` with these instructions:

```
Client: $ARGUMENTS
─────────────────────────────────────
Add the following files to this folder before running /test-pipeline $ARGUMENTS:

  logo.png          — brand logo (PNG or JPG, max 5MB)
  about.png         — about/mission page screenshot or image (PNG or JPG, max 5MB)
  collection_1.png  — product/collection image (PNG or JPG, max 5MB)
  collection_2.png  — (optional)
  collection_3.png  — (optional)

Once images are in place, run: /test-pipeline $ARGUMENTS
```

4. **Confirm** — tell the user the folder `clients/$ARGUMENTS/` is ready, list the files created, and remind them to drop their images in before running `/test-pipeline $ARGUMENTS`.
