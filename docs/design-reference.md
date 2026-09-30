# CircuitDesk interface references

Observed in a live browser on 2026-09-30 (Asia/Seoul). These are commercial products in the circuit design and simulation category, not TapeOut or X Layer implementations. Observations describe their public screens, not their private code or assets.

## CircuitLab — editor

- Reference: [CircuitLab homepage](https://www.circuitlab.com/) → **Launch CircuitLab** → [public editor sample](https://www.circuitlab.com/editor/7pq5wm/?from=homepage).
- Screen observed: a working guest editor showing a sample analog circuit, a component toolbox, and a simulation mode. The guest banner says the demo is time limited and cannot save schematics.
- Typography: compact `Helvetica Neue` / Helvetica / Arial at about 13 px for controls. The white canvas and black wire labels carry the technical information; editor chrome uses dark charcoal bars.
- Layout: top menu strip (`File`, `Edit`, `Run`, `Help`); approximately 206 px component toolbox at left; large graph-paper schematic in the center; optional assistant pane on the right; Build/Simulate and zoom controls on the bottom edge.
- Spacing and density: compact tool cells and short menu labels, with a dense icon library in the left rail. The central canvas gets most of the width. At 1280 × 720 the right assistant compresses the schematic area substantially.
- Interaction rule: load an actual sample in one click, then manipulate components and switch to simulation. The first use instructions are placed on the canvas; a contextual assistant is separate from the core workflow.
- Useful pattern for CircuitDesk: bring users directly to a prepared, editable example and keep the technical artifact in a generous center stage. Do not copy the crowded tool palette, CircuitLab branding, artwork, or editor layout exactly.

## EveryCircuit — interactive app

- Reference: [EveryCircuit live app](https://everycircuit.com/app).
- Screen observed: guest demo workspace. A sign-up modal appeared after loading; it was dismissed to inspect the live example. No account was created or terms accepted.
- Typography: Montserrat / Arial at about 13 px for application text. The app uses light gray text on near-black panels and bright green, violet, orange, and blue signal accents.
- Layout: shallow top navigation; examples and tutorials in a left column; plot over a circuit canvas in the center; component details and an optional AI explanation panel on the right. Bottom canvas actions control simulation. At 1280 × 720, multiple rails leave about a third of the screen to the schematic.
- Spacing and density: dense application chrome with close vertical stacking in the examples list, moderate padding in the assistant cards, clear pane borders. Color and movement focus attention on live signal paths.
- Interaction rule: the first view already runs a circuit; selecting a component exposes parameters. Example cards describe a real task; changing a value updates the simulation rather than taking the user through a marketing page.
- Useful pattern for CircuitDesk: instant result feedback and task-oriented templates. Our interface should keep the data preview but reserve wallet calls for a distinct, reviewed action. We will not reproduce its neon signal animation, logos, copy, or component artwork.

## Autodesk Tinkercad Circuits — onboarding cross-check

- Reference: [Tinkercad Circuits](https://www.tinkercad.com/circuits).
- Public screen observed: green full-width hero with a large animated circuit and two prominent start/join actions; below it, explanatory sections and a starter library. The actual editor requires entering the product account flow, so this is an onboarding comparison only.
- Beginner pattern: the first visible promise is making something work, and starter circuits bridge an intimidating blank canvas. CircuitDesk adopts the intent of a guided first project without copying Tinkercad's green palette, typography, assets, or page structure.

## CircuitDesk direction

- Purpose: help a newcomer select a small Boolean circuit, test its truth table, see the exact component requirement and deployment evidence, then use a wallet to tape it out on the verified X Layer processor.
- Tone: an instrument panel for a small digital foundry. Warm off-white technical paper against ink-blue structure, orange signal highlights, and precise monospace numbers. This deliberately separates it from the references' generic gray editor and neon simulation canvas.
- Signature view: a central truth table and wiring diagram update together, while a visible preflight column explains what is local preview and what a mainnet wallet action would do.
- Mobile rule: turn the three-pane desktop workbench into a linear `Choose → Test → Preflight → Receipt` sequence without hiding fees or chain status.
- Boundary: the local truth-table preview is never presented as a chain evaluation; a chain receipt requires a verified transaction. Any unavailable factory, unverified address, disconnected wallet, unsupported chain, or insufficient balance gets a named state and a recovery action.

## Sources and verification limit

- Live browser screens above were inspected directly. The product feature claims are limited to those visible screens.
- [IGNIX hackathon campaign](https://ignix.bot/x_campaign) requires a real X Layer factory processor and one taped-out circuit; [IGNIX docs index](https://ignix.bot/docs) currently documents the older token launchpad and does not by itself supply a TapeOut ABI. The UI's final chain action must follow the separately verified TapeOut adapter.
