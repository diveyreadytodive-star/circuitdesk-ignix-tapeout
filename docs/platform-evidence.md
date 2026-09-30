# TapeOut X Layer integration evidence

Checked on **2026-09-30 KST**. This file records the source and execution boundary for the CircuitDesk adapter. It is evidence that TapeOut's public X Layer stack can create and evaluate circuits; it is **not** evidence that CircuitDesk has already launched its own processor.

## Sources and contract identity

- [IGNIX campaign](https://ignix.bot/x_campaign) requires X Layer mainnet factory deployment, public issuance terms, and one circuit tapeout.
- [OKX X Layer network information](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information) gives chain ID **196**, OKB gas currency, public RPC `https://rpc.xlayer.tech`, and explorer.
- TapeOut's live [L2 client bundle](https://tapeout.net/assets/l2-CYZpWPZp.js), [netlist module](https://tapeout.net/assets/netlist-nwZJybgD.js), and [tapeout flow module](https://tapeout.net/assets/l2Tapeout-DpmBbfTA.js) expose the X Layer factory, selectors, netlist format, creation and mint/tapeout sequence. This is the shipped client interface, not an independent audit of its contracts.
- Factory proxy: `0x1f09daefa827f02cbb40967cc91b259763760761`. A read-only RPC call returned nonempty proxy code (130 bytes); the EIP-1967 implementation slot pointed to `0x74956236ab64ed143933040b4137e8a352e4d17b`, with 7,671 bytes of code. The adapter pins that implementation and checks the public and wallet RPC views before writes. Upgrades can still happen after a check and before inclusion.
- `eth_chainId` returned `0xc4` (196). `cpuCount()` returned **256** during the first independent check, then **257** in a later read. The count is live chain state, not a project adoption metric.

The campaign-linked [developer-channel post 181](https://t.me/IGNIXOfficial/181) displayed only a public Telegram preview. Browser security policy rejected opening its post body and explicitly prohibited a workaround. No claim here depends on unread post content.

## ABI and netlist scope

The [adapter](../src/platform/browser.js) uses the client-exposed factory `createCPU(string,string,string,uint256,uint256) payable`, `cpuCount`, `cpuAt`, `isCPU`, `deployFee`; processor `factory`, `transistors`, `nextId`, `circuitInfo`, `ownerOf`, `netlist`, `eval`, `TAPEOUT_FEE`, and `tapeout(bytes,uint32,uint32) payable`; and transistor `supplyCap`, `minted`, `mintPrice`, `protocolFee`, `creator`, `circuits`, `balanceOf`, and `mint`.

The shipped netlist format represents NAND as opcode `0x00` followed by two big-endian 24-bit signal references. Inputs begin after constant signals 0 and 1. CircuitDesk synthesizes **two-input AND (2 NAND), OR (3 NAND), and XOR (4 NAND)**. Local truth tables are deterministic previews. `eval` is a read-only `eth_call`; it produces an onchain contract response at a block but **no transaction hash or receipt**. A successful `tapeout` is a separate signed transaction, with a `TapedOut` event and circuit ID.

Read-only reference: public CPU #0 `0x839bdd6fa7a66416a609a735e11de5411b98574e`, circuit #1, 2 inputs, 1 output, 4 NAND. On X Layer, evaluating packed inputs `00, 01, 10, 11` returned `0, 1, 1, 0`. The leader separately ran the project adapter against that circuit: `[1,0] → [1]` at block **71,982,620**. This CPU/circuit belongs to someone else and is always labeled as a public reference in the app.

The reference circuit's real [TapedOut transaction](https://www.oklink.com/xlayer/tx/0x407402bee88c4663f64ea2c4c3184277c381f32546c4bceaabc8a31776b49210) is `0x407402bee88c4663f64ea2c4c3184277c381f32546c4bceaabc8a31776b49210` at block **71,026,051**. Its event identifies circuit #1 and author `0x571d447f4f24688ec35ccf07f1d6993655f6af15`. The exported `verifyReceipt` independently checked the X Layer receipt status, transaction destination, event, circuit metadata and exact XOR netlist. This is useful for testing a shared demo link; it is **external protocol evidence, not our contest deployment**.

## Local fork write spike

The guarded [`technical/fork-spike.mjs`](../technical/fork-spike.mjs) refuses to send unless the endpoint reports **Anvil** and chain 196. With `anvil --fork-url https://rpc.xlayer.tech --port 8547 --silent --auto-impersonate`, the leader independently ran a code-empty **synthetic local** account through:

1. `createCPU` with 100,000 supply and 0.000066 OKB mint price;
2. mint of four NAND (4 units at unit price plus protocol fee);
3. XOR tapeout into circuit #1;
4. netlist/event/readback, 4→0 transistor balance, wrong-fee revert, and all four XOR evaluations;
5. independent `verifyReceipt` checks for the local creation and tapeout hashes;
6. a second creation → mint → tapeout through the **same EIP-1193 adapter methods used by the browser**, with a synthetic Anvil provider. The second circuit evaluated `[1,0] → [1]`.

The script returned `LOCAL_ANVIL_FORK_ONLY`, XOR outputs `[0,1,1,0]`, `wrongFeeReverted: true`, `receiptsIndependentlyVerified: true`, and a successful `browserAdapterLifecycle`. Local fork addresses and hashes are **not** X Layer mainnet receipts and must never enter the submission form as such.

The same guarded fork also exercised a partial-spend failure: a synthetic wallet confirmed a second 2-NAND mint, then rejected the tapeout signature. The adapter returned the confirmed mint hash and a non-refund warning; readback showed **2 NAND still in the synthetic wallet**. This verifies the error path and the need to distinguish a completed mint from a completed circuit.

## Fees and security boundary

At the observed block, factory deploy fee was **0.0066 OKB**, transistor mint protocol fee **0.00066 OKB** per mint call, and tapeout fee **0.0013 OKB**. Four NAND at the proposed 0.000066 OKB/unit add **0.000264 OKB**, for **0.008824 OKB plus gas** across three signatures when the wallet holds no NAND. Each fee and balance needs a fresh check at action time. The proposal and consequences are in [issuance-proposal.md](../submission/issuance-proposal.md).

Mint and tapeout are separate transactions. If mint confirms and the later tapeout is rejected or reverts, the paid mint and its gas are not automatically reversed; the user may still hold the transistors. Third parties can mint from a public processor and consume its available supply. The TapeOut [frontend bundle](https://tapeout.net/assets/index-CMTeTi9V.js) warns that X Layer contracts are in a test phase, unsealed, and not independently audited. The adapter performs local validation, chain guard, public/wallet state comparison, current fee checks, implementation pin, event decoding, and readback; these reduce accidental wrong calls but do not make the external contracts audited or immutable.

## Missing contest evidence

No CircuitDesk-owned processor, deployment wallet, or circuit tapeout has been verified on X Layer mainnet. The user must review and sign those real transactions. After they confirm, verify both receipts and the circuit on chain, add actual addresses/terms/timestamps to README and the form draft, then record the video. Until then `readiness.json` must remain ineligible.
