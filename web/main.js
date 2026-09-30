const $ = (id) => document.getElementById(id);
const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const txPattern = /^0x[a-fA-F0-9]{64}$/;
const pendingKey = "circuitdesk-unverified-write-v1";
const fallbackTemplates = [
  {
    id: "xor",
    name: "Review disagreement",
    description: "Compare two manual review flags. A result of 1 means they disagree; this is an advisory signal.",
    nIn: 2,
    nOut: 1,
    gateCount: 4,
    latchCount: 0,
    symbol: "⊕",
    truthTable: [0, 1, 1, 0],
    previewOnly: true,
  },
  {
    id: "nand",
    name: "NAND primitive",
    description: "The one-gate building block. Output is 0 only when both inputs are 1.",
    nIn: 2,
    nOut: 1,
    gateCount: 1,
    latchCount: 0,
    symbol: "⊼",
    truthTable: [1, 1, 1, 0],
    previewOnly: true,
  },
];

const state = {
  platform: null,
  templates: fallbackTemplates,
  selected: fallbackTemplates[0],
  bits: [0, 0],
  processor: null,
  wallet: null,
  factoryReady: false,
  busy: false,
  reference: null,
  lastChainRead: null,
  chainReadError: null,
  cost: null,
  costError: null,
  costRequest: 0,
  factory: null,
  operationStatus: null,
  projectCircuit: null,
  retryBlocked: false,
  createBlocked: false,
  pendingWrite: null,
};

function storedPending() {
  try {
    const item = JSON.parse(localStorage.getItem(pendingKey) || "null");
    return item && txPattern.test(item.hash) && ["createCPU", "mint", "tapeout"].includes(item.action)
      && (!item.processor || addressPattern.test(item.processor)) ? item : null;
  } catch { return null; }
}

function canPersistRetryLock() {
  try {
    localStorage.setItem(`${pendingKey}-probe`, "1");
    localStorage.removeItem(`${pendingKey}-probe`);
    return true;
  } catch { return false; }
}

function savePending(item) {
  state.pendingWrite = { ...item, chainId: 196, recordedAt: new Date().toISOString() };
  state.createBlocked = item.action === "createCPU";
  state.retryBlocked = item.action !== "createCPU";
  try { localStorage.setItem(pendingKey, JSON.stringify(state.pendingWrite)); } catch { /* In-memory lock still applies. */ }
}

function clearPending() {
  state.pendingWrite = null;
  state.createBlocked = false;
  state.retryBlocked = false;
  try { localStorage.removeItem(pendingKey); } catch { /* No persisted copy available. */ }
}

function setText(id, value) {
  $(id).textContent = value ?? "—";
}

function shortAddress(value) {
  return typeof value === "string" && value.length > 14
    ? `${value.slice(0, 7)}…${value.slice(-5)}`
    : value || "—";
}

function normalizedInt(value) {
  try { return BigInt(value || 0); } catch { return 0n; }
}

function formatInteger(value) {
  try { return BigInt(value || 0).toLocaleString("en-US"); } catch { return String(value ?? "—"); }
}

function formatWei(wei) {
  if (wei === undefined || wei === null) return "—";
  try {
    const amount = BigInt(wei);
    const integer = amount / 10n ** 18n;
    const fraction = (amount % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
    return `${integer}${fraction ? `.${fraction}` : ""} OKB`;
  } catch { return "—"; }
}

function status(message, type = "wait") {
  const node = $("preflightState");
  node.textContent = message;
  node.className = `state-banner state-${type}`;
}

function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 6000);
}

function errorText(error) {
  const message = String(error?.shortMessage || error?.message || error || "Unknown error");
  if (/rejected|denied|cancelled/i.test(message)) return "The wallet request was cancelled.";
  return message.length > 220 ? `${message.slice(0, 217)}…` : message;
}

function operationMessage(event) {
  if (typeof event === "string") return event;
  if (!event || typeof event !== "object") return "Waiting for wallet or network response…";
  const action = ({ createCPU: "Processor deployment", mint: "NAND mint", tapeout: "Circuit tapeout" })[event.action] || "Transaction";
  if (event.step === "awaiting-wallet") return `${action}: review ${formatWei(event.valueWei || 0)} plus network gas in your wallet before signing.`;
  if (event.step === "pending") return `${action} submitted: ${shortAddress(event.hash)}. Waiting for X Layer confirmation…`;
  if (event.step === "confirmed") return `${action} confirmed: ${shortAddress(event.hash)}${event.circuitId ? ` · circuit #${event.circuitId}` : ""}.`;
  return `${action}: ${String(event.step || "working")}`;
}

function normalizeTemplate(template) {
  const id = String(template.id || template.templateId || template.name || "unknown").toLowerCase();
  const known = fallbackTemplates.find((item) => item.id === id);
  return {
    ...known,
    ...template,
    id,
    name: id === "xor" ? "Review disagreement" : (template.name || known?.name || id.toUpperCase()),
    description: id === "xor" ? known.description : (template.description || known?.description || "A validated Boolean netlist template."),
    nIn: Number(template.nIn ?? template.inputs ?? known?.nIn ?? 2),
    nOut: Number(template.nOut ?? template.outputs ?? known?.nOut ?? 1),
    gateCount: Number(template.gateCount ?? template.nandCount ?? known?.gateCount ?? 0),
    latchCount: Number(template.latchCount ?? known?.latchCount ?? 0),
    symbol: template.symbol || known?.symbol || "◇",
    previewOnly: false,
  };
}

