# Public repository and hosted-release verification

Reviewer: **strategy/QA agent C**. Read-only checks on 2026-09-30 Asia/Seoul. These checks are independent of the local Git checkout and use GitHub's remote API plus unauthenticated raw-file requests. GitHub Pages is tracked separately; creating Pages configuration alone is not proof that the site is serving the app.

## Public GitHub package — PASS

- Repository: [diveyreadytodive-star/circuitdesk-ignix-tapeout](https://github.com/diveyreadytodive-star/circuitdesk-ignix-tapeout). GitHub API returned `private=false`, `visibility=public`, default branch `main`.
- Remote `main` HEAD returned **`9f4b423cef5e5829db88112bf42545e052717081`** at the time of this independent check. That was the initial pushed source commit, confirmed through GitHub API rather than the local checkout. A later evidence commit will change `main`; recheck the final HEAD after that push rather than treating this SHA as the final release revision.
- The remote tree contained `README.md`, `LICENSE`, `web/main.js`, `tests/platform/browser.test.mjs`, and `readiness.json`.
- Unauthenticated requests to `raw.githubusercontent.com/.../main/` returned **HTTP 200** for each required file: README (5,568 bytes), LICENSE (1,081), web app JS (44,929), tests (3,807), and readiness JSON (2,059). This independently confirms the files are public and nonempty.
- The initial source commit's remotely fetched `readiness.json` said `eligibility: NOT_MET`, kept project processor/circuit addresses and transaction hashes `null`, `ownCircuitEthCallVerified: false`, `userVideoUrl: null`, and `formSubmitted: false`. It labeled the 100,000 cap and 0.000066 OKB price as **proposed, not deployed**. Its `remoteHeadVerified` and `hostedDemoVerified` fields were still false because it preceded this release check; the follow-up evidence commit should update only those verified delivery flags and keep mainnet/video/submission gates false.

## Hosted demo — PASS for public read-only flow

- Public URL: [CircuitDesk Pages](https://diveyreadytodive-star.github.io/circuitdesk-ignix-tapeout/). Unauthenticated HTTP GET returned **200** for the root (299-byte redirect document), `/web/` (15,904-byte CircuitDesk HTML), `/web/main.js` (44,929 bytes), `/src/platform/browser.js` (28,739 bytes), and `/readiness.json` (2,059 bytes). The root HTML refreshes to `web/`; the app HTML has the CircuitDesk title and relative `./main.js` and `./styles.css` references.
- SHA-256 of publicly served `/web/main.js` was `3d8fe6a846b480e40195408dc98ec6f9364ca0b104b18e863e89c021af6412d8`; `/src/platform/browser.js` was `7babd7d93842554e4768a4b25c4202ed36c5e39c48f1f980d7a50bb9e1736e86`. Both matched the locally tested source bytes at this release check.
- With that matching adapter, C made a fresh **read-only** call to the existing third-party CPU #0/XOR circuit #1. At X Layer block **71989152**, input `[1,0]` returned output `[1]`, `execution: eth_call`, `transactionHash: null`. This demonstrates the published adapter's public read path, not CircuitDesk's own tapeout.
- The leader independently opened the hosted app in IAB, observed three adapter templates and a reachable factory, and got the same public XOR output for input `1,0` at block **71989028** with no transaction. Hosted mobile 390 px had matching document/viewport scroll widths, one `h1`, and no console warnings/errors. C inspected the saved [hosted desktop](../ui/hosted-desktop.jpg) and [hosted mobile](../ui/hosted-mobile.jpg) screenshots. No wallet write was attempted.

This verifies public hosting and a read-only product demo. It does **not** verify the mainnet processor/circuit issuance required for contest eligibility or any future wallet signature.

## Remaining contest gate

The public repo does **not** substitute for a user-signed mainnet processor creation and circuit tapeout on that processor before 2026-10-06 13:00 KST. The user video and final form submission are also pending. See [readiness.json](../../readiness.json) and [requirements-checklist.md](../../submission/requirements-checklist.md).

## Last-mile recheck — 2026-10-03 KST

- The current campaign's “Submit project” link opened the same Google Form with `?usp=dialog`. It showed the Sep 22 12:00–Oct 6 12:00 HKT window, required project/contact/repository fields, and a Submit button. No fields were filled or submitted; no account email was inspected.
- The app page evaluated in the Codex IAB and the inspected Chrome automation tab did not expose `window.ethereum`. No account list was requested. For a real deployment the user needs the app open in their normal browser profile where their OKX Wallet/MetaMask provider is injected; if they connect manually, the app should show the selected address and chain before preparing writes.
- Read-only X Layer refresh at 2026-10-02 23:58 KST still returned factory deploy fee 0.0066 OKB, reference processor mint protocol fee 0.00066 OKB, and tapeout fee 0.0013 OKB. The reference processor has zero mint price and is fully minted, so it is not the proposed new processor; its values only confirm current protocol fee components. The proposed new processor's mint quote is still 4 × 0.000066 + 0.00066 OKB, pending fresh read at deployment.
