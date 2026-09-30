# CircuitDesk

CircuitDesk is a guided workbench for small Boolean circuits on [TapeOut](https://tapeout.net/) and X Layer. A visitor can inspect a rule's inputs and local truth table, check the transistor and fee terms, and read a real circuit's result from X Layer. Publishing a new processor or circuit requires the visitor's own wallet signature.

**Contest status (2026-09-30 KST): development preview.** The project does not yet have its own mainnet processor or taped-out circuit. The [IGNIX hackathon](https://ignix.bot/x_campaign) requires both; neither a local preview nor an existing public reference circuit qualifies CircuitDesk. The user will decide on the final mainnet transactions after reviewing the exact calls and costs, then record/upload the video and submit the form.

[Open the public CircuitDesk preview](https://diveyreadytodive-star.github.io/circuitdesk-ignix-tapeout/) · [Source repository](https://github.com/diveyreadytodive-star/circuitdesk-ignix-tapeout)

## Why this exists

TapeOut exposes NAND and LATCH transistors, onchain processors, and circuits made from those components. Its native canvas is powerful but a first-time visitor still needs a clear path from a useful Boolean rule to its gate count, cost, wallet action, and independently checkable result. CircuitDesk concentrates on that path. The interface must always distinguish:

1. a **local preview** of a truth table;
2. a **read-only contract evaluation** against an existing onchain circuit (`eth_call`, no transaction receipt);
3. a **processor creation, mint, or tapeout transaction** signed by a user wallet and confirmed on X Layer.

It does not enforce external access policies, automate trades, or claim general-purpose computation.

## Quick start

The app is static and uses browser ES modules and JSON-RPC. From this repository root:

```sh
python3 -m http.server 4173 --directory .
```

Open `http://127.0.0.1:4173/web/`. Reading public chain state needs network access. Writing needs an EIP-1193 wallet on **X Layer mainnet, chain ID 196**, with enough OKB for the disclosed protocol charges and gas. There is no server-held signing key.

Run the dependency-free checks from the repository root:

```sh
node --test
```

The live contract adapter and UI checks are described in [platform evidence](docs/platform-evidence.md) and [QA records](review/qa/). A browser preview and test suite are separate from the mandatory mainnet launch.

## Network and contracts

| Item | Value / status |
| --- | --- |
| Network | [X Layer mainnet, chain ID 196](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information) |
| Public RPC | `https://rpc.xlayer.tech` (read-only queries, rate-limited) |
| TapeOut X Layer factory | `0x1f09daefa827f02cbb40967cc91b259763760761` — found in the [TapeOut L2 client bundle](https://tapeout.net/assets/l2-CYZpWPZp.js) and checked against live code/state; verify again before signing |
| CircuitDesk processor | **Pending user-signed mainnet creation** |
| Deployment wallet | **Pending user selection and transaction** |
| Transistor supply, unit price, cap | **Proposed only:** 100,000 combined NAND/LATCH cap; 0.000066 OKB per unit. No values have been committed on chain for this project. Replace this row with exact deployment readback after signing. |
| CircuitDesk circuit / tapeout receipt | **Pending user-signed mainnet tapeout** |

The factory is an upgradeable proxy. A read-only X Layer check on 2026-09-30 found chain ID `0xc4`, nonempty factory and implementation code, and `cpuCount() = 256`. This proves an active factory endpoint, **not** that this project is deployed or that a future transaction has the same fee/implementation. See the adapter's current state checks before signing.

TapeOut's X Layer interface describes its contracts as test-phase, unsealed, and not independently audited. Treat wallet calls as irreversible financial actions. Confirm the recipient, chain, transistor count, current `mintPrice`, protocol fee, tapeout fee, gas estimate, and any contract upgrade before accepting a wallet transaction. A token or circuit carries no promise of return.

The proposed first-run sequence needs three separate signatures: processor creation, mint of four NAND, then XOR tapeout. At the fees observed on 2026-09-30 this totals **0.008824 OKB plus gas**. A confirmed mint is not automatically refunded if the subsequent tapeout fails or is cancelled; the wallet would still hold the minted transistors. The exact, reviewable proposal and fixed-supply consequences are in [issuance-proposal.md](submission/issuance-proposal.md). This estimate is not spending authorization.

## What the judges can inspect

- [Official rules and entry status](docs/official-rules.md)
- [Criterion-to-feature-to-proof strategy](docs/judge-strategy.md)
- [Product and technical decisions](decisions/)
- [Desktop/mobile reference study](docs/design-reference.md)
- [Requirement checklist](submission/requirements-checklist.md)
- [English form draft](submission/form-draft.md) and [filming script](submission/filming-script.md)
- `readiness.json` and QA records will identify the exact evidence and unmet mainnet gates at handoff.

No wash trading, matched orders, self-trading, fabricated usage, or simulated API response is part of the demo. Existing TapeOut circuits, when shown, are labeled as public references rather than CircuitDesk deployments.

## License

[MIT](LICENSE). External brand marks, logos, and the commercial interface references are not included in this license.
