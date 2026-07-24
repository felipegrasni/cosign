# CoSign

CoSign creates small public collaboration cards that become mutual when a second wallet co-signs them. It offers the same wallet-to-wallet flow on Celo and Stacks with no backend, database, indexer, account system, payments, admin role, or upgradeability.

## Run locally

Use Node 22.13.0 or newer.

```bash
npm install
npx playwright install
npm run dev
```

Only copy `.env.example` to `.env` when you need configured network routes or contract deployment commands:

```bash
cp .env.example .env
```

For local UI work, fill in only the `NEXT_PUBLIC_*` values you actually need. Leave deploy-only secrets such as `PRIVATE_KEY`, `STACKS_PRIVATE_KEY`, and explorer API keys empty unless you are intentionally deploying contracts from this machine.

The landing preview and `/app` network chooser both work without contracts. Live network routes intentionally show an unconfigured state until their public contract values are supplied.

CoSign cards are public and permanent on the selected network. If two wallets do not share the same network, create separate cards because CoSign does not mirror receipts between Celo and Stacks.

Inside MiniPay, opening `/app` automatically redirects to the Celo route so the network chooser does not interrupt the wallet-native flow.

## Verify

```bash
npm run verify
npm run test:e2e
```

`npm run verify` covers lint, typecheck, Celo contract compilation, unit/UI tests, and a production build. It does not run `check:stacks`, `check:stacks:clarinet`, or Playwright end-to-end coverage.

Install Playwright browsers once per machine before running `npm run test:e2e` against a local dev server:

```bash
npx playwright install
```

Individual checks are available through `lint`, `typecheck`, `compile:celo`, `test:celo`, `check:stacks`, `check:stacks:clarinet`, `test:stacks`, `test:ui`, and `build` scripts.

## Architecture

- Next.js App Router and React
- Viem with the injected MiniPay/Celo provider
- Stacks Connect and Stacks Transactions
- Solidity `CoSignRegistry` and Clarity `cosign-registry`
- Direct paginated contract reads through a shared repository interface

See [deployment instructions](./docs/deploy.md), the [launch checklist](./docs/launch-checklist.md), and the [contract parity matrix](./docs/contract-parity.md).
