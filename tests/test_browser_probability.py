from math import factorial, isclose
from itertools import combinations
import json, urllib.request, pathlib, subprocess, tempfile, time, asyncio
import websockets
ROOT=pathlib.Path(__file__).resolve().parents[1]
def compositions(n,k=6):
 if k==1:yield [n];return
 for i in range(n+1):
  for rest in compositions(n-i,k-1):yield [i]+rest
def place(c,need,yard):
 used=[min(c[i],need[i]) for i in range(6)]
 filled=sum(used);buried=sum((c[i]-used[i])*(i+1) for i in range(6));return (yard+buried<=7,filled,yard+buried)
def obj(x):return (int(x[0]),int(x[0] and x[1]>0),x[1] if x[0] else 0,-x[2])
def choosebest(options):return max(options,key=obj)
def canonical(n,need,yard,mode='normal',threshold=3):
 out={i:0.0 for i in range(19)};bust=0.
 for c in compositions(n):
  weight=factorial(n)/(6**n)
  for k in c:weight/=factorial(k)
  if mode=='normal':result=place(c,need,yard)
  elif mode=='guard':result=place([c[i] if i<threshold else 0 for i in range(6)],need,yard)
  elif mode=='fetch':result=choosebest([place([c[i] if i==face else 0 for i in range(6)],need,yard) for face in range(6) if c[face]])
  else:raise Exception(mode)
  if result[0]:out[result[1]]+=weight
  else:bust+=weight
 return [out[k]*100 for k in range(1,5)],bust*100
async def test():
 home=pathlib.Path(tempfile.mkdtemp(prefix='spots-ref-'))
 chrome=subprocess.Popen(['google-chrome','--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+str(home), '--window-size=390,844',(ROOT/'index.html').as_uri()],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  for _ in range(100):
   if (home/'DevToolsActivePort').exists():break
   await asyncio.sleep(.1)
  port=int((home/'DevToolsActivePort').read_text().splitlines()[0])
  target=next(t for t in json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json')) if t['type']=='page')
  async with websockets.connect(target['webSocketDebuggerUrl'],origin='http://localhost') as ws:
   i=0
   async def j(src):
    nonlocal i
    i+=1;k=i;await ws.send(json.dumps({'id':k,'method':'Runtime.evaluate','params':{'expression':src,'returnByValue':True,'awaitPromise':True}}))
    while True:
     m=json.loads(await ws.recv())
     if m.get('id')==k:
      if m.get('result',{}).get('exceptionDetails'):raise RuntimeError(m['result']['exceptionDetails'])
      return m.get('result',{}).get('result',{}).get('value')
   cases=[
    ('normal',2,[1,0,0,0,0,0],0,3),
    ('normal',3,[1,1,0,0,0,0],2,3),
    ('guard',4,[1,0,1,0,0,0],2,3),
    ('fetch',8,[1,0,1,0,0,0],2,3)
   ]
   for mode,n,need,yard,t in cases:
    # Build the exact missing faces through the palette. A generated slot is
    # already empty; clicking the dog itself would fill it, reversing need.
    # The isolated browser profile owns this current-game save. Reset setup
    # through UI removal, never through BUST (which creates a result record).
    await j("(function(){document.querySelector('#zero').click();let b;while((b=document.querySelector('#dogs button[data-remove]')))b.click();if(!document.querySelector('#clearDraft').hidden)document.querySelector('#clearDraft').click();while(!document.querySelector('#bonesMinus').disabled)document.querySelector('#bonesMinus').click();})()")
    if yard:await j(f"document.querySelector('#yard').children[{yard-1}].click()")
    for idx,v in enumerate(need):
     for _ in range(v):await j(f"document.querySelector('#dicePalette button[data-face-choice=\"{idx+1}\"]').click()")
    await j("document.querySelector('#createDog').click()")
    assert await j("document.querySelectorAll('#dogs .card-slot[aria-pressed=false]').length")==sum(need),(mode,need)
    if mode!='normal':
     # These independent reference cases use the Filter group's cards.
     await j(f"(function(){{let group=document.querySelector('#trickGroups [data-group=blue]');if(group.getAttribute('aria-pressed')!=='true')group.click();else if(!document.querySelector('#actionDetail').hidden)document.querySelector('#backToCards').click();document.querySelector('#actionCards [data-action={mode}]').click();}})()")
    if mode=='normal':
     await j("(function(){for(let i=0;i<12;i++)document.querySelector('#diceMinus').click()})()")
     for _ in range(n-1):await j("document.querySelector('#dicePlus').click()")
    if mode=='guard':await j(f"(function(){{let x=document.querySelector('#specialExtra input[type=range][data-p=threshold]');x.value='{t}';x.dispatchEvent(new Event('input',{{bubbles:true}}))}})()")
    fill_key='#fill' if mode=='normal' else '#actionFill'
    bust_key='#bust' if mode=='normal' else '#actionBust'
    scope_key='#scope' if mode=='normal' else '#actionScope'
    values=json.loads(await j("JSON.stringify({fill:[1,2,3,4].map(i=>document.querySelector('"+fill_key+"'+i).textContent),bust:document.querySelector('"+bust_key+"').textContent,scope:document.querySelector('"+scope_key+"').textContent})"))
    expected,exb=canonical(n,need,yard,mode,t)
    observed=[float(v.replace('%','')) for v in values['fill']]
    ob=float(values['bust'].replace('%',''))
    for a,b in zip(observed,expected):assert abs(a-b)<.08,(mode,observed,expected,values)
    assert abs(ob-exb)<.08,(mode,ob,exb,values)
    print(mode,'n',n,'yard',yard,'expected', [round(x,1) for x in expected],round(exb,1),'observed',observed,ob)
 finally:
  chrome.terminate()
  try:chrome.wait(timeout=5)
  except:chrome.kill()
asyncio.run(test())