function getOutputs(template, inputs) {
  const index = inputs.reduce((acc, bit, position) => acc + (Number(bit) << position), 0);
  const row = template.truthTable?.[index];
  if (typeof row === "number" || typeof row === "boolean") return [Number(row)];
  if (Array.isArray(row)) return row.map(Number);
  if (row && typeof row === "object") {
    const output = row.outputs ?? row.outputBits ?? row.output;
    if (Array.isArray(output)) return output.map(Number);
    if (typeof output === "number" || typeof output === "boolean") return [Number(output)];
  }
  if (template.id === "xor") return [inputs[0] ^ inputs[1]];
  if (template.id === "nand") return [Number(!(inputs[0] && inputs[1]))];
  return ["—"];
}

function currentInputs() {
  return state.bits.slice(0, state.selected?.nIn || 2);
}

function selectTemplate(id) {
  const next = state.templates.find((item) => item.id === id);
  if (!next) return;
  state.selected = next;
  state.bits = Array.from({ length: Math.min(next.nIn, 8) }, () => 0);
  state.lastChainRead = null;
  state.chainReadError = null;
  state.operationStatus = null;
  renderTemplates();
  renderPreview();
  renderPreflight();
  renderChainRead();
  updateCost();
}

function renderTemplates() {
  const list = $("templateList");
  list.replaceChildren();
  for (const template of state.templates) {
    const button = document.createElement("button");
    button.className = "template-card";
    button.type = "button";
    button.setAttribute("aria-pressed", String(template.id === state.selected?.id));
    const icon = document.createElement("span");
    icon.className = "template-icon";
    icon.textContent = template.symbol;
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = template.name;
    const meta = document.createElement("small");
    meta.textContent = `${template.gateCount} NAND  ·  ${template.latchCount} LATCH`;
    copy.append(title, meta);
    const arrow = document.createElement("span");
    arrow.className = "template-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    button.append(icon, copy, arrow);
    button.addEventListener("click", () => selectTemplate(template.id));
    list.append(button);
  }
  setText("templateNotice", state.templates.every((item) => item.previewOnly)
    ? "Local examples are available. Tapeout templates will unlock only when their netlists pass platform verification."
    : "These netlist templates are checked by the platform adapter. Read a processor before a wallet action.");
}

function renderPreview() {
  const template = state.selected;
  if (!template) return;
  setText("selectedName", template.name);
  setText("selectedDescription", template.description);
  setText("selectedSymbol", template.symbol);
  setText("gateLabel", template.id.toUpperCase());
  setText("gateCountLabel", `${template.gateCount} NAND · ${template.latchCount} LATCH`);
  setText("activeOutput", getOutputs(template, currentInputs()).join(""));

  const wires = $("inputWires");
  wires.replaceChildren();
  for (let index = 0; index < Math.min(template.nIn, 8); index += 1) {
    const row = document.createElement("div");
    row.className = "signal-input";
    const label = document.createElement("span");
    label.textContent = template.id === "xor" ? ["E", "O"][index] || String(index + 1) : String.fromCharCode(65 + index);
    const button = document.createElement("button");
    button.className = "bit-button";
    button.type = "button";
    button.textContent = String(state.bits[index]);
    button.setAttribute("aria-label", `${template.id === "xor" ? ["Expected", "Observed"][index] : `Input ${String.fromCharCode(65 + index)}`} is ${state.bits[index]}; toggle`);
    button.setAttribute("aria-pressed", String(Boolean(state.bits[index])));
    button.addEventListener("click", () => {
      state.bits[index] = state.bits[index] ? 0 : 1;
      state.lastChainRead = null;
      state.chainReadError = null;
      renderPreview();
      renderChainRead();
    });
    const line = document.createElement("span");
    line.className = "wire";
    line.setAttribute("aria-hidden", "true");
    row.append(label, button, line);
    wires.append(row);
  }

  const head = $("truthHead");
  const body = $("truthBody");
  head.replaceChildren();
  body.replaceChildren();
  const headingRow = document.createElement("tr");
  for (let index = 0; index < Math.min(template.nIn, 8); index += 1) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = template.id === "xor" ? ["EXPECTED", "OBSERVED"][index] || `IN ${index + 1}` : `IN ${String.fromCharCode(65 + index)}`;
    headingRow.append(th);
  }
  const outHeading = document.createElement("th");
  outHeading.scope = "col";
  outHeading.textContent = "OUTPUT";
  headingRow.append(outHeading);
  head.append(headingRow);
  const rowCount = 2 ** Math.min(template.nIn, 8);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const inputs = Array.from({ length: template.nIn }, (_, bit) => (rowIndex >> bit) & 1);
    const outputs = getOutputs(template, inputs);
    const tr = document.createElement("tr");
    tr.tabIndex = 0;
    tr.setAttribute("aria-label", `Inputs ${inputs.join(", ")}, output ${outputs.join(", ")}; select inputs`);
    if (inputs.every((bit, index) => bit === state.bits[index])) tr.className = "active";
    for (const bit of inputs) {
      const td = document.createElement("td");
      td.textContent = String(bit);
      tr.append(td);
    }
    const outputCell = document.createElement("td");
    outputCell.className = "output-cell";
    outputCell.textContent = outputs.join("");
    tr.append(outputCell);
    const choose = () => {
      state.bits = inputs;
      state.lastChainRead = null;
      state.chainReadError = null;
      renderPreview();
      renderChainRead();
    };
    tr.addEventListener("click", choose);
    tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    body.append(tr);
  }
}

