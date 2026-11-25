from pathlib import Path
import re,subprocess,tempfile,unittest
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
class ReleaseTests(unittest.TestCase):
 def test_home(self):
  self.assertIn('<html lang="zh-CN">',HTML)
  self.assertIn('meta name="description"',HTML)
  self.assertIn('非官方',HTML)
 def test_no_network_runtime(self):
  self.assertEqual(HTML.count('<script>'),1)
  for token in ('<script src=', 'fetch(', 'localStorage','indexedDB','private-workspace-path','PRIVATE KEY'):
   self.assertNotIn(token,HTML)
 def test_action_and_probability_controls(self):
  for token in ('id="fill1"','id="fill2"','id="fill3"','id="fill4"','id="bust"','id="action"','id="trainerTry"','function restoreDemo','function renderOutcomes'):
   self.assertIn(token,HTML)
 def test_package(self):
  for name in ('README.md','LICENSE','NOTICE.md','QA_REPORT.md','COMMUNITY_POSTS.md','CHANGELOG.md','assets/preview-mobile.png','.nojekyll'):
   self.assertTrue((ROOT/name).is_file(),name)
 def test_js_syntax(self):
  found=re.search(r'<script>(.*?)</script>',HTML,re.S)
  self.assertIsNotNone(found)
  with tempfile.NamedTemporaryFile(mode='w',suffix='.js',encoding='utf-8') as fp:
   fp.write(found.group(1));fp.flush()
   r=subprocess.run(['node','--check',fp.name],capture_output=True,text=True)
   self.assertEqual(r.returncode,0,r.stderr)
if __name__=='__main__': unittest.main()
