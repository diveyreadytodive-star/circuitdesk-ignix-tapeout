/**
 * Local-only TapeOut lifecycle probe. Start Anvil with:
 *   anvil --fork-url https://rpc.xlayer.tech --port 8547 --silent --auto-impersonate
 * Then run: node technical/fork-spike.mjs
 * Uses Anvil's unlocked synthetic account via eth_sendTransaction. Never accepts a key.
 */
import { PLATFORM, TEMPLATES, _test, parseOkb, verifyReceipt,
  createProcessor, tapeoutCircuit, evaluateCircuit } from '../src/platform/browser.js';

const URL = 'http://127.0.0.1:8547';
const SELECTOR = {
  cpuCount: 'a94da8a7', deployFee: 'eb2a5d2c', transistors: '6fbd1719',
  minted: '4f02c420', supplyCap: '8f770ad0', mintPrice: '6817c76c', protocolFee: 'b0e21e8a',
  balanceOf: '00fdd58e', tapeoutFee: 'adfb2b69', circuitInfo: '084d60f1',
  netlist: '3fc4be56', eval: '934d06ea', mint: '1b2ef1ca',
};
const word = value => BigInt(value).toString(16).padStart(64, '0');
const asAddress = value => '0x' + _test.readWord(value).toString(16).padStart(40, '0');
const asUint = value => _test.readWord(value);
const valueHex = value => '0x' + BigInt(value).toString(16);

