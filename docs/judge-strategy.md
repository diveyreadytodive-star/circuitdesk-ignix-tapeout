# Judge strategy — TapeOut Genesis Transistor Hackathon

Verified on 2026-09-30 (Asia/Seoul). The [official campaign](https://ignix.bot/x_campaign) lists **seven criteria but publishes no scores or weights**. This document maps each criterion to a product behavior and an independently checkable proof. It does not assign invented percentages.

## Reverse reading of the organizer's goal

The rules say the first processors should be deployed through the TapeOut factory, should have a disclosed transistor issuance design, and should have at least one **real taped-out circuit** before the window closes. The FAQ says circuits can come from anyone, but the processor must be real and used. First place also turns its transistor into the Ignix Genesis Transistor, around which Ignix plans dedicated vault mechanics. These are [stated campaign facts](https://ignix.bot/x_campaign#hackathon-rules).

**Inference from those facts:** Ignix and X Layer want developer adoption of the factory and a first set of usable processor/circuit examples, with public artifacts other builders can inspect and extend. A product should therefore show the full lifecycle, an honest economic configuration, and a reason to return or let another builder tape out on the processor. Token promotion and trading activity alone have weaker fit; the rules explicitly reject volume/price-only judging and fake trades.

## Eligibility gates before any pitch claim

1. Chain ID **196**, X Layer **mainnet** transaction through the **official TapeOut factory**, with a processor address and deployment wallet verified from a receipt or explorer.
2. At deployment, public transistor supply, unit price, and any cap, with the configured values reflected in the contract and README.
3. At least one confirmed circuit tapeout on that processor by **2026-10-06 13:00 KST**, supported by transaction, event, and circuit identity. The user-facing demo must link to that proof.
4. A clear use case, a working product demo, and a public repo. Do not call local previews, mocks, testnet transactions, wallet prompts, or unsigned transactions a mainnet launch.
5. No wash trading, matched orders, self-trading, invented user counts, or fabricated results.

These gates are mandatory according to the [campaign rules and FAQ](https://ignix.bot/x_campaign#hackathon-rules); a polished UI cannot compensate for a missing mainnet processor or circuit.

## Criterion → product feature → judge-visible proof

| Official criterion | Product behavior to prioritize | Judge-visible proof |
| --- | --- | --- |
| Application innovation | Translate a supported circuit tapeout into a useful, repeatable nondeveloper workflow with clear inputs, costs, and outputs. The exact workflow remains conditional on the factory API and circuit semantics. | One plain-language scenario completed in the live app; before/after state; receipt tied to the scenario. |
| Depth of TapeOut integration | Read factory/processor state, prepare a contract-correct tapeout, show lifecycle and circuit identity. | Factory address and verified ABI source, transaction hash, decoded event/state, explorer links, readback after page reload. |
| Product completeness and UX | Explain requirements before wallet connection; show unsupported network, fee, pending, rejection, failure, and confirmed receipt states. | Desktop/mobile live walkthrough, error-path screenshots, accessibility checks, working public demo URL. |
| Asset issuance design | Publish supply, unit price, cap, and who pays/receives what; tie configuration to real usage rather than speculative returns. | Deployment transaction inputs and readback, transparent pricing card, cost calculation with units and rounding, public README. |
| Quality of X Layer integration | Chain ID 196 guard, real RPC reads, wallet signature path, receipt confirmations, explorer deep links. | Wrong-chain and rejection demonstrations; receipt and state verified by a separate read-only RPC call. |
| User growth potential | Shareable processor/circuit page and a repeatable template or workflow that another user can inspect/use. | Stable public URL and a second-person walkthrough; no claimed adoption without analytics evidence. |
| Contract security and economic model | Minimize custom contracts, validate inputs, surface irreversible spend, handle reorg/revert/rejection, avoid privileged or hidden issuance. | Threat model, tests against official interface, contract verification where relevant, explicit risk/fee table and deployment configuration. |

## Three product candidates and objections

These began as **conditional candidates**, not claims that the factory supports arbitrary computation. The public [IGNIX docs index](https://ignix.bot/docs) currently documents its launchpad, bonding curve, vaults, and token API, rather than a TapeOut factory ABI or circuit execution API. The team's [technical integration review](../decisions/round-2-technical-review.md) records a live client-derived ABI and independent X Layer readback: an existing XOR circuit evaluated by `eth_call` for all four inputs. This proves a specific circuit evaluation path, not a general-purpose processor or our own deployment.

| Candidate | Why it may fit | Critical objection / decision rule |
| --- | --- | --- |
| **A. CircuitDesk: template-to-tapeout workbench** | A nondeveloper chooses a narrowly defined circuit/template, sees transistor cost, signs the actual factory call, and gets a verifiable circuit passport. This directly supports factory adoption and repeat use. | Only use templates and cost semantics the official contracts actually support. If no public template schema or quote path is verified, do not show an executable call or claim correct cost. |
| **B. Processor and circuit passport** | A public dashboard explains a processor's issuance terms and lists real circuits/receipts from X Layer. It can work even if circuit execution is not exposed. | A read-only explorer wrapper may score poorly on innovation and growth. It must add a concrete decision or repeatable workflow, and still needs a real tapeout transaction to qualify. |
| **C. Binary decision-card runtime** | A user creates an easy-to-understand Boolean rule, previews its truth table, and evaluates an actual deployed circuit through `eth_call`. The live XOR example proves that a read-only evaluation path exists. | The read-only result is not a transaction receipt or an enforced external decision. We must first publish and evaluate **our own** circuit before pitching this as CircuitDesk's complete flow. No arbitrary program or policy automation claim follows from the XOR probe. |

**Current recommendation:** pursue A with B as the evidence view. Integrate the narrow read-only evaluation proven by the XOR spike after the app's encoder and own-circuit path are verified. Keep C's broader decision-automation story out of the pitch. The team recorded dissent and gates in `decisions/`.

For the first judge walkthrough, use the **review disagreement check**: two manual pass/needs-work flags feed a published XOR circuit, whose output is `1` only when reviewers differ. The local truth table and read-only X Layer evaluation should match for all four input pairs. This is a shareable rule worksheet, **not** automatic CI or wallet permission enforcement. The [competitive check](competitive-landscape.md) explains why this narrow task differentiates the workbench from another entrant's Agent-permission story and where it may still score weakly on application innovation.

## Competitive context and differentiation

The nearby commercial categories are mature. [CircuitLab](https://www.circuitlab.com/) offers an in-browser schematic editor, analog/digital simulation, plots, and shareable circuit URLs. [Autodesk Tinkercad Circuits](https://images.tinkercad.com/jl5ii4oqrdmc/1eTWASZYKjnMX9u5ioLh8Y/bb2dfb24cfc4bd66adc485baaecedf97/Tinkercad_Getting_Started_Guide_ISTE.pdf) offers starter circuits, virtual components, block/text coding, schematic view, and simulation for electronics learning. Neither of these cited official descriptions claims X Layer TapeOut factory deployment, transistor issuance disclosure, or onchain circuit receipts. This is a **workflow distinction**, not evidence that our product is a superior simulator. CircuitDesk should avoid trying to recreate their broad simulators in a hackathon window; it should make the verified manufacturing/receipt path understandable and inspectable.

There is also direct overlap risk with the organizer's own TapeOut interface. The product must add value after the official factory UI: a use case, clearer preflight cost/terms, intelligible lifecycle states, and a reusable receipt/passport. If it only restyles the factory, judges have little reason to use it.

## Demo sequence judges can verify quickly

1. Show the user's task and the selected supported circuit/template; explain exactly what the circuit can and cannot do.
2. Show processor address, chain, supply, unit price, cap, estimated spend, and linked official factory source before signing.
3. Show the user's own factory processor-creation receipt, then connect a wallet on X Layer for the actual circuit mint/tapeout request and outcome. If using prior confirmed transactions in the recording, say so and show timestamps within the window.
4. Open the tapeout receipt and X Layer explorer; reload the app and read the circuit/processor state independently. Evaluate the confirmed circuit through a separately labeled read-only `eth_call` and compare it to the local preview.
5. Show a second user path (share link or repeat workflow) and one error path (wrong network or rejected transaction).

No sponsor criterion is assigned a fabricated numeric weight or award probability. The demo should carry the same names, contract addresses, values, and transaction hashes as the README and submission form.
