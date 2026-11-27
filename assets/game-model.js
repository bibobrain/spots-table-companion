/* Pip & Paw: immutable board and current-game settlement model. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipGame = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_CARDS = 6;
  const MAX_SPOTS = 4;
  const MAX_RECORDS = 2000;
  const MAX_TEXT = 512;
  const KINDS = new Set(['fill', 'bust', 'reward', 'resource', 'unknown']);
  const clone = value => copy(value, 0, new Set());

  function error(message) { throw new Error(message); }
  function plain(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  function copy(value, depth, seen) {
    if (depth > 40) error('保存的数据层级过深。');
    if (value === null || typeof value === 'string' || typeof value === 'boolean' || value === undefined) return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) error('数据中含有无效数字。');
      return value;
    }
    if (!Array.isArray(value) && !plain(value)) error('只能保存普通对象和数组。');
    if (seen.has(value)) error('数据中不能包含循环引用。');
    seen.add(value);
    const out = Array.isArray(value) ? [] : {};
    for (const key of Object.keys(value)) {
      Object.defineProperty(out, key, { value: copy(value[key], depth + 1, seen), writable: true, configurable: true, enumerable: true });
    }
    seen.delete(value);
    return out;
  }
  function integer(value, min, max, message) {
    if (!Number.isSafeInteger(value) || value < min || value > max) error(message);
    return value;
  }
  function text(value, message) {
    if (typeof value !== 'string' || !value.trim() || value.length > MAX_TEXT) error(message);
    return value;
  }
  function timestamp(value, message) { return integer(value, 0, Number.MAX_SAFE_INTEGER - 1, message); }
  function facesValid(faces) {
    if (!Array.isArray(faces) || faces.length < 1 || faces.length > MAX_SPOTS) error('每张狗牌请选择 1–4 个点面。');
    for (let i = 0; i < faces.length; i++) integer(faces[i], 1, 6, '骰子点面必须是 1–6。');
  }
  function cardsValid(cards) {
    if (!Array.isArray(cards) || cards.length > MAX_CARDS) error('已记分和未记分的狗牌合计最多 6 张。');
    const ids = new Set();
    for (const card of cards) {
      if (!plain(card)) error('狗牌数据不完整。');
      text(card.id, '狗牌缺少有效编号。');
      if (ids.has(card.id)) error('狗牌编号不能重复。');
      ids.add(card.id);
      facesValid(card.faces);
      if (!Array.isArray(card.filled) || card.filled.length !== card.faces.length || Array.from(card.filled).some(v => typeof v !== 'boolean')) error('狗牌的已填状态与点面不一致。');
      if (typeof card.scored !== 'boolean') error('狗牌的记分状态无效。');
      if (card.scored && !card.filled.every(Boolean)) error('已记分的狗牌必须完整。');
      integer(card.pose, 0, Number.MAX_SAFE_INTEGER - 1, '狗狗姿态编号无效。');
    }
  }
  function boardValid(value) {
    if (!plain(value)) error('桌面数据不完整。');
    cardsValid(value.cards);
    integer(value.yard, 0, 7, 'Yard 必须在 0–7 点之间。');
    integer(value.dice, 1, 12, '骰子数量必须在 1–12 颗之间。');
    integer(value.bones, 0, 99, '骨头数量必须在 0–99 根之间。');
  }
  function probability(value) {
    if (value === null || value === undefined || value === 0) return null;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) error('结算概率必须在 0–100% 之间。');
    return value;
  }
  function bucketValid(bucket, actual) {
    if (bucket === '5+') {
      if (actual < 5) error('选择 5 颗以上时，至少要填入 5 颗。');
    } else {
      integer(bucket, 0, 4, '请选择 0、1、2、3、4 或 5 颗以上。');
      if (actual !== bucket) error('实际填入颗数与所选结果不一致。');
    }
  }
  function rewardValid(event) {
    if (event.actualFilled !== 0) error('埋骰奖励不能同时记作填入狗牌。');
    integer(event.rewardBones, 0, 99, '实际获得的骨头数量无效。');
    integer(event.buriedFace, 1, 6, '埋入的骰面必须是 1–6。');
  }
  function referenceValid(ref, cards) {
    if (!plain(ref)) error('点面位置无效。');
    text(ref.dogId, '点面缺少狗牌编号。');
    const card = cards.find(c => c.id === ref.dogId);
    if (!card) error('找不到这张狗牌。');
    integer(ref.slot, 0, card.faces.length - 1, '点面位置超出狗牌范围。');
    return card;
  }
  function refsValid(refs, cards) {
    if (!Array.isArray(refs) || refs.length > MAX_CARDS * MAX_SPOTS) error('本次点面选择无效。');
    const seen = new Set();
    for (const ref of refs) {
      referenceValid(ref, cards);
      const key = ref.dogId + ':' + ref.slot;
      if (seen.has(key)) error('同一个点面不能重复选择。');
      seen.add(key);
    }
  }
  function recordValid(record) {
    if (!plain(record)) error('结算记录不完整。');
    text(record.id, '结算记录缺少编号。');
    integer(record.sequence, 1, Number.MAX_SAFE_INTEGER - 1, '结算顺序无效。');
    if (!KINDS.has(record.kind)) error('结算类型无效。');
    if (!Object.prototype.hasOwnProperty.call(record, 'probability')) error('结算记录缺少概率字段。');
    probability(record.probability);
    integer(record.actualFilled, 0, MAX_CARDS * MAX_SPOTS, '实际填入颗数无效。');
    if (record.kind === 'fill') bucketValid(record.bucket, record.actualFilled);
    if (record.kind === 'bust' && record.actualFilled !== 0) error('爆掉不能保留本次填入颗数。');
    if (record.kind === 'reward') rewardValid(record);
    timestamp(record.createdAt, '结算时间无效。');
    boardValid(record.beforeBoard);
    boardValid(record.afterBoard);
    refsValid(record.placements, record.beforeBoard.cards);
    refsValid(record.removals, record.beforeBoard.cards);
    if (record.kind !== 'bust' && record.placements.length !== record.actualFilled) error('结算点面与实际颗数不一致。');
    if (record.kind === 'bust' && (record.afterBoard.yard !== 0 || record.afterBoard.cards.some(c => !c.scored && c.filled.some(Boolean)))) error('爆掉后的桌面状态无效。');
    if (record.source === undefined || record.calculationSnapshot === undefined) error('结算记录缺少计算快照。');
  }
  function valid(state) {
    if (!plain(state) || state.schema !== 1) error('无法识别这个版本的对局数据。');
    text(state.id, '对局缺少有效编号。');
    timestamp(state.startedAt, '对局开始时间无效。');
    if (state.endedAt !== null) {
      timestamp(state.endedAt, '对局结束时间无效。');
      if (state.endedAt < state.startedAt) error('对局结束时间早于开始时间。');
    }
    integer(state.revision, 0, Number.MAX_SAFE_INTEGER - 1, '对局版本无效。');
    integer(state.nextDogId, 1, Number.MAX_SAFE_INTEGER - 1, '下一张狗牌编号无效。');
    integer(state.nextEventId, 1, Number.MAX_SAFE_INTEGER - 1, '下一次结算编号无效。');
    boardValid(state);
    if (state.cards.some(c => /^dog-\d+$/.test(c.id) && Number(c.id.slice(4)) >= state.nextDogId)) error('下一张狗牌编号与已有牌冲突。');
    if (!Array.isArray(state.records) || state.records.length > MAX_RECORDS) error('本局记录数量无效。');
    const ids = new Set();
    let sequence = 0;
    for (const record of state.records) {
      recordValid(record);
      if (ids.has(record.id)) error('结算记录编号不能重复。');
      ids.add(record.id);
      if (record.sequence <= sequence || record.sequence >= state.nextEventId) error('结算记录顺序无效。');
      sequence = record.sequence;
      if (record.createdAt < state.startedAt) error('结算时间早于本局开始。');
    }
    return state;
  }
  function editable(state) {
    valid(state);
    if (state.endedAt !== null) error('本局已结束，请先返回本局再调整。');
  }
  function next(state) { const out = clone(state); out.revision += 1; return out; }
  function board(state) {
    boardValid(state);
    return clone({ cards: state.cards, yard: state.yard, dice: state.dice, bones: state.bones });
  }
  function newGame(now = Date.now()) {
    timestamp(now, '对局开始时间无效。');
    return { schema: 1, id: 'game-' + now.toString(36), startedAt: now, endedAt: null, revision: 0, nextDogId: 1, nextEventId: 1, cards: [], yard: 0, dice: 2, bones: 0, records: [] };
  }
  function needs(state) {
    boardValid(state);
    const out = [0, 0, 0, 0, 0, 0];
    state.cards.forEach(card => {
      if (!card.scored) card.faces.forEach((face, i) => { if (!card.filled[i]) out[face - 1] += 1; });
    });
    return out;
  }
  function addDog(state, faces, pose = 0) {
    editable(state); facesValid(faces);
    integer(pose, 0, Number.MAX_SAFE_INTEGER - 1, '狗狗姿态编号无效。');
    if (state.cards.length >= MAX_CARDS) error('已记分和未记分的狗牌合计最多 6 张。');
    const out = next(state);
    out.cards.push({ id: 'dog-' + out.nextDogId, faces: faces.slice(), filled: faces.map(() => false), scored: false, pose });
    out.nextDogId += 1;
    return out;
  }
  function removeDog(state, id) {
    editable(state);
    const index = state.cards.findIndex(card => card.id === id);
    if (index < 0) error('找不到这张狗牌。');
    const out = next(state); out.cards.splice(index, 1); return out;
  }
  function toggleSpot(state, id, slot) {
    editable(state);
    const card = referenceValid({ dogId: id, slot }, state.cards);
    if (card.scored) error('已记分的狗牌不能再放置或取回骰子。');
    const out = next(state);
    const target = out.cards.find(c => c.id === id);
    target.filled[slot] = !target.filled[slot];
    return out;
  }
  function scoreDogs(state) {
    editable(state);
    const completed = state.cards.filter(c => !c.scored && c.filled.every(Boolean));
    if (!completed.length) error('还没有可以记分的完整狗牌。');
    const out = next(state);
    out.cards.forEach(c => { if (!c.scored && c.filled.every(Boolean)) c.scored = true; });
    return out;
  }
  function amend(state, patch) {
    editable(state);
    if (!plain(patch)) error('桌面调整数据无效。');
    if (Object.keys(patch).some(k => !['yard', 'dice', 'bones'].includes(k))) error('只能调整 Yard、骰子和骨头。');
    const out = next(state);
    Object.keys(patch).forEach(key => { out[key] = patch[key]; });
    boardValid(out); return out;
  }
  function eventValid(state, event, allowed) {
    if (!plain(event)) error('请先选择本次结算结果。');
    text(event.id, '本次结算缺少有效编号。');
    if (!allowed.includes(event.kind)) error('结算类型与操作不一致。');
    if (state.records.some(record => record.id === event.id)) error('这次结果已经记录，请勿重复结算。');
    if (state.records.length >= MAX_RECORDS) error('本局记录已满，请结束本局后开始新一局。');
    probability(event.probability);
    if (event.createdAt !== undefined) {
      timestamp(event.createdAt, '结算时间无效。');
      if (event.createdAt < state.startedAt) error('结算时间早于本局开始。');
    }
    clone(event);
  }
  function appendRecord(state, out, event, actualFilled, placements, removals) {
    const record = clone(event);
    record.sequence = state.nextEventId;
    record.probability = probability(event.probability);
    record.source = event.source === undefined ? 'Roll' : clone(event.source);
    record.calculationSnapshot = event.calculationSnapshot === undefined ? {} : clone(event.calculationSnapshot);
    record.actualFilled = actualFilled;
    record.createdAt = event.createdAt === undefined ? Math.max(Date.now(), state.startedAt) : event.createdAt;
    record.beforeBoard = board(state);
    record.afterBoard = board(out);
    record.placements = clone(placements);
    record.removals = clone(removals);
    out.records.push(record);
    out.nextEventId += 1;
    return out;
  }
  function bust(state, event, bonesAfter = state.bones) {
    editable(state); eventValid(state, event, ['bust']);
    integer(bonesAfter, 0, 99, '骨头数量必须在 0–99 根之间。');
    const out = next(state);
    out.cards.forEach(card => { if (!card.scored) card.filled.fill(false); });
    out.yard = 0; out.bones = bonesAfter;
    return appendRecord(state, out, event, 0, [], []);
  }
  function settle(state, options) {
    editable(state);
    if (!plain(options)) error('本次结算数据无效。');
    const { event, filled = [], emptied = [], yardAfter, bonesAfter = state.bones } = options;
    eventValid(state, event, ['fill', 'reward', 'resource', 'unknown']);
    refsValid(filled, state.cards); refsValid(emptied, state.cards);
    integer(yardAfter, 0, 7, '安全结算后的 Yard 必须在 0–7 点之间。');
    integer(bonesAfter, 0, 99, '骨头数量必须在 0–99 根之间。');
    if (event.kind === 'fill') {
      bucketValid(event.bucket, filled.length);
      if (event.actualFilled !== undefined && event.actualFilled !== filled.length) error('实际填入颗数与所选点面不一致。');
    } else {
      integer(event.actualFilled, 0, MAX_CARDS * MAX_SPOTS, '请明确记录这次实际填入的颗数。');
      if (event.actualFilled !== filled.length) error('实际填入颗数与所选点面不一致。');
      if (event.kind === 'reward') rewardValid(event);
    }
    const out = next(state);
    emptied.forEach(ref => {
      const card = referenceValid(ref, out.cards);
      if (card.scored) error('已记分的狗牌不能取回骰子。');
      if (!card.filled[ref.slot]) error('这个位置没有骰子可以取回。');
      card.filled[ref.slot] = false;
    });
    filled.forEach(ref => {
      const card = referenceValid(ref, out.cards);
      if (card.scored) error('已记分的狗牌不能再填入骰子。');
      if (card.filled[ref.slot]) error('这个位置已经放有骰子。');
      card.filled[ref.slot] = true;
    });
    out.yard = yardAfter; out.bones = bonesAfter;
    const unscored = out.cards.filter(card => !card.scored);
    if (unscored.length && unscored.every(card => card.filled.every(Boolean))) unscored.forEach(card => { card.scored = true; });
    return appendRecord(state, out, event, filled.length, filled, emptied);
  }
  function endGame(state) {
    valid(state);
    const out = next(state);
    if (out.endedAt === null) out.endedAt = Math.max(Date.now(), out.startedAt);
    return out;
  }
  function resumeGame(state) { valid(state); const out = next(state); out.endedAt = null; return out; }
  function displayProbability(p) {
    const percent = p * 100;
    if (percent < 0.01) return '<0.01%';
    return percent.toFixed(percent < 1 ? 3 : 1).replace(/\.?0+$/, '') + '%';
  }
  function summarize(state) {
    valid(state);
    let highlight = null;
    state.records.forEach(record => {
      if (!['fill', 'bust', 'reward'].includes(record.kind) || !(record.probability > 0)) return;
      if (!highlight || record.probability < highlight.probability) highlight = record;
    });
    const summary = { recorded: state.records.length, busts: state.records.filter(e => e.kind === 'bust').length, filled: state.records.reduce((total, e) => total + (e.kind === 'bust' ? 0 : e.actualFilled), 0), scored: state.cards.filter(c => c.scored).length, highlight: highlight ? clone(highlight) : null, title: null, description: '本局还没有可比较概率的结算记录。', rarity: null, rarityLabel: null };
    if (!highlight) return summary;
    const p = highlight.probability;
    const tier = p <= 0.001 ? 0 : p <= 0.01 ? 1 : p <= 0.05 ? 2 : p <= 0.2 ? 3 : 4;
    summary.rarity = ['exceptional', 'rare', 'uncommon', 'notable', 'ordinary'][tier];
    summary.rarityLabel = ['极罕见', '很罕见', '少见', '偶尔出现', '常见'][tier];
    if (highlight.kind === 'bust') {
      summary.title = ['无妄之灾', '平地风波', '一波三折', '山重水复', '风雨寻常'][tier];
    } else if ((highlight.kind === 'reward' ? highlight.rewardBones : highlight.actualFilled) === 0) summary.title = '波澜不惊';
    else summary.title = ['凤毛麟角', '百里挑一', '妙手偶得', '不期而遇', '水到渠成'][tier];
    const result = highlight.kind === 'bust' ? '一次爆掉' : highlight.kind === 'reward' ? '埋入 ' + highlight.buriedFace + ' 点骰子，获得 ' + highlight.rewardBones + ' 根骨头' : highlight.bucket === '5+' ? '安全填入 5 颗以上（实际 ' + highlight.actualFilled + ' 颗）' : '安全填入 ' + highlight.actualFilled + ' 颗';
    summary.description = '本局最罕见的一次：' + result + '，当时方案概率为 ' + displayProbability(p) + '。';
    return summary;
  }
  function restore(json) {
    try {
      if (typeof json !== 'string' || json.length > 10000000) return null;
      const state = JSON.parse(json);
      valid(state);
      // Zero is an unavailable probability, never an infinitely rare achievement.
      state.records.forEach(record => { record.probability = probability(record.probability); });
      return clone(state);
    } catch (_) { return null; }
  }

  return Object.freeze({ newGame, clone, board, needs, addDog, removeDog, toggleSpot, scoreDogs, amend, bust, settle, endGame, resumeGame, summarize, restore });
}));
