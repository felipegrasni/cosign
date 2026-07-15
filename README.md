# CoSign

CoSign creates small public collaboration cards that become mutual when a second wallet co-signs them. It supports matching experiences on Celo and Stacks with no backend, database, indexer, account system, payments, admin role, or upgradeability.

## Run locally

Use Node 22.13.0 or newer.

```bash
npm install
cp .env.example .env
npx playwright install
npm run dev
```

The landing preview works without contracts. Live app routes intentionally show an unconfigured state until their public contract values are supplied.

## Verify

```bash
npm run verify
npm run test:e2e
```

Install Playwright browsers once per machine before running `npm run test:e2e`.

Individual checks are available through `lint`, `typecheck`, `compile:celo`, `test:celo`, `check:stacks`, `test:stacks`, `test:ui`, and `build` scripts.

## Architecture

- Next.js App Router and React
- Viem with the injected MiniPay/Celo provider
- Stacks Connect and Stacks Transactions
- Solidity `CoSignRegistry` and Clarity `cosign-registry`
- Direct paginated contract reads through a shared repository interface

See [deployment instructions](./docs/deploy.md), the [launch checklist](./docs/launch-checklist.md), and the [contract parity matrix](./docs/contract-parity.md).
