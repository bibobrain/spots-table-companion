'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Strategy = require('../assets/journal-strategy.js');

let number = 0;
function check(name, run) { run(); number++; console.log('ok ' + number + ' - ' + name); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function distribution(risk) {
  const fills = Array(19).fill(0);
  fills[1] = 1 - risk;
  return { fills, bust: risk, unknown: 0, invalid: false, resource: null };
}
function record(risk, options = {}) {
  const d = distribution(risk);
  const kind = options.kind || 'fill';
  return {
    kind, bucket: kind === 'bust' ? null : 1,
    probability: kind === 'bust' ? risk : 1 - risk,
    source: 'Roll', calculationSnapshot: { mode: 'normal', distribution: d },
    ...options
  };
}
function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

check('reads complete matched pre-action risk, including zero and certain BUST', () => {
  assert.equal(Strategy.riskOf(record(0.15)), 0.15);
  assert.equal(Strategy.riskOf(record(0)), 0);
  assert.equal(Strategy.riskOf(record(1, { kind: 'bust' })), 1);
  assert.equal(Strategy.summarize([record(0)]).key, 'steady');
  assert.equal(Strategy.summarize([record(1, { kind: 'bust' })]).key, 'bold');
});

check('a BUST or a safe result from the same plan has the same style', () => {
  for (const risk of [0.05, 0.35, 0.8]) {
    assert.deepEqual(Strategy.summarize([record(risk)]),
      Strategy.summarize([record(risk, { kind: 'bust' })]));
  }
});

check('a rare safe event is not mistaken for an aggressive choice', () => {
  const rare = record(0.05);
  rare.calculationSnapshot.distribution.fills[0] = 0.949;
  rare.calculationSnapshot.distribution.fills[1] = 0.001;
  rare.probability = 0.001;
  assert.equal(Strategy.riskOf(rare), 0.05);
  assert.equal(Strategy.summarize([rare]).key, 'steady');
  assert.equal(Strategy.summarize([record(0.8, { kind: 'bust' })]).key, 'bold');
});

check('cleared, missing, zero or invalid event odds cannot inherit old plan risk', () => {
  for (const value of [null, undefined, 0, -0.1, NaN, Infinity, 1.2, '0.8']) {
    assert.equal(Strategy.riskOf(record(0.2, { probability: value })), null);
  }
  assert.equal(Strategy.summarize([record(0.2, { probability: null })]).key, 'unrated');
});

check('rejects invalid, incomplete, nonconserving and malformed distributions', () => {
  const changes = [
    d => { d.invalid = true; },
    d => { d.invalid = 'false'; },
    d => { d.resource = 0; },
    d => { d.unknown = 0.1; d.fills[1] -= 0.1; },
    d => { d.fills[0] = 0.01; },
    d => { d.fills[0] = -0.01; d.fills[1] += 0.01; },
    d => { d.fills[0] = NaN; },
    d => { d.fills[0] = '0'; },
    d => { d.bust = Infinity; },
    d => { d.unknown = null; },
    d => { d.fills = null; },
    d => { d.fills = []; }
  ];
  for (const change of changes) {
    const r = record(0.2);
    change(r.calculationSnapshot.distribution);
    assert.equal(Strategy.riskOf(r), null);
  }
  for (const value of [null, {}, [], { kind: 'fill' }, { kind: 'unknown' }, { kind: 'resource' }]) {
    assert.equal(Strategy.riskOf(value), null);
  }
});

check('requires the recorded outcome probability to match its own distribution bucket', () => {
  assert.equal(Strategy.riskOf(record(0.2, { probability: 0.2 })), null);
  assert.equal(Strategy.riskOf(record(0.2, { kind: 'bust', probability: 0.8 })), null);
  assert.equal(Strategy.riskOf(record(0.2, { bucket: 0 })), null);
  assert.equal(Strategy.riskOf(record(0.2, { bucket: '1' })), null);
  const impossible = record(0, { kind: 'bust', probability: 1e-16 });
  assert.equal(Strategy.riskOf(impossible), null);
});

check('5+ remains an aggregate, including Play Dead rewards', () => {
  const r = record(0.3, { bucket: '5+', actualFilled: 6, probability: 0.7 });
  const d = r.calculationSnapshot.distribution;
  d.fills[1] = 0; d.fills[5] = 0.4; d.fills[6] = 0.3;
  assert.equal(Strategy.riskOf(r), 0.3);
  assert.equal(Strategy.riskOf({ ...r, probability: 0.3 }), null);
  assert.equal(Strategy.riskOf({ ...r, bucket: 6, probability: 0.3 }), null);
  const reward = clone(r);
  reward.kind = 'reward'; reward.calculationSnapshot.mode = 'playdead';
  reward.calculationSnapshot.distribution.reward = 'treat';
  assert.equal(Strategy.riskOf(reward), 0.3);
});

check('numeric roundoff is tolerated without accepting substantially invalid mass', () => {
  const r = record(0.5);
  r.calculationSnapshot.distribution.bust -= 5e-16;
  assert.equal(Strategy.summarize([r]).key, 'bold');
  const low = record(0.2 + 5e-16);
  assert.equal(Strategy.summarize([low]).key, 'steady');
  const legacy = record(0.2);
  delete legacy.calculationSnapshot.distribution.unknown;
  assert.equal(Strategy.riskOf(legacy), 0.2);
  const overshoot = record(1, { kind: 'bust', probability: 1 + 1e-12 });
  overshoot.calculationSnapshot.distribution.bust = 1 + 1e-12;
  assert.equal(Strategy.riskOf(overshoot), 1);
});

check('one record gives a scoped conclusion without requiring any dog cards', () => {
  for (const risk of [0.1, 0.35, 0.8]) {
    const result = Strategy.summarize([record(risk)]);
    assert.match(result.title, /^这一手/);
    assert.equal(result.recordCount, 1);
    assert.equal(result.knownRiskCount, 1);
    assert.match(result.basis, /1 笔已记录/);
  }
});

check('majorities, mixed extremes and middle plans produce bounded descriptive styles', () => {
  const key = risks => Strategy.summarize(risks.map(risk => record(risk))).key;
  assert.equal(key([0.2, 0.1, 0.8]), 'steady');
  assert.equal(key([0.5, 0.8, 0.1]), 'bold');
  assert.equal(key([0.1, 0.8]), 'varied');
  assert.equal(key([0.1, 0.4]), 'measured');
  assert.equal(key([0.4, 0.8]), 'measured');
  assert.equal(key([0.21, 0.49]), 'measured');
});

check('only comparable records vote, with visible scope for the remaining records', () => {
  const result = Strategy.summarize([
    record(0.1), record(0.9, { probability: null }), { kind: 'resource' }, { kind: 'unknown' }
  ]);
  assert.equal(result.key, 'steady');
  assert.match(result.title, /^这一手/);
  assert.equal(result.recordCount, 4);
  assert.equal(result.knownRiskCount, 1);
  assert.match(result.basis, /4 笔已记录 · 1 次方案可比/);
});

check('bone spending, Yard, event labels and fills do not invent strategy evidence', () => {
  const a = record(0.3, { bonesSpent: 0, actualFilled: 1 });
  const b = clone(a);
  b.bonesSpent = 8; b.actualFilled = 6; b.source = 'Track';
  b.calculationSnapshot.yard = 7;
  b.calculationSnapshot.bones = 99;
  b.calculationSnapshot.params = { rounds: 5 };
  b.beforeBoard = { yard: 7, bones: 99 };
  b.afterBoard = { yard: 0, bones: 91 };
  assert.deepEqual(Strategy.summarize([a]), Strategy.summarize([b]));
  assert.equal(Strategy.summarize([record(0.3, { probability: null, bonesSpent: 8 })]).key, 'unrated');
});

check('resource-only, new-card, legacy and empty journals have readable honest fallbacks', () => {
  for (const [records, key] of [
    [[{ kind: 'resource', source: 'Beg' }], 'resources'],
    [[{ kind: 'resource' }, { kind: 'resource' }], 'resources'],
    [[{ kind: 'unknown', probability: 0.1 }], 'new-card'],
    [[{ kind: 'fill', probability: 0.001, calculationSnapshot: {} }], 'unrated'],
    [[{ kind: 'resource' }, { kind: 'bust', probability: 0.1 }], 'unrated'],
    [[], 'empty']
  ]) {
    const result = Strategy.summarize(records);
    assert.equal(result.key, key);
    assert.equal(result.recordCount, records.length);
    assert.equal(result.knownRiskCount, 0);
    for (const field of ['title', 'text', 'basis']) assert.ok(result[field].length > 0);
  }
  assert.equal(Strategy.summarize(null).key, 'empty');
  assert.equal(Strategy.summarize([null, false, []]).key, 'empty');
});

check('reload, undo and record order preserve stateless derivation and input immutability', () => {
  const first = [record(0.1), record(0.15)];
  const saved = freezeDeep([...first, record(0.7), record(0.8)]);
  const before = JSON.stringify(saved);
  assert.deepEqual(Strategy.summarize(saved), Strategy.summarize(clone(saved)));
  assert.deepEqual(Strategy.summarize(saved), Strategy.summarize([...saved].reverse()));
  assert.deepEqual(Strategy.summarize(saved.slice(0, 2)), Strategy.summarize(first));
  assert.equal(Strategy.summarize(saved).key, 'varied');
  assert.equal(Strategy.summarize(first).key, 'steady');
  assert.equal(JSON.stringify(saved), before);
});

check('the actual calculator produces supported risk, reward and unknown-boundary records', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const core = html.slice(html.indexOf('function getNeed(){'), html.indexOf('function percent(')) +
    html.slice(html.indexOf('function sumNeed(a)'), html.indexOf('function paintMetric('));
  const context = {
    params: { supply: -1, source: 'none', walkExtra: 1 },
    dogs: 1, spots: [[1, 0, 0, 0, 0, 0]], dice: 1, yard: 7, bones: 0
  };
  vm.createContext(context);
  vm.runInContext(core, context);
  const roll = context.compute('normal');
  const r = record(0, {
    probability: roll.fills[1], calculationSnapshot: { mode: 'normal', distribution: roll }
  });
  assert.ok(Math.abs(Strategy.riskOf(r) - 5 / 6) < 1e-12);
  assert.equal(Strategy.summarize([r]).key, 'bold');
  context.yard = 0;
  const reward = context.playDeadBurial(0, 0);
  assert.equal(Strategy.riskOf({ kind: 'reward', bucket: '5+',
    probability: reward.fills.slice(5).reduce((a, b) => a + b, 0),
    calculationSnapshot: { mode: 'playdead', distribution: reward } }), 0);
  const walk = context.compute('walk');
  assert.ok(walk.unknown > 0);
  assert.equal(Strategy.riskOf({ kind: 'bust', probability: walk.bust,
    calculationSnapshot: { mode: 'walk', distribution: walk } }), null);
});

check('browser and CommonJS exports agree and expose a frozen API', () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/journal-strategy.js'), 'utf8'), context);
  assert.ok(Object.isFrozen(Strategy));
  assert.ok(Object.isFrozen(context.PipJournalStrategy));
  assert.equal(context.PipJournalStrategy.riskOf(record(0)), 0);
  assert.deepEqual(clone(context.PipJournalStrategy.summarize([record(0.75)])),
    Strategy.summarize([record(0.75)]));
});

console.log('Journal strategy: ' + number + ' checks passed.');
