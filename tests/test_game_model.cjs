'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const G = require('../assets/game-model.js');

let count = 0;
function test(name, fn) {
  fn(); count += 1; console.log('PASS ' + name);
}
function start(patterns) {
  let s = G.newGame(1000);
  for (const p of patterns) s = G.addDog(s, p);
  return s;
}
function ref(s, card, slot) { return { dogId: s.cards[card].id, slot }; }
function event(id, kind, bucket, probability, extra = {}) {
  return { id, kind, bucket, probability, source: 'Roll', calculationSnapshot: { dice: 2, bones: 0, policy: 'fill-first', distribution: { fills: [0.1, 0.2, 0.3], bust: 0.4 } }, ...extra };
}
function settle(s, id, refs, bucket = refs.length, probability = 0.2, more = {}) {
  return G.settle(s, { event: event(id, 'fill', bucket, probability), filled: refs, yardAfter: s.yard, bonesAfter: s.bones, ...more });
}
function frozen(value) {
  Object.freeze(value);
  Object.values(value).forEach(v => { if (v && typeof v === 'object') frozen(v); });
  return value;
}

test('repeated faces are distinct slots, including four identical faces', () => {
  const initial = frozen(start([[4, 4], [1, 1, 1, 1]]));
  const one = G.toggleSpot(initial, initial.cards[0].id, 0);
  assert.deepEqual(G.needs(initial), [4, 0, 0, 2, 0, 0]);
  assert.deepEqual(G.needs(one), [4, 0, 0, 1, 0, 0]);
  assert.deepEqual(initial.cards[0].filled, [false, false]);
  assert.equal(one.revision, initial.revision + 1);
  assert.equal(one.cards[0].scored, false);
});

test('full but unscored dogs are still lost on a bust; scored dogs survive', () => {
  let s = start([[1], [2], [3, 4]]);
  s = G.amend(s, { yard: 7, bones: 8 });
  s = G.toggleSpot(s, s.cards[0].id, 0);
  s = G.scoreDogs(s);
  s = G.toggleSpot(s, s.cards[1].id, 0);
  s = G.toggleSpot(s, s.cards[2].id, 0);
  assert.equal(s.cards[1].scored, false);
  const before = G.clone(s);
  const result = G.bust(frozen(s), event('b1', 'bust', null, 5 / 6));
  assert.equal(result.yard, 0);
  assert.equal(result.bones, 8);
  assert.equal(result.cards.length, 3);
  assert.equal(result.cards[0].scored, true);
  assert.deepEqual(result.cards[0].filled, [true]);
  assert.deepEqual(result.cards[1].filled, [false]);
  assert.deepEqual(result.cards[2].filled, [false, false]);
  assert.deepEqual(result.records[0].beforeBoard, G.board(before));
  assert.deepEqual(result.records[0].afterBoard, G.board(result));
  assert.equal(result.revision, before.revision + 1);
  assert.deepEqual(G.summarize(result).filled, 0);
});

test('yard 7 is safe; scoring only happens after a successful settlement', () => {
  let s = start([[1], [2]]);
  s = G.amend(s, { yard: 7 });
  s = G.toggleSpot(s, s.cards[0].id, 0);
  const safe = settle(s, 's1', [ref(s, 1, 0)], 1, 1 / 6);
  assert.ok(safe.cards.every(c => c.scored));
  assert.equal(safe.yard, 7);
  assert.equal(s.cards[0].scored, false);
  assert.deepEqual(G.needs(safe), [0, 0, 0, 0, 0, 0]);
  // Placing the last slot in the UI is not yet safe resolution of the whole batch.
  const visuallyFull = G.toggleSpot(s, s.cards[1].id, 0);
  assert.ok(visuallyFull.cards.every(c => !c.scored));
  const busted = G.bust(visuallyFull, event('b-after-last-slot', 'bust', null, 0.1));
  assert.ok(busted.cards.every(c => !c.scored && c.filled.every(v => !v)));
});

test('scoreDogs scores every completed dog but preserves yard and partial dogs', () => {
  let s = G.amend(start([[2], [3], [4, 4]]), { yard: 6 });
  s = G.toggleSpot(s, s.cards[0].id, 0);
  s = G.toggleSpot(s, s.cards[1].id, 0);
  s = G.toggleSpot(s, s.cards[2].id, 0);
  const result = G.scoreDogs(s);
  assert.deepEqual(result.cards.map(c => c.scored), [true, true, false]);
  assert.equal(result.yard, 6);
  assert.deepEqual(G.needs(result), [0, 0, 0, 1, 0, 0]);
  assert.throws(() => G.toggleSpot(result, result.cards[0].id, 0), /已记分/);
});

