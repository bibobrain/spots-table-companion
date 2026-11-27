'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Reactions = require('../assets/journal-reactions.js');
const Strategy = require('../assets/journal-strategy.js');

let number = 0;
function check(name, run) { run(); console.log('ok ' + (++number) + ' - ' + name); }
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function record(patch = {}) {
  return {
    id: 'reaction-fixture', kind: 'fill', bucket: 1, actualFilled: 1,
    probability: 0.3, bonesSpent: 0, sequence: 1, createdAt: 1700000000000,
    calculationSnapshot: { mode: 'normal', params: {}, distribution: { fills: [0.5, 0.3, 0, 0, 0, 0], bust: 0.2, unknown: 0 } },
    beforeBoard: { cards: [], yard: 0, bones: 3 },
    afterBoard: { cards: [], yard: 2, bones: 3 },
    ...patch
  };
}
function odds({ probability = 0.3, risk = 0.2, unknown = 0, count = 1, mode = 'normal', kind = 'fill', params = {} } = {}) {
  const bucket = count >= 5 ? '5+' : count;
  const fills = [0, 0, 0, 0, 0, 0];
  if (kind === 'bust') fills[0] = 1 - risk - unknown;
  else { fills[bucket === '5+' ? 5 : bucket] = probability; fills[bucket === 0 ? 1 : 0] += 1 - risk - unknown - probability; }
  return record({ kind, bucket: kind === 'bust' ? null : bucket, probability: kind === 'bust' ? risk : probability,
    actualFilled: kind === 'bust' ? 0 : count,
    calculationSnapshot: { mode, params, distribution: { fills, bust: risk, unknown } } });
}
function react(event) { return Reactions.forRecord(event, { risk: Strategy.riskOf(event) }); }

check('the same pure module loads in CommonJS and as a browser global', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/journal-reactions.js'), 'utf8'), context);
  assert.equal(typeof context.PipJournalReactions.forRecord, 'function');
  const event = freeze(record()), options = freeze({ risk: 0.2 });
  const before = JSON.stringify({ event, options });
  assert.equal(JSON.stringify(context.PipJournalReactions.forRecord(event, options)), JSON.stringify(Reactions.forRecord(event, options)));
  assert.equal(JSON.stringify({ event, options }), before);
});

check('saved event identity keeps wording stable on reopen and list reordering', () => {
  const event = record();
  const original = react(event);
  assert.deepEqual(react(copy(event)), original);
  assert.deepEqual(react({ ...event, sequence: 17, createdAt: 1800000000000, source: 'display label changed' }), original);
  const phrases = new Set(Array.from({ length: 64 }, (_, i) => react({ ...event, id: 'event-' + i }).headline));
  assert.ok(phrases.size >= 3, 'separate moves have a pool rather than one fixed line');
});

check('null, impossible or nonnumeric outcome odds cannot manufacture rarity or risk', () => {
  const event = odds({ risk: 0.6, probability: 0.3 });
  const ordinary = Reactions.forRecord({ ...event, probability: null }, { risk: 0.6 });
  for (const probability of [null, undefined, 0, -0.1, 1.1, NaN, Infinity, '0.01']) {
    assert.deepEqual(Reactions.forRecord({ ...event, probability }, { risk: 0.6 }), ordinary);
  }
});

check('only a mass-conserving distribution with a matching outcome bucket supports rarity', () => {
  const event = odds({ probability: 0.01, risk: 0.2 });
  const ordinary = react({ ...event, probability: null });
  assert.notEqual(react(event).headline, ordinary.headline);
  const invalid = [
    { ...event, calculationSnapshot: undefined },
    { ...event, bucket: 4 },
    { ...event, probability: 0.02 },
    ...[
      { invalid: true }, { invalid: 'false' }, { resource: 0 }, { fills: [] },
      { fills: [0.79, 0.01, NaN] }, { fills: [0.7, 0.01] }, { unknown: -0.1 }, { bust: Infinity }
    ].map(patch => ({ ...event, calculationSnapshot: { ...event.calculationSnapshot,
      distribution: { ...event.calculationSnapshot.distribution, ...patch } } }))
  ];
  for (const bad of invalid) assert.equal(Reactions.forRecord(bad, { risk: 0.9 }).headline, ordinary.headline);
});

check('zero risk stays valid and a rare outcome does not become an aggressive strategy', () => {
  const safeRare = odds({ probability: 0.02, risk: 0, mode: 'walk', params: { walkExtra: 1 } });
  assert.equal(Strategy.riskOf(safeRare), 0);
  const known = react(safeRare), noRisk = Reactions.forRecord(safeRare, { risk: null });
  assert.equal(known.headline, noRisk.headline, 'event rarity is independent of complete risk');
  assert.notEqual(known.actionLine, noRisk.actionLine, 'zero risk qualifies the matched plan');
  assert.doesNotMatch(known.headline, /激进|冒险|胆子|敢掷|够悬|悬着/);
  assert.notEqual(known.headline, react({ ...safeRare, probability: null }).headline);
});

