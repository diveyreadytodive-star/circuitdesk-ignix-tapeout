# Official rules verification log

Reviewer: **strategy/QA agent C**. Observed 2026-09-30 Asia/Seoul. This log describes read-only checks; no contact information was entered, no wallet connected, and no form submitted.

| Claim checked | Method and evidence | Verdict |
| --- | --- | --- |
| Event dates and format | Opened the rendered [IGNIX campaign](https://ignix.bot/x_campaign) in a live browser. It displayed 2026.09.22 13:00–2026.10.06 13:00 UTC+09:00 and “Format: Online.” A web crawler view only said “Loading dates”; the rendered browser supplied the dynamic value. | **PASS at observation time** |
| Cash awards and Genesis condition | Same rendered campaign: $8,000 / $4,000 / $2,000; first place transistor becomes Ignix Genesis Transistor with planned dedicated vault mechanics. | **PASS** |
| Mainnet and circuit requirements | Rendered rules require processor via factory, supply/unit price/cap disclosure at deployment, one taped-out circuit by close, use case, address/wallet/demo/description; FAQ states mainnet required. | **PASS** |
| Judging and conduct | Rendered campaign lists seven criteria without percentages and prohibits wash, matched, self and other fake trading. | **PASS** |
| Form availability, deadline and fields | Opened the linked [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSd7USjG6LUNNRxwFWY4YEuSY0V0xv8VZNCl6z_-lGSl96vWZA/viewform) in a live browser. Intro said Sep 22 12:00–Oct 6 12:00 HKT; it showed Project Name, Project Description, Telegram, Contact Email, GitHub Repository as required, X Account and X Post Link as optional, plus a Submit button and account-email recording choice. | **PASS at observation time; no submission attempted** |
| Separate registration and offline final | Neither observed official campaign nor form listed separate pre-registration or an offline final. | **No such condition observed; recheck before deadline** |
| TapeOut technical docs | The public [IGNIX docs](https://ignix.bot/docs) index described launchpad/vault/token topics, not a TapeOut ABI. The [developer-channel post link](https://t.me/IGNIXOfficial/181) opened a public preview without post text. The leader's attempt to open View Post was auto-rejected by browser security policy; the post was not read and was not retried through another UI. | **ABI not established from these pages** |

The contest facts above are independent of code implementation. Processor deployment, circuit tapeout, live demo, and final submission remain separate evidence gates in [requirements-checklist.md](../../submission/requirements-checklist.md).