function renderPreflight() {
  const template = state.selected;
  setText("requiredNand", template ? formatInteger(template.gateCount) : "—");
  setText("requiredLatch", template ? formatInteger(template.latchCount) : "—");
  setText("processorShort", state.processor ? shortAddress(state.processor.address) : "Not selected");
  setText("unitPrice", state.processor ? formatWei(state.processor.mintPriceWei) : "—");
  const cost = state.cost;
  setText("heldMint", cost ? `${formatInteger(cost.heldNand)} / ${formatInteger(cost.toMint)}` : "—");
  const componentPrice = cost ? normalizedInt(cost.toMint) * normalizedInt(state.processor.mintPriceWei) : null;
  setText("componentPrice", componentPrice === null ? "—" : formatWei(componentPrice));
  setText("mintFee", cost ? formatWei(normalizedInt(cost.toMint) > 0n ? state.processor.protocolFeeWei : 0) : "—");
  setText("tapeoutFee", cost ? formatWei(cost.tapeoutFeeWei) : "—");
  setText("totalPrice", cost ? formatWei(cost.totalValueWei) : "—");
  setText("costDisclosure", cost
    ? `Estimated ${cost.walletActions} wallet transaction${cost.walletActions === 1 ? "" : "s"}: ${formatWei(cost.totalValueWei)} total transaction value, excluding network gas. Other users may mint from this processor's shared cap before you do. X Layer TapeOut contracts are in test phase, unsealed and unaudited.`
    : "Choose a verified processor to read live terms and a fee estimate. The current TapeOut frontend marks X Layer contracts as test phase, unsealed and unaudited. Network gas is separate.");
  const button = $("tapeoutButton");
  const supported = Boolean(template && !template.previewOnly && state.platform?.tapeoutCircuit);
  button.disabled = state.busy || state.retryBlocked || !state.processor?.verified || !supported || !cost || Boolean(state.costError);
  button.innerHTML = "";
  button.append(document.createTextNode(!state.processor ? "Choose a processor first" : !supported ? "Netlist not yet verified" : state.retryBlocked ? "Check pending transaction" : state.busy ? "Waiting for wallet…" : state.costError ? "Tapeout unavailable" : !cost ? "Calculating live cost…" : state.wallet ? "Tape out on X Layer" : "Connect wallet to tape out"));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  button.append(arrow);
  if (state.operationStatus) status(state.operationStatus.message, state.operationStatus.type);
  else if (!state.platform) status("Platform adapter unavailable. Local preview only.", "error");
  else if (!state.factoryReady) status("Factory read unavailable. Try again when X Layer RPC responds.", "error");
  else if (!state.processor) status("Factory reachable. Select a verified processor for the mainnet preflight.", "wait");
  else if (!state.processor.verified) status("Processor could not be verified against the factory. Tapeout is disabled.", "error");
  else if (!supported) status("Processor verified. This template's tapeout netlist has not passed adapter checks.", "wait");
  else if (state.retryBlocked) status("A prior mainnet transaction is unverified. Inspect its hash and unlock retry before another write.", "error");
  else if (state.costError) status(`Cost preflight failed: ${state.costError}`, "error");
  else if (!cost) status("Processor verified. Reading the live mint balance and fees…", "wait");
  else status("Processor and netlist verified. Review the terms before asking your wallet to sign.", "good");
}

async function updateCost() {
  const request = ++state.costRequest;
  state.cost = null;
  state.costError = null;
  renderPreflight();
  if (!state.processor?.verified || !state.selected || !state.platform?.estimateTemplateCost || state.selected.previewOnly) return;
  try {
    const cost = await state.platform.estimateTemplateCost({
      processor: state.processor,
      templateId: state.selected.id,
      walletAddress: state.wallet || undefined,
    });
    if (request !== state.costRequest) return;
    state.cost = cost;
  } catch (error) {
    if (request !== state.costRequest) return;
    state.costError = errorText(error);
  }
  renderPreflight();
}

function renderChainRead() {
  const button = $("chainReadButton");
  const reference = state.projectCircuit?.templateId === state.selected?.id ? state.projectCircuit : state.reference;
  button.disabled = !state.platform?.evaluateCircuit || !reference || state.selected?.id !== reference.templateId || state.busy;
  if (state.lastChainRead) {
    setText("chainReadStatus", `X Layer eth_call at block ${state.lastChainRead.blockNumber} returned ${state.lastChainRead.outputBits.join("")} for inputs ${state.lastChainRead.inputs.join("")}. ${reference.label || "Circuit"} · #${reference.circuitId}. No transaction was sent.`);
  } else if (state.chainReadError) {
    setText("chainReadStatus", `Read failed: ${state.chainReadError.replace(/[.!?]+$/, "")}. Local preview remains separate.`);
  } else if (reference && state.selected?.id === reference.templateId) {
    setText("chainReadStatus", `${reference.label || "Verified circuit"}, circuit #${reference.circuitId}. Read selected inputs from chain without gas or a wallet.${reference === state.reference ? " This is not our project deployment." : ""}`);
  } else {
    setText("chainReadStatus", "A verified public reference is available for the matching template. Select it to compare a read-only X Layer result.");
  }
}

