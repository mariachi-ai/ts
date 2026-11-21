---
"@mariachi/integrations": minor
---

Integration contracts: `contract.json` is the source of truth for each provider package. `ContractSchema` and its JSON Schema (`@mariachi/integrations/contract.schema.json`), `checkSetting` for a setting's value per environment, `settingsFromEnv`, and `@mariachi/integrations/codegen`, which `pnpm integrations:generate` runs to write each package's `src/generated.ts` (checked by `pnpm docs:check`).
