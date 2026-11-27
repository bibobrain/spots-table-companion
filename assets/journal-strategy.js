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
      return card('empty', '尚未落笔', '记下一手，再请狗开口。', '只评价已记录的操作');
    }
    if (knownRiskCount === 0) {
      if (resourceCount === recordCount) {
        return card('resources', recordCount === 1 ? '这一手，先管骨头' : '骨头管家',
          recordCount === 1 ? '账本归你，骨头归狗。' :
            '账本归你，骨头归狗。',
          recordCount + ' 笔已记录 · 都是骨头操作');
      }
      if (newCardCount === recordCount) {
        return card('new-card', recordCount === 1 ? '这一手，等新客落座' : '等新客落座',
          '记录停在补新狗牌这里，后半段暂且留白。',
          recordCount + ' 笔已记录 · 都是补新狗牌的节点');
      }
      return card('unrated', recordCount === 1 ? '这一手，路数待辨' : '路数待辨',
        resourceCount > 0 ? '操作都已记下，还缺当时方案的风险依据。' :
          '结果已记下。' + (recordCount === 1 ? '这一笔' : '这几笔') + '，还缺当时方案的风险依据。',
        recordCount + ' 笔已记录 · 暂无可比的事前风险');
    }

    if (knownRiskCount === 1) {
      const risk = risks[0];
      const basis = scope + ' · 事前爆掉风险 ' + percent(risk);
      if (lowRisk(risk)) {
        return card('steady', '这一手，走平路',
          '沿途还顾得上闻花。', basis);
      }
      if (highRisk(risk)) {
        return card('bold', '这一手，悬崖边遛狗',
          '狗倒像是来散步的。', basis);
      }
      return card('measured', '这一手，带点悬念',
        '狗倒先打了个哈欠。', basis);
    }

    const lowCount = risks.filter(lowRisk).length;
    const highCount = risks.filter(highRisk).length;
    if (lowCount * 3 >= knownRiskCount * 2) {
      return card('steady', '平路遛狗',
        '闻花也不必赶。',
        scope + ' · ' + lowCount + ' 次事前爆掉风险 ≤20%');
    }
    if (highCount * 3 >= knownRiskCount * 2) {
      return card('bold', '悬崖边遛狗',
        '狗倒像是来散步的。',
        scope + ' · ' + highCount + ' 次事前爆掉风险 ≥50%');
    }
    if (lowCount > 0 && highCount > 0) {
      return card('varied', '牵绳时松时紧',
        '狗暂且不问目的地。',
        scope + ' · 低风险 ' + lowCount + ' 次，高风险 ' + highCount + ' 次');
    }
    return card('measured', '带着悬念走',
      '狗倒先打了个哈欠。',
      scope + ' · 事前爆掉风险 ' + percent(risks.reduce((a, b) => Math.min(a, b))) + '—' +
        percent(risks.reduce((a, b) => Math.max(a, b))));
  }

  return Object.freeze({ riskOf, summarize });
}));