function renderProcessor() {
  const processor = state.processor;
  const tag = $("processorVerifiedTag");
  tag.textContent = processor?.verified ? "FACTORY VERIFIED" : processor ? "UNVERIFIED" : "NOT LOADED";
  tag.className = processor?.verified ? "verified-tag" : "unverified-tag";
  setText("processorName", processor?.name || (processor ? "Unnamed processor" : "Select a deployed processor"));
  setText("processorStory", processor?.story || (processor ? "No public story supplied." : "Its factory origin and economics will appear here after a live read."));
  setText("processorFullAddress", processor?.address);
  setText("processorCreator", processor?.creator);
  setText("processorSupply", processor ? formatInteger(processor.supplyCap) : "—");
  setText("processorMinted", processor ? formatInteger(processor.minted) : "—");
  setText("processorUnitPrice", processor ? formatWei(processor.mintPriceWei) : "—");
  setText("processorCircuits", processor ? formatInteger(processor.circuitCount) : "—");
  const link = $("processorExplorer");
  if (processor?.address && addressPattern.test(processor.address)) {
    link.href = `${state.platform?.PLATFORM?.explorer || "https://www.oklink.com/xlayer"}/address/${processor.address}`;
    link.hidden = false;
  } else link.hidden = true;
  renderPreflight();
}

function renderRecentProcessors(processors) {
  const list = $("processorList");
  list.replaceChildren();
  if (!processors.length) {
    const note = document.createElement("p");
    note.className = "micro-copy";
    note.textContent = "No recent processors were returned by this RPC read. Paste a known address above.";
    list.append(note);
    return;
  }
  for (const entry of processors.slice(0, 6)) {
    const address = typeof entry === "string" ? entry : entry.address;
    if (!addressPattern.test(address || "")) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "processor-chip";
    const name = document.createElement("span");
    name.textContent = entry.name || "Processor";
    const addr = document.createElement("small");
    addr.textContent = shortAddress(address);
    button.append(name, addr);
    button.addEventListener("click", () => loadProcessor(address));
    list.append(button);
  }
}

async function loadProcessor(address) {
  if (!state.platform?.readProcessor) throw new Error("X Layer read adapter is not available.");
  if (!addressPattern.test(address)) throw new Error("Enter a complete 0x processor address.");
  setText("processorStory", "Reading the processor from X Layer…");
  try {
    const processor = await state.platform.readProcessor(address);
    if (state.projectCircuit?.processor?.toLowerCase() !== address.toLowerCase()) state.projectCircuit = null;
    state.processor = processor;
    state.operationStatus = null;
    state.retryBlocked = Boolean(state.pendingWrite && state.pendingWrite.action !== "createCPU");
    $("processorAddress").value = address;
    renderProcessor();
    updateCost();
    if (!processor?.verified) throw new Error("The address is not verified as a processor from the selected TapeOut factory.");
    const url = new URL(window.location.href);
    const linkedProcessor = url.searchParams.get("processor");
    if (!linkedProcessor || linkedProcessor.toLowerCase() !== address.toLowerCase()) {
      url.searchParams.delete("circuit");
      url.searchParams.delete("tx");
    }
    url.searchParams.set("processor", address);
    history.replaceState(null, "", url);
    toast("Processor verified from the X Layer factory.");
  } catch (error) {
    state.processor = null;
    state.cost = null;
    state.costRequest += 1;
    renderProcessor();
    setText("processorStory", errorText(error));
    status(errorText(error), "error");
    throw error;
  }
}

async function loadSharedCircuit(circuitId) {
  if (!state.processor?.verified || !state.platform?.readCircuit) return;
  try {
    const circuit = await state.platform.readCircuit(state.processor.address, circuitId);
    const template = state.templates.find((item) => item.netlistHex?.toLowerCase() === circuit.netlistHex?.toLowerCase()
      && item.nIn === circuit.nIn && item.nOut === circuit.nOut && item.gateCount === circuit.gateCount);
    if (!template) throw new Error("The selected processor circuit does not match a validated CircuitDesk template.");
    const txHash = new URLSearchParams(location.search).get("tx");
    if (txHash) {
      if (!txPattern.test(txHash) || !state.platform.verifyReceipt)
        throw new Error("A valid tapeout receipt verifier is required for this shared link.");
      await state.platform.verifyReceipt({
        hash: txHash, type: "circuit", processor: state.processor.address,
        circuitId: circuit.id, templateId: template.id,
      });
    }
    selectTemplate(template.id);
    state.projectCircuit = {
      processor: state.processor.address,
      circuitId: circuit.id,
      templateId: template.id,
      label: "Verified circuit on selected processor",
    };
    renderChainRead();
    if (txHash) renderReceipt({ hash: txHash, processor: state.processor.address, circuitId: circuit.id }, "circuit", "shared");
    toast(`Circuit #${circuit.id} verified against its onchain netlist.`);
  } catch (error) {
    setText("chainReadStatus", `Selected circuit could not be verified: ${errorText(error).replace(/[.!?]+$/, "")}. Public reference remains available for XOR.`);
  }
}

