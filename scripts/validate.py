"""Check content invariants and internal links without external dependencies."""
import datetime, json, pathlib, re
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'data/adoptions.json').read_text()); projects=data['projects']
assert len({r['id'] for r in projects})==len(projects), 'Duplicate project IDs'
categories={'Evaluation use','Software integration','Methodological adaptation','Citation or mention'}
for r in projects:
 for key in ['id','name','owner','category','summary','methodology','caveats','sources','status','verifiedAt','countedAsReuse']:
  assert key in r, (r['id'],key)
 assert r['category'] in categories
 assert r['countedAsReuse']==(r['category']!='Citation or mention')
 assert r['caveats'] and r['sources']
 if r.get('date'):
  assert datetime.date.fromisoformat(r['date'])<=datetime.date.fromisoformat(data['auditDate'])
  assert r['dateLabel'] and r['dateSourceUrl'].startswith('https://')
 for s in r['sources']: assert s['url'].startswith('https://')
for f in root.glob('*.html'):
 for link in re.findall(r'(?:href|src)="([^"#]+)"',f.read_text()):
  if not re.match(r'^(?:https?:|mailto:)',link): assert (root/link.split('#')[0].split('?')[0]).exists(),(f.name,link)
reuse=[r for r in projects if r['external'] and r['verified'] and r['countedAsReuse']]
slots=[r['artSlot'] for r in reuse]
assert len(slots)==len(set(slots)), 'Duplicate artwork slots'
for r in projects:
 assert r.get('display',{}).get('shortName') and r['display']['oneLine'], r['id']
 assert len(r['display']['oneLine'])<=95, r['id']
print(f'Validated {len(projects)} records; {len(reuse)} reuse projects; {len(projects)-len(reuse)} mention-only. Internal links valid.')
