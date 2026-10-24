/** Check that every counted project has exactly one station on the right route. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transit} from '../theme-transit.js';

const data = JSON.parse(await readFile(new URL('../data/adoptions.json', import.meta.url), 'utf8'));
const records = data.projects.filter(r => r.external && r.verified && r.countedAsReuse);
const routes = {'Evaluation use':'evaluation','Software integration':'integration','Methodological adaptation':'adaptation'};
for (const options of [{}, {mobile:true,mobileScale:284/390}]) {
  const markup = transit(records, options);
  assert(!/NaN|undefined/.test(markup), 'Invalid map coordinates or labels');
  const stations = [...markup.matchAll(/<g\s+data-project="([^"]+)"[^>]*>/g)].map(m => ({
    id: m[1], route: m[0].match(/data-route="([^"]+)"/)?.[1],
    y: Number(m[0].match(/data-y="([^"]+)"/)?.[1])
  }));
  assert.equal(stations.length, records.length + 1, 'Station count differs from reuse count plus origin');
  assert.equal(new Set(stations.map(s => s.id)).size, stations.length, 'Duplicate stations');
  assert.equal(stations.filter(s => s.id === 'origin').length, 1, 'Missing ASQ-PHI origin');
  for (const r of records) {
    const station = stations.find(s => s.id === r.id);
    assert(station, `Missing project: ${r.id}`);
    assert.equal(station.route, routes[r.category], `Wrong route: ${r.id}`);
  }
  for (const route of Object.values(routes)) {
    const dated = records.filter(r => routes[r.category] === route && r.date).sort((a,b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const ys = dated.map(r => stations.find(s => s.id === r.id).y);
    assert(ys.every((y,i) => i === 0 || y <= ys[i-1]), `Dates run backward on ${route}`);
  }
  if (options.mobile) {
    const targets = [...markup.matchAll(/<circle class="transit-hit-target"[^>]* r="([^"]+)"/g)];
    assert.equal(targets.length, records.length + 1);
    assert(targets.every(m => Number(m[1])*2*options.mobileScale >= 43.99), 'Mobile target smaller than 44 pixels');
  }
}
console.log(`Validated ${records.length} project stations, ASQ-PHI origin, date order, and phone touch targets in both layouts.`);