async function connect() {
  if (!state.platform?.connectWallet) throw new Error("Wallet integration is not available.");
  const address = await state.platform.connectWallet();
  state.wallet = address;
  setText("walletButton", shortAddress(address));
  renderPreflight();
  updateCost();
  return address;
}

function receiptLink(hash) {
  return `${state.platform?.PLATFORM?.explorer || "https://www.oklink.com/xlayer"}/tx/${hash}`;
}

function renderReceipt(receipt, type, source = "session") {
  if (!receipt?.hash || !txPattern.test(receipt.hash)) return;
  const card = $("receiptCard");
  card.replaceChildren();
  const icon = document.createElement("div");
  icon.className = "receipt-empty-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✓";
  const content = document.createElement("div");
  const kicker = document.createElement("span");
  kicker.className = "step-index";
  kicker.textContent = source === "session" ? "CONFIRMED X LAYER TRANSACTION IN THIS SESSION" : "INDEPENDENTLY VERIFIED X LAYER TRANSACTION";
  const title = document.createElement("h3");
  title.textContent = type === "processor" ? "Processor deployed" : "Circuit taped out";
  const info = document.createElement("p");
  info.textContent = source !== "session"
    ? "The linked processor, circuit and transaction were independently checked on X Layer. This does not establish ownership or contest entry by CircuitDesk."
    : type === "processor"
      ? "The processor exists on mainnet. Tape out a supported circuit before claiming the project meets the hackathon requirement."
      : "A confirmed circuit tapeout exists. Verify its contract and circuit ID on the chain.";
  const rows = document.createElement("div");
  rows.className = "receipt-details";
  const addr = document.createElement("span");
  addr.textContent = `Processor: ${receipt.address || receipt.processor || state.processor?.address || "—"}`;
  const circuit = document.createElement("span");
  circuit.textContent = type === "processor" ? "Circuit: still required" : `Circuit ID: ${receipt.circuitId ?? "check transaction"}`;
  const link = document.createElement("a");
  link.href = receiptLink(receipt.hash);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `Open tx ${shortAddress(receipt.hash)} ↗`;
  rows.append(addr, circuit, link);
  content.append(kicker, title, info, rows);
  card.append(icon, content);
}

function renderPartialMint(error) {
  const confirmed = Array.isArray(error?.confirmedMintHashes) ? error.confirmedMintHashes.filter((hash) => txPattern.test(hash)) : [];
  const submitted = Array.isArray(error?.mintHashes) ? error.mintHashes.filter((hash) => txPattern.test(hash)) : [];
  const tapeoutHash = txPattern.test(error?.tapeoutHash || "") ? error.tapeoutHash : null;
  if (!confirmed.length && !submitted.length && !tapeoutHash) return;
  const card = $("receiptCard");
  card.replaceChildren();
  const icon = document.createElement("div");
  icon.className = "receipt-empty-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "!";
  const content = document.createElement("div");
  const kicker = document.createElement("span");
  kicker.className = "step-index";
  kicker.textContent = "PARTIAL MAINNET ACTION / NO VERIFIED CIRCUIT";
  const title = document.createElement("h3");
  title.textContent = confirmed.length ? "NAND mint confirmed" : submitted.length ? "NAND mint submitted" : "Tapeout transaction submitted";
  const info = document.createElement("p");
  info.textContent = confirmed.length
    ? "Paid transistors remain in the wallet and are not automatically refunded. The circuit tapeout is not verified."
    : submitted.length
      ? "The mint transaction's final status is unknown. Check the explorer before retrying. The circuit tapeout is not verified."
      : "The tapeout transaction's final status is unknown. Check the explorer before retrying. No confirmed circuit is shown here.";
  const rows = document.createElement("div");
  rows.className = "receipt-details";
  for (const hash of submitted) {
    const link = document.createElement("a");
    link.href = receiptLink(hash);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${confirmed.includes(hash) ? "Confirmed mint" : "Submitted mint"} ${shortAddress(hash)} ↗`;
    rows.append(link);
  }
  if (tapeoutHash) {
    const link = document.createElement("a");
    link.href = receiptLink(tapeoutHash);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Submitted tapeout ${shortAddress(tapeoutHash)} ↗`;
    rows.append(link);
  }
  content.append(kicker, title, info, rows);
  card.append(icon, content);
}

function renderUnverifiedDeployment(hash) {
  if (!txPattern.test(hash || "")) return;
  const card = $("receiptCard");
  card.replaceChildren();
  const content = document.createElement("div");
  const kicker = document.createElement("span");
  kicker.className = "step-index";
  kicker.textContent = "TRANSACTION SUBMITTED / PROCESSOR NOT VERIFIED";
  const title = document.createElement("h3");
  title.textContent = "Check the factory transaction";
  const explanation = document.createElement("p");
  explanation.textContent = "A deployment request was sent, but its processor address and economics did not pass final readback. Do not deploy again until this transaction is inspected.";
  const link = document.createElement("a");
  link.href = receiptLink(hash);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "text-link";
  link.textContent = `Inspect ${shortAddress(hash)} ↗`;
  content.append(kicker, title, explanation, link);
  card.append(content);
}

