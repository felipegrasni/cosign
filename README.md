# CoSign

CoSign creates small public shared cards that become mutual when a second wallet co-signs them. It offers the same wallet-to-wallet flow on Celo and Stacks with no backend, database, indexer, account system, payments, admin role, or upgradeability.

## Run locally

Use Node 22.13.0 or newer.

```bash
npm ci
npm run dev
```

Use `npm install` only when you intentionally need to update `package-lock.json` after changing dependencies.

Install Playwright browsers only when you plan to run `npm run test:e2e` on this machine:

```bash
npx playwright install
```

You only need to install those browsers once per machine.

You can leave the repo without a `.env` file when you only need the landing page, preview, or `/app` network chooser.

Only copy `.env.example` to `.env` when you need configured `/app/celo` or `/app/stacks` routes, contract deployment commands, or explorer links:

```bash
cp .env.example .env
```

For local UI work, fill in only the `NEXT_PUBLIC_*` values you actually need. Leave deploy-only secrets such as `PRIVATE_KEY`, `STACKS_PRIVATE_KEY`, and explorer API keys empty unless you are intentionally deploying contracts from this machine.

The landing preview and `/app` network chooser both work without contracts. Live network routes intentionally show an unconfigured state until their public contract values are supplied.

CoSign cards are public and permanent on the selected network. Each card stays on the network where it was created. If two wallets do not share the same network, create one card on Celo and another on Stacks because CoSign does not mirror receipts between those networks.

Inside MiniPay, opening `/app` automatically redirects to the Celo route so the network chooser does not interrupt the wallet-native flow.

## Verify

```bash
npm run verify
npm run test:e2e
```

`npm run verify` covers lint, typecheck, Celo contract compilation, unit/UI tests, and a production build. It does not run `check:stacks`, `check:stacks:clarinet`, or Playwright end-to-end coverage.

If Playwright browsers are not installed on this machine yet, run `npx playwright install` before `npm run test:e2e`.

For landing-page copy, docs, or metadata-only changes, `npm run build` is the lightest useful validation before you decide whether a broader `npm run verify` pass is necessary.

Individual checks are available through `lint`, `typecheck`, `compile:celo`, `test:celo`, `check:stacks`, `check:stacks:clarinet`, `test:stacks`, `test:ui`, and `build` scripts.

## Architecture

- Next.js App Router and React
- Viem with the injected MiniPay/Celo provider
- Stacks Connect and Stacks Transactions
- Solidity `CoSignRegistry` and Clarity `cosign-registry`
- Direct paginated contract reads through a shared repository interface

See [deployment instructions](./docs/deploy.md), the [launch checklist](./docs/launch-checklist.md), and the [contract parity matrix](./docs/contract-parity.md).
