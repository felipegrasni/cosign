# Launch checklist

- Run `npm ci` on Node 22.13.0 or newer.
- Run `npm run verify` and resolve every warning or failure.
- Confirm `NEXT_PUBLIC_APP_URL` is the canonical HTTPS origin.
- Add Talent verification metadata only after receiving the project token.
- Deploy and verify the Celo contract; save address, block, transaction, and explorer links.
- Deploy the Stacks contract; save contract ID, transaction, and explorer links.
- Rebuild with both public contract configurations.
- Test open-link, one-wallet invitation, co-signed, cancelled, expired, wrong-wallet, creator-self-sign, and direct-link flows.
- Test MiniPay automatic connection on a physical mobile device.
- Test a current Stacks wallet and confirm addresses refresh after reconnect.
- Confirm every public text warning appears before creation.
- Confirm OG, manifest, icons, sitemap, robots, keyboard focus, reduced motion, and mobile overflow.
- Complete one genuine two-wallet smoke test on each selected launch network.
