/** X Layer TapeOut browser adapter. No signing keys, server secrets, or dependencies. */
export const PLATFORM = Object.freeze({
  chainId: 196,
  chainIdHex: '0xc4',
  chainName: 'X Layer',
  currency: 'OKB',
  factory: '0x1f09daefa827f02cbb40967cc91b259763760761',
  factoryImplementation: '0x74956236ab64ed143933040b4137e8a352e4d17b',
  explorer: 'https://www.oklink.com/xlayer',
  rpcs: [
    'https://xlayerrpc.okx.com',
    'https://xlayer.drpc.org',
    'https://rpc.xlayer.tech',
  ],
  expectedTapeoutFeeWei: '1300000000000000',
});
export const PUBLIC_REFERENCE = Object.freeze({
  processor: '0x839bdd6fa7a66416a609a735e11de5411b98574e',
  circuitId: '1',
  label: 'Existing public X Layer XOR circuit (not this project)',
  templateId: 'xor',
});

const SELECTOR = Object.freeze({
  cpuCount: 'a94da8a7', cpuAt: '4bc7cbbd', isCPU: '5f5a364f', deployFee: 'eb2a5d2c',
  factory: 'c45a0155', transistors: '6fbd1719', nextId: '61b8ce8c',
  circuitInfo: '084d60f1', ownerOf: '6352211e', netlist: '3fc4be56', eval: '934d06ea',
  tapeoutFee: 'adfb2b69', supplyCap: '8f770ad0', minted: '4f02c420',
  mintPrice: '6817c76c', protocolFee: 'b0e21e8a', creator: '02d05d3f',
  circuits: '5f48772d', cpuName: '700ed104', story: '46c922d1', balanceOf: '00fdd58e',
  createCPU: '47f9b5fd', mint: '1b2ef1ca', tapeout: '7bd3ac1d',
});
const CPU_CREATED_TOPIC = '0x2e8868f18a1eaf0222b5b09484fdf12163e9741393f8457cd79d2ae42b2d2290';
const TAPED_OUT_TOPIC = '0xc11215e417669c143c8a07aeb778034c0a0a85ebdf305d64a629b19a7a9ce031';
const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const addressPattern = /^0x[0-9a-fA-F]{40}$/;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function address(value) {
  if (!addressPattern.test(String(value))) throw new Error('Expected a 20-byte contract address.');
  return String(value).toLowerCase();
}
function uint(value) {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new Error('Unsafe integer.');
  const n = BigInt(value);
  if (n < 0n || n >= 2n ** 256n) throw new Error('Uint256 out of range.');
  return n;
}
function word(value) { return uint(value).toString(16).padStart(64, '0'); }
function addressWord(value) { return address(value).slice(2).padStart(64, '0'); }
function hex(bytes) { return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''); }
function bytesFromHex(value) {
  const raw = String(value).replace(/^0x/, '');
  if (raw.length % 2 || /[^0-9a-f]/i.test(raw)) throw new Error('Invalid hex bytes.');
  return Uint8Array.from(raw.match(/../g)?.map(x => parseInt(x, 16)) ?? []);
}
function dynamic(bytes) {
  const raw = hex(bytes);
  return word(bytes.length) + raw.padEnd(Math.ceil(bytes.length / 32) * 64, '0');
}
function readWord(data, offset = 0) {
  const raw = String(data).replace(/^0x/, '');
  if (raw.length < (offset + 1) * 64) throw new Error('Short ABI return data.');
  return BigInt('0x' + raw.slice(offset * 64, (offset + 1) * 64));
}
function readAddress(data, offset = 0) {
  return '0x' + readWord(data, offset).toString(16).padStart(40, '0');
}
function readBytes(data) {
  const raw = String(data).replace(/^0x/, '');
  const start = Number(readWord(raw, 0));
  if (!Number.isSafeInteger(start) || start < 32 || start > raw.length / 2) throw new Error('Invalid ABI offset.');
  const length = Number(readWord(raw.slice(start * 2), 0));
  if (!Number.isSafeInteger(length) || length > 2_000_000) throw new Error('Invalid ABI byte length.');
  const payload = raw.slice((start + 32) * 2, (start + 32 + length) * 2);
  if (payload.length !== length * 2) throw new Error('Truncated ABI bytes.');
  return bytesFromHex(payload);
}
function encodeString(value) { return dynamic(textEncoder.encode(value)); }
function callData(selector, ...args) { return '0x' + SELECTOR[selector] + args.map(word).join(''); }
function callAddress(selector, value) { return '0x' + SELECTOR[selector] + addressWord(value); }
function callBalanceOf(owner, tokenId) { return '0x' + SELECTOR.balanceOf + addressWord(owner) + word(tokenId); }
function encodeCreateCPU({ name, symbol, story, supply, mintPriceWei }) {
  const parts = [name, symbol, story].map(encodeString);
  let offset = 160;
  const offsets = parts.map(part => { const at = offset; offset += part.length / 2; return word(at); });
  return '0x' + SELECTOR.createCPU + offsets.join('') + word(supply) + word(mintPriceWei) + parts.join('');
}
function encodeTapeout(netlistHex, nIn, nOut) {
  return '0x' + SELECTOR.tapeout + word(96) + word(nIn) + word(nOut) + dynamic(bytesFromHex(netlistHex));
}
function encodeEval(id, packedInputs) {
  return '0x' + SELECTOR.eval + word(id) + word(64) + dynamic(packedInputs);
}
function rpcError(error) {
  const message = error?.message || 'RPC call failed';
  return new Error(`${message}${error?.code != null ? ` (${error.code})` : ''}`);
}
async function postRpc(url, method, params = []) {
  const response = await fetch(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw rpcError(body.error);
  if (body.result == null && method !== 'eth_getTransactionReceipt' && method !== 'eth_getTransactionByHash')
    throw new Error('RPC returned no result.');
  return body.result;
}
async function publicRpc(method, params = []) {
  let last;
  for (const url of PLATFORM.rpcs) {
    try { return await postRpc(url, method, params); }
    catch (error) { last = error; }
  }
  throw new Error(`X Layer RPC unavailable: ${last?.message ?? 'unknown error'}`);
}
async function publicCall(to, data, block = 'latest') {
  return publicRpc('eth_call', [{ to: address(to), data }, block]);
}
async function publicUint(to, method, ...args) {
  return readWord(await publicCall(to, callData(method, ...args)));
}
function wallet() {
  const provider = globalThis.window?.ethereum;
  if (!provider?.request) throw new Error('An EIP-1193 wallet such as OKX Wallet or MetaMask is required.');
  return provider;
}
async function walletCall(to, data) {
  return wallet().request({ method: 'eth_call', params: [{ to: address(to), data }, 'latest'] });
}
async function walletUint(to, method, ...args) {
  return readWord(await walletCall(to, callData(method, ...args)));
}
function same(a, b) { return String(a).toLowerCase() === String(b).toLowerCase(); }
function requireEqual(label, a, b) {
  if (!same(a, b)) throw new Error(`${label} differs between the wallet and public X Layer RPC. Nothing was sent.`);
}
function topicAddress(topic) { return address('0x' + String(topic).slice(-40)); }
function emit(onStatus, step, detail = {}) { onStatus?.({ step, ...detail }); }
function txValue(value) { return '0x' + uint(value).toString(16); }

/** Price parser uses integer arithmetic; input is decimal OKB, no exponent notation. */
export function parseOkb(value) {
  const match = /^(\d+)(?:\.(\d{1,18}))?$/.exec(String(value).trim());
  if (!match) throw new Error('Enter a non-negative OKB amount with up to 18 decimal places.');
  return (BigInt(match[1]) * 10n ** 18n + BigInt((match[2] ?? '').padEnd(18, '0'))).toString();
}
export function formatOkb(value) {
  const n = uint(value), whole = n / 10n ** 18n, frac = (n % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : String(whole);
}

export async function readFactory() {
  const [chain, count, deployFeeWei, implementationRaw] = await Promise.all([
    publicRpc('eth_chainId'), publicUint(PLATFORM.factory, 'cpuCount'),
    publicUint(PLATFORM.factory, 'deployFee'),
    publicRpc('eth_getStorageAt', [PLATFORM.factory, IMPLEMENTATION_SLOT, 'latest']),
  ]);
  if (Number(chain) !== PLATFORM.chainId) throw new Error('RPC is not X Layer mainnet.');
  return { chainId: PLATFORM.chainId, factory: PLATFORM.factory,
    implementation: readAddress(implementationRaw), count: Number(count), deployFeeWei: deployFeeWei.toString() };
}
async function assertFactoryImplementation() {
  const factory = await readFactory();
  if (!same(factory.implementation, PLATFORM.factoryImplementation))
    throw new Error(`TapeOut factory implementation changed to ${factory.implementation}; review its ABI before any wallet action.`);
  const walletRaw = await wallet().request({ method: 'eth_getStorageAt', params: [PLATFORM.factory, IMPLEMENTATION_SLOT, 'latest'] });
  const walletImplementation = readAddress(walletRaw);
  if (!same(walletImplementation, PLATFORM.factoryImplementation))
    throw new Error(`Wallet RPC reports factory implementation ${walletImplementation}; review the contract before any wallet action.`);
  return factory;
}

export async function readProcessor(contract) {
  const cpu = address(contract);
  const recognized = await publicCall(PLATFORM.factory, callAddress('isCPU', cpu));
  if (readWord(recognized) !== 1n)
    throw new Error('This address is not a processor created by the X Layer TapeOut factory.');
  const [sourceFactory, transistorsHex, nextId] = await Promise.all([
    publicCall(cpu, callData('factory')),
    publicCall(cpu, callData('transistors')),
    publicUint(cpu, 'nextId'),
  ]);
  const tr = readAddress(transistorsHex);
  const [backlink, supplyCap, minted, mintPrice, protocolFee, creator, name, story, fee] = await Promise.all([
    publicCall(tr, callData('circuits')),
    publicUint(tr, 'supplyCap'), publicUint(tr, 'minted'),
    publicUint(tr, 'mintPrice'), publicUint(tr, 'protocolFee'),
    publicCall(tr, callData('creator')), publicCall(tr, callData('cpuName')),
    publicCall(tr, callData('story')), publicUint(cpu, 'tapeoutFee'),
  ]);
  const verified = same(readAddress(sourceFactory), PLATFORM.factory)
    && same(readAddress(backlink), cpu);
  if (!verified) throw new Error('This address is not a processor created by the X Layer TapeOut factory.');
  return {
    address: cpu, verified, transistors: tr, creator: readAddress(creator),
    name: textDecoder.decode(readBytes(name)), story: textDecoder.decode(readBytes(story)),
    supplyCap: supplyCap.toString(), minted: minted.toString(),
    mintPriceWei: mintPrice.toString(), protocolFeeWei: protocolFee.toString(),
    tapeoutFeeWei: fee.toString(), circuitCount: Number(nextId),
  };
}

export async function listProcessors({ limit = 8 } = {}) {
  const factory = await readFactory();
  const cap = Math.max(0, Math.min(24, Number(limit) || 0));
  const indices = Array.from({ length: Math.min(factory.count, cap) }, (_, i) => factory.count - i - 1);
  const rows = await Promise.all(indices.map(async index => {
    try {
      const raw = await publicCall(PLATFORM.factory, callData('cpuAt', index));
      return { index, ...await readProcessor(readAddress(raw)) };
    } catch (error) { return { index, error: error.message }; }
  }));
  return { ...factory, processors: rows };
}

export async function readCircuit(contract, id) {
  const cpu = await readProcessor(contract);
  const circuitId = uint(id);
  if (circuitId < 1n || circuitId > BigInt(cpu.circuitCount)) throw new Error('Circuit ID is outside this processor.');
  const [info, owner, netlist] = await Promise.all([
    publicCall(cpu.address, callData('circuitInfo', circuitId)),
    publicCall(cpu.address, callData('ownerOf', circuitId)),
    publicCall(cpu.address, callData('netlist', circuitId)),
  ]);
  return {
    id: circuitId.toString(), processor: cpu.address, owner: readAddress(owner),
    nIn: Number(readWord(info, 0)), nOut: Number(readWord(info, 1)),
    nState: Number(readWord(info, 2)), gateCount: Number(readWord(info, 3)),
    netlistHex: '0x' + hex(readBytes(netlist)),
  };
}

export async function evaluateCircuit(contract, id, inputBits) {
  const circuit = await readCircuit(contract, id);
  if (circuit.nState !== 0) throw new Error('This tool evaluates combinational circuits only.');
  if (!Array.isArray(inputBits) || inputBits.length !== circuit.nIn || inputBits.some(bit => bit !== 0 && bit !== 1))
    throw new Error(`Provide exactly ${circuit.nIn} binary inputs.`);
  const packed = new Uint8Array(Math.ceil(circuit.nIn / 8));
  inputBits.forEach((bit, i) => { packed[i >> 3] |= bit << (i & 7); });
  const block = await publicRpc('eth_blockNumber');
  const raw = await publicCall(circuit.processor, encodeEval(circuit.id, packed), block);
  const outputs = readBytes(raw);
  return {
    processor: circuit.processor, circuitId: circuit.id, blockNumber: Number(block),
    inputBits: [...inputBits], outputBits: Array.from({ length: circuit.nOut }, (_, i) => (outputs[i >> 3] >> (i & 7)) & 1),
    rawHex: '0x' + hex(outputs), execution: 'eth_call', transactionHash: null,
  };
}

export async function connectWallet() {
  const provider = wallet();
  let chain = await provider.request({ method: 'eth_chainId' });
  if (Number(chain) !== PLATFORM.chainId) {
    try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: PLATFORM.chainIdHex }] }); }
    catch (error) {
      if (error.code !== 4902) throw error;
      await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: PLATFORM.chainIdHex,
        chainName: PLATFORM.chainName, nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
        rpcUrls: ['https://rpc.xlayer.tech'], blockExplorerUrls: [PLATFORM.explorer] }] });
    }
    chain = await provider.request({ method: 'eth_chainId' });
  }
  if (Number(chain) !== PLATFORM.chainId) throw new Error('Wallet is not on X Layer mainnet.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('No wallet account was selected.');
  return address(accounts[0]);
}