check('a known rare result beside an unknown branch retains rarity but not risk', () => {
  const event = odds({ probability: 0.01, risk: 0.2, unknown: 0.3 });
  const complete = odds({ probability: 0.01, risk: 0.2 });
  assert.equal(Strategy.riskOf(event), null);
  assert.equal(react(event).headline, react(complete).headline);
  assert.notEqual(react(event).headline, react({ ...event, probability: null }).headline);
  assert.doesNotMatch(react(event).headline, /激进|冒险|胆子|敢掷|悬着/);
});

check('only qualified pre-action risk at or above one half invokes high-risk wording', () => {
  const high = odds({ probability: 0.3, risk: 0.5 });
  const low = odds({ probability: 0.3, risk: 0.499 });
  assert.notEqual(react(high).headline, react(low).headline);
  const ordinary = Reactions.forRecord(high, { risk: null }).headline;
  for (const risk of [null, undefined, NaN, Infinity, -0.1, 1.1, '0.9']) {
    assert.equal(Reactions.forRecord(high, { risk }).headline, ordinary);
  }
  assert.equal(Reactions.forRecord(high, { risk: 0 }).headline, ordinary);
});

check('zero-fill, a single fill, many fills, 5+ and BUST have different result reactions', () => {
  const events = [0, 1, 3, 6].map(count => odds({ count, probability: 0.3 }));
  events.push(odds({ kind: 'bust', risk: 0.2 }));
  assert.equal(new Set(events.map(event => react(event).headline)).size, events.length);
  assert.match(react(events[0]).headline, /没|空/);
});

check('5+ rarity remains the aggregate bucket even when six dice were actually placed', () => {
  const event = odds({ count: 6, probability: 0.03 });
  event.calculationSnapshot.distribution.fills[5] = 0.02;
  event.calculationSnapshot.distribution.fills[6] = 0.01;
  assert.equal(Strategy.riskOf(event), 0.2);
  const original = react(event);
  assert.equal(react({ ...event, actualFilled: 5 }).headline, original.headline);
  const incorrectExactOdds = { ...event, probability: 0.01 };
  assert.equal(Strategy.riskOf(incorrectExactOdds), null);
  assert.equal(react(incorrectExactOdds).headline, react({ ...event, probability: null }).headline);
  assert.equal(event.probability, 0.03);
  assert.equal(event.actualFilled, 6);
});

check('resource commentary follows the actual bone delta, not an inconsistent reward field', () => {
  const event = record({ kind: 'resource', probability: null, rewardBones: -7 });
  const gain = react({ ...event, afterBoard: { ...event.afterBoard, bones: 4 } });
  const zero = react({ ...event, rewardBones: 7 });
  const loss = react({ ...event, afterBoard: { ...event.afterBoard, bones: 2 } });
  assert.equal(new Set([gain.headline, zero.headline, loss.headline]).size, 3);
  assert.match(gain.headline, /到账|厚|攒/);
  assert.match(zero.headline, /没|热闹/);
  assert.match(loss.headline, /花出去|瘦|库存/);
  const missing = { ...event, beforeBoard: undefined, afterBoard: undefined, rewardBones: undefined };
  assert.notEqual(react(missing).headline, zero.headline, 'missing facts do not imply zero change');
});

check('resource and new-card checkpoints never inherit fake rare-result odds', () => {
  for (const kind of ['resource', 'unknown']) {
    const event = odds({ probability: 0.01, risk: 0.6 });
    event.kind = kind;
    assert.deepEqual(Reactions.forRecord(event, { risk: 0.6 }), Reactions.forRecord({ ...event, probability: null }, { risk: 0.6 }));
  }
});

check('Play Dead distinguishes zero reward, gross reward and actual placement', () => {
  const event = odds({ mode: 'playdead', kind: 'reward', count: 0, probability: 0.3 });
  const zero = react({ ...event, rewardBones: 0 });
  assert.match(zero.headline, /没|口粮没到/);
  assert.match(zero.actionLine, /没到账|没领着/);
  const reward = { ...event, bucket: 2, rewardBones: 2, probability: null,
    bonesSpent: 3, beforeBoard: { cards: [], yard: 0, bones: 5 }, afterBoard: { cards: [], yard: 2, bones: 4 } };
  assert.match(react(reward).actionLine, /骨头一叼|领骨头/);
  assert.doesNotMatch(react(reward).headline, /小金库|厚|攒/);
  const placed = odds({ mode: 'playdead' });
  assert.match(react(placed).actionLine, /格子|有去处/);
  assert.doesNotMatch(react({ ...placed, actualFilled: 0, probability: null }).actionLine, /格子照样占|有去处/);
});

