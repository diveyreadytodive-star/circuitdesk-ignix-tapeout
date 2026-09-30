# User filming script and shot list

The user records and uploads the video. Film the actual app build and actual X Layer receipts. Do not edit a local simulation to look like a chain result. Before recording, replace all bracketed proof markers from confirmed explorer/RPC reads and confirm the processor and circuit were created during the contest window.

## Preparation before screen recording

1. Open the public CircuitDesk URL and the project README in a signed-out browser window. Confirm the application is the same build referenced by the repo.
2. Prepare a wallet the user controls on **X Layer mainnet, chain 196**, with a deliberate gas/spend budget. The user handles wallet setup, funds, signatures, and any final transaction acceptance. Never expose a seed phrase or private key in the recording.
3. Confirm the read-only processor data: address, deployment wallet, public supply, unit price, cap, factory, circuit ID, and transaction URLs. Place those exact values in README and the form draft. Review [the issuance proposal](issuance-proposal.md): creation, mint, and tapeout are separate wallet transactions. A confirmed mint can leave paid NAND in the wallet with **no circuit** if tapeout does not follow; the earlier mint payment/gas is not undone.
4. If **our** processor or at least one circuit on it has not been created on mainnet, **pause the eligible submission video**. An existing TapeOut example processor or browser preview can illustrate capability but cannot satisfy our entry.
5. Close unrelated tabs, notifications, and account details. Keep a direct X Layer explorer tab ready for the confirmed receipts.

## Suggested 120–150 second story

| Shot | Screen action | Spoken line / on-screen point | Proof to capture |
| --- | --- | --- | --- |
| 1 · Problem (0–10s) | Open CircuitDesk on desktop, then briefly show its mobile layout. | “Publishing a small TapeOut circuit should be understandable before a wallet signs anything.” | Product name, clear task, responsive UI. |
| 2 · Choose (10–30s) | Select a supported Boolean template. Change inputs and view the local truth table. | “This preview is computed locally so I can inspect the rule. It is not yet a blockchain result.” | Input/output state changes and template identity. |
| 3 · Preflight (30–50s) | Show factory, processor issuance configuration, NAND/LATCH requirement, cost, fees, and chain before connecting. | “Here are the supply, unit price, cap and the proposed spend before I sign.” | Exact disclosed economics, wallet/network and fee state. |
| 4 · Processor (50–75s) | Show **our** processor creation receipt (or a short authentic segment of the user signing its creation). Open explorer and contract readback. | “Our processor was created through the TapeOut factory on X Layer mainnet.” | Chain 196, factory call, processor address, deploying wallet, settings, block time. |
| 5 · Tapeout (75–105s) | Show the user reviewing/signing any transistor mint **as a separate action**, then the tapeout; capture pending and success states. Open tapeout receipt and circuit passport. | “The mint can confirm without a circuit; tapeout is a second transaction. Here is the separate confirmed tapeout receipt that creates its circuit ID.” | Destinations, OKB amounts and fees for each signature, true circuit ID linked to **our** processor, block time within window. Do not show keys. |
| 6 · Evaluate (105–125s) | Change input bits on **our** confirmed circuit and run the read-only chain evaluation; compare with the local truth table. | “This output comes from a read-only `eth_call` to the deployed circuit. The call itself has no transaction receipt.” | Actual circuit ID and RPC output, local/chain agreement for tested vectors. |
| 7 · Share and boundary (125–150s) | Reload app, open public passport and README proof section; show one error state if reliably reproducible without extra spend. | “Another person can inspect the issuance terms, the two transaction receipts, and the circuit output.” | Share URL, public repo, wrong-chain/rejection clarity, no claimed adoption figures. |

If using an **already confirmed circuit on our processor** instead of a new live transaction during filming, say so: “These are the transactions already recorded during the hackathon window.” Show authentic processor-creation and tapeout receipts; do not splice in a fake signing moment. An existing sample XOR circuit on CPU #0 may be labeled as a technical reference, but cannot stand in for our own circuit. If a transaction is rejected or fails, capture it as an error path, then separately show a previously verified successful tapeout. Do not claim the failed transaction qualified the project.

## Final checks after export

- The video shows **our** real processor deployment and circuit tapeout proof with readable addresses/receipts, or explicitly states that mainnet eligibility is still pending.
- Local preview, read-only chain `eth_call`, and paid transaction receipts are visibly separate.
- The film's chain, values, and links match the README and form draft.
- The share URL, repo, video, and explorer pages are accessible without signing in.
- No secret, contact email, unnecessary account identity, wallet recovery material, or fabricated trade/user metric appears.