test('5+ probability remains the frozen aggregate even when the actual count is 6', () => {
  const s = start([[1, 1, 1, 1], [1, 1]]);
  const selected = s.cards.flatMap(c => c.faces.map((_, slot) => ({ dogId: c.id, slot })));
  const aggregate = 31 / 46656;
  const result = settle(s, 'over-five', selected, '5+', aggregate);
  assert.equal(result.records[0].actualFilled, 6);
  assert.equal(result.records[0].bucket, '5+');
  assert.equal(result.records[0].probability, aggregate);
  assert.notEqual(result.records[0].probability, 1 / 46656);
  assert.equal(G.summarize(result).title, '凤毛麟角');
  assert.match(G.summarize(result).description, /5 颗以上（实际 6 颗）/);
});

test('settlement metadata and before/after boards are deep immutable snapshots', () => {
  const s = start([[1, 2]]);
  const e = event('snapshot', 'fill', 1, 0.33333333333333);
  const result = G.settle(s, { event: e, filled: [ref(s, 0, 0)], yardAfter: 4 });
  e.calculationSnapshot.distribution.fills[1] = 999;
  s.cards[0].faces[0] = 6;
  assert.equal(result.records[0].calculationSnapshot.distribution.fills[1], 0.2);
  assert.equal(result.records[0].beforeBoard.cards[0].faces[0], 1);
  result.cards[0].filled[1] = true;
  assert.equal(result.records[0].afterBoard.cards[0].filled[1], false);
  assert.equal(result.records[0].probability, 0.33333333333333);
});

test('duplicate event IDs and duplicated/invalid slot selections are rejected atomically', () => {
  const s = start([[1, 2, 3]]);
  const r = ref(s, 0, 0);
  assert.throws(() => settle(s, 'dup-slots', [r, r]), /重复/);
  assert.throws(() => settle(s, 'bad-slot', [ref(s, 0, 4)]), /超出/);
  assert.throws(() => settle(s, 'bad-count', [r], 2), /颗数/);
  const first = settle(s, 'once', [r]);
  assert.throws(() => G.bust(first, event('once', 'bust', null, 0.2)), /已经记录/);
  assert.equal(first.records.length, 1);
  assert.deepEqual(s.cards[0].filled, [false, false, false]);
});

test('old dice can be removed before placing new dice in the same slot', () => {
  let s = start([[4, 5]]);
  s = G.toggleSpot(s, s.cards[0].id, 0);
  const r = ref(s, 0, 0);
  const out = settle(s, 'replace', [r], 1, 0.4, { emptied: [r] });
  assert.deepEqual(out.cards[0].filled, [true, false]);
  assert.equal(out.records[0].actualFilled, 1);
  assert.deepEqual(out.records[0].removals, [r]);
  assert.throws(() => settle(s, 'remove-empty', [], 0, 0.5, { emptied: [ref(s, 0, 1)] }), /没有骰子/);
});

test('0 safe fills are recordable; zero probability never becomes a rarity award', () => {
  const s = start([[1, 2]]);
  const zero = settle(s, 'safe-zero', [], 0, 5 / 6, { yardAfter: 6 });
  assert.equal(zero.records[0].actualFilled, 0);
  assert.equal(G.summarize(zero).title, '波澜不惊');
  const unmodelled = G.bust(s, event('external-bust', 'bust', null, 0));
  assert.equal(unmodelled.records[0].probability, null);
  assert.equal(G.summarize(unmodelled).title, null);
  assert.equal(G.summarize(unmodelled).highlight, null);
  assert.throws(() => G.bust(s, event('negative', 'bust', null, -0.1)), /概率/);
});

test('unknown and resource records require actual counts and cannot win a title', () => {
  const s = start([[1, 2]]);
  assert.throws(() => G.settle(s, { event: event('missing-count', 'unknown', null, 0.000001), yardAfter: 0 }), /实际填入/);
  const unknown = G.settle(s, { event: event('unknown', 'unknown', null, 0.000001, { actualFilled: 1 }), filled: [ref(s, 0, 0)], yardAfter: 0 });
  const resource = G.settle(unknown, { event: event('resource', 'resource', null, 0.0000001, { actualFilled: 0 }), filled: [], yardAfter: 0, bonesAfter: 7 });
  assert.equal(G.summarize(resource).recorded, 2);
  assert.equal(G.summarize(resource).filled, 1);
  assert.equal(G.summarize(resource).title, null);
  assert.equal(resource.bones, 7);
});

test('random burial rewards can win a title without inflating filled dog spots', () => {
  const s = start([[1, 2]]);
  const reward = event('reward', 'reward', '5+', 0.001, { actualFilled: 0, rewardBones: 6, buriedFace: 6 });
  const result = G.settle(s, { event: reward, filled: [], yardAfter: 6, bonesAfter: 6 });
  const summary = G.summarize(result);
  assert.equal(summary.filled, 0);
  assert.equal(summary.highlight.id, 'reward');
  assert.equal(summary.title, '凤毛麟角');
  assert.match(summary.description, /埋入 6 点骰子，获得 6 根骨头/);
  assert.deepEqual(result.cards[0].filled, [false, false]);
  assert.deepEqual(G.restore(JSON.stringify(result)), result);
  const noGain = G.settle(s, { event: event('no-gain', 'reward', 0, 0.01, { actualFilled: 0, rewardBones: 0, buriedFace: 1 }), filled: [], yardAfter: 1, bonesAfter: 0 });
  assert.equal(G.summarize(noGain).title, '波澜不惊');
  for (const bad of [{ rewardBones: -1 }, { rewardBones: 1.5 }, { buriedFace: 0 }, { buriedFace: 7 }]) {
    assert.throws(() => G.settle(s, { event: { ...reward, ...bad }, filled: [], yardAfter: 6 }), /骨头|骰面/);
  }
});

