# Deployment

## Celo

Set `PRIVATE_KEY` plus the matching RPC URL, then run `npm run deploy:celo:sepolia` or `npm run deploy:celo:mainnet`. Record the printed address, transaction, and block in the matching `NEXT_PUBLIC_COSIGN_CELO_*` values before rebuilding the app. Verification uses the matching `COSIGN_CELO_CONTRACT_ADDRESS_*` value and `npm run verify:celo:*`.

## Stacks

Set `STACKS_PRIVATE_KEY`, `STACKS_NETWORK`, and a positive `STACKS_DEPLOY_FEE_MICROSTX`, then run `npm run deploy:stacks:testnet` or `npm run deploy:stacks:mainnet`. Record the printed contract ID in the matching `COSIGN_STACKS_CONTRACT_ID_*` value, split it into `NEXT_PUBLIC_COSIGN_STACKS_CONTRACT_ADDRESS` plus `NEXT_PUBLIC_COSIGN_STACKS_CONTRACT_NAME`, set the matching `NEXT_PUBLIC_STACKS_NETWORK`, and rebuild.

Before either production deployment, set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin so canonical metadata, OG links, and the manifest all point at the right host. Then run `npm run verify`, confirm the deployer is funded, confirm network selectors, and save every receipt. No contract is upgradeable; a changed contract requires a new deployment and app configuration.
