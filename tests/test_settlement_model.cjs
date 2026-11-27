'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Game=require('../assets/game-model.js');
const SV=require('../assets/settlement-model.js');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
let core=html.slice(html.indexOf('function getNeed(){'),html.indexOf('function percent('))+html.slice(html.indexOf('function sumNeed(a)'),html.indexOf('function paintMetric('));
// Exercise the integrated policy tracing; no instrumented substitute solver.
assert.ok(core.includes('traceTrackPolicy'));
const trackSupports=new Map(),context={params:{},SV,PipSettlement:SV,trackSupports,trackSupportCache:trackSupports};vm.createContext(context);vm.runInContext(core,context);
const integratedTrackCache=vm.runInContext('trackSupportCache',context);
const engine={needs:Game.needs,hist:context.hist,process:context.process,autoGuard:context.autoGuard,trackSupport:(n,y,b)=>trackSupports.get(n.join(',')+'|'+y+'|'+b)||integratedTrackCache.get(n.join(',')+'|'+y+'|'+b)};
const baseParams={paws:0,threshold:0,fetch:0,top:1,rounds:2,walkExtra:1,rolloverExtra:0,buried:0,boltRolls:3,source:'none',src:1,supply:-1};
let number=0;
function check(name,run){run();number++;console.log('ok '+number+' - '+name);}
function game(cards,patch={}){let g=Game.newGame(1);cards.forEach(f=>{g=Game.addDog(g,f);});return Game.amend(g,patch);}
function pending(g,options={}){return {mode:'normal',type:'1',before:g,work:Game.board(g),params:{...baseParams,...options.params},baseYard:g.yard,firstHit:0,reward:false,spent:0,selected:[],d:{invalid:false},...options,params:{...baseParams,...options.params}};}
function ref(g,card,slot){return {dogId:g.cards[card].id,slot};}
function examine(p,work=p.work){return SV.analyze(p,work,engine);}
function prepTrack(p){context.trackDist(Game.needs(p.work),p.baseYard,p.before.bones);}

