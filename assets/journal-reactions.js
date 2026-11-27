(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipJournalReactions = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Original Chinese UI copy. These are reactions to a recorded move, not
  // quotations, a prediction of the next roll, or a judgement of the player.
  const LINES = {
    recorded: ['这手记下了，挺有戏！', '这一手，给它留个镜头！', '骰子落定，故事记上！'],
    fillZero: ['空着手，但没翻车！', '呼，没填上，倒也没爆！', '格子没动，先松口气！'],
    fillOne: ['有了！先占这一格！', '漂亮！这一格拿下！', '行啊，这格给你占住了！', '嘿，这一颗找着家了！'],
    fillMany: ['嚯，一把铺开了！', '哎哟，这手有点排面！', '骰子听话，尾巴翘起！', '这几格，填得真痛快！'],
    fillLots: ['一把塞进去这么多？！', '这一把，真让你摆开了！', '好家伙，这把够热闹！', '嚯，格子连着亮起来了！'],
    scored: ['整只收下！这才叫痛快！', '漂亮，牵走！', '收狗啦！尾巴可以翘了！'],
    scoredMany: ['不止一只？这手够排面！', '一把收好几只，漂亮！', '收狗都成批了，嚯！'],
    rareFill: ['这也能中？！有点东西！', '嚯，小门缝也给你挤进去了！', '这么窄的路，真让你走通了！'],
    veryRareFill: ['不是吧，这都给你掷中了？！', '嚯！这么偏的门也开了！', '这手够偏，骰子偏偏答应了！'],
    rareLots: ['这么难见，还一把填这么多？！', '嚯，这一大片来得够稀罕！', '这把真少见，场面也真大！'],
    veryRareLots: ['这么偏、这么多，还真成了？！', '这满把的热闹，还真难撞见！', '这么偏还填这么多，真成了？！'],
    rareScore: ['这么难碰，还把狗牵走了？！', '偏偏让你碰上，还整只收下！', '嚯，稀罕这一手，狗也收下了！'],
    rareZero: ['不是吧，偏偏就空着手？！', '这么偏的一手，格子还没动！', '骰子拐了个小弯，格子没轮上！'],
    highRiskFill: ['敢掷，还真给你接住了！', '这一脚悬，落地倒挺稳！', '悬着一口气，硬给你填上了！'],
    highRiskScore: ['悬着一口气，整只收下！', '胆子不小，狗还真牵走了！', '这手够悬，收狗够痛快！'],
    highRiskZero: ['险是避开了，格子没捞着！', '悬是悬，至少没翻！', '空着手下来了，也捏了把汗！'],
    bust: ['嘭！尾巴先放下来吧！', '后院一响，气势归零！', '好，这下后院清静了！', '哎哟！这声够响亮！'],
    rareBust: ['不是吧，这也能爆？！', '就这点缝，也能掉进去？！', '这么小的坑，偏偏踩中了！'],
    veryRareBust: ['这都能爆？骰子出来解释！', '好家伙，这个小坑也没躲过！', '这么窄的翻车位，都能停进去？！'],
    highRiskBust: ['胆子够大，动静也够大！', '这一把，勇气比运气多！', '气势拉满，后院也响了！'],
    reward: ['埋下这一颗，骨头另算账！', '这一手，先把骨头这笔记上！'],
    rewardGain: ['骨头到嘴，谁还装客气！', '骨头真到账！这手不白演！', '这一埋，还真叼回骨头了！'],
    rewardBig: ['一口这么多骨头？嚯！', '这把口粮，叼得够排面！', '骨头一把来，嘴角压不住！'],
    rewardZero: ['这回埋下了，骨头没领着！', '动静有了，口粮没到！', '演得挺像，骨头没到账！'],
    rareReward: ['这也能领到？！嘴角收一收！', '这么窄的门，骨头真叼出来了！', '嚯，这把口粮来得够稀罕！'],
    veryRareReward: ['这么偏的口粮，都给你叼到了？！', '不是吧，骨头从这条缝里来了？！', '这骨头，来得真够出其不意！'],
    rareRewardZero: ['偏偏领了个零？骰子你说句话！', '这么偏的一手，骨头还没来！'],
    highRiskReward: ['这一埋够悬，骨头真叼回来了！', '捏着一把汗，还真领到骨头了！', '敢埋，骨头也真给了！'],
    resource: ['骨头这笔，也得记上！', '这手的戏，都在骨头账上！'],
    resourceGain: ['骨头到账，底气也到账！', '小金库，厚起来了！', '这口粮，攒得漂亮！'],
    resourceZero: ['算盘响了，库存没动！', '忙活一圈，骨头没挪窝！', '哦，今天主打一个热闹！'],
    resourceLoss: ['骨头花出去，气势留着！', '小金库瘦了，嘴还挺硬！', '这一口，库存听见了！'],
    checkpoint: ['下一位毛茸茸的，请！', '新搭档，该你上场了！', '这幕记下，新狗接戏！']
  };

  const ACTIONS = {
    normal: {
      safe: ['骰子落定，表情可藏不住了！', '点数都摆这儿了，谁也别装没看见！'],
      bust: ['骰子一落地，后院先有意见了！', '这把骰子，响得很有主见！']
    },
    howl: {
      safe: ['一嗓子喊出去，排场先到位！', '嚎得这么响，后院都精神了！'],
      bust: ['嗓门没输，骰子先炸了！', '嚎一声，后院跟着响一声！']
    },
    rollover: {
      safe: ['翻个身，还真翻出点动静！', '这一滚，戏份拉满！'],
      bust: ['身是翻过来了，场面也翻了！', '翻身挺潇洒，落点挺响！'],
      cleared: ['翻完身，后院还腾出地方了！', '这一滚，后院也松了口气！']
    },
    dig: {
      safe: ['爪子一动，算盘也跟着响！', '土得刨，点数也得抠！'],
      bust: ['坑还没收拾好，后院先炸了！', '爪子忙了半天，后院给了声嘭！']
    },
    retrieve: {
      safe: ['先看一眼，再装作全凭运气！', '小抄拿在手，气势不能少！'],
      bust: ['都给看牌了，骰子还拆台！', '小抄拿到了，骰子没配合！']
    },
    track: {
      safe: ['这位客人，骰子也要挑款！', '眼光挺挑，骰子得合眼缘！'],
      bust: ['眼光这么挑，骰子还敢翻脸！', '骰子挺有脾气，说响就响！'],
      spent: ['骨头已付，骰子得重新表态！', '挑骰子这件事，骨头都掏出来了！']
    },
    trot: {
      safe: ['小跑两步，气势先安排上！', '步子不大，盘算倒不少！'],
      bust: ['跑得不远，动静倒不小！', '小跑跑到这声嘭，谁想得到！']
    },
    walk: {
      safe: ['说好散步，架势还挺认真！', '慢慢走，也要走出点排面！'],
      bust: ['散个步，把后院散炸了？！', '这路走着走着，响了！'],
      extra: ['说好散步，还惦记着多走一步！', '散步的路线，还安排了加时！'],
      stopped: ['走到这儿就收脚，挺会拿捏！', '步子收住了，尾巴没收住！']
    },
    fetch: {
      safe: ['八颗里挑同门，这口味真专一！', '这么多骰子，就认这一家！'],
      bust: ['同一种点数，惹出不小动静！', '挑得这么专一，后院还是响了！']
    },
    guard: {
      safe: ['门槛一摆，闲骰免进！', '先报门槛，骰子也得守规矩！'],
      bust: ['门槛设好了，后院还是炸了！', '守住了门口，没守住这声嘭！']
    },
    hunt: {
      safe: ['就留两位，架势还挺讲究！', '挑的是两颗，摆的是排面！'],
      bust: ['两颗也能闹这么大？！', '精挑细选，挑来一声嘭！']
    },
    scavenge: {
      safe: ['这一爪下去，眼光够挑！', '后院翻一翻，爪子不能闲！'],
      bust: ['捡来捡去，捡了个响的！', '留下来的，脾气还不小！']
    },
    search: {
      safe: ['今天就认八，别的先靠边！', '七颗里凑八，爪尖都在打算盘！'],
      bust: ['这声嘭，还挺会凑整！', '算的是八，响的是后院！']
    },
    bolt: {
      safe: ['油门挺响，刹车还得问爪印！', '一颗一颗往前闯，阵仗不小！'],
      bust: ['油门还热着，后院先响了！', '跑得够快，嘭得也够干脆！']
    },
    chase: {
      safe: ['追逐一开场，骰子都得排队！', '这股追劲，尾巴都快赶不上！'],
      bust: ['追得热闹，后院也热闹了！', '追逐的戏，后院一声收场！']
    },
    dogpile: {
      safe: ['凑到一块儿了，场面得撑住！', '叠叠乐一开场，谁都得挤一挤！'],
      bust: ['挤得这么热闹，后院真炸了！', '叠得挺欢，响得也齐整！'],
      oldDie: ['旧骰也来凑局，谁都想挤一挤！', '新骰旧骰同桌，场面够热闹！']
    },
    run: {
      safe: ['跑起来了，尾巴都快跟丢！', '奔跑这架势，气势先拉满！'],
      bust: ['脚底生风，后院生烟！', '跑得挺带劲，收得挺突然！']
    },
    sprint: {
      safe: ['未收下的狗各一颗，阵仗拉开！', '狗狗排开掷骰，后院都跟着紧张！'],
      bust: ['冲刺声没落，后院先响了！', '冲得够快，停得够突然！']
    },
    beg: {
      safe: ['眼神摆上桌，骨头请到位！', '算盘声藏在呜咽里！'],
      gain: ['眼巴巴一看，骨头真来了！', '这双眼睛，真能开仓！']
    },
    chew: {
      safe: ['嘴没闲着，算盘也没闲着！', '咀嚼得认真，家底算得更认真！'],
      gain: ['嚼一嚼，小金库鼓了！', '嘴还嚼着呢，库存已经动了！'],
      doubled: ['骨头翻着倍来，嘴可别咧太大！', '翻一倍再添一根，这嘴挺会算！'],
      zero: ['嚼得挺卖力，仓库没动静！', '嘴没停，库存倒挺沉得住气！']
    },
    gobble: {
      safe: ['一口下去，先把排场吃出来！', '这一嘴下去，骨头得排队！'],
      loss: ['吃得挺豪横，结账挺清醒！', '嘴先痛快了，账也跟上了！']
    },
    playdead: {
      safe: ['这一躺，场面倒挺足！', '往地上一躺，戏份先占上！'],
      bust: ['本来是装死，这回真得躺会儿！', '眼睛一闭，后院先响了！'],
      placed: ['装死归装死，格子照样占！', '这一躺，骰子还真有去处！'],
      gain: ['眼睛一闭，骨头一叼！', '装死装到领骨头，演技可以！'],
      zero: ['演得挺像，骨头没到账！', '眼睛闭得认真，口粮没领着！']
    },
    stay: {
      safe: ['坐姿摆好了，骨头另算账！', '不动归不动，账可得算明白！'],
      gain: ['一动不动，骨头自己进账！', '你倒是挺会坐着收租！'],
      zero: ['坐得挺稳，骨头还没来！', '没动！库存也很配合！']
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