async function sendWallet(from, to, data, value) {
  const provider = wallet();
  if (Number(await provider.request({ method: 'eth_chainId' })) !== PLATFORM.chainId)
    throw new Error('Wallet changed away from X Layer. Nothing was sent.');
  const accounts = await provider.request({ method: 'eth_accounts' });
  if (!accounts?.some(account => same(account, from))) throw new Error('Selected wallet account changed. Nothing was sent.');
  return provider.request({ method: 'eth_sendTransaction', params: [{ from, to: address(to), data, value: txValue(value), chainId: PLATFORM.chainIdHex }] });
}
async function waitReceipt(hash, timeoutMs = 180_000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const receipt = await publicRpc('eth_getTransactionReceipt', [hash]);
    if (receipt) {
      if (Number(receipt.status) !== 1) throw new Error(`Transaction reverted: ${hash}`);
      return receipt;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error(`Transaction pending or receipt unavailable: ${hash}`);
}

export async function createProcessor({ name, symbol = 'RULE', story = '', supply, mintPriceWei, onStatus } = {}) {
  if (!String(name ?? '').trim() || String(name).length > 64) throw new Error('Processor name must be 1–64 characters.');
  if (String(symbol).length > 16 || String(story).length > 200) throw new Error('Symbol or story is too long.');
  const cap = uint(supply), price = uint(mintPriceWei);
  if (cap < 1n) throw new Error('Supply must be positive.');
  const from = await connectWallet();
  await assertFactoryImplementation();
  const [publicFee, walletFee] = await Promise.all([
    publicUint(PLATFORM.factory, 'deployFee'), walletUint(PLATFORM.factory, 'deployFee'),
  ]);
  requireEqual('Factory deployment fee', publicFee, walletFee);
  emit(onStatus, 'awaiting-wallet', { action: 'createCPU', valueWei: publicFee.toString() });
  const hash = await sendWallet(from, PLATFORM.factory, encodeCreateCPU({ name: name.trim(), symbol: symbol.trim(), story: story.trim(), supply: cap, mintPriceWei: price }), publicFee);
  let receipt;
  try {
    emit(onStatus, 'pending', { action: 'createCPU', hash });
    receipt = await waitReceipt(hash);
    const event = receipt.logs?.find(log => same(log.address, PLATFORM.factory) && same(log.topics?.[0], CPU_CREATED_TOPIC));
    if (!event?.topics?.[1]) throw new Error('CPUCreated event was not decoded.');
    const processor = topicAddress(event.topics[1]);
    const confirmed = await readProcessor(processor);
    if (!same(confirmed.creator, from) || BigInt(confirmed.supplyCap) !== cap || BigInt(confirmed.mintPriceWei) !== price)
      throw new Error('Processor readback differs from submitted economics.');
    emit(onStatus, 'confirmed', { action: 'createCPU', hash, processor });
    return { hash, address: processor, receipt, processor: confirmed };
  } catch (error) {
    const status = receipt ? 'Factory transaction confirmed, but processor verification is incomplete.'
      : /reverted/i.test(error.message) ? 'Factory transaction reverted.'
        : 'Factory transaction submitted; its final status is unknown.';
    const enriched = new Error(`${status} Check ${hash} on X Layer before retrying. ${error.message}`, { cause: error });
    enriched.deploymentHash = hash;
    enriched.receiptConfirmed = Boolean(receipt);
    throw enriched;
  }
}

function nandBuilder(nIn) {
  const bytes = [], gates = [];
  let signal = 2 + nIn;
  function nand(a, b) {
    if (![a, b].every(x => Number.isInteger(x) && x >= 0 && x < signal)) throw new Error('Invalid NAND signal.');
    for (const v of [a, b]) bytes.push((v >> 16) & 255, (v >> 8) & 255, v & 255);
    bytes.splice(bytes.length - 6, 0, 0);
    gates.push([a, b]);
    return signal++;
  }
  return { nand, gates, netlistHex: () => '0x' + hex(bytes) };
}
function buildTemplate(id) {
  const b = nandBuilder(2), a = 2, c = 3;
  let output;
  if (id === 'and') { const t = b.nand(a, c); output = b.nand(t, t); }
  else if (id === 'or') { const x = b.nand(a, a), y = b.nand(c, c); output = b.nand(x, y); }
  else if (id === 'xor') { const t = b.nand(a, c), x = b.nand(a, t), y = b.nand(c, t); output = b.nand(x, y); }
  else throw new Error('Unknown circuit template.');
  const truthTable = [[0, 0], [1, 0], [0, 1], [1, 1]].map(inputs => {
    const values = [0, 1, ...inputs];
    for (const [left, right] of b.gates) values.push(values[left] & values[right] ? 0 : 1);
    return { inputs, output: [values[output]] };
  });
  return { id, nIn: 2, nOut: 1, gateCount: b.gates.length, latchCount: 0,
    netlistHex: b.netlistHex(), truthTable };
}
export const TEMPLATES = Object.freeze([
  { ...buildTemplate('and'), name: 'Both conditions', description: 'True only when both inputs are true.' },
  { ...buildTemplate('or'), name: 'Either condition', description: 'True when at least one input is true.' },
  { ...buildTemplate('xor'), name: 'Exactly one condition', description: 'True when one input is true and the other false.' },
]);
export function getTemplate(id) {
  const template = TEMPLATES.find(item => item.id === id);
  if (!template) throw new Error('Unknown circuit template.');
  return template;
}

export async function estimateTemplateCost({ processor, templateId, walletAddress } = {}) {
  const cpu = typeof processor === 'string' ? await readProcessor(processor) : processor;
  if (!cpu?.verified) throw new Error('A verified TapeOut processor is required.');
  const template = getTemplate(templateId);
  const held = walletAddress ? readWord(await publicCall(cpu.transistors, callBalanceOf(walletAddress, 0))) : 0n;
  const toMint = BigInt(template.gateCount) > held ? BigInt(template.gateCount) - held : 0n;
  const remaining = BigInt(cpu.supplyCap) - BigInt(cpu.minted);
  if (toMint > remaining) throw new Error('Processor transistor supply is insufficient for this circuit.');
  const mintValueWei = toMint ? BigInt(cpu.mintPriceWei) * toMint + BigInt(cpu.protocolFeeWei) : 0n;
  const totalValueWei = mintValueWei + BigInt(cpu.tapeoutFeeWei);
  return { templateId, requiredNand: template.gateCount, heldNand: held.toString(), toMint: toMint.toString(),
    mintValueWei: mintValueWei.toString(), tapeoutFeeWei: cpu.tapeoutFeeWei,
    totalValueWei: totalValueWei.toString(), walletActions: (toMint ? 1 : 0) + 1,
    gasExcluded: true };
}

export async function tapeoutCircuit({ processor, templateId, onStatus } = {}) {
  const from = await connectWallet();
  await assertFactoryImplementation();
  const cpu = await readProcessor(processor);
  const template = getTemplate(templateId);
  const checks = [
    ['factory', PLATFORM.factory, readAddress(await walletCall(cpu.address, callData('factory')))],
    ['transistor contract', cpu.transistors, readAddress(await walletCall(cpu.address, callData('transistors')))],
    ['creator', cpu.creator, readAddress(await walletCall(cpu.transistors, callData('creator')))],
    ['supply cap', cpu.supplyCap, await walletUint(cpu.transistors, 'supplyCap')],
    ['minted supply', cpu.minted, await walletUint(cpu.transistors, 'minted')],
    ['unit price', cpu.mintPriceWei, await walletUint(cpu.transistors, 'mintPrice')],
    ['mint fee', cpu.protocolFeeWei, await walletUint(cpu.transistors, 'protocolFee')],
    ['tapeout fee', cpu.tapeoutFeeWei, await walletUint(cpu.address, 'tapeoutFee')],
  ];
  for (const [label, expected, observed] of checks) requireEqual(label, expected, observed);
  const walletRecognized = readWord(await walletCall(PLATFORM.factory, callAddress('isCPU', cpu.address)));
  if (walletRecognized !== 1n) throw new Error('Wallet RPC does not recognize this factory processor.');
  if (BigInt(cpu.tapeoutFeeWei) !== BigInt(PLATFORM.expectedTapeoutFeeWei))
    throw new Error('Tapeout fee differs from the published X Layer value. Nothing was sent.');
  const cost = await estimateTemplateCost({ processor: cpu, templateId, walletAddress: from });
  const walletHeld = readWord(await walletCall(cpu.transistors, callBalanceOf(from, 0)));
  requireEqual('NAND balance', cost.heldNand, walletHeld);
  const mintHashes = [];
  let mintConfirmed = false;
  let tapeoutHash = null;
  try {
    if (BigInt(cost.toMint) > 0n) {
      emit(onStatus, 'awaiting-wallet', { action: 'mint', valueWei: cost.mintValueWei, amount: cost.toMint });
      const mintHash = await sendWallet(from, cpu.transistors,
        callData('mint', 0, cost.toMint), BigInt(cost.mintValueWei));
      mintHashes.push(mintHash);
      emit(onStatus, 'pending', { action: 'mint', hash: mintHash });
      await waitReceipt(mintHash);
      mintConfirmed = true;
      emit(onStatus, 'confirmed', { action: 'mint', hash: mintHash });
    }
    const currentBalance = readWord(await publicCall(cpu.transistors, callBalanceOf(from, 0)));
    if (currentBalance < BigInt(template.gateCount)) throw new Error('NAND balance is still insufficient after mint.');
    const [latest, walletFee] = await Promise.all([
      readProcessor(cpu.address), walletUint(cpu.address, 'tapeoutFee'),
    ]);
    requireEqual('Tapeout fee', latest.tapeoutFeeWei, walletFee);
    if (BigInt(latest.tapeoutFeeWei) !== BigInt(PLATFORM.expectedTapeoutFeeWei))
      throw new Error('Tapeout fee changed after mint. No tapeout transaction was sent.');
    emit(onStatus, 'awaiting-wallet', { action: 'tapeout', valueWei: latest.tapeoutFeeWei });
    const hash = await sendWallet(from, cpu.address,
      encodeTapeout(template.netlistHex, template.nIn, template.nOut), BigInt(latest.tapeoutFeeWei));
    tapeoutHash = hash;
    emit(onStatus, 'pending', { action: 'tapeout', hash });
    const receipt = await waitReceipt(hash);
    const event = receipt.logs?.find(log => same(log.address, cpu.address) && same(log.topics?.[0], TAPED_OUT_TOPIC));
    if (!event?.topics?.[1]) throw new Error(`Tapeout confirmed but TapedOut event was not decoded: ${hash}`);
    const circuitId = readWord(event.topics[1]).toString();
    const circuit = await readCircuit(cpu.address, circuitId);
    if (circuit.nIn !== template.nIn || circuit.nOut !== template.nOut || circuit.gateCount !== template.gateCount
      || !same(circuit.netlistHex, template.netlistHex))
      throw new Error(`Tapeout confirmed but on-chain circuit differs from the selected template: ${hash}`);
    emit(onStatus, 'confirmed', { action: 'tapeout', hash, circuitId });
    return { hash, circuitId, mintHashes, receipt, circuit };
  } catch (error) {
    if (!mintHashes.length && !tapeoutHash) throw error;
    const mintStatus = mintConfirmed
      ? 'NAND mint confirmed and is not automatically refunded.'
      : mintHashes.length ? 'NAND mint was submitted; its final status is unknown.' : '';
    const detail = `${mintHashes.length ? `Mint tx: ${mintHashes.join(', ')}. ` : ''}${tapeoutHash ? `Tapeout tx: ${tapeoutHash}. ` : ''}Circuit tapeout is not verified.`;
    const enriched = new Error(`${mintStatus} ${detail} ${error.message}`, { cause: error });
    enriched.mintHashes = mintHashes;
    enriched.confirmedMintHashes = mintConfirmed ? [...mintHashes] : [];
    enriched.tapeoutHash = tapeoutHash;
    throw enriched;
  }
}

/** Re-check a saved hash against X Layer receipt, expected event and current contract readback. */
export async function verifyReceipt({ hash, type, processor, circuitId, templateId } = {}) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(String(hash))) throw new Error('Expected a 32-byte transaction hash.');
  if (type !== 'processor' && type !== 'circuit') throw new Error('Receipt type must be processor or circuit.');
  if (Number(await publicRpc('eth_chainId')) !== PLATFORM.chainId) throw new Error('Receipt RPC is not X Layer.');
  const [receipt, tx] = await Promise.all([
    publicRpc('eth_getTransactionReceipt', [hash]),
    publicRpc('eth_getTransactionByHash', [hash]),
  ]);
  if (!receipt || !tx) throw new Error('Transaction is pending or not found on X Layer.');
  if (Number(receipt.status) !== 1) throw new Error('Transaction reverted on X Layer.');
  if (!same(tx.hash, hash) || !same(receipt.transactionHash, hash)) throw new Error('Receipt hash mismatch.');
  if (type === 'processor') {
    if (!same(tx.to, PLATFORM.factory)) throw new Error('Transaction did not call the TapeOut factory.');
    const event = receipt.logs?.find(log => same(log.address, PLATFORM.factory) && same(log.topics?.[0], CPU_CREATED_TOPIC));
    if (!event?.topics?.[1] || !event?.topics?.[3]) throw new Error('CPUCreated event is missing.');
    const deployed = topicAddress(event.topics[1]);
    if (processor && !same(processor, deployed)) throw new Error('Saved processor does not match CPUCreated.');
    const current = await readProcessor(deployed);
    if (!same(current.creator, topicAddress(event.topics[3])) || !same(tx.from, current.creator))
      throw new Error('Creator differs from the factory event or transaction sender.');
    if (current.name !== textDecoder.decode(readBytes(event.data))
      || BigInt(current.supplyCap) !== readWord(event.data, 1)
      || BigInt(current.mintPriceWei) !== readWord(event.data, 2))
      throw new Error('Processor economics differ from CPUCreated event.');
    return { verified: true, type, hash, processor: deployed, creator: current.creator,
      blockNumber: Number(receipt.blockNumber), explorerUrl: `${PLATFORM.explorer}/tx/${hash}`,
      currentProcessor: current };
  }
  if (!processor) throw new Error('Processor address is required for a circuit receipt.');
  const cpu = address(processor);
  if (!same(tx.to, cpu)) throw new Error('Transaction did not call this processor.');
  const event = receipt.logs?.find(log => same(log.address, cpu) && same(log.topics?.[0], TAPED_OUT_TOPIC));
  if (!event?.topics?.[1] || !event?.topics?.[2]) throw new Error('TapedOut event is missing.');
  const tapedId = readWord(event.topics[1]).toString();
  if (circuitId != null && String(circuitId) !== tapedId) throw new Error('Saved circuit ID does not match TapedOut.');
  const current = await readCircuit(cpu, tapedId);
  if (current.gateCount !== Number(readWord(event.data, 0)) || current.nState !== Number(readWord(event.data, 1)))
    throw new Error('Circuit metadata differs from TapedOut event.');
  if (templateId) {
    const template = getTemplate(templateId);
    if (!same(current.netlistHex, template.netlistHex) || current.nIn !== template.nIn || current.nOut !== template.nOut)
      throw new Error('Circuit netlist differs from the saved template.');
  }
  return { verified: true, type, hash, processor: cpu, circuitId: tapedId,
    author: topicAddress(event.topics[2]), blockNumber: Number(receipt.blockNumber),
    explorerUrl: `${PLATFORM.explorer}/tx/${hash}`, currentCircuit: current };
}

export const _test = Object.freeze({
  callData, encodeCreateCPU, encodeTapeout, encodeEval, readWord, readAddress, readBytes,
});
