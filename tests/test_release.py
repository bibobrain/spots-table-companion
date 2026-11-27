from pathlib import Path, PurePosixPath
from html.parser import HTMLParser
from urllib.parse import unquote,urlsplit
import re,subprocess,unittest
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
RUNTIME_FILES=('index.html','assets/game-model.js','assets/settlement-model.js','assets/dalmatian-poses.webp','assets/puppy-actions.webp')

class RuntimeScripts(HTMLParser):
 def __init__(self):
  super().__init__();self.scripts=[];self.current=None;self.resources=[];self.styles=[];self.in_style=False
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='script':
   self.current={'src':attrs.get('src'),'body':''};self.scripts.append(self.current)
  if tag=='link' and set(attrs.get('rel','').split()) & {'preload','modulepreload','stylesheet','icon'}:
   if attrs.get('href'):self.resources.append(attrs['href'])
  if tag in ('img','source','video','audio') and attrs.get('src'):self.resources.append(attrs['src'])
  if tag=='style':self.in_style=True
  if attrs.get('style'):self.styles.append(attrs['style'])
 def handle_data(self,data):
  if self.current is not None:self.current['body']+=data
  if self.in_style:self.styles.append(data)
 def handle_endtag(self,tag):
  if tag=='script':self.current=None
  if tag=='style':self.in_style=False

SCRIPTS=RuntimeScripts();SCRIPTS.feed(HTML)

class ReleaseTests(unittest.TestCase):
 def test_home(self):
  self.assertIn('<html lang="zh-CN">',HTML)
  self.assertIn('meta name="description"',HTML)
  self.assertIn('Free, unofficial Spots companion',HTML)
 def test_no_network_runtime(self):
  # The model is packaged locally and must load before the UI. External
  # runtime dependencies remain forbidden; current-game persistence is local.
  self.assertEqual([script['src'] for script in SCRIPTS.scripts],['assets/game-model.js','assets/settlement-model.js',None])
  runtime='\n'.join((ROOT/script['src']).read_text(encoding='utf-8') if script['src'] else script['body'] for script in SCRIPTS.scripts)
  self.assertNotRegex(runtime,r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(|\.sendBeacon\s*\(')
  for token in ('indexedDB','private-workspace-path','PRIVATE KEY'):
   self.assertNotIn(token,HTML+runtime)
 def test_current_game_storage_scope(self):
  self.assertRegex(HTML,r"const\s+STORE_KEY\s*=\s*['\"]pip-and-paw\.current-game\.v1['\"]")
  calls=re.findall(r'\blocalStorage\.(getItem|setItem|removeItem)\s*\(\s*([^,\)]+)',HTML)
  self.assertEqual({method for method,_ in calls},{'getItem','setItem'})
  self.assertTrue(calls)
  self.assertTrue(all(key.strip()=='STORE_KEY' for _,key in calls),calls)
  self.assertNotRegex(HTML,r'\blocalStorage\.clear\s*\(')
 def test_action_and_probability_controls(self):
  for token in ('id="fill1"','id="fill2"','id="fill3"','id="fill4"','id="bust"','id="trickGroups"','id="generalEmpty"','id="actionEmpty"','id="actionCards"','id="actionDetail"','id="backToCards"','id="actionFill1"','id="actionBust"','id="actionRule"','id="ruleSteps"','id="dicePalette"','id="createDog"','id="settlementDialog"','id="confirmSettlement"','id="journalDialog"','id="endSession"','function paintOutcome','function renderActionRule','function autoGuard'):
   self.assertIn(token,HTML)
 def test_exactly_two_modules(self):
  self.assertEqual(HTML.count('<section class="general-module"'),1)
  self.assertEqual(HTML.count('<section class="trick-module"'),1)
  self.assertEqual(HTML.count('<div class="trick-groups"'),1)
  self.assertEqual(HTML.count('<strong>BUST</strong>'),2)
  for old in ('id="trainer"','id="tiles"','id="trainerQuiz"','id="filters"','id="action"'):
   self.assertNotIn(old,HTML)
 def test_package(self):
  for name in ('README.md','LICENSE','NOTICE.md','QA_REPORT.md','COMMUNITY_POSTS.md','CHANGELOG.md','.nojekyll'):
   self.assertTrue((ROOT/name).is_file(),name)
 def test_offline_runtime_dependencies(self):
  # Validate the files the page actually loads. Source PNGs, atlas metadata,
  # and screenshots are repository material, not offline runtime dependencies.
  urls=SCRIPTS.resources+[script['src'] for script in SCRIPTS.scripts if script['src']]
  for style in SCRIPTS.styles:
   urls.extend(match.strip() for match in re.findall(r'url\(\s*[\'\"]?([^\'\"\)]+)',style))
  dependencies=set()
  for url in urls:
   if url.startswith(('#','data:')):continue
   parts=urlsplit(url);path=unquote(parts.path)
   self.assertFalse(parts.scheme or parts.netloc,('remote runtime dependency',url))
   self.assertFalse(path.startswith('/') or '..' in PurePosixPath(path).parts,('non-package runtime dependency',url))
   self.assertTrue((ROOT/path).is_file(),('missing runtime dependency',path))
   dependencies.add(path)
  self.assertEqual({'index.html'}|dependencies,set(RUNTIME_FILES))
  for name in RUNTIME_FILES:
   self.assertTrue((ROOT/name).is_file(),name)
   self.assertGreater((ROOT/name).stat().st_size,0,name)
 def test_js_syntax(self):
  self.assertTrue(SCRIPTS.scripts)
  for index,script in enumerate(SCRIPTS.scripts):
   with self.subTest(script=script['src'] or 'inline '+str(index)):
    source=(ROOT/script['src']).read_text(encoding='utf-8') if script['src'] else script['body']
    r=subprocess.run(['node','--check'],input=source,capture_output=True,text=True)
    self.assertEqual(r.returncode,0,r.stderr)
if __name__=='__main__': unittest.main()
