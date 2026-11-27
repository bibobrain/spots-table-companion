(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipJournalReactions = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Original Chinese UI copy. These are reactions to a recorded move, not
  // quotations, a prediction of the next roll, or a judgement of the player.
  const LINES = {
    recorded: ['记下了。字请写小些。', '这一笔，爪印为证。', '这段，容我饭后再看。'],
    fillZero: ['散步，确实只散了步。', '空位没少。先喝口水。', '没添斑点，算是路过。'],
    fillOne: ['这一格，算是认门了。', '添了一点。请容我端详。', '这一颗，有了落脚处。', '先落一爪，神色照旧。'],
    fillMany: ['这几格，恰好合身。', '几处都有了着落，容我坐端正些。', '添了几笔，倒像原本就有。', '斑点添了，得侧身给您看看。'],
    fillLots: ['斑点添了许多。镜子借我一下。', '这一片，得转个身才看得全。', '这么多颗，落座倒很安静。', '空位少了许多，坐姿还得稳重。'],
    scored: ['这只，可以牵回家了。', '这一身斑点，算是齐了。', '牵好一只，容我慢慢走。'],
    scoredMany: ['几只一起回家，门得开宽些。', '牵绳添了几根，步子还要从容。', '这回，得数着鼻尖进门。'],
    rareFill: ['难得的来客，正好有座。', '偏巧这一点，落得很妥帖。', '平日少走的门，今天开着。'],
    veryRareFill: ['这么偏的门，钥匙竟也合适。', '少见到这份上，得认一认脚印。', '稀客归稀客，斑点倒合身。'],
    rareLots: ['稀客上门，还带了一队。', '少见的斑点，偏偏添了一片。', '难得登门，便占了许多座。'],
    veryRareLots: ['这等稀客，竟还成群结队。', '冷门开了，门口还排着队。', '罕见的一趟，斑点得慢慢数。'],
    rareScore: ['难得的巧合，连斑点都凑齐了。', '稀客登门，顺手替狗系好了绳。', '这一趟少见，回家时倒牵着狗。'],
    rareZero: ['这么少见的一趟，手仍空着。', '稀客登门，没带礼物。', '门倒开得巧，格子却没动。'],
    highRiskFill: ['悬崖边遛狗，脚下倒有落点。', '这一步，爪尖找着了位置。', '路窄了些，斑点还是添了。'],
    highRiskScore: ['狗牵回来了，来路容后再谈。', '斑点齐了，牵绳仍握得很紧。', '悬崖边这一趟，倒牵回了狗。'],
    highRiskZero: ['悬崖边走了一圈，空手回来。', '格子没添，脚下还算站住了。', '空着手，先离栏杆远一点。'],
    bust: ['后院安静了。容我坐一会儿。', '动静过去了，反省留到饭后。', '这一声，够邻居抬头了。', '后院空了，神色还得端正。'],
    rareBust: ['院子这么大，偏踩中那块松土。', '这么窄的缝，漏进来一声响。', '偏是这块小石子，绊了一下。'],
    veryRareBust: ['罕见是罕见，偏有我的爪印。', '针眼大的缺口，也漏出这一声。', '这么细的一道缝，尾巴倒没绕过去。'],
    highRiskBust: ['胆子够大，动静也够大。', '风度留在了起跳时。', '悬崖边这一趟，回声倒很足。'],
    reward: ['埋下的是骰子，惦记的是骨头。', '这一笔，请用骨头来算。'],
    rewardGain: ['骨头收到了，谢意稍后补上。', '这一份骨头，我亲自保管。', '嘴边有骨头，话就不多了。'],
    rewardBig: ['这一捧骨头，得两只爪子接。', '收下这么多，谢词倒很短。', '这份骨头，搂着睡正合适。'],
    rewardZero: ['埋下去了，骨头没来。', '骨头没领着，先不急着起身。', '这回没领骨头，谢词也省了。'],
    rareReward: ['骨头走了条少有人走的路。', '难得来这一份，先收在爪下。', '稀客上门，原来是送骨头的。'],
    veryRareReward: ['门缝这么细，骨头倒送到了。', '冷门里，倒藏着一份骨头。', '这份巧合，请直接放我碗里。'],
    rareRewardZero: ['难得遇上，偏没带骨头。', '稀客到了，骨头没到。'],
    highRiskReward: ['扶着栏杆，骨头先收下。', '这份骨头，爪子探得远了些。', '骨头拿到了，扶手还得借一下。'],
    resource: ['骨头的事，请容我亲自过目。', '这笔骨头账，我闻一闻再说。'],
    resourceGain: ['骨头添了些，枕边得挪个位置。', '攒了些骨头，午睡不妨长一点。', '这点余粮，请别替我惦记。'],
    resourceZero: ['数目没变，倒数得很仔细。', '骨头还是这些，够我再看一眼。', '账翻了一页，存粮没添。'],
    resourceLoss: ['骨头花出去了，碗还舍不得挪。', '库存薄了些，牙印留作凭据。', '少了些骨头，午饭的事先别提。'],
    checkpoint: ['下一位，请先让我闻闻。', '新面孔，容我认一认斑点。', '先留个座，等下一只狗。']
  };

  const ACTIONS = {
    normal: {
      safe: ['骰子落定，容我摆好神色。', '点数在这儿，我坐得很端正。'],
      bust: ['骰子落地，体面暂时搁一旁。', '这阵安静，来得有些突然。']
    },
    howl: {
      safe: ['只叫一声。回声不算。', '叫完了，容我喝口水。'],
      bust: ['嗓门停了，后院接着说。', '唱到这里，得清清嗓子。']
    },
    rollover: {
      safe: ['翻过身来，仍是一只体面的狗。', '这一面，暂且朝上。'],
      bust: ['这一翻，后院也翻了篇。', '身是翻过来了，体面留在那边。'],
      cleared: ['翻过身，后院也松快了些。', '这一滚，院子倒轻了些。']
    },
    dig: {
      safe: ['土里的事，容我低头处理。', '爪子沾点土，不必写进履历。'],
      bust: ['这回，土也没替我保密。', '爪子洗干净，饭后再谈。']
    },
    retrieve: {
      safe: ['这一颗，来时带着门牌。', '先认个门，后面的事另说。'],
      bust: ['门牌认得，动静倒没料到。', '门牌还在，先别问路。']
    },
    track: {
      safe: ['这点气味，容我再辨一辨。', '挑选时，鼻子比尾巴认真。'],
      bust: ['鼻子很认真，神色得重来。', '气味没留住，爪印倒留下了。'],
      spent: ['骨头已付，神色仍得从容。', '这一嗅，是付过骨头的。']
    },
    trot: {
      safe: ['小跑两步，耳朵不必太认真。', '步子略快，仍算出门散心。'],
      bust: ['步子不大，回声倒远。', '这一小跑，体面慢了半步。']
    },
    walk: {
      safe: ['回家的路，容我再绕一绕。', '散步嘛，路过也算数。'],
      bust: ['散步散出了回声。', '回家的话，忽然听进去了。'],
      extra: ['这一趟，原就打算多走一步。', '散步的打算里，回家稍晚一步。'],
      stopped: ['这一趟，只打算走到这里。', '回家的路线，没另添一步。']
    },
    fetch: {
      safe: ['八颗里，只闻一种气味。', '点数认准一种，其余请自便。'],
      bust: ['只认一种点数，回声倒不少。', '叼回的这一份，不便给主人看。']
    },
    guard: {
      safe: ['门槛在这儿，请先量一量。', '点数再大，门口也不让步。'],
      bust: ['门槛有规矩，后院有回声。', '门还守着，脸先转过去。']
    },
    hunt: {
      safe: ['只留两位，请各自坐好。', '名额只有两个，容我闻仔细些。'],
      bust: ['只留两位，后院已很热闹。', '精挑的两位，请先送出门。']
    },
    scavenge: {
      safe: ['地上的东西，容我先闻一闻。', '捡不捡，鼻子自有主张。'],
      bust: ['这一声，原来藏在脚边。', '这次低头，头还不太想抬。']
    },
    search: {
      safe: ['七颗骰子，偏惦记着八。', '总数不是八，就算路过。'],
      bust: ['凑的是八，惊动的是后院。', '八倒凑齐了，后院装不下。']
    },
    bolt: {
      safe: ['一步一颗，耳朵先往后放。', '跑归跑，停下还得问爪子。'],
      bust: ['跑得很快，回声也没落下。', '停下这件事，后院替我决定了。']
    },
    chase: {
      safe: ['前面有动静，尾巴便坐不住。', '追上要说什么，容我路上再想。'],
      bust: ['这一追，后院也跟着出声。', '追逐到此，先把耳朵放下来。']
    },
    dogpile: {
      safe: ['挤一挤，爪子请各自收好。', '挤在一处，也请认准自己的尾巴。'],
      bust: ['挤得太近，体面没处落脚。', '爪子请各自领回，容我静一静。'],
      oldDie: ['旧骰也来了，得替它挪个位置。', '新骰挨着旧骰，先闻一闻再说。']
    },
    run: {
      safe: ['先跑起来，回家稍后商量。', '耳朵向后，心思还在前面。'],
      bust: ['风从耳边过，动静留在院里。', '步子收住了，表情还没赶上。']
    },
    sprint: {
      safe: ['斑点尚未齐，起跑倒很齐。', '各缺各的斑点，谁也不肯慢些。'],
      bust: ['起跑很齐，回声也齐。', '跑得齐，停得也齐。']
    },
    beg: {
      safe: ['碗在这里，我再坐近一点。', '眼神先递过去，话可以省了。'],
      gain: ['碗边多了骨头，眼神可以收了。', '骨头给了，坐姿还得留一会儿。']
    },
    chew: {
      safe: ['嚼慢些，骨头的事要仔细。', '嘴上忙着，眼睛还看着碗。'],
      gain: ['骨头添了些，咀嚼得更从容了。', '嘴还在忙，爪边又添了骨头。'],
      doubled: ['翻倍之外，那一根也请留下。', '翻了一倍，还添一根。请放近些。'],
      zero: ['嚼得仔细，骨头数目没变。', '嘴没闲着，骨头还是那么多。']
    },
    gobble: {
      safe: ['先容我咽下去，再谈数目。', '这一口，礼节稍后补上。'],
      loss: ['骨头少了，嘴边先擦干净。', '这一口，吃到了账本上。']
    },
    playdead: {
      safe: ['眼睛闭着，耳朵仍在值班。', '先躺着，起身的理由慢慢找。'],
      bust: ['眼睛闭得住，动静盖不住。', '这会儿，倒不必急着起身。'],
      placed: ['躺归躺，斑点照样有了着落。', '身子没起，骰子已有了位置。'],
      gain: ['骨头递来，眼睛可以睁了。', '骨头收下，躺姿暂且保留。'],
      zero: ['眼睛闭着，骨头却没领着。', '骨头没来，起身的事再议。']
    },
    stay: {
      safe: ['我坐着，您不必跟着等。', '坐稳了，心思还在骨头那边。'],
      gain: ['坐姿不变，骨头添了些。', '骨头收到了，起身就免了。'],
      zero: ['坐得很稳，骨头数目也很稳。', '我没动，骨头也没多。']
    }
  };

  function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function integer(value, min, max) {
    return Number.isInteger(value) && value >= min && value <= max;
  }

  function probabilityValue(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= -1e-10 && value <= 1 + 1e-10
      ? Math.min(1, Math.max(0, value)) : null;
  }

  // A known result can have exact odds even when another branch stops at a
  // new-dog checkpoint. That unknown branch blocks full-plan risk analysis,
  // but need not erase the rarity of this matched, already settled result.
  function observedProbability(record) {
    if (!['fill', 'bust', 'reward'].includes(record.kind)) return null;
    const observed = probabilityValue(record.probability);
    if (!(observed > 0)) return null;
    const snapshot = record.calculationSnapshot;
    const distribution = object(snapshot) && snapshot.distribution;
    if (!object(distribution) ||
        (distribution.invalid !== undefined && distribution.invalid !== false) ||
        distribution.resource != null || !Array.isArray(distribution.fills) || !distribution.fills.length) return null;
    const bust = probabilityValue(distribution.bust);
    const unknown = distribution.unknown === undefined ? 0 : probabilityValue(distribution.unknown);
    if (bust === null || unknown === null) return null;
    const fills = distribution.fills.map(probabilityValue);
    if (fills.some(p => p === null)) return null;
    if (Math.abs(fills.reduce((sum, p) => sum + p, bust + unknown) - 1) > 1e-6) return null;
    let expected;
    if (record.kind === 'bust') expected = bust;
    else if (record.bucket === '5+') expected = fills.slice(5).reduce((sum, p) => sum + p, 0);
    else if (Number.isInteger(record.bucket) && record.bucket >= 0 && record.bucket <= 4) expected = fills[record.bucket];
    else return null;
    return expected > 0 && Math.abs(observed - expected) <= 1e-7 * Math.max(observed, expected)
      ? observed : null;
  }

  // Keep a saved event's wording stable across reopening, undo/restore and
  // list reordering. Pool selection never depends on the other records.
  function pick(lines, record, namespace) {
    const identity = typeof record.id === 'string' || typeof record.id === 'number'
      ? String(record.id)
      : String(record.createdAt || '') + ':' + String(record.sequence || '') + ':' + String(record.kind || '');
    const seed = identity + ':' + namespace;
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
    return lines[(hash >>> 0) % lines.length];
  }

  function boneDelta(record) {
    const before = object(record.beforeBoard) && record.beforeBoard.bones;
    const after = object(record.afterBoard) && record.afterBoard.bones;
    if (integer(before, 0, 99) && integer(after, 0, 99)) return after - before;
    return integer(record.rewardBones, -99, 99) ? record.rewardBones : null;
  }

  function newlyScored(record) {
    const before = object(record.beforeBoard) && record.beforeBoard.cards;
    const after = object(record.afterBoard) && record.afterBoard.cards;
    if (!Array.isArray(before) || !Array.isArray(after)) return 0;
    const old = new Map(before.filter(object).map(card => [card.id, card]));
    return after.filter(card => object(card) && typeof card.id === 'string' &&
      card.scored === true && old.has(card.id) && old.get(card.id).scored === false).length;
  }

  function headlineKey(record, facts) {
    const { qualified, rare, veryRare, highRisk, count, gained, delta } = facts;
    if (record.kind === 'unknown') return 'checkpoint';
    if (record.kind === 'resource') return delta === null ? 'resource' :
      delta > 0 ? 'resourceGain' : delta < 0 ? 'resourceLoss' : 'resourceZero';
    if (record.kind === 'bust') return veryRare ? 'veryRareBust' : rare ? 'rareBust' :
      highRisk ? 'highRiskBust' : 'bust';
    if (record.kind === 'reward') {
      if (gained === null) return 'reward';
      if (gained === 0) return rare ? 'rareRewardZero' : 'rewardZero';
      return veryRare ? 'veryRareReward' : rare ? 'rareReward' : highRisk ? 'highRiskReward' :
        gained >= 5 ? 'rewardBig' : 'rewardGain';
    }
    if (record.kind !== 'fill' || count === null) return 'recorded';
    if (count === 0) return rare ? 'rareZero' : highRisk ? 'highRiskZero' : 'fillZero';
    const scored = newlyScored(record);
    if (scored) return rare ? 'rareScore' : highRisk ? 'highRiskScore' : scored > 1 ? 'scoredMany' : 'scored';
    if (rare) return count >= 5 ? (veryRare ? 'veryRareLots' : 'rareLots') :
      (veryRare ? 'veryRareFill' : 'rareFill');
    if (qualified && highRisk) return 'highRiskFill';
    return count >= 5 ? 'fillLots' : count === 1 ? 'fillOne' : 'fillMany';
  }

  function actionKey(record, facts, mode, params) {
    if (record.kind === 'bust') return 'bust';
    const { qualified, count, gained, delta } = facts;
    if (mode === 'playdead') {
      if (record.kind === 'reward' && gained !== null) return gained > 0 ? 'gain' : 'zero';
      if (record.kind === 'fill' && count > 0) return 'placed';
    }
    if (record.kind === 'resource') {
      if (mode === 'gobble' && delta !== null && delta < 0) return 'loss';
      if (mode === 'chew' && delta > 0) {
        const before = object(record.beforeBoard) && record.beforeBoard.bones;
        const after = object(record.afterBoard) && record.afterBoard.bones;
        if (integer(before, 0, 99) && integer(after, 0, 99) && after === 2 * before + 1) return 'doubled';
      }
      if (delta !== null && delta > 0) return 'gain';
      if (delta === 0) return 'zero';
    }
    if (mode === 'track' && integer(record.bonesSpent, 1, 99)) return 'spent';
    if (mode === 'rollover') {
      const before = object(record.beforeBoard) && record.beforeBoard.yard;
      const after = object(record.afterBoard) && record.afterBoard.yard;
      if (integer(before, 1, 7) && integer(after, 0, 7) && after < before) return 'cleared';
    }
    // The frozen plan may include a step the real move never reached. Only a
    // matched safe settlement can use its optional-step wording, and even the
    // extra-step lines describe the plan, not an invented execution trace.
    if (mode === 'walk' && qualified) {
      if (params.walkExtra === 1) return 'extra';
      if (params.walkExtra === 0) return 'stopped';
    }
    if (mode === 'dogpile' && qualified && ['dog', 'yard'].includes(params.source)) return 'oldDie';
    return 'safe';
  }

  /**
   * Return original plain-text reactions to one saved record.
   * options.risk must be the number|null returned by PipJournalStrategy.riskOf.
   * Rarity independently checks the observed outcome against its frozen bucket;
   * risk is the complete plan's pre-action BUST probability. Neither is inferred
   * from the other. Missing or unmatched odds get outcome-only copy. A genuine
   * zero risk remains valid, and a known result beside an unknown branch can
   * still be rare without being described as an adventurous decision.
   */
  function forRecord(input, options) {
    const record = object(input) ? input : {};
    const snapshot = object(record.calculationSnapshot) ? record.calculationSnapshot : {};
    const params = object(snapshot.params) ? snapshot.params : {};
    const risk = object(options) ? options.risk : null;
    const probability = observedProbability(record);
    const qualified = probability !== null &&
      typeof risk === 'number' && Number.isFinite(risk) && risk >= 0 && risk <= 1;
    const facts = {
      qualified,
      rare: probability !== null && probability <= 0.05,
      veryRare: probability !== null && probability <= 0.01,
      highRisk: qualified && risk >= 0.5,
      count: integer(record.actualFilled, 0, 24) ? record.actualFilled : null,
      gained: integer(record.rewardBones, 0, 99) ? record.rewardBones : null,
      delta: boneDelta(record)
    };
    const key = headlineKey(record, facts);
    const mode = typeof snapshot.mode === 'string' && Object.prototype.hasOwnProperty.call(ACTIONS, snapshot.mode)
      ? snapshot.mode : null;
    let actionLine = '';
    if (mode) {
      const action = ACTIONS[mode];
      const requested = actionKey(record, facts, mode, params);
      const selected = Object.prototype.hasOwnProperty.call(action, requested) ? requested : 'safe';
      actionLine = pick(action[selected], record, 'action:' + mode + ':' + selected);
    }
    return { headline: pick(LINES[key], record, 'headline:' + key), actionLine };
  }

  return Object.freeze({ forRecord });
}));
