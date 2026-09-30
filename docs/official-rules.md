# Official rules and submission status

Observed **2026-09-30 Asia/Seoul** from the rendered [IGNIX × X Layer campaign](https://ignix.bot/x_campaign) and its linked [Google submission form](https://docs.google.com/forms/d/e/1FAIpQLSd7USjG6LUNNRxwFWY4YEuSY0V0xv8VZNCl6z_-lGSl96vWZA/viewform). The rendered page matters for the dynamic dates: the static web crawler text still says “Loading dates”. No form response was entered or submitted.

| Topic | Official evidence and practical meaning |
| --- | --- |
| Event | “TapeOut Genesis Transistor Hackathon”; the campaign calls it an **online** event. No offline final or attendance condition is listed in the displayed rules. This is an absence in the published rules, not a guarantee against later organizer updates. |
| Window | Campaign rendered **2026-09-22 13:00 to 2026-10-06 13:00 UTC+09:00** (KST). The form intro says **Sep 22 12:00 to Oct 6 12:00 HKT**; HKT is UTC+08:00, so the dates match. Confirm again before the actual tapeout and form submission. |
| Current entry status | The linked form displayed all fields and an enabled **Submit** button on 2026-09-30. No separate pre-registration form or registration cutoff appears on the campaign or submission form. This supports “submission currently open”; it does not prove eligibility or successful receipt. |
| Prize | 1st **USD 8,000** plus designation as Ignix Genesis Transistor, 2nd **USD 4,000**, 3rd **USD 2,000**; cash pool **USD 14,000**. The winner’s transistor and circuits are planned to receive dedicated Ignix vault mechanics. |
| Mainnet processor | The processor must be deployed on X Layer through the **TapeOut factory**. Campaign footer displays **X Layer chain ID 196**. [OKX's X Layer network documentation](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information) independently confirms mainnet chain ID **196**, native token **OKB**, RPC `https://rpc.xlayer.tech`, and the X Layer explorer; testnet is a distinct chain ID **1952**. FAQ explicitly says mainnet launch is required. |
| Issuance | Transistor **supply**, **unit price**, and **any cap** must be set and publicly disclosed **at deployment**. A post hoc README statement alone is insufficient if deployment values differ. |
| Usage | At least **one circuit must be taped out on the processor before the window closes**. The FAQ permits circuits from anyone; a real processor that is used matters. |
| Submission content | Clear use case plus **processor contract address**, **deployment wallet**, **product demo**, and **project description**. The form intro says all links must be publicly accessible. |
| Conduct | Trading volume and asset price are not the sole criteria. Wash trading, matched orders, self-trading, other fake trading, fraud, and plagiarism can void eligibility. |
| Risk notice | The organizer disclaims investment advice, endorsement, or return commitment; participants must assess digital-asset risk and applicable law. |

## Judging criteria

The campaign lists application innovation; depth of TapeOut ecosystem integration; product completeness and UX; asset issuance design; quality of X Layer integration; user growth potential; and contract security/economic model. **No numeric weights were published** in the campaign or linked form at observation time. See [judge-strategy.md](judge-strategy.md) for the evidence map.

## Form field inventory

The active Google Form displayed:

| Field | Required? | Notes |
| --- | --- | --- |
| Email recorded with response | Yes, via a visible account email recording choice | Do not include account identity in public documents. The final user submission must handle this account-specific choice. |
| Project Name | Yes | Text field. |
| Project Description | Yes | Long text. Put processor address, deployment wallet, token supply/unit price/cap, demo and proof links here when actually known. |
| X Account | No | Optional. |
| Telegram | Yes | User-provided contact; leave placeholder until the user enters it. |
| Contact Email | Yes | User-provided contact; leave placeholder until the user enters it. |
| GitHub Repository | Yes | Must be public and reachable. |
| X Post Link | No | Optional public introductory post. |

The form does **not** expose separate boxes for processor address, wallet, economics, or demo. The official requirements still demand those facts; include them in the description and public README. Do not invent the values or submit the form before the user’s video and verified chain evidence are ready.

## What is not yet established by these pages

The linked [IGNIX docs](https://ignix.bot/docs) describe a launchpad, bonding curve, vaults, and token API. Their public index did not expose a TapeOut factory ABI, address, circuit schema, or runtime evaluation interface during this check. The campaign points to [Ignix Developers Channel post 181](https://t.me/IGNIXOfficial/181) for technical resources; its public landing page showed only a channel preview. The leader's attempt to open the post was automatically rejected by the browser's security policy (“Browser Use is not permitted on this page”), so its text was **not read**, and no alternate UI attempt was made. Technical integration is instead documented from the public TapeOut frontend bundles and independent read-only X Layer RPC/local-fork checks in [Round 2](../decisions/round-2-technical-review.md). Do not interpret “processor” as arbitrary general computation without contract evidence.

## Evidence links

- [Official campaign and full rules](https://ignix.bot/x_campaign#hackathon-rules)
- [Active submission form](https://docs.google.com/forms/d/e/1FAIpQLSd7USjG6LUNNRxwFWY4YEuSY0V0xv8VZNCl6z_-lGSl96vWZA/viewform)
- [Official IGNIX docs index](https://ignix.bot/docs)
- [Developer channel link from campaign/form](https://t.me/IGNIXOfficial/181)
- [Official OKX X Layer network information](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information)
