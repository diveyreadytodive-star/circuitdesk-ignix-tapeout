# Requirement-by-requirement readiness checklist

Status as of 2026-09-30 Asia/Seoul. **Verified** means this project has direct evidence; **Pending** means the contest requirement is unmet or has not yet been proven. Recheck after implementation and before the final form. Source: [official campaign](https://ignix.bot/x_campaign#hackathon-rules), [live form](https://docs.google.com/forms/d/e/1FAIpQLSd7USjG6LUNNRxwFWY4YEuSY0V0xv8VZNCl6z_-lGSl96vWZA/viewform).

| Requirement | Current status | What closes it |
| --- | --- | --- |
| Online event and live submission path | **Verified** 2026-09-30 | Campaign rendered “Online”; linked Google Form showed fields and Submit button. Reconfirm before submission. |
| Deadline and separate pre-registration | **Verified with limit** | Rendered deadline 2026-10-06 13:00 KST. No separate registration cutoff was stated on the observed official surfaces; do not assume future changes. |
| Processor deployed through TapeOut factory on X Layer mainnet (chain 196) | **Pending** | Official factory address/ABI and successful mainnet deployment receipt; separate read-only `isCPU`/equivalent check and explorer link. |
| Public transistor supply, unit price, any cap at deployment | **Pending** | Deployment call parameters and contract reads match publicly accessible README and app. Disclose currency, units, and any cap scope. |
| At least one circuit taped out on that processor in window | **Pending** | Successful mainnet receipt, circuit identity and processor link, block timestamp before 2026-10-06 13:00 KST, readback after reload. |
| Real read-only circuit evaluation, if pitched | **Platform capability verified; our circuit pending** | An existing XOR circuit on CPU #0 returned `0,1,1,0` via chain-196 `eth_call`. Verify our own confirmed circuit against local truth table and label the result as a read-only call without a transaction hash. |
| Clear use case | **Implemented locally; mainnet proof pending** | Guided “review disagreement check”: two manual flags, XOR truth table, component/fee preflight and public reference evaluation. It is advisory and does not enforce a release or wallet action. |
| Product demo | **Local browser verified; public/video pending** | Localhost app captured at 1440×900 and 390×844 with no horizontal overflow and no console errors in the observed pass; [browser QA](../review/qa/browser-verification.md) records screenshots and error states. Still need public URL and user-recorded video. |
| Processor address and deployment wallet in submission | **Pending** | Verified public addresses added to README and form description. |
| Public GitHub repository | **Created, upload not yet verified** | Repo URL: [circuitdesk-ignix-tapeout](https://github.com/diveyreadytodive-star/circuitdesk-ignix-tapeout). Confirm committed source, README, license, tests, remote HEAD and signed-out access after push. An empty repo does not close this gate. |
| No fake trading or fabricated usage | **Design constraint** | Never generate wash/matched/self trades or invent adoption. Keep separate transaction evidence. |
| Contract security/economic model | **Proposal and local tests; mainnet risk remains** | Five Node tests pass; guarded Anvil fork completed create→mint→tapeout→eval, and exact [issuance proposal](issuance-proposal.md) separates three paid wallet actions. TapeOut's client warns X Layer contracts are in a test phase, unsealed, and not independently audited; no contract audit or real wallet write was performed. |
| User contact and final form | **Reserved for user** | User enters Telegram/contact email, uploads video, reviews all fields and clicks Submit. Save actual receipt after submission. |

**Eligibility verdict now: not ready.** A local demo, working adapter, public repo, or signed transaction proposal alone cannot close the mainnet processor and circuit gates.
