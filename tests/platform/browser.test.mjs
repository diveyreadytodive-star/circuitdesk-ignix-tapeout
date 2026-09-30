import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, PUBLIC_REFERENCE, PLATFORM, _test, parseOkb, formatOkb,
  estimateTemplateCost, createProcessor } from '../../src/platform/browser.js';

test('NAND templates have expected truth tables and valid backward-only signals', () => {
  const expected = { and: [0, 0, 0, 1], or: [0, 1, 1, 1], xor: [0, 1, 1, 0] };
  for (const template of TEMPLATES) {
    assert.deepEqual(template.truthTable.map(row => row.output[0]), expected[template.id]);
    const bytes = Buffer.from(template.netlistHex.slice(2), 'hex');
    assert.equal(bytes.length, template.gateCount * 7);
    let nextSignal = 4;
    for (let i = 0; i < bytes.length; i += 7) {
      assert.equal(bytes[i], 0, 'only NAND opcode is used');
      const left = bytes.readUIntBE(i + 1, 3), right = bytes.readUIntBE(i + 4, 3);
      assert.ok(left < nextSignal && right < nextSignal);
      nextSignal++;
    }
  }
});

test('XOR netlist matches a publicly read X Layer TapeOut circuit', () => {
  assert.equal(PUBLIC_REFERENCE.processor, '0x839bdd6fa7a66416a609a735e11de5411b98574e');
  assert.equal(TEMPLATES.find(t => t.id === 'xor').netlistHex,
    '0x00000002000003000000020000040000000300000400000005000006');
});

test('ABI call data agrees with independent cast calldata vectors', () => {
  assert.equal(_test.encodeCreateCPU({ name: 'RuleDesk', symbol: 'RD', story: 'Truth-table',
    supply: 100000n, mintPriceWei: 66000000000000n }),
    '0x47f9b5fd00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000186a000000000000000000000000000000000000000000000000000003c06d28e2000000000000000000000000000000000000000000000000000000000000000000852756c654465736b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025244000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b54727574682d7461626c65000000000000000000000000000000000000000000');
  assert.equal(_test.encodeTapeout(TEMPLATES.find(t => t.id === 'xor').netlistHex, 2, 1),
    '0x7bd3ac1d000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000001c0000000200000300000002000004000000030000040000000500000600000000');
});

test('issuance estimate is integer-exact and excludes gas', async () => {
  const processor = { verified: true, transistors: '0x0000000000000000000000000000000000000001',
    supplyCap: '100000', minted: '0', mintPriceWei: parseOkb('0.000066'),
    protocolFeeWei: parseOkb('0.00066'), tapeoutFeeWei: parseOkb('0.0013') };
  const cost = await estimateTemplateCost({ processor, templateId: 'xor' });
  assert.deepEqual({ requiredNand: cost.requiredNand, toMint: cost.toMint,
    mintValueWei: cost.mintValueWei, totalValueWei: cost.totalValueWei,
    walletActions: cost.walletActions, gasExcluded: cost.gasExcluded },
  { requiredNand: 4, toMint: '4', mintValueWei: '924000000000000',
    totalValueWei: '2224000000000000', walletActions: 2, gasExcluded: true });
  assert.equal(formatOkb(cost.totalValueWei), '0.002224');
  assert.equal(PLATFORM.chainId, 196);
});

test('invalid economics fail before wallet access', async () => {
  await assert.rejects(createProcessor({ name: 'X', supply: '0', mintPriceWei: '0' }), /Supply/);
  assert.throws(() => parseOkb('1e-3'), /non-negative/);
  assert.throws(() => parseOkb('0.1234567890123456789'), /18 decimal/);
});
