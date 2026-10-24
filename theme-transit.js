/**
 * An original research-route diagram. Lines group the kind of reuse;
 * they do not assert that one external project depends on another.
 * Contract: transit(records, { esc, attributes }) -> SVG inner markup.
 */
export function transit(records, h = {}) {
  const esc = h.esc || (v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const attrs = r => h.attributes ? h.attributes(r) : `data-project="${esc(r.id)}" tabindex="0" role="button"`;
  const colors = { evaluation: '#AA4038', integration: '#365F79', adaptation: '#79774C' };
  const groups = { evaluation: [], integration: [], adaptation: [] };
  records.forEach(r => {
    const category = `${r.category || ''} ${r.display?.typeShort || ''}`.toLowerCase();
    const type = (category.includes('adaptation') || category.includes('influence')) ? 'adaptation' : category.includes('integration') ? 'integration' : 'evaluation';
    groups[type].push(r);
  });
  Object.values(groups).forEach(xs => xs.sort((a,b) => (a.date || '9999').localeCompare(b.date || '9999') || a.id.localeCompare(b.id)));

  // A deliberately asymmetric layout, with later releases encountered upward.
  // Same-date works remain separate stations along the same route.
  const points = {
    evaluation: [
      [480, 520, 456, 536, 'end'],
      [400, 440, 376, 446, 'end'],
      [400, 360, 376, 349, 'end'],
      [460, 300, 482, 307, 'start'],
      [520, 240, 544, 229, 'start'],
      [580, 180, 604, 169, 'start'],
      [580, 130, 556, 137, 'end'],
      [580, 80, 604, 87, 'start']
    ],
    integration: [[250,610,250,647,'middle'], [170,280,194,287,'start']],
    adaptation: [[840,350,816,326,'end']]
  };
  const fallbackPoint = (i,n,type) => type === 'evaluation'
    ? [580, Math.max(55, 520-i*465/Math.max(1,n-1)), 604, Math.max(62,527-i*465/Math.max(1,n-1)), 'start']
    : type === 'integration'
      ? [170,560-i*460/Math.max(1,n-1),194,567-i*460/Math.max(1,n-1),'start']
      : [840,350-i*240/Math.max(1,n-1),816,389-i*240/Math.max(1,n-1),'end'];
  const wrap = name => {
    // Preserve familiar project names while keeping unusually long cards quiet.
    const overrides = {
      'Guardian Layer · Custodian': ['Guardian Layer', 'Custodian'],
      'Browser-local de-identification': ['Browser-local', 'de-identification'],
      'AegisVox · Oracle Health AI': ['AegisVox', 'Oracle Health AI'],
      'Korean PII dataset': ['Korean PII dataset']
    };
    if (overrides[name]) return overrides[name];
    if (name.length < 25) return [name];
    const words = name.split(/\s+/), lines = [''];
    words.forEach(word => {
      if ((lines[lines.length-1] + ' ' + word).trim().length > 24 && lines.length < 2) lines.push(word);
      else lines[lines.length-1] += (lines[lines.length-1] ? ' ' : '') + word;
    });
    return lines;
  };
  const station = (r, point, type) => {
    const [x,y,tx,ty,anchor] = point;
    const lines = wrap(r.display?.shortName || r.name);
    const labelWidth = Math.max(...lines.map(s => s.length)) * 10.5 + 16;
    const labelX = anchor === 'end' ? tx - labelWidth + 8 : anchor === 'middle' ? tx - labelWidth / 2 : tx - 8;
    return `<g ${attrs(r)} data-route="${type}" class="project-node transit-station" style="cursor:pointer" data-x="${x}" data-y="${y}">
      <title>${esc(r.display?.shortName || r.name)} · ${esc(r.date || 'Date unverified')}</title>
      <rect x="${labelX}" y="${ty-22}" width="${labelWidth}" height="${lines.length*24+8}" fill="transparent" />
      <circle cx="${x}" cy="${y}" r="16" fill="transparent" />
      <circle cx="${x}" cy="${y}" r="7.5" fill="#F6F5F0" stroke="${colors[type]}" stroke-width="3.5" />
      <text x="${tx}" y="${ty}" text-anchor="${anchor}" fill="#252523" font-size="20" font-weight="450" letter-spacing="-.35">${lines.map((s,i) => `<tspan x="${tx}" dy="${i ? 24 : 0}">${esc(s)}</tspan>`).join('')}</text>
    </g>`;
  };
  const stations = Object.entries(groups).map(([type,xs]) => xs.map((r,i) => station(r,points[type][i] || fallbackPoint(i,xs.length,type),type)).join('')).join('');
  return `<g class="transit-network" font-family="Arial, Helvetica, sans-serif">
    <g fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M500 610 H250 L170 530 V95" stroke="${colors.integration}" />
      <path d="M500 610 V540 L400 440 V360 L580 180 V57" stroke="${colors.evaluation}" />
      <path d="M500 610 L760 350 H840 V106" stroke="${colors.adaptation}" />
    </g>
    ${stations}
    <g ${h.attributes ? h.attributes({id:'origin',name:'ASQ-PHI'}) : 'data-project="origin" role="button" tabindex="0"'} class="project-node transit-origin" style="cursor:pointer" data-x="500" data-y="610">
      <title>ASQ-PHI · Paper, code and dataset</title>
      <circle cx="500" cy="610" r="31" fill="transparent" />
      <circle cx="500" cy="610" r="13" fill="#F6F5F0" stroke="#252523" stroke-width="4" />
      <circle cx="500" cy="610" r="5" fill="#252523" />
      <text x="533" y="618" font-size="25" fill="#252523" font-weight="600" letter-spacing="-1">ASQ-PHI</text>
    </g>
    <g font-size="16" fill="#66665F" transform="translate(-55 0)">
      <path d="M267 684 h24" stroke="${colors.evaluation}" stroke-width="4" stroke-linecap="round" />
      <text x="301" y="689">Evaluation</text>
      <path d="M437 684 h24" stroke="${colors.integration}" stroke-width="4" stroke-linecap="round" />
      <text x="471" y="689">Integration</text>
      <path d="M614 684 h24" stroke="${colors.adaptation}" stroke-width="4" stroke-linecap="round" />
      <text x="648" y="689">Methodological adaptation</text>
    </g>
  </g>`;
}
