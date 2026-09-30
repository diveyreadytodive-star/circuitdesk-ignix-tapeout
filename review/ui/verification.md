# UI verification notes

Date: 2026-09-30 (Asia/Seoul)

## Who checked what

- Product UI agent: directly observed the public CircuitLab editor and EveryCircuit live app in a browser, wrote `docs/design-reference.md`, implemented the static workbench, and inspected the captured CircuitDesk desktop/mobile images listed below. `node --check web/main.js` passes.
- Leader: ran the app in the Codex in-app browser at desktop 1440 × 900 and mobile 390 × 844, checked no horizontal overflow, exercised a truth-table row by keyboard, observed a real public XOR `eth_call` result, checked console output and saved the screenshots. The public CPU/circuit is explicitly a third-party reference, not CircuitDesk's entry.
- Platform agent: independently verified live X Layer read-only XOR evaluation and a local fork create → mint → tapeout lifecycle. See `docs/platform-evidence.md` for exact scope.

## Screenshots

- `desktop-landing.jpg`, `mobile-landing.jpg`: brand and first-use entry.
- `desktop-workbench.jpg`, `mobile-workbench.jpg`: guided template and local truth table.
- `desktop-chain-proof.jpg`, `mobile-chain-proof.jpg`: browser preview alongside real public X Layer read-only result.
- `desktop-processor.jpg`, `mobile-create-preflight.jpg`: processor verification and deployment terms.
- `desktop-public-reference-receipt.jpg`: A real external TapeOut circuit transaction independently rechecked with the adapter. Its card explicitly says third-party and does not claim CircuitDesk ownership.

The commercial reference captures used for internal comparison are in `/private/tmp/circuitlab-reference.jpg` and `/private/tmp/everycircuit-reference.jpg`; they are not project assets and should not be published.

## Accessibility and state checks

- Semantic buttons and form labels; keyboard activation for truth-table rows; visible focus rings; `aria-live` for RPC status and receipt changes; reduced-motion CSS path.
- Normal-text contrast spot checks after the final color pass: white CTA text on `#b64624` 5.40:1; selected label on white 5.59:1; step label on paper 6.31:1; detail label on white 5.55:1; preflight foot on white 5.25:1; disabled CTA text/background 6.55:1.
- Final visual-verdict: 93/pass against two directly observed commercial reference editors, with `desktop-workbench.jpg` and `desktop-chain-proof.jpg` used together for the complete judge proof. The verdict is stored locally in `.omx/state/visual/ralph-progress.json`.
- The UI distinguishes local preview, third-party read-only `eth_call`, confirmed project transactions, partial NAND mint, and unverified submitted transactions. It keeps tapeout disabled until a real processor and live cost estimate pass adapter checks.
- Submitted factory, mint and tapeout hashes are retained in browser localStorage as **unverified**. Reload restores a retry lock and an explorer link; a verified factory/circuit receipt clears the lock automatically, while a mint requires deliberate user review because the adapter has no mint receipt verifier. If browser storage is unavailable, the app disables paid writes before the wallet flow.
- Leader's synthetic same-origin browser test used a fake createCPU hash with no transaction: the app displayed the **UNVERIFIED / RETRY LOCKED** card and explorer link, kept the create button disabled after reload, then returned to **NOT DEPLOYED** and enabled the button after the synthetic localStorage entry was removed. This verifies persistence and lock rendering only; it is not a mainnet transaction test.

## Limit

No CircuitDesk processor or circuit has been deployed to X Layer mainnet yet. The wallet owner must review/sign the mainnet factory and tapeout sequence. All current chain results in these screenshots are a public third-party reference, not a project receipt.