function renderPendingWrite(item) {
  const card = $("receiptCard");
  card.replaceChildren();
  const content = document.createElement("div");
  const kicker = document.createElement("span");
  kicker.className = "step-index";
  kicker.textContent = "UNVERIFIED MAINNET TRANSACTION / RETRY LOCKED";
  const title = document.createElement("h3");
  title.textContent = item.action === "createCPU" ? "Check the processor deployment" : item.action === "mint" ? "Check the NAND mint" : "Check the circuit tapeout";
  const explanation = document.createElement("p");
  explanation.textContent = item.action === "createCPU"
    ? "A factory transaction was submitted. It might have deployed a processor, so another deployment is blocked until this hash is checked."
    : item.action === "mint"
      ? "A NAND mint was submitted. Its final state and paid balance need checking before another tapeout attempt."
      : "A tapeout transaction was submitted. The circuit might already exist, so a duplicate attempt is blocked until this hash is checked.";
  const rows = document.createElement("div");
  rows.className = "receipt-details";
  const hashes = [item.hash, ...(Array.isArray(item.mintHashes) ? item.mintHashes : [])].filter((hash, index, all) => txPattern.test(hash) && all.indexOf(hash) === index);
  for (const hash of hashes) {
    const link = document.createElement("a");
    link.href = receiptLink(hash);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Inspect ${shortAddress(hash)} on X Layer ↗`;
    rows.append(link);
  }
  const unlock = document.createElement("button");
  unlock.type = "button";
  unlock.className = "button button-ink button-small";
  unlock.textContent = "I checked the hash; unlock retry";
  unlock.addEventListener("click", async () => {
    if (!window.confirm("Only unlock after checking the linked transaction on X Layer. A repeat write can spend OKB or create a duplicate. Unlock retry?")) return;
    clearPending();
    unlock.disabled = true;
    unlock.textContent = "Retry lock cleared";
    kicker.textContent = "RETRY LOCK CLEARED BY USER / PRIOR RESULT NOT VERIFIED";
    $("createSubmit").disabled = !state.factory;
    state.operationStatus = { message: "Retry unlocked after user review. Previous transaction is still unverified; live terms will be checked again.", type: "wait" };
    await updateCost();
    renderPreflight();
  });
  content.append(kicker, title, explanation, rows, unlock);
  card.append(content);
}

async function recoverPendingWrite() {
  const item = state.pendingWrite;
  if (!item || item.action === "mint" || !state.platform?.verifyReceipt) return;
  try {
    const type = item.action === "createCPU" ? "processor" : "circuit";
    const proof = await state.platform.verifyReceipt({
      hash: item.hash, type,
      processor: item.processor,
      templateId: item.templateId,
    });
    if (!proof?.verified) return;
    clearPending();
    if (type === "processor") renderReceipt({ hash: item.hash, address: proof.processor }, "processor", "recovered");
    else renderReceipt({ hash: item.hash, processor: proof.processor, circuitId: proof.circuitId }, "circuit", "recovered");
    const url = new URL(window.location.href);
    url.searchParams.set("processor", proof.processor);
    if (proof.circuitId) url.searchParams.set("circuit", String(proof.circuitId));
    url.searchParams.set("tx", item.hash);
    history.replaceState(null, "", url);
    state.operationStatus = { message: "Saved transaction independently verified on X Layer. No duplicate write is needed.", type: "good" };
    $("createSubmit").disabled = !state.factory;
    renderPreflight();
  } catch { /* Pending, reverted or mismatched writes remain locked until reviewed. */ }
}

async function readPublicReference() {
  const reference = state.projectCircuit?.templateId === state.selected?.id ? state.projectCircuit : state.reference;
  if (!reference || state.selected?.id !== reference.templateId || !state.platform?.evaluateCircuit) return;
  const button = $("chainReadButton");
  button.disabled = true;
  state.chainReadError = null;
  setText("chainReadStatus", reference === state.reference
    ? "Reading the existing public circuit from X Layer RPC…"
    : "Reading the selected verified circuit from X Layer RPC…");
  try {
    const inputs = currentInputs();
    const result = await state.platform.evaluateCircuit(reference.processor, reference.circuitId, inputs);
    state.lastChainRead = { inputs, blockNumber: result.blockNumber, outputBits: Array.isArray(result.outputBits) ? result.outputBits : [result.outputBits] };
    renderChainRead();
  } catch (error) {
    state.chainReadError = errorText(error);
    toast(errorText(error));
  } finally { renderChainRead(); }
}

async function tapeout() {
  if (state.retryBlocked || !state.processor?.verified || !state.cost || state.selected?.previewOnly || !state.platform?.tapeoutCircuit) return;
  if (!canPersistRetryLock()) {
    state.operationStatus = { message: "Browser storage is unavailable, so a submitted hash could be lost after reload. Tapeout is disabled until storage works.", type: "error" };
    renderPreflight();
    return;
  }
  if (!state.wallet) {
    try { await connect(); toast("Wallet connected. Review the terms, then request tapeout again."); }
    catch (error) { toast(errorText(error)); }
    return;
  }
  state.busy = true;
  state.operationStatus = { message: "Preparing onchain tapeout. Inspect each wallet request before signing…", type: "wait" };
  renderPreflight();
  try {
    const result = await state.platform.tapeoutCircuit({
      processor: state.processor.address,
      templateId: state.selected.id,
      onStatus: (event) => {
        if (event.step === "pending" && txPattern.test(event.hash || "")) {
          const mintHashes = event.action === "mint"
            ? [event.hash]
            : (state.pendingWrite?.mintHashes || []);
          savePending({ action: event.action, hash: event.hash, processor: state.processor.address, templateId: state.selected.id, mintHashes });
          renderPendingWrite(state.pendingWrite);
        }
        if (event.step === "confirmed" && event.action === "mint" && txPattern.test(event.hash || "")) {
          renderPartialMint({ mintHashes: [event.hash], confirmedMintHashes: [event.hash] });
        }
        if (event.step === "confirmed" && event.action === "tapeout") clearPending();
        state.operationStatus = { message: operationMessage(event), type: event.step === "confirmed" ? "good" : "wait" };
        renderPreflight();
      },
    });
    if (!result?.hash || !txPattern.test(result.hash)) throw new Error("Tapeout did not return a confirmed transaction hash.");
    clearPending();
    renderReceipt({ ...result, processor: state.processor.address }, "circuit");
    state.operationStatus = { message: "Circuit tapeout confirmed on X Layer. Open the transaction receipt below.", type: "good" };
    state.projectCircuit = { processor: state.processor.address, circuitId: result.circuitId, templateId: state.selected.id, label: "Newly taped-out circuit on selected processor" };
    state.lastChainRead = null;
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("processor", state.processor.address);
    shareUrl.searchParams.set("circuit", String(result.circuitId));
    shareUrl.searchParams.set("tx", result.hash);
    history.replaceState(null, "", shareUrl);
    renderChainRead();
    try { state.processor = await state.platform.readProcessor(state.processor.address); await updateCost(); } catch { /* Receipt remains visible; refresh can retry. */ }
    $("receipts").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    if (txPattern.test(error?.tapeoutHash || "")) savePending({ action: "tapeout", hash: error.tapeoutHash, processor: state.processor.address, templateId: state.selected.id, mintHashes: error.mintHashes || [] });
    else if (error?.mintHashes?.length && txPattern.test(error.mintHashes[0])) savePending({ action: "mint", hash: error.mintHashes[0], processor: state.processor.address, templateId: state.selected.id, mintHashes: error.mintHashes });
    renderPartialMint(error);
    const mintNote = error?.confirmedMintHashes?.length
      ? " A NAND mint was confirmed and remains on chain; no circuit tapeout was verified."
      : error?.mintHashes?.length
        ? " A NAND mint was submitted; inspect its status before retrying. No circuit tapeout was verified."
        : " No circuit tapeout was verified.";
    state.operationStatus = { message: `Tapeout stopped: ${errorText(error)}${mintNote}`, type: "error" };
    if (error?.tapeoutHash || (error?.mintHashes?.length && !error?.confirmedMintHashes?.length)) {
      state.retryBlocked = true;
      state.costError = "A transaction's final status is unknown. Check its explorer link before retrying.";
    } else if (error?.confirmedMintHashes?.length) {
      await updateCost();
    }
    toast(errorText(error));
  } finally {
    state.busy = false;
    renderPreflight();
  }
}

async function createProcessor(event) {
  event.preventDefault();
  if (state.createBlocked) { setText("createStatus", "A prior factory transaction is unverified. Inspect its hash and unlock retry first."); return; }
  if (!canPersistRetryLock()) { setText("createStatus", "Browser storage is unavailable, so a submitted hash could be lost after reload. Deployment is disabled until storage works."); return; }
  const form = $("createForm");
  if (!form.reportValidity()) return;
  if (!state.platform?.createProcessor) { setText("createStatus", "Factory write adapter is unavailable."); return; }
  const name = $("createName").value.trim();
  const symbol = $("createSymbol").value.trim();
  const story = $("createStory").value.trim();
  const supply = $("createSupply").value.trim();
  const mintPriceOkb = $("createPrice").value.trim();
  let mintPriceWei;
  try { mintPriceWei = state.platform.parseOkb(mintPriceOkb); }
  catch (error) { setText("createStatus", errorText(error)); return; }
  if (!/^\d+$/.test(supply) || normalizedInt(supply) <= 0n) {
    setText("createStatus", "Supply must be a positive whole number.");
    return;
  }
  if (!state.factory) { setText("createStatus", "Live factory fee is not available. Deployment is disabled."); return; }
  $("createSubmit").disabled = true;
  try {
    if (!state.wallet) await connect();
    setText("createStatus", "Preparing factory deployment. Review the fee, terms and gas in your wallet.");
    const result = await state.platform.createProcessor({
      name, symbol, story, supply, mintPriceWei,
      onStatus: (event) => {
        if (event.step === "pending" && txPattern.test(event.hash || "")) {
          savePending({ action: "createCPU", hash: event.hash });
          renderPendingWrite(state.pendingWrite);
        }
        if (event.step === "confirmed" && event.action === "createCPU") clearPending();
        setText("createStatus", operationMessage(event));
      },
    });
    if (!result?.hash || !txPattern.test(result.hash) || !addressPattern.test(result.address || "")) throw new Error("The factory did not return a confirmed processor address and transaction hash.");
    clearPending();
    renderReceipt(result, "processor");
    $("createDialog").close();
    await loadProcessor(result.address);
    const deployUrl = new URL(window.location.href);
    deployUrl.searchParams.set("processor", result.address);
    deployUrl.searchParams.set("tx", result.hash);
    history.replaceState(null, "", deployUrl);
    state.operationStatus = { message: "Processor deployed. A verified circuit tapeout is still required.", type: "good" };
    renderPreflight();
    toast("Processor deployment confirmed. A circuit tapeout is still required.");
  } catch (error) {
    if (error?.deploymentHash) {
      savePending({ action: "createCPU", hash: error.deploymentHash });
      renderUnverifiedDeployment(error.deploymentHash);
      setText("createStatus", `Factory transaction submitted but processor not verified. Inspect ${shortAddress(error.deploymentHash)} before another attempt. ${errorText(error)}`);
    } else setText("createStatus", errorText(error));
  } finally { $("createSubmit").disabled = state.createBlocked; }
}

async function init() {
  state.pendingWrite = storedPending();
  if (state.pendingWrite) {
    state.createBlocked = state.pendingWrite.action === "createCPU";
    state.retryBlocked = !state.createBlocked;
    renderPendingWrite(state.pendingWrite);
    if (state.retryBlocked) state.operationStatus = { message: "A previous mainnet transaction is unverified. Inspect its hash before retrying.", type: "error" };
  }
  renderTemplates();
  renderPreview();
  renderPreflight();
  renderChainRead();
  $("walletButton").addEventListener("click", async () => { try { await connect(); } catch (error) { toast(errorText(error)); } });
  $("processorForm").addEventListener("submit", async (event) => { event.preventDefault(); try { await loadProcessor($("processorAddress").value.trim()); } catch { /* The page displays the read error. */ } });
  $("chainReadButton").addEventListener("click", readPublicReference);
  $("tapeoutButton").addEventListener("click", tapeout);
  $("openCreateButton").addEventListener("click", () => $("createDialog").showModal());
  $("closeCreateButton").addEventListener("click", () => $("createDialog").close());
  $("createForm").addEventListener("submit", createProcessor);
  $("createPrice").addEventListener("input", () => {
    try { setText("createPriceWei", `${state.platform.parseOkb($("createPrice").value)} wei at deployment`); }
    catch { setText("createPriceWei", "Enter up to 18 decimal places of OKB."); }
  });
  try {
    state.platform = await import("../src/platform/browser.js");
    const templates = state.platform.TEMPLATES;
    if (Array.isArray(templates) && templates.length) {
      state.templates = templates.map(normalizeTemplate);
      state.selected = state.templates.find((item) => item.id === "xor") || state.templates[0];
      state.bits = Array.from({ length: state.selected.nIn }, () => 0);
      renderTemplates();
      renderPreview();
    }
    state.reference = state.platform.PUBLIC_REFERENCE || null;
    renderChainRead();
    const factory = state.platform.PLATFORM?.factory;
    if (!addressPattern.test(factory || "")) throw new Error("Factory address is not configured by the verified platform adapter.");
    state.factory = await state.platform.readFactory();
    state.factoryReady = true;
    setText("createDeployFee", `${formatWei(state.factory.deployFeeWei)} + network gas`);
    setText("createPriceWei", `${state.platform.parseOkb($("createPrice").value)} wei at deployment`);
    $("createSubmit").disabled = state.createBlocked;
    renderPreflight();
    await recoverPendingWrite();
    const sharedAddress = new URLSearchParams(location.search).get("processor");
    if (sharedAddress && addressPattern.test(sharedAddress)) await loadProcessor(sharedAddress);
    const sharedCircuit = new URLSearchParams(location.search).get("circuit");
    if (sharedCircuit && state.processor && /^\d+$/.test(sharedCircuit)) await loadSharedCircuit(sharedCircuit);
    else {
      const deployHash = new URLSearchParams(location.search).get("tx");
      if (deployHash && state.processor && txPattern.test(deployHash)) {
        try {
          await state.platform.verifyReceipt({ hash: deployHash, type: "processor", processor: state.processor.address });
          renderReceipt({ hash: deployHash, address: state.processor.address }, "processor", "shared");
        } catch (error) {
          setText("processorStory", `Processor read succeeded, but the shared deployment transaction was not verified: ${errorText(error)}`);
        }
      }
    }
    state.platform.listProcessors({ limit: 3 }).then((listing) => {
      renderRecentProcessors(Array.isArray(listing?.processors) ? listing.processors : []);
    }).catch((error) => {
      const node = document.createElement("p");
      node.className = "micro-copy";
      node.textContent = `Recent list unavailable: ${errorText(error)}. You can still paste an address.`;
      $("processorList").replaceChildren(node);
    });
  } catch (error) {
    state.factoryReady = false;
    renderPreflight();
    setText("templateNotice", `Local preview is available. Platform read failed: ${errorText(error)}`);
    console.warn("CircuitDesk platform read failed:", error);
  }
}

init();
