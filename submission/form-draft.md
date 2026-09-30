# English Google Form draft — do not submit until the mainnet and video gates pass

Form: [TapeOut Genesis Transistor Hackathon](https://docs.google.com/forms/d/e/1FAIpQLSd7USjG6LUNNRxwFWY4YEuSY0V0xv8VZNCl6z_-lGSl96vWZA/viewform). Fields were read from the live form on 2026-09-30. This is editable copy, **not a submitted response**. Replace every `[VERIFY …]` marker with direct evidence and check that public links open in a signed-out browser before submission. The user creates/uploads the demo video and makes the final form submission.

## Project Name — required

CircuitDesk

## Project Description — required

```text
CircuitDesk helps a newcomer understand and publish a small Boolean circuit on a TapeOut processor on X Layer. Its first task is a review disagreement check: two manually entered pass/needs-work flags feed XOR, which returns 1 when reviewers disagree. A guided template shows the local truth table, required components, and transaction terms before signing. After a confirmed tapeout, a shareable circuit passport links the processor, circuit ID, issuance settings, and X Layer receipt for independent verification. A separate read-only eth_call evaluates a deployed circuit; it has no transaction receipt and does not enforce a release decision.

Our processor on X Layer mainnet (chain 196): [VERIFY processor contract address]. Deployment wallet: [VERIFY public wallet address]. TapeOut factory: 0x1f09daefa827f02cbb40967cc91b259763760761. Transistor supply: [VERIFY supply and units]. Unit price: [VERIFY amount, OKB and units]. Cap: [VERIFY value and scope]. Processor creation receipt: [VERIFY explorer URL]. Circuit taped out on our processor within the window: [VERIFY circuit ID, tapeout transaction URL and block timestamp]. Read-only evaluation of our circuit: [VERIFY public circuit URL/readback]. Live demo: [VERIFY public URL]. Video walkthrough: [USER VIDEO URL]. GitHub: https://github.com/diveyreadytodive-star/circuitdesk-ignix-tapeout [VERIFY remote files after push].

The product makes no investment-return or artificial-usage claim. TapeOut's X Layer frontend warns its contracts are in a test phase, unsealed and not independently audited. Processor creation, transistor mint, and tapeout are separate wallet transactions; a paid mint may remain in the wallet without a circuit if tapeout does not confirm, and earlier spend/gas is not reversed. Costs, recipients and risks are disclosed before signing and in the README.
```

## X Account — optional

Leave blank unless the user supplies the project account.

## Telegram — required

`[USER TO ENTER TELEGRAM CONTACT]`

## Contact Email — required

`[USER TO ENTER CONTACT EMAIL]`

## GitHub Repository — required

`https://github.com/diveyreadytodive-star/circuitdesk-ignix-tapeout` — **verify remote HEAD and signed-out file access before pasting**.

## X Post Link — optional

Leave blank unless the user posts and supplies a public project introduction.

## Final paste checklist

- All bracketed markers removed; actual supply, price, cap and wallet agree with contract reads and README.
- Our processor creation and circuit tapeout transactions both succeeded on chain 196 within the allowed window. An existing sample CPU/circuit does not satisfy this gate.
- Read-only evaluation is labeled as `eth_call`; do not assign it a transaction hash or imply it enforces an external decision.
- Video and live demo URLs are public and match the build shown in the film.
- Contact details are entered by the user in the form, not committed to GitHub.
- GitHub is public and contains the source, instructions, license, proof links, and known limitations.
- Submit once only after the user finishes the video; save the confirmation/receipt separately.
