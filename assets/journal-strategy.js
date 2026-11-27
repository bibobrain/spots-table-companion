(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipJournalStrategy = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // These bands describe the recorded plans, not a player's personality or
  // whether a particular move was optimal. Outcomes never vote on a style.
  const LOW_RISK = 0.2;
  const HIGH_RISK = 0.5;
  const ROUNDING_EPSILON = 1e-10;
  const UNKNOWN_EPSILON = 1e-9;
  const MASS_EPSILON = 1e-6;
  const MATCH_EPSILON = 1e-7;

  function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function probability(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) ||
        value < -ROUNDING_EPSILON || value > 1 + ROUNDING_EPSILON) return null;
    return Math.min(1, Math.max(0, value));
  }

  /**
   * Return a matched, complete plan's pre-action BUST probability, or null.
   *
   * A record's own probability describes its observed outcome, not its risk.
   * It must still be present: the settlement code deliberately clears that
   * field when the recorded placement/spending departs from the frozen plan.
   * A distribution with an unresolved new-card branch is not a complete risk.
   * Zero BUST risk is valid; callers must compare with null, not truthiness.
   */
  function riskOf(record) {
    if (!object(record) || !['fill', 'bust', 'reward'].includes(record.kind)) return null;
    const observed = probability(record.probability);
    if (observed === null || observed <= 0) return null;
    const snapshot = record.calculationSnapshot;
    const distribution = object(snapshot) && snapshot.distribution;
    if (!object(distribution) ||
        (distribution.invalid !== undefined && distribution.invalid !== false) ||
        distribution.resource != null || !Array.isArray(distribution.fills) ||
        distribution.fills.length === 0) return null;

    const bust = probability(distribution.bust);
    const unknown = distribution.unknown === undefined ? 0 : probability(distribution.unknown);
    if (bust === null || unknown === null || unknown > UNKNOWN_EPSILON) return null;

    const fills = [];
    let mass = bust + unknown;
    for (const value of distribution.fills) {
      const p = probability(value);
      if (p === null) return null;
      fills.push(p);
      mass += p;
    }
    if (Math.abs(mass - 1) > MASS_EPSILON) return null;

    let expected;
    if (record.kind === 'bust') expected = bust;
    else if (record.bucket === '5+') expected = fills.slice(5).reduce((sum, p) => sum + p, 0);
    else if (Number.isInteger(record.bucket) && record.bucket >= 0 && record.bucket <= 4) {
      expected = fills[record.bucket];
    } else return null;
    if (!(expected > 0) ||
        Math.abs(observed - expected) > MATCH_EPSILON * Math.max(observed, expected)) return null;
    return bust;
  }

  function percent(value) {
    if (value === 0) return '0%';
    if (value < 0.001) return '<0.1%';
    if (value === 1) return '100%';
    if (value > 0.999) return '>99.9%';
    return (value * 100).toFixed(1).replace(/\.0$/, '') + '%';
  }

  function lowRisk(value) { return value <= LOW_RISK + ROUNDING_EPSILON; }
  function highRisk(value) { return value >= HIGH_RISK - ROUNDING_EPSILON; }

  /**
   * Derive a journal card from the records currently present. There is no
   * persistent counter: undo, restore and omitted actions need no special path.
   * Stable keys: empty, steady, bold, varied, measured, resources, new-card,
   * unrated. A single comparable plan receives an explicitly scoped title.
   */
  function summarize(input) {
    const records = Array.isArray(input) ? input.filter(object) : [];
    const recordCount = records.length;
    const risks = records.map(riskOf).filter(value => value !== null);
    const knownRiskCount = risks.length;
    const resourceCount = records.filter(record => record.kind === 'resource').length;
    const newCardCount = records.filter(record => record.kind === 'unknown').length;
    const counts = { recordCount, knownRiskCount };
    const scope = recordCount + ' 笔已记录 · ' + knownRiskCount + ' 次方案可比';
    const card = (key, title, text, basis) => ({ key, title, text, basis, ...counts });

    if (recordCount === 0) {
      return card('empty', '还没出招', '记下一手，狗狗就有话说了！', '只评价已记录的操作');
    }
    if (knownRiskCount === 0) {
      if (resourceCount === recordCount) {
        return card('resources', recordCount === 1 ? '这一手，先管骨头' : '骨头管家',
          recordCount === 1 ? '这笔记的是骨头调度。家当先安排上，狗狗的口袋有戏！' :
            '记下来的都是骨头调度。这几手，口袋里的家当很有戏！',
          recordCount + ' 笔已记录 · 都是骨头操作');
      }
      if (newCardCount === recordCount) {
        return card('new-card', recordCount === 1 ? '这一手，新队友登场！' : '新队友登场！',
          '记录停在需要补新狗牌的节点。前半段先入册，下一幕留点悬念！',
          recordCount + ' 笔已记录 · 都是补新狗牌的节点');
      }
      return card('unrated', recordCount === 1 ? '这一手，故事先记下' : '有故事，先不贴标签',
        resourceCount > 0 ? '骨头操作和落点都记着呢。这些片段还看不清出手前的风险，精彩先收好！' :
          '落点有戏，出手前的风险还看不清。先把' + (recordCount === 1 ? '这一笔' : '这几笔') + '故事收好！',
        recordCount + ' 笔已记录 · 暂无可比的事前风险');
    }

    if (knownRiskCount === 1) {
      const risk = risks[0];
      const basis = scope + ' · 事前爆掉风险 ' + percent(risk);
      if (lowRisk(risk)) {
        return card('steady', '这一手，稳字当头',
          '看得清风险的这一手，走的是低风险路线。骰子还没停，稳字先站住了！', basis);
      }
      if (highRisk(risk)) {
        return card('bold', '这一手，够敢！',
          '看得清风险的这一手，爆掉的可能至少占一半。悬念直接拉满！', basis);
      }
      return card('measured', '这一手，带点悬念',
        '看得清风险的这一手，处在中间区间。狗狗已经竖起耳朵等骰子了！', basis);
    }

    const lowCount = risks.filter(lowRisk).length;
    const highCount = risks.filter(highRisk).length;
    if (lowCount * 3 >= knownRiskCount * 2) {
      return card('steady', '稳扎稳打派',
        '能比较的这几手，多数走低风险路线。出手的路数里，稳字写得挺大！',
        scope + ' · ' + lowCount + ' 次事前爆掉风险 ≤20%');
    }
    if (highCount * 3 >= knownRiskCount * 2) {
      return card('bold', '悬崖边遛狗',
        '能比较的这几手，多数是高风险方案。骰子还没停，悬念就先拉满了！',
        scope + ' · ' + highCount + ' 次事前爆掉风险 ≥50%');
    }
    if (lowCount > 0 && highCount > 0) {
      return card('varied', '一脚刹车，一脚油门',
        '低风险和高风险的方案都留下过记录。这几手有收有放，路数不只一种！',
        scope + ' · 低风险 ' + lowCount + ' 次，高风险 ' + highCount + ' 次');
    }
    return card('measured', '带着悬念走',
      '这些方案没有明显集中到低风险或高风险一边。带点悬念，路数还留着弹性。',
      scope + ' · 事前爆掉风险 ' + percent(risks.reduce((a, b) => Math.min(a, b))) + '—' +
        percent(risks.reduce((a, b) => Math.max(a, b))));
  }

  return Object.freeze({ riskOf, summarize });
}));
