# Validation notes

- All 64 TypeScript/TSX source files were parsed with the TypeScript compiler API; no syntax diagnostics were reported.
- A full Next.js production build and database integration test were not run in the packaging environment because dependency installation timed out before `node_modules` could be installed.
- Daraja credentials, PostgreSQL connection and Safaricom Sandbox callback flow were not available for live integration testing.
- Run `npm install`, `npm run typecheck`, `npm run lint` and `npm run build` in the deployment environment before publishing. Then complete the Sandbox test checklist in `DEPLOY.md` before switching to Production.
