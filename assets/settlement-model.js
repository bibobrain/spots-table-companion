/* Private integration helper. Pass the existing probability engine functions;
 * this module checks support and never recalculates or replaces event odds. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipSettlement = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const memo = new WeakMap();
  const total = values => values.reduce((a, b) => a + b, 0);
  const keyOf = (need, yard) => need.join(',') + '|' + yard;
  const same = (a, b) => a.every((v, i) => v === b[i]);
  const through = n => n < 0 ? 0n : (1n << BigInt(n + 1)) - 1n;
  const has = (bits, n) => (bits & (1n << BigInt(n))) !== 0n;

  function normalizedProbability(value) {
    if (!Number.isFinite(value) || value <= 0) return null;
    if (value > 1) return value <= 1 + 1e-10 ? 1 : null;
    return value;
  }

  function stagesFor(p, work) {
    const par = p.params, mode = p.mode;
    const ordinary = {normal:p.before.dice,fetch:8,guard:4,hunt:Math.min(12,2+par.paws),search:7,scavenge:4,track:3,trot:2,howl:1,dig:2,retrieve:2,dogpile:par.source==='none'?2:3,playdead:1};
    if (Object.hasOwn(ordinary, mode)) return [[ordinary[mode], ['fetch','guard','hunt','search','scavenge'].includes(mode) ? mode : 'normal']];
    if (mode === 'sprint') return [[work.cards.filter(c => !c.scored && c.filled.some(v => !v)).length, 'normal']];
    if (mode === 'walk') return [[2,'normal'], ...(par.walkExtra ? [[1,'normal']] : [])];
    if (mode === 'run') return [[3,'normal'], ...Array.from({length:par.rounds}, () => [1,'normal'])];
    if (mode === 'chase') return Array.from({length:par.rounds}, (_, i) => [i+1,'normal']);
    if (mode === 'bolt') return Array.from({length:par.boltRolls}, () => [1,'normal']);
    if (mode === 'rollover') return [...(par.buried ? [[par.buried,'normal']] : []), ...(par.rolloverExtra ? [[1,'normal']] : [])];
    return null;
  }

  function countsFor(p, work) {
    const counts = [0,0,0,0,0,0], seen = new Set();
    for (const ref of p.selected || []) {
      const card = work.cards.find(c => c.id === ref.dogId);
      const key = ref.dogId + ':' + ref.slot;
      if (!card || card.scored || !Number.isInteger(ref.slot) || ref.slot < 0 || ref.slot >= card.faces.length || card.filled[ref.slot] || seen.has(key)) return null;
      seen.add(key); counts[card.faces[ref.slot]-1]++;
    }
    return counts;
  }

  function analyze(p, work, engine) {
    const counts = countsFor(p, work);
    const invalid = reason => ({yards:[], compatibleYards:[], probabilityCompatible:false, verified:true, reason});
    if (!counts) return invalid('所选空位已变化，请重新选择。');
    if (!Number.isInteger(p.spent) || p.spent < 0 || p.spent > p.before.bones) return invalid('本次花费的骨头数量无效。');
    if (p.type === 'resource') return {yards:[p.before.yard],compatibleYards:[],probabilityCompatible:false,verified:true,reason:''};
    if (p.d && p.d.invalid) return invalid('当前方案没有有效概率，这次只记录结果。');

    const cacheKey = keyOf(engine.needs(work), p.baseYard) + '|' + counts.join(',') + '|' + p.spent + '|' + p.face + '|' + p.type;
    let cache = memo.get(p);
    if (!cache) { cache = new Map(); memo.set(p, cache); }
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const finish = result => { cache.set(cacheKey, result); return result; };
    const budget = p.before.bones;
    const mismatchText = '实际花骨或结算结果不符合当前重掷方案，这次记结果、不计稀有度。';

    if (p.reward) {
      const safe = Math.max(0, Math.min(6, 7-p.baseYard));
      const compatible = p.type === 'bust' ? p.spent === budget : (p.spent === 0 || safe < 6);
      if (p.type === 'bust') return finish({yards:[],compatibleYards:[],probabilityCompatible:compatible,verified:true,reason:compatible?'':mismatchText});
      const stock = p.params.supply < 0 ? Infinity : p.params.supply + p.spent;
      const gain = Math.min(p.face, stock);
      const rightBucket = p.type === '5+' ? gain >= 5 : gain === Number(p.type);
      const yards = Number.isInteger(p.face) && p.face >= 1 && p.face <= safe && rightBucket ? [p.baseYard+p.face] : [];
      return finish({yards,compatibleYards:compatible?yards:[],probabilityCompatible:compatible&&yards.length>0,verified:true,reason:compatible?'':mismatchText});
    }

    let need = engine.needs(work), baseYard = p.baseYard;
    if (p.mode === 'retrieve' && p.firstHit) {
      if (need[p.params.top-1] < 1 || (p.type !== 'bust' && counts[p.params.top-1] < 1)) return finish(invalid('请先选中取回骰子对应的空位。'));
      if (p.type !== 'bust') counts[p.params.top-1]--;
      need = need.slice(); need[p.params.top-1]--;
    }

    if (p.type === 'bust') {
      let compatible;
      if (p.mode === 'retrieve' && baseYard > 7) compatible = p.spent === 0;
      else if (p.mode === 'track' && budget > 0) {
        const support = engine.trackSupport?.(need, baseYard, budget);
        if (!support) return finish({yards:[],compatibleYards:[],probabilityCompatible:false,verified:false,reason:'这次未核实 Track 的重掷路径，保留结果、不计稀有度。'});
        compatible = support.bust.has(p.spent);
      } else compatible = p.spent === budget;
      return finish({yards:[],compatibleYards:[],probabilityCompatible:compatible,verified:true,reason:compatible?'':mismatchText});
    }

    const target = need.map((n,i) => n-counts[i]);
    if (target.some(n => n < 0)) return finish(invalid('所选点面超出了当前缺口。'));
    const stages = stagesFor(p, work);
    if (!stages || stages.some(([n]) => !Number.isInteger(n) || n < 1 || n > 12)) return finish(invalid('当前行动无法核对结算位置，请按实际牌面校正。'));
    const par = {...p.params, originalYard:p.before.yard};
    if (p.mode === 'guard' && par.threshold === 0) par.threshold = engine.autoGuard(need, baseYard, budget);
    const rawCache = new Map();
    function outcomes(n, mode, fromNeed, fromYard) {
      const rawKey = n + '|' + mode + '|' + keyOf(fromNeed, fromYard);
      if (rawCache.has(rawKey)) return rawCache.get(rawKey);
      const options = new Map(); let failure = false;
      for (const row of engine.hist(n)) {
        const result = engine.process(row.c, fromNeed, fromYard, mode, par);
        if (result.bust || result.hit === 0) failure = true;
        if (!result.bust) options.set(keyOf(result.need,result.yr), result);
      }
      const result = {options:[...options.values()],failure};
      rawCache.set(rawKey,result); return result;
    }

    if (p.mode === 'track') {
      const rows = outcomes(3,'normal',need,baseYard).options.filter(o => same(o.need,target));
      const yards = [...new Set(rows.map(o => o.yr))].sort((a,b) => a-b);
      if (budget === 0) return finish({yards,compatibleYards:yards,probabilityCompatible:true,verified:true,reason:''});
      const support = engine.trackSupport?.(need,baseYard,budget);
      if (!support) return finish({yards,compatibleYards:[],probabilityCompatible:false,verified:false,reason:'这次未核实 Track 的重掷路径，保留结果、不计稀有度。'});
      const compatibleYards = yards.filter(y => support.safe.has(counts.join(',')+'|'+y+'|'+p.spent));
      return finish({yards,compatibleYards,probabilityCompatible:compatibleYards.length>0,verified:true,reason:compatibleYards.length?'':mismatchText});
    }

    const yardMasks = new Map();
    function terminal(st) {
      if (same(st.need,target)) yardMasks.set(st.yr,(yardMasks.get(st.yr)||0n)|st.used);
    }
    let states = new Map([[keyOf(need,baseYard),{need,yr:baseYard,used:1n}]]);
    for (const [n,mode] of stages) {
      const next = new Map();
      for (const state of states.values()) {
        if (total(state.need) === 0) {
          if (p.type === 'unknown') terminal(state);
          continue;
        }
        const raw = outcomes(n,mode,state.need,state.yr);
        for (const out of raw.options) {
          if (out.need.some((v,i) => v < target[i])) continue;
          let used = state.used;
          if (used) {
            if (out.hit === 0) used = budget <= p.spent ? 1n << BigInt(budget) : 0n;
            else if (raw.failure) {
              let first = 0; while (first <= p.spent && !has(used,first)) first++;
              used = through(p.spent) ^ through(first-1);
            }
          }
          const key = keyOf(out.need,out.yr), existing = next.get(key);
          if (existing) existing.used |= used;
          else next.set(key,{need:out.need,yr:out.yr,used});
        }
      }
      states = next;
    }
    if (p.type !== 'unknown') for (const state of states.values()) terminal(state);
    const yards = [...yardMasks.keys()].sort((a,b) => a-b);
    const compatibleYards = yards.filter(y => has(yardMasks.get(y),p.spent));
    return finish({yards,compatibleYards,probabilityCompatible:compatibleYards.length>0,verified:true,reason:compatibleYards.length?'':mismatchText});
  }

  function matchesProbability(p, result) {
    if (p.type === 'resource') return false;
    if (p.type === 'bust' || p.reward) return result.probabilityCompatible;
    return result.compatibleYards.includes(p.yardAfter);
  }

  /* Called once after trackDist has chosen a mask at each cached state.
   * It walks those choices, without comparing or solving policies again.
   * policy key follows the existing trackDist: sorted.join('') + '|' + b. */
  function traceTrackPolicy(need, yard, budget, policy, hist, placement) {
    const safe = new Set(), bust = new Set(), visited = new Set(), draws = new Map();
    function draw(n) {
      if (draws.has(n)) return draws.get(n);
      let rows=[[]]; for(let i=0;i<n;i++)rows=rows.flatMap(a=>[1,2,3,4,5,6].map(v=>[...a,v]));
      draws.set(n,rows); return rows;
    }
    function visit(values, left) {
      const sorted=values.slice().sort((a,b)=>a-b),key=sorted.join('')+'|'+left;
      if (visited.has(key)) return; visited.add(key);
      if (!policy.has(key)) throw new Error('Track 策略缺少已计算状态。');
      const mask=policy.get(key);
      if (mask === 0) {
        const counts=[0,0,0,0,0,0];sorted.forEach(v=>counts[v-1]++);
        const out=placement(counts,need,yard),spent=budget-left;
        if (out.bust) bust.add(spent);
        else safe.add(need.map((v,i)=>v-out.need[i]).join(',')+'|'+out.yr+'|'+spent);
        return;
      }
      if (left <= 0) throw new Error('Track 策略在没有骨头时要求重掷。');
      const indices=[0,1,2].filter(i=>mask&(1<<i));
      for(const replacement of draw(indices.length)) {
        const next=sorted.slice();indices.forEach((index,i)=>{next[index]=replacement[i];});
        visit(next,left-1);
      }
    }
    for (const row of hist(3)) visit(row.c.flatMap((n,i)=>Array(n).fill(i+1)),budget);
    return {safe,bust};
  }

  return Object.freeze({analyze,matchesProbability,normalizedProbability,traceTrackPolicy});
}));