test('minimum positive probability selects the earliest tie, not the most flattering outcome', () => {
  let s = start([[1, 2, 3]]);
  s = G.bust(s, event('first', 'bust', null, 0.005));
  s = settle(s, 'equal', [ref(s, 0, 0)], 1, 0.005);
  assert.equal(G.summarize(s).highlight.id, 'first');
  assert.equal(G.summarize(s).title, '平地风波');
  s = settle(s, 'rarer', [ref(s, 0, 1)], 1, 0.0001);
  assert.equal(G.summarize(s).highlight.id, 'rarer');
});

test('card capacity counts scored cards; all public mutators return a new revision', () => {
  let s = start([[1], [2], [3], [4], [5], [6]]);
  s = G.toggleSpot(s, s.cards[0].id, 0);
  s = G.scoreDogs(s);
  assert.throws(() => G.addDog(s, [1]), /最多 6/);
  const less = G.removeDog(s, s.cards[5].id);
  assert.equal(less.revision, s.revision + 1);
  assert.equal(less.cards.length, 5);
  const again = G.addDog(less, [6]);
  assert.equal(again.cards[5].id, 'dog-7');
  assert.throws(() => G.amend(s, { yard: 8 }), /Yard/);
  assert.throws(() => G.amend(s, { bones: 100 }), /骨头/);
  assert.throws(() => G.amend(s, { cards: [] }), /只能调整/);
});

test('ending and resuming preserves the same game and does not fabricate records', () => {
  const s = start([[1]]);
  const ended = G.endGame(s);
  assert.equal(ended.id, s.id);
  assert.ok(ended.endedAt >= ended.startedAt);
  assert.equal(ended.revision, s.revision + 1);
  assert.equal(G.summarize(ended).title, null);
  assert.throws(() => G.amend(ended, { yard: 1 }), /已结束/);
  const resumed = G.resumeGame(ended);
  assert.equal(resumed.endedAt, null);
  assert.equal(resumed.id, s.id);
  assert.equal(resumed.revision, ended.revision + 1);
  assert.deepEqual(resumed.records, []);
});

test('valid save restores independently, damaged schema/card/record data returns null', () => {
  const s = start([[1, 2]]);
  const good = settle(s, 'saved', [ref(s, 0, 0)], 1, 1 / 6);
  const recovered = G.restore(JSON.stringify(good));
  assert.deepEqual(recovered, good);
  recovered.cards[0].filled[0] = false;
  assert.equal(good.cards[0].filled[0], true);
  const corruptions = [
    x => { x.schema = 2; },
    x => { x.yard = 8; },
    x => { x.bones = -1; },
    x => { x.cards[0].faces.push(1, 2, 3); },
    x => { x.cards[0].faces[0] = 7; },
    x => { x.cards[0].filled = [true]; },
    x => { x.cards[0].filled[1] = 1; },
    x => { x.records.push(G.clone(x.records[0])); },
    x => { x.records[0].probability = 1.1; },
    x => { delete x.records[0].probability; },
    x => { x.records[0].placements[0].slot = 9; },
    x => { x.records[0].beforeBoard.cards[0].filled = []; },
    x => { x.records[0].actualFilled = 2; },
    x => { x.records[0].sequence = 0; },
    x => { x.nextEventId = 1; }
  ];
  for (const corrupt of corruptions) {
    const changed = G.clone(good); corrupt(changed);
    assert.equal(G.restore(JSON.stringify(changed)), null);
  }
  assert.equal(G.restore('{broken'), null);
  assert.equal(G.restore('null'), null);
  assert.equal(G.restore('{}'), null);
});

test('sparse arrays and a stale next dog ID cannot create a damaged game', () => {
  const s = G.newGame(1000);
  assert.throws(() => G.addDog(s, new Array(2)), /点面/);
  const two = start([[1], [2]]);
  const damaged = G.clone(two);
  damaged.cards.splice(0, 1);
  damaged.nextDogId = 1;
  assert.equal(G.restore(JSON.stringify(damaged)), null);
});

test('browser UMD exposes the same API without CommonJS', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/game-model.js'), 'utf8'), context);
  assert.equal(typeof context.PipGame.newGame, 'function');
  assert.equal(context.PipGame.newGame(1000).schema, 1);
});

console.log('\n' + count + ' game-model scenarios passed.');