check('Sprint cannot invent Yard points when its only die was placed',()=>{
 const g=game([[1,2]]),p=pending(g,{mode:'sprint',selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p).yards,[0]);
});
check('a raw two-die endpoint checks the exact chosen faces',()=>{
 const g=game([[1,2]],{dice:2}),p=pending(g,{selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p).yards,[1,3,4,5,6]);
});
check('Walk sequential endpoint does not allow an invented empty Yard',()=>{
 const g=game([[1,2,3]]),p=pending(g,{mode:'walk',type:'2',selected:[ref(g,0,0),ref(g,0,1)]});
 assert.deepEqual(examine(p).yards,[1,2,4,5,6]);
});
check('unknown denotes completion before the next batch, not the final batch',()=>{
 const g=game([[1]]),p=pending(g,{mode:'walk',type:'unknown',selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p).yards,[1,2,3,4,5,6]);
 const ordinary=pending(g,{mode:'walk',type:'1',selected:[ref(g,0,0)]});
 assert.deepEqual(examine(ordinary).yards,[4,5,6,7]);
});
check('Chase final placements preserve the sum of the extra buried die',()=>{
 const g=game([[1,2]]),p=pending(g,{mode:'chase',type:'2',selected:[ref(g,0,0),ref(g,0,1)]});
 assert.deepEqual(examine(p).yards,[1,2,3,4,5,6]);
});
check('Roll Over replaces the old Yard rather than adding it twice',()=>{
 const g=game([[1,2]],{yard:5}),p=pending(g,{mode:'rollover',type:'2',baseYard:0,params:{buried:2},selected:[ref(g,0,0),ref(g,0,1)]});
 assert.deepEqual(examine(p).yards,[0]);
});
check('Retrieve safe bucket 1 can still require all rerolls after its fixed hit',()=>{
 const g=game([[1,2,3]],{bones:1}),p=pending(g,{mode:'retrieve',type:'1',firstHit:1,selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p).yards,[2,5,6,7]);assert.deepEqual(examine(p).compatibleYards,[]);
 p.spent=1;assert.deepEqual(examine(p).compatibleYards,[2,5,6,7]);
});
check('Retrieve immediate fixed-die BUST consumes no reroll bones',()=>{
 const g=game([[1]],{yard:7,bones:2}),p=pending(g,{mode:'retrieve',type:'bust',baseYard:9,params:{top:2}});
 assert.equal(examine(p).probabilityCompatible,true);p.spent=2;assert.equal(examine(p).probabilityCompatible,false);
});
check('Retrieve rolled BUST after its fixed hit does not require selecting lost slots',()=>{
 const g=game([[1,2]],{bones:1}),p=pending(g,{mode:'retrieve',type:'bust',firstHit:1,spent:1});
 assert.equal(examine(p).probabilityCompatible,true);
});
check('safe zero is mechanically recordable but has no policy odds when stopping early',()=>{
 const g=game([[1]],{dice:1,bones:1}),p=pending(g,{type:'0'});
 assert.deepEqual(examine(p).yards,[2,3,4,5,6]);assert.deepEqual(examine(p).compatibleYards,[]);
 p.spent=1;assert.deepEqual(examine(p).compatibleYards,[2,3,4,5,6]);
});
check('Howl BUST is checked against the same reroll policy as normal Roll',()=>{
 const g=game([[1]],{yard:7,bones:1}),p=pending(g,{mode:'howl',type:'bust'});
 assert.equal(examine(p).probabilityCompatible,false);p.spent=1;assert.equal(examine(p).probabilityCompatible,true);
});
check('unnecessary rerolls after an always-positive raw roll do not inherit plan odds',()=>{
 const g=game([[1,2,3,4],[5,6]],{dice:1,bones:1}),p=pending(g,{spent:1,selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p).yards,[0]);assert.deepEqual(examine(p).compatibleYards,[]);
});
check('Play Dead cannot spend a policy reroll when every burial is already safe',()=>{
 const g=game([[1]],{bones:1}),p=pending(g,{mode:'playdead',reward:true,spent:1,face:1});
 assert.deepEqual(examine(p).yards,[1]);assert.equal(examine(p).probabilityCompatible,false);
});
check('Play Dead can reroll an unsafe burial and then collect a safe face',()=>{
 const g=game([[1]],{yard:5,bones:1}),p=pending(g,{mode:'playdead',reward:true,spent:1,face:1});
 assert.deepEqual(examine(p).yards,[6]);assert.equal(examine(p).probabilityCompatible,true);
});
check('Track unavoidable BUST uses zero bones because every policy has the same value',()=>{
 const g=game([[1]],{yard:7,bones:1}),p=pending(g,{mode:'track',type:'bust'});prepTrack(p);
 assert.equal(examine(p).probabilityCompatible,true);p.spent=1;assert.equal(examine(p).probabilityCompatible,false);
});
check('Track optimal safe-positive stopping is validated, not merely BUST/zero',()=>{
 const g=game([[1,2,3,4],[5,6]],{bones:1}),p=pending(g,{mode:'track',type:'1',selected:[ref(g,0,0)],yardAfter:2});prepTrack(p);
 assert.deepEqual(examine(p).yards,[2]);assert.equal(SV.matchesProbability(p,examine(p)),false);
 p.spent=1;assert.equal(SV.matchesProbability(p,examine(p)),true);
});
check('Dogpile makes the taken old dog die a real vacancy before settlement',()=>{
 let g=game([[1]]);g=Game.toggleSpot(g,g.cards[0].id,0);const work=Game.board(g);work.cards[0].filled[0]=false;
 const p=pending(g,{mode:'dogpile',params:{source:'dog',src:1},selected:[ref(g,0,0)]});
 assert.deepEqual(examine(p,work).yards,[2,3,4,5,6,7]);
});
check('5+ checks actual six placements while leaving the frozen aggregate probability unchanged',()=>{
 const g=game([[1,1,1,1],[1,1]],{dice:6});
 const selected=g.cards.flatMap(c=>c.faces.map((_,slot)=>({dogId:c.id,slot})));
 const p=pending(g,{type:'5+',selected,probability:31/46656});
 assert.deepEqual(examine(p).yards,[0]);assert.equal(p.probability,31/46656);assert.equal(p.selected.length,6);
});
check('an empty Roll Over makes no fictional roll and cannot spend a bone',()=>{
 const g=game([[1]],{bones:1}),p=pending(g,{mode:'rollover',type:'0',baseYard:0,params:{buried:0,rolloverExtra:0}});
 assert.deepEqual(examine(p).compatibleYards,[0]);p.spent=1;assert.deepEqual(examine(p).yards,[0]);assert.deepEqual(examine(p).compatibleYards,[]);
});
check('micro floating-point overshoot is accepted without hiding genuinely invalid probabilities',()=>{
 assert.equal(SV.normalizedProbability(1.0000000000000029),1);assert.equal(SV.normalizedProbability(1.1),null);assert.equal(SV.normalizedProbability(0),null);assert.equal(SV.normalizedProbability(.25),.25);
});
function setCoreBoard(g,params) {
 context.table=g;context.yard=g.yard;context.dice=g.dice;context.bones=g.bones;context.dogs=g.cards.length;
 context.spots=g.cards.map(c=>{const a=[0,0,0,0,0,0];if(!c.scored)c.faces.forEach((f,i)=>{if(!c.filled[i])a[f-1]++;});return a;});
 context.params={...baseParams,...params};
}
check('Dogpile can reopen a complete unscored template by taking its actual die',()=>{
 let g=game([[1]]);g=Game.toggleSpot(g,g.cards[0].id,0);setCoreBoard(g,{source:'dog',src:1});
 assert.equal(context.compute('dogpile').invalid,false);
});
check('Dogpile cannot claim there are no old dice when a dog slot is occupied',()=>{
 let g=game([[1,2]]);g=Game.toggleSpot(g,g.cards[0].id,0);setCoreBoard(g,{source:'none'});
 assert.equal(context.compute('dogpile').invalid,true);
});
check('twelve sequential rolls with repeated faces keep distinct multi-digit states',()=>{
 const d=context.sequenceDist(Array.from({length:12},()=>[1,'normal',{}]),[11,10,0,0,0,0],0,0);
 assert.ok(Math.abs(d.fills[12]-4082/6**12)<1e-15);
});
console.log(number+' settlement integration checks passed');