check('scoring copy requires an existing unscored dog to become scored in this record', () => {
  const event = record();
  const ordinary = react(event).headline;
  const existing = { ...event,
    beforeBoard: { ...event.beforeBoard, cards: [{ id: 'dog-a', scored: false }] },
    afterBoard: { ...event.afterBoard, cards: [{ id: 'dog-a', scored: true }] } };
  assert.notEqual(react(existing).headline, ordinary);
  assert.equal(react({ ...existing, beforeBoard: event.beforeBoard }).headline, ordinary, 'a newly added scored card is not a new score by this move');
  assert.equal(react({ ...existing, beforeBoard: { ...event.beforeBoard, cards: [{ id: 'dog-a', scored: true }] } }).headline, ordinary);
  assert.equal(react({ ...existing, beforeBoard: { ...event.beforeBoard, cards: [{ id: 'dog-a' }] } }).headline, ordinary);
});

check('optional-step jokes do not invent a later stage of an interrupted or unmatched move', () => {
  const walk = odds({ mode: 'walk', params: { walkExtra: 1 } });
  assert.match(react(walk).actionLine, /多走一步|加时/);
  const interrupted = odds({ mode: 'walk', kind: 'bust', params: { walkExtra: 1 } });
  assert.equal(react(interrupted).actionLine, react({ ...interrupted,
    calculationSnapshot: { ...interrupted.calculationSnapshot, params: { walkExtra: 0 } } }).actionLine);
  assert.doesNotMatch(react({ ...walk, probability: null }).actionLine, /多走一步|加时|收脚|收住/);
  const dogpile = odds({ mode: 'dogpile', params: { source: 'yard' } });
  assert.match(react(dogpile).actionLine, /旧骰/);
  assert.doesNotMatch(react({ ...dogpile, probability: null }).actionLine, /旧骰/);
  const ambiguous = { ...dogpile, calculationSnapshot: { ...dogpile.calculationSnapshot, params: { source: 'choose' } } };
  assert.doesNotMatch(react(ambiguous).actionLine, /旧骰/);
});

check('special expenditure and doubling lines require the corresponding actual facts', () => {
  const track = odds({ mode: 'track' });
  assert.notEqual(react({ ...track, bonesSpent: 1 }).actionLine, react(track).actionLine);
  const chew = record({ kind: 'resource', probability: null,
    calculationSnapshot: { mode: 'chew', params: {} }, afterBoard: { cards: [], yard: 0, bones: 7 } });
  assert.match(react(chew).actionLine, /翻/);
  assert.doesNotMatch(react({ ...chew, afterBoard: { cards: [], yard: 0, bones: 5 } }).actionLine, /翻/);
  const rollover = odds({ mode: 'rollover' });
  const emptied = { ...rollover, beforeBoard: { ...rollover.beforeBoard, yard: 6 }, afterBoard: { ...rollover.afterBoard, yard: 2 } };
  assert.notEqual(react(emptied).actionLine, react(rollover).actionLine);
});

check('all 22 exact Action keys have original action lines; unknown strings are not echoed', () => {
  const modes = ['howl', 'rollover', 'dig', 'retrieve', 'track', 'trot', 'walk', 'fetch', 'guard', 'hunt', 'scavenge', 'search', 'bolt', 'chase', 'dogpile', 'run', 'sprint', 'beg', 'chew', 'gobble', 'playdead', 'stay'];
  const seen = new Set();
  for (const mode of modes) {
    const line = react(odds({ mode })).actionLine;
    assert.ok(line.length > 0, mode);
    seen.add(line);
  }
  assert.equal(seen.size, 22);
  for (const mode of ['__proto__', 'constructor', 'toString', '<img src=x onerror=alert(1)>']) {
    assert.equal(react(odds({ mode })).actionLine, '');
  }
  for (const input of [null, undefined, [], 'not a record']) assert.equal(typeof Reactions.forRecord(input).headline, 'string');
});

check('the copy corpus makes no streak, recovery, future-win or lost-dog claims', () => {
  const modes = ['normal', 'howl', 'rollover', 'dig', 'retrieve', 'track', 'trot', 'walk', 'fetch', 'guard', 'hunt', 'scavenge', 'search', 'bolt', 'chase', 'dogpile', 'run', 'sprint', 'beg', 'chew', 'gobble', 'playdead', 'stay'];
  const prohibited = /连胜|连跪|翻本|回本|该你赢|下一把.*(?:必|稳)|全军覆没|狗牌全没|加注|赢钱|输钱|活该|偶然一掷|落成意外之喜|[<>]/;
  for (const mode of modes) for (const kind of ['fill', 'bust', 'reward', 'resource', 'unknown']) for (let i = 0; i < 24; i++) {
    const event = odds({ mode, kind, probability: i % 2 ? 0.01 : 0.3, risk: i % 3 ? 0.2 : 0.6, count: i % 7 });
    event.id = 'corpus-' + i;
    event.rewardBones = i % 6;
    const result = react(event);
    assert.doesNotMatch(result.headline + result.actionLine, prohibited);
  }
});

console.log(number + ' journal reaction checks passed');
