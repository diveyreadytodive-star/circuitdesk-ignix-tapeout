# Browser and visual verification

Date: 2026-09-30 Asia/Seoul. **Leader** ran the live IAB browser against the local server at `http://127.0.0.1:4173/web/`. **Strategy/QA agent C** independently inspected all nine saved screenshots and reran the 5 Node tests. These checks show a usable development build; they do not show a user wallet transaction, our own mainnet processor, or a submitted contest entry.

## Saved visual evidence

| View | Screenshot | What is visible |
| --- | --- | --- |
| Desktop landing | [desktop-landing.jpg](../ui/desktop-landing.jpg) | Hero, product task, X Layer chain badge, wallet button, own schematic illustration, clear workbench entry. |
| Desktop workbench | [desktop-workbench.jpg](../ui/desktop-workbench.jpg) | Template choice, selected XOR review-disagreement task, local truth table, preflight with no processor selected. |
| Desktop public chain result | [desktop-chain-proof.jpg](../ui/desktop-chain-proof.jpg) | Local XOR input `1,0 → 1` and a separately labeled public-reference `eth_call` result at block 71986055. The screen explicitly says this is **not our project** and that no transaction was sent. |
| Desktop verified reference receipt | [desktop-public-reference-receipt.jpg](../ui/desktop-public-reference-receipt.jpg) | A real public XOR tapeout transaction is labeled **“verified third-party X Layer transaction”**. The card says it does not establish CircuitDesk ownership or contest entry, and links the external receipt. |
| Desktop processor | [desktop-processor.jpg](../ui/desktop-processor.jpg) | Factory-verified public CPU #0 with cap 100,000, minted 100,000 and circuit count 103; processor creation is separate. This is a reference CPU, not CircuitDesk's. |
| Mobile landing | [mobile-landing.jpg](../ui/mobile-landing.jpg) | Header, hero and schematic reflow at 390 px viewport without horizontal clipping. |
| Mobile workbench | [mobile-workbench.jpg](../ui/mobile-workbench.jpg) | Template panel followed by signal preview in a single-column flow. |
| Mobile public chain result | [mobile-chain-proof.jpg](../ui/mobile-chain-proof.jpg) | Truth table, `eth_call` reference result at block 71986374, and preflight below it. The reference is labeled as an existing circuit. |
| Mobile processor preflight | [mobile-create-preflight.jpg](../ui/mobile-create-preflight.jpg) | Processor fields, suggested 100,000 cap and 0.000066 OKB unit-price placeholders, current **0.0066 OKB + gas** creation fee, test-phase/unsealed/unaudited warning, and wallet-review CTA. This screenshot does **not** show a confirmed transaction. |

## Live behavior reported by the leader

- Desktop viewport **1440 × 900** and mobile viewport **390 × 844**: document scroll width matched viewport width; no horizontal overflow in either.
- Selected XOR inputs `1,0`: local preview returned `1`, and the existing public X Layer circuit returned `1` via read-only `eth_call`; no transaction hash was shown for that call.
- Focused a truth-table row and pressed **Enter**; choosing row `1,1` changed local output to `0`. One `h1`, a skip link, and four live/status regions were observed. No browser console warning or error was observed in this pass.
- Invalid CPU address ending in `dEaD` produced a friendly factory-verification error and kept tapeout disabled. Public CPU #0 has its 100,000-unit cap minted, so its tapeout preflight remained disabled by insufficient supply.
- The create-processor dialog displayed the read live factory fee and risk warning. No wallet transaction was sent.
- The final create-dialog source prefills exactly the reviewed **proposal** in [issuance-proposal.md](../../submission/issuance-proposal.md): `CircuitDesk Logic One`, `CDL1`, the public purpose sentence, 100,000 cap, and 0.000066 OKB per unit. These are editable inputs, not onchain values or proof of deployment.

## Pending-write and receipt integrity checks (leader, live IAB)

- B added a persisted **UNVERIFIED** pending-hash record to lock out duplicate paid writes after page reload. The leader inserted only a **synthetic localStorage createCPU hash** of `0x00…00` (no wallet request or transaction) into the local test page. The UI displayed “UNVERIFIED MAINNET TRANSACTION / RETRY LOCKED”, kept an explorer link to the unverified hash, and disabled `createSubmit`. A reload preserved the lock. The explorer link is a lookup aid, **not proof that the hash exists or succeeded**.
- The leader cleared that synthetic record and removed temporary QA pages. The app returned to “NOT DEPLOYED” and `createSubmit` was enabled. No real pending user transaction was cleared.
- With a genuine **third-party** CPU #0 / circuit #1 / `&tx` URL, the app displayed a verified reference receipt and explicitly denied CircuitDesk ownership. A forged all-zero `&tx` hash did **not** yield a confirmed receipt. This checks proof-label integrity for those two cases, not the user's own mainnet lifecycle.

## C's visual verdict and limits

**PASS as a local, reviewable prototype:** desktop hierarchy and mobile single-column flow are coherent; the reference circuit, local preview, and mainnet preflight are visibly separated. The warm-paper/navy palette and original schematic are distinct from the cited commercial references in [design-reference.md](../../docs/design-reference.md). The dense microcopy in the desktop preflight and mobile chain note is small, so key risk and fee text should be checked on a real phone before filming. The mobile dialog screenshot is scrolled to its lower fields and does not by itself prove the title/close control is visible at the top of the dialog.

B applied the prescribed visual-verdict loop against saved live CircuitLab and EveryCircuit reference images kept outside the public repository. First pass **87/revise** identified CTA/metadata contrast and chain-proof visibility. After focused CSS contrast changes and a companion chain-proof capture, second pass **93/pass** was recorded in local `.omx/state/visual/ralph-progress.json`. The remaining layout note is that the read-only proof sits below the first 900 px workbench viewport; the companion [desktop-chain-proof.jpg](../ui/desktop-chain-proof.jpg) shows it. These are visual QA judgments, not proof of onchain project eligibility.

Accessibility evidence includes manual skip-link, headings/status regions, Enter-key row activation, and width/overflow checks. B measured contrast after a focused CSS pass: primary CTA **5.40:1**, selected kicker **5.59:1**, step index **6.31:1**, detail label **5.55:1**, preflight foot **5.25:1**, disabled CTA text/background **6.55:1**; these sampled normal-text pairs exceed WCAG AA's 4.5:1 threshold. This is **not** a full automated accessibility or screen-reader audit. Error checks cover invalid processor and exhausted supply; actual wallet rejection, insufficient OKB, gas failure, reorg and a confirmed own-circuit receipt were **not** observed in this browser pass.

## Test evidence

`node --test` independently returned **5 passed, 0 failed**: template truth tables/backward signals, XOR netlist match against a public circuit, ABI calldata vectors, integer-exact issuance estimate excluding gas, and invalid economics rejection before wallet access. Local fork evidence is recorded separately in [technical-verification.md](technical-verification.md).

`node --check web/main.js`, `node --check src/platform/browser.js`, and `git diff --check` also exited **0** in C's independent pass. These checks do not exercise a wallet or contract write.

C scanned Markdown local links across the repository; **0 missing local targets** were found. External and hosted URLs still require separate live checks.
