Check that the project is ready to deploy to Netlify. Run the following steps in order and report the result of each:

1. **netlify.toml check** — confirm `netlify.toml` exists in the project root. Read it and confirm it has a `[build]` section with a `command` and `publish` field.

2. **next build** — run `npm run build`. Report success or paste the first error if it fails.

3. **Summary** — print a short pass/fail table for all checks. If everything passes, tell the user they are clear to deploy. If anything failed, list what needs to be fixed before deploying.
