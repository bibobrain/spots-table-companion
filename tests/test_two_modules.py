import asyncio,json,pathlib,tempfile,subprocess,time,urllib.request,sys
import websockets
html=pathlib.Path(sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].isdigit() else str(pathlib.Path(__file__).resolve().parents[1]/'index.html')).resolve()
home=pathlib.Path(tempfile.mkdtemp(prefix='spots-2module-cdp-'))
width=int(sys.argv[2]) if len(sys.argv)>2 else (int(sys.argv[1]) if len(sys.argv)>1 and sys.argv[1].isdigit() else 390)
chrome=subprocess.Popen(['google-chrome','--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--disable-extensions','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+str(home),'--window-size='+str(width)+',940',html.as_uri()],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(120):
  if (home/'DevToolsActivePort').exists():break
  time.sleep(.1)
 port=int((home/'DevToolsActivePort').read_text().splitlines()[0])
 tab=next(t for t in json.load(urllib.request.urlopen(f'http://localhost:{port}/json')) if t['type']=='page')
 async def check():
  async with websockets.connect(tab['webSocketDebuggerUrl'],max_size=5_000_000,origin='http://localhost') as ws:
   i=0;errors=[]
   async def js(expr):
    nonlocal i
    i+=1; k=i
    await ws.send(json.dumps({'id':k,'method':'Runtime.evaluate','params':{'expression':expr,'returnByValue':True,'awaitPromise':True}}))
    while True:
     z=json.loads(await ws.recv())
     if z.get('id')==k:
      x=z.get('result',{})
      if x.get('exceptionDetails'):raise RuntimeError('JS '+str(x['exceptionDetails'])[:950])
      return x.get('result',{}).get('value')
     if z.get('method')=='Runtime.exceptionThrown':errors.append(z)
   # Real viewport emulation; Chrome headless window-size has a minimum layout width.
   i+=1;rid=i
   await ws.send(json.dumps({'id':rid,'method':'Emulation.setDeviceMetricsOverride','params':{'width':width,'height':940,'deviceScaleFactor':1,'mobile':True}}))
   while True:
    answer=json.loads(await ws.recv())
    if answer.get('id')==rid:break
   print('ACTUAL VIEWPORT', await js('window.innerWidth'))
   await js('document.readyState')
   initial=json.loads(await js("""JSON.stringify({gen:document.querySelector('#fill1').textContent,bust:document.querySelector('#bust').textContent,selectedSpots:document.querySelectorAll('.spot[aria-pressed=true]').length,selectedGroups:document.querySelectorAll('#trickGroups [aria-pressed=true]').length,generalEmpty:!document.querySelector('#generalEmpty').hidden,actionEmpty:!document.querySelector('#actionEmpty').hidden,cardsHidden:document.querySelector('#actionCards').hidden,detailHidden:document.querySelector('#actionDetail').hidden,dropdown:!!document.querySelector('#action'),modules:document.querySelectorAll('main>section').length,old:!!document.querySelector('#trainer'),catalog:!!document.querySelector('.ref'),overflow:document.documentElement.scrollWidth>innerWidth})"""))
   print('INITIAL',initial)
   assert initial['gen']==initial['bust']=='—' and initial['selectedSpots']==initial['selectedGroups']==0,initial
   assert initial['generalEmpty'] and initial['actionEmpty'] and initial['cardsHidden'] and initial['detailHidden'],initial
   assert initial['modules']==2 and not any(initial[k] for k in ('dropdown','old','catalog','overflow')),initial
   catalog=json.loads(await js("""JSON.stringify(['red','yellow','blue','purple','green'].map(id=>{const group=document.querySelector('#trickGroups [data-group='+id+']');group.click();return {id,label:group.textContent,cards:[...document.querySelectorAll('#actionCards [data-action]')].map(card=>({id:card.dataset.action,summary:card.querySelector('.card-summary').textContent})),cardsVisible:!document.querySelector('#actionCards').hidden,detailHidden:document.querySelector('#actionDetail').hidden};}))"""))
   assert [g['label'] for g in catalog]==['Fixed','Adjust','Filter','Chain','Bones'],catalog
   assert [len(g['cards']) for g in catalog]==[2,5,5,5,5],catalog
   assert all(g['cardsVisible'] and g['detailHidden'] and all(c['summary'] for c in g['cards']) for g in catalog),catalog
   modes=[c['id'] for g in catalog for c in g['cards']]
   assert len(modes)==len(set(modes))==22,modes
   # Initial state is intentionally empty. Set the original reference board explicitly.
   await js("document.querySelector('#dogs [data-d=\"0\"][data-f=\"0\"]').click()")
   async def go(mode):
    category={"howl":"red","rollover":"red","walk":"yellow","dig":"yellow","retrieve":"yellow","track":"yellow","trot":"yellow","fetch":"blue","guard":"blue","scavenge":"blue","search":"blue","hunt":"blue","run":"purple","chase":"purple","bolt":"purple","sprint":"purple","dogpile":"purple","beg":"green","chew":"green","gobble":"green","playdead":"green","stay":"green"}[mode]
    await js("(function(){let group=document.querySelector('#trickGroups [data-group="+category+"]');if(group.getAttribute('aria-pressed')!=='true')group.click();else if(!document.querySelector('#actionDetail').hidden)document.querySelector('#backToCards').click();document.querySelector('#actionCards [data-action="+mode+"]').click();})()")

   await go('howl')
   assert await js("!document.querySelector('#actionDetail').hidden && document.querySelector('#actionCards').hidden && document.activeElement.id==='detailName'")
   await js("document.querySelector('#backToCards').click()")
   assert await js("document.querySelector('#actionDetail').hidden && !document.querySelector('#actionCards').hidden && document.querySelectorAll('#actionCards [data-action]').length===2 && document.activeElement.dataset.action==='howl'")

   results=[]
   for mode in modes:
    await go(mode)
    v=json.loads(await js("""JSON.stringify({base:document.querySelector('#fill1').textContent,baseBust:document.querySelector('#bust').textContent,action:document.querySelector('#actionActiveName').textContent,rule:document.querySelector('#actionRule').textContent,steps:document.querySelectorAll('#ruleSteps li').length,option:document.querySelector('#actionSettings').hidden,prob:document.querySelector('#actionFill1').textContent,resource:document.querySelector('#actionResourceValue').textContent,resourceVisible:!document.querySelector('#actionResourceResult').hidden,overflow:document.documentElement.scrollWidth>innerWidth})"""))
    assert v['base']=='30.6%' and v['baseBust']=='41.7%',(mode,v)
    assert v['rule'] and v['steps'] in (0,3) and not v['overflow'],(mode,v)
    assert v['prob']!='—' or v['resourceVisible'] or mode in ('dogpile','rollover','retrieve'),(mode,v)
    results.append(mode)
   print('ALL MODES RULES',len(results))
   touch=json.loads(await js("JSON.stringify({spots:[...document.querySelectorAll('.spot')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})),mini:[...document.querySelectorAll('.tinybutton')].map(x=>x.getBoundingClientRect().height),chips:[...document.querySelectorAll('.group-chip')].map(x=>x.getBoundingClientRect().height),dogColumns:getComputedStyle(document.querySelector('#dogs')).gridTemplateColumns})"))
   print('TOUCH',touch['spots'][:1],touch['mini'],touch['chips'],touch['dogColumns'])
   sizes=json.loads(await js("JSON.stringify({yard:[...document.querySelectorAll('#yard button')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})),stepper:[...document.querySelectorAll('.stepper button')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height}))})"))
   assert all(x['w']>=44 and x['h']>=44 for x in sizes['yard']),('yard too small',width,sizes['yard'])
   assert all(x['w']>=44 and x['h']>=44 for x in sizes['stepper']),('stepper too small',width,sizes['stepper'])
   print('ALL_TAP_TARGETS',width,'yard',[(round(z['w']),round(z['h'])) for z in sizes['yard']],'stepper',[(round(z['w']),round(z['h'])) for z in sizes['stepper']])
   assert all(z['w']>=44 and z['h']>=44 for z in touch['spots']),touch
   assert all(x>=44 for x in touch['mini']+touch['chips']),touch

   # Guard threshold changes action probability, but not general result.
   await go('guard')
   first=await js("document.querySelector('#actionFill1').textContent")
   await js("(function(){let x=document.querySelector('#specialExtra select');x.value='6';x.dispatchEvent(new Event('change',{bubbles:true}));})()")
   changed=await js("document.querySelector('#actionFill1').textContent")
   print('GUARD PARAM',first,changed)
   assert first!=changed
   assert await js("document.querySelector('#fill1').textContent")=='30.6%'
   # Board changes update BOTH independent panels.
   await js("(function(){document.querySelector('#yard button[data-y=\"7\"]').click();})()")
   print('YARD7',await js("document.querySelector('#bust').textContent"),await js("document.querySelector('#actionBust').textContent"))
   await js("document.querySelector('#yard button[data-y=\"7\"]').click()")
   # Resource actions render own result.
   await go('chew');await js("document.querySelector('#bonesPlus').click()")
   num=await js("document.querySelector('#actionResourceValue').textContent")
   print('CHEW',num,'BASE',await js("document.querySelector('#fill1').textContent"))
   assert num=='3 根'
   assert await js("document.querySelector('#fill1').textContent")!='—'
   # Special action distribution / mass conservation.
   valid=resource=invalid=0;bad=[]
   for mode in modes:
    await go(mode)
    for bone in [0,2,10]:
     await js("(function(){for(let i=0;i<10;i++)document.querySelector('#bonesMinus').click();for(let i=0;i<"+str(bone)+";i++)document.querySelector('#bonesPlus').click()})()")
     x=json.loads(await js("""JSON.stringify({prob:[1,2,3,4].map(i=>document.querySelector('#actionFill'+i).textContent),zero:document.querySelector('#actionZeroNote').textContent,more:document.querySelector('#actionMoreNote').hidden?null:document.querySelector('#actionMoreNote').textContent,bust:document.querySelector('#actionBust').textContent,unknown:document.querySelector('#actionUnknownNote').hidden?null:document.querySelector('#actionUnknownNote').textContent,resource:!document.querySelector('#actionResourceResult').hidden})"""))
     if x['resource']:resource+=1;continue
     if x['bust']=='—':invalid+=1;continue
     def pct(t):return 0 if not t else float(t.strip().split()[-1].rstrip('%'))
     tot=sum(pct(t) for t in x['prob'])+sum(pct(x[k]) for k in ['zero','more','bust','unknown'])
     if abs(tot-100)>.36:bad.append((mode,bone,tot))
     else:valid+=1
   print('MASS',{'valid':valid,'resource':resource,'invalid':invalid,'bad':bad[:5]})
   assert not bad
   # Run and Chase retain their own valid ranges through the actual browse path.
   async def rounds(value):
    await js("(function(){let x=document.querySelector('#specialExtra [data-p=rounds]');x.value='"+str(value)+"';x.dispatchEvent(new Event('change',{bubbles:true}));})()")
   await go('run');await rounds(0);await go('chase')
   assert await js("document.querySelector('#specialExtra [data-p=rounds]').value")=='2'
   assert await js("document.querySelector('#actionBust').textContent")!='—'
   await go('run')
   assert await js("document.querySelector('#specialExtra [data-p=rounds]').value")=='0'
   await rounds(5);await go('chase')
   assert await js("document.querySelector('#specialExtra [data-p=rounds]').value")=='2'
   assert await js("document.querySelector('#actionBust').textContent")!='—'
   await go('bolt')
   assert await js("!!document.querySelector('#specialExtra [data-p=paws]')")
   await go('sprint')
   assert '只算当前一批' in await js("document.querySelector('#actionScope').textContent")
   await js("document.querySelector('#clearSpots').click()")
   assert await js("!document.querySelector('#generalEmpty').hidden && document.querySelector('#fillGrid').hidden && document.querySelector('#fill1').textContent==='—' && document.querySelector('#actionFill1').textContent==='—'")
   assert not errors,errors[:2]
   print('PASS',width,'errors',len(errors))
 asyncio.run(asyncio.wait_for(check(),timeout=110))
finally:
 chrome.terminate()
 try:chrome.wait(timeout=5)
 except:chrome.kill()
