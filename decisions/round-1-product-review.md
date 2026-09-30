# Round 1 — product direction review

Date: 2026-09-30 (Asia/Seoul). Participants: leader, technical integration agent A, product/UI agent B, judging and verification agent C. This is an internal product review, not a claim that an external jury or human teammates approved the idea.

## Evidence brought to the review

- The live [campaign](https://ignix.bot/x_campaign#hackathon-rules) demands a real X Layer factory-deployed processor, public supply/price/cap, and at least one circuit tapeout before 2026-10-06 13:00 KST. The FAQ says actual mainnet launch and use matter.
- The public [IGNIX documentation](https://ignix.bot/docs) mainly explains its token launchpad; its index does not document the TapeOut ABI. A located a live TapeOut L2 client bundle (`https://tapeout.net/assets/l2-CYZpWPZp.js`) exposing a chain-196 factory address `0x1f09daefa827f02cbb40967cc91b259763760761`, `createCPU`, `cpuCount/cpuAt/isCPU`, processor `tapeout(bytes,uint32,uint32)` and `circuitInfo`, and transistor `mint/supplyCap/mintPrice`. **This is client-bundle evidence, pending separate chain readback/contract verification.**
- B observed a product opening in guided template selection and a plain-language truth-table preview; the official canvas could already cover raw creation, so our app needs a distinct novice flow and receipt inspection.
- C mapped all seven published criteria in [judge-strategy.md](../docs/judge-strategy.md). No official numeric weighting is published.

## Alternatives and objections

| Option | Advocate's case | Counterargument |
| --- | --- | --- |
| Guided Boolean-template lab + passport | Gives a concrete novice task: choose a rule, preview a reproducible truth table, inspect actual transistor units/cost, tape out with a wallet, and verify the receipt. Integrates both creation and readback. | A truth table is initially local until the TapeOut netlist and any evaluation semantics are confirmed. It must not imply that onchain processor execution occurred. Official canvas overlap is substantial unless guidance and verification are genuinely clearer. |
| Processor/circuit passport only | Safest truthful surface if circuit creation is poorly documented; shows issued terms, real tapeouts, and receipts. | Weak application innovation and repeat use; may read as a custom block explorer. It remains a supporting surface. |
| Binary decision-card runtime | Most intuitive repeated end-user utility if actual circuit evaluation exists. | No evidence yet of a runtime evaluation ABI or arbitrary compute. Claiming it would be misleading. Defer it unless direct contract and live-chain proof emerge. |

## Decision and conditions

**Selected:** guided Boolean-template lab as the MVP, with a processor/circuit passport as its evidence view. The product may simulate a Boolean truth table locally and label it as a preview. It can expose a wallet tapeout action only when A proves the official factory, processor lifecycle, netlist encoding, units, pricing, and transaction path. The UI must make any unavailable onchain step explicit rather than fake an outcome.

**Dissent retained:** C considers the passport-only path more defensible if netlist encoding or costing is unavailable, and B noted that the official TapeOut canvas may already offer templates. The leader resolved this by requiring an actual novice workflow and independent receipt readback as the differentiation, and by making the creation step conditional on the technical spike.

**Changed from initial CircuitDesk framing:** We removed the unproven promise that a user can *run* a processor to obtain an onchain decision result. The supported story is selecting/previewing a circuit, taping it out where proven, and verifying its permanent identity and economics. Any runtime use claim needs separate evidence.

## Exit to technical integration review

The next round must test the factory address against chain 196; decode real processor records and at least one circuit; verify `tapeout` parameter meanings and circuit byte format; determine whether source/ABI is authoritative and current; and compare local cost preview to contract behavior. Unresolved fields are blockers to a real call and to eligibility claims. See the forthcoming round-2 record.
