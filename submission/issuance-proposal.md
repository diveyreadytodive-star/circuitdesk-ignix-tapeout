# Mainnet issuance and spend proposal — for user review before signing

**Status: proposal, no CircuitDesk asset deployed or purchased.** Observed contract fees on 2026-09-30 may change. The browser wallet must show each actual destination, value, gas and data before the user signs. TapeOut's X Layer frontend warns its contracts are in a test phase, are not sealed and have not been independently audited.

**Refreshed read-only fee check: 2026-10-02 23:58 KST.** Factory deployment fee still read `0.0066 OKB`; the public reference processor reported `0.00066 OKB` protocol fee and `0.0013 OKB` tapeout fee. Its own transistor mint price is **0 OKB**, so the proposed `0.000066 OKB` unit price above remains a proposal; the new processor's fees and gas must be read in the app immediately before signing.

| Parameter | Proposed value | Reason and consequence |
| --- | --- | --- |
| Network | X Layer mainnet, chain 196, native OKB | Required by the contest. Testnet chain 1952 does not qualify. |
| Factory | `0x1f09daefa827f02cbb40967cc91b259763760761` | Client-bundle and live RPC address; recheck factory code/implementation and fees before the wallet prompt. |
| Processor name / symbol / story | **Proposed:** `CircuitDesk Logic One` / `CDL1` / `Open Boolean circuits for verifiable two-signal reviews and reusable learning on X Layer.` | The app prefills these editable public fields. Review spelling and purpose before signing; avoid personal details or promises of asset return. |
| Combined NAND + LATCH transistor supply cap | **100,000 units proposed** | A ceiling, not pre-minted supply or evidence of demand. More headroom than 10,000 for an open workbench and raises the cost of a third party buying all capacity from roughly 0.66 to 6.6 OKB at proposed price, before fees. No cap prevents hoarding. |
| Unit mint price | **0.000066 OKB per transistor** = `66,000,000,000,000` wei proposed | Low price suggested in the observed TapeOut UI. It is paid when transistors are minted. Do not describe this as an investment, return, or price forecast. |
| First circuit | XOR disagreement check, **4 NAND**, 0 LATCH | Two manually supplied pass/needs-work flags; output 1 when they differ. The circuit is a transparent rule worksheet, not an automatic release or wallet control. |

## Observed first-run charges (fresh quote required)

| User wallet action | Observed contract charge | What becomes irreversible if confirmed |
| --- | --- | --- |
| 1. `createCPU` at factory | `0.0066 OKB` + gas | New public processor and its issuance cap/price. The current client indicates those values cannot be edited later; verify exact calldata/readback before approval. |
| 2. `mint` 4 NAND on the new transistor contract | `4 × 0.000066 + 0.00066` = `0.000924 OKB` + gas | Pays for 4 transistor units plus protocol fee. **Mint and tapeout are separate transactions, not atomic.** If mint confirms but the next prompt is rejected, fee changes, or tapeout reverts, the wallet may hold the 4 paid NAND tokens **without a circuit**. The mint payment and gas are not reversed by the later failure; no automatic refund is promised. |
| 3. `tapeout` XOR on the processor | `0.0013 OKB` + gas | Consumes the 4 NAND units and creates a public circuit ID/receipt if successful. A failed or rejected transaction is not qualifying tapeout evidence. |
| **Three actions total** | **`0.008824 OKB` + gas at observed values** | Exact wallet quotes may differ and must be reviewed at action time. This number is a budget illustration, not spending authorization. |

The app must re-read supply cap, minted count, unit price, mint protocol fee, tapeout fee, wallet holdings, factory recognition, and network before signing. It should warn if third parties have minted supply since the prior view; anyone able to call the public mint function may exhaust or hoard the remaining cap. Third-party demand is not proof of legitimate use. If the factory implementation or fees change, stop and review the new call. The user can abandon any unsigned wallet prompt. Already confirmed creation or mint transactions cannot simply be undone by closing the browser. In particular, **do not sign mint assuming tapeout is guaranteed to follow**.

After the user chooses to sign and the network confirms, copy **actual** processor address, deployment wallet, supply, price, cap, creation receipt, circuit ID and tapeout receipt into the README, form description, and demo. Until then, the entry is not mainnet-ready.