async function rpc(method, params = []) {
  const response = await fetch(URL, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}
async function call(to, data, from) { return rpc('eth_call', [{ to, data, ...(from ? { from } : {}) }, 'latest']); }
async function send(from, to, data, value = 0n) {
  const hash = await rpc('eth_sendTransaction', [{ from, to, data, value: valueHex(value) }]);
  let receipt;
  for (let attempt = 0; attempt < 30; attempt++) {
    receipt = await rpc('eth_getTransactionReceipt', [hash]);
    if (receipt) break;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  if (Number(receipt?.status) !== 1) throw new Error(`Fork transaction failed: ${hash}`);
  return { hash, receipt };
}
const bool = value => { if (!value) throw new Error('Fork assertion failed'); };

const client = await rpc('web3_clientVersion');
if (!/anvil/i.test(client)) throw new Error('Refusing transaction probe: endpoint is not Anvil.');
if (Number(await rpc('eth_chainId')) !== PLATFORM.chainId) throw new Error('Fork chain ID differs from X Layer.');
const accounts = await rpc('eth_accounts');
let from;
for (const candidate of accounts) {
  if (await rpc('eth_getCode', [candidate, 'latest']) === '0x') { from = candidate; break; }
}
if (!from) throw new Error('Anvil has no unlocked synthetic account.');

const factory = PLATFORM.factory;
const supply = 100000n;
const price = BigInt(parseOkb('0.000066'));
const before = asUint(await call(factory, '0x' + SELECTOR.cpuCount));
const deployFee = asUint(await call(factory, '0x' + SELECTOR.deployFee));
const created = await send(from, factory,
  _test.encodeCreateCPU({ name: 'RuleDesk Fork Proof', symbol: 'RDF', story: 'Synthetic local lifecycle probe', supply, mintPriceWei: price }),
  deployFee);
const cpuEvent = created.receipt.logs.find(log => log.address.toLowerCase() === factory.toLowerCase()
  && log.topics[0]?.toLowerCase() === '0x2e8868f18a1eaf0222b5b09484fdf12163e9741393f8457cd79d2ae42b2d2290');
bool(cpuEvent?.topics?.[1]);
const cpu = '0x' + cpuEvent.topics[1].slice(-40);
const after = asUint(await call(factory, '0x' + SELECTOR.cpuCount));
bool(after === before + 1n);
const transistor = asAddress(await call(cpu, '0x' + SELECTOR.transistors));
bool(asUint(await call(transistor, '0x' + SELECTOR.supplyCap)) === supply);
bool(asUint(await call(transistor, '0x' + SELECTOR.mintPrice)) === price);
const template = TEMPLATES.find(item => item.id === 'xor');
const feeMint = asUint(await call(transistor, '0x' + SELECTOR.protocolFee));
const feeTapeout = asUint(await call(cpu, '0x' + SELECTOR.tapeoutFee));
const mintedBefore = asUint(await call(transistor, '0x' + SELECTOR.minted));
const mintValue = price * BigInt(template.gateCount) + feeMint;
const minted = await send(from, transistor,
  '0x' + SELECTOR.mint + word(0) + word(template.gateCount), mintValue);
const mintedAfter = asUint(await call(transistor, '0x' + SELECTOR.minted));
bool(mintedAfter - mintedBefore === BigInt(template.gateCount));
const balanceData = '0x' + SELECTOR.balanceOf + from.slice(2).padStart(64, '0') + word(0);
bool(asUint(await call(transistor, balanceData)) === BigInt(template.gateCount));

let wrongFeeReverted = false;
try { await rpc('eth_call', [{ from, to: cpu, data: _test.encodeTapeout(template.netlistHex, 2, 1), value: '0x0' }, 'latest']); }
catch { wrongFeeReverted = true; }
bool(wrongFeeReverted);

const taped = await send(from, cpu, _test.encodeTapeout(template.netlistHex, 2, 1), feeTapeout);
const circuitEvent = taped.receipt.logs.find(log => log.address.toLowerCase() === cpu.toLowerCase()
  && log.topics[0]?.toLowerCase() === '0xc11215e417669c143c8a07aeb778034c0a0a85ebdf305d64a629b19a7a9ce031');
bool(circuitEvent?.topics?.[1]);
const circuitId = asUint(circuitEvent.topics[1]);
const info = await call(cpu, '0x' + SELECTOR.circuitInfo + word(circuitId));
bool(_test.readWord(info, 0) === 2n && _test.readWord(info, 1) === 1n && _test.readWord(info, 3) === 4n);
const netlist = await call(cpu, '0x' + SELECTOR.netlist + word(circuitId));
bool(('0x' + [..._test.readBytes(netlist)].map(x => x.toString(16).padStart(2, '0')).join('')) === template.netlistHex);
const balanceAfter = asUint(await call(transistor, balanceData));
bool(balanceAfter === 0n);
const actual = [];
for (let input = 0; input < 4; input++) {
  const result = await call(cpu, _test.encodeEval(circuitId, new Uint8Array([input])));
  actual.push(_test.readBytes(result)[0] & 1);
}
bool(JSON.stringify(actual) === JSON.stringify([0, 1, 1, 0]));
const nativeFetch = globalThis.fetch;
globalThis.fetch = (url, options) => nativeFetch(String(url).startsWith('https://') ? URL : url, options);
let verifiedCreate, verifiedTapeout;
try {
  verifiedCreate = await verifyReceipt({ hash: created.hash, type: 'processor', processor: cpu });
  verifiedTapeout = await verifyReceipt({ hash: taped.hash, type: 'circuit', processor: cpu,
    circuitId: circuitId.toString(), templateId: 'xor' });
} finally { globalThis.fetch = nativeFetch; }
bool(verifiedCreate.verified && verifiedTapeout.verified);

// Exercise the same EIP-1193 adapter methods that the browser uses. This provider
// is a synthetic local Anvil account; the script refuses any non-Anvil endpoint.
globalThis.window = { ethereum: { request: ({ method, params = [] }) => {
  if (method === 'eth_requestAccounts' || method === 'eth_accounts') return Promise.resolve([from]);
  return rpc(method, params);
} } };
globalThis.fetch = (url, options) => nativeFetch(String(url).startsWith('https://') ? URL : url, options);
let adapterCreated, adapterTaped, adapterEval, partialMintError, partialNandBalance;
try {
  adapterCreated = await createProcessor({ name: 'CircuitDesk Adapter Fork', symbol: 'CDA',
    story: 'Synthetic browser-adapter lifecycle probe', supply: '100000',
    mintPriceWei: parseOkb('0.000066') });
  adapterTaped = await tapeoutCircuit({ processor: adapterCreated.address, templateId: 'xor' });
  adapterEval = await evaluateCircuit(adapterCreated.address, adapterTaped.circuitId, [1, 0]);
  let sendCount = 0;
  globalThis.window.ethereum.request = ({ method, params = [] }) => {
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') return Promise.resolve([from]);
    if (method === 'eth_sendTransaction' && ++sendCount === 2)
      return Promise.reject(Object.assign(new Error('Synthetic user rejection'), { code: 4001 }));
    return rpc(method, params);
  };
  try { await tapeoutCircuit({ processor: adapterCreated.address, templateId: 'and' }); }
  catch (error) { partialMintError = error; }
  const adapterTransistor = asAddress(await call(adapterCreated.address, '0x' + SELECTOR.transistors));
  partialNandBalance = asUint(await call(adapterTransistor,
    '0x' + SELECTOR.balanceOf + from.slice(2).padStart(64, '0') + word(0)));
} finally {
  globalThis.fetch = nativeFetch;
  delete globalThis.window;
}
bool(adapterCreated.processor.verified && adapterTaped.circuit.gateCount === 4
  && adapterEval.outputBits[0] === 1);
bool(partialMintError?.confirmedMintHashes?.length === 1 && partialNandBalance === 2n
  && /not automatically refunded/i.test(partialMintError.message));
console.log(JSON.stringify({
  scope: 'LOCAL_ANVIL_FORK_ONLY', client, syntheticSigner: from,
  factory, processor: cpu, transistor, circuitId: circuitId.toString(),
  deploymentHash: created.hash, mintHash: minted.hash, tapeoutHash: taped.hash,
  deployFeeWei: deployFee.toString(), mintValueWei: mintValue.toString(),
  tapeoutFeeWei: feeTapeout.toString(),
  mintedDelta: String(mintedAfter - mintedBefore), transistorBalanceAfter: balanceAfter.toString(),
  wrongFeeReverted, netlistMatched: true, xorOutputs: actual,
  receiptsIndependentlyVerified: true,
  browserAdapterLifecycle: {
    processor: adapterCreated.address, circuitId: adapterTaped.circuitId,
    creationHash: adapterCreated.hash, tapeoutHash: adapterTaped.hash,
    xorInput10: adapterEval.outputBits[0],
    rejectedSecondSignatureAfterConfirmedMint: true,
    strandedNandBalance: partialNandBalance.toString(),
    confirmedMintHash: partialMintError.confirmedMintHashes[0],
  },
}, null, 2));
