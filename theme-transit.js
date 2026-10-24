/**
 * An original research-route diagram. Lines group the kind of reuse;
 * they do not assert that one external project depends on another.
 * Contract: transit(records, { esc, attributes }) -> SVG inner markup.
 */
export function mobileMapSize(records) {
  const evaluations = records.filter(r => !/integration|adaptation|influence/i.test(`${r.category || ''} ${r.display?.typeShort || ''}`)).length;
  return {width:390, height:560 + Math.max(0,evaluations-1)*90};
}

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

  if (h.mobile) {
    // The same routes are arranged vertically on a phone. Text stays 16 CSS px
    // and every station has a 44 CSS px target, independent of SVG scaling.
    const scale = Math.max(.1, Number(h.mobileScale) || 1);
    const px = n => n / scale;
    const firstY = 220 + Math.max(0,groups.evaluation.length-1)*90;
    const originY = firstY + 170;
    const mobileNames = name => ({
      'Guardian Layer · Custodian':['Guardian Layer','Custodian'],
      'Browser-local de-identification':['Browser-local','de-identification'],
      'AegisVox · Oracle Health AI':['AegisVox','Oracle Health AI']
    }[name] || [name]);
    const mobileStation = (r,type,x,y) => {
      const lines = mobileNames(r.display?.shortName || r.name);
      const baseIntegration = type === 'integration' && y === originY;
      const tx = baseIntegration ? x : type === 'adaptation' ? 320 : type === 'integration' ? 70 : 156;
      const end = type === 'adaptation';
      const labelWidth = px(Math.max(...lines.map(s=>s.length))*8.1+16);
      const labelX = baseIntegration ? tx-labelWidth/2 : end ? tx-labelWidth+px(8) : tx-px(8);
      const baseline = baseIntegration ? y+px(38) : y+px(lines.length>1?-4:6);
      return `<g ${attrs(r)} data-route="${type}" class="project-node transit-station" data-x="${x}" data-y="${y}">
        <title>${esc(r.display?.shortName || r.name)} · ${esc(r.date || 'Date unverified')}</title>
        <rect class="transit-label-hit" x="${labelX}" y="${baseIntegration?baseline-px(24):y-px(22)}" width="${labelWidth}" height="${px(44)}" fill="transparent" />
        <circle class="transit-hit-target" data-hit-target="station" cx="${x}" cy="${y}" r="${px(22)}" fill="transparent" />
        <circle cx="${x}" cy="${y}" r="${px(6)}" fill="#F6F5F0" stroke="${colors[type]}" stroke-width="${px(3)}" />
        <text class="mobile-station-label" style="font-size:${px(16)}px" x="${tx}" y="${baseline}" text-anchor="${baseIntegration?'middle':end?'end':'start'}" fill="#252523" font-size="${px(16)}" font-weight="450" letter-spacing="-.2">${lines.map((s,i)=>`<tspan x="${tx}" dy="${i?px(20):0}">${esc(s)}</tspan>`).join('')}</text>
      </g>`;
    };
    const mobileStations = Object.entries(groups).map(([type,xs])=>xs.map((r,i)=>{
      const x = type==='evaluation'?130:type==='integration'?(i===0?80:40):350;
      const y = type==='evaluation'?firstY-i*90:type==='integration'?
        (xs.length===1?originY:originY-i*(originY-145)/(xs.length-1)):
        70+(xs.length-1-i)*75;
      return mobileStation(r,type,x,y);
    }).join('')).join('');
    return `<g class="transit-network mobile-transit-network" font-family="Arial, Helvetica, sans-serif">
      <g fill="none" stroke-width="${px(5)}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M195 ${originY} H40 V95" stroke="${colors.integration}" />
        <path d="M195 ${originY} L130 ${firstY+70} V180" stroke="${colors.evaluation}" />
        <path d="M195 ${originY} L350 ${firstY+35} V40" stroke="${colors.adaptation}" />
      </g>
      ${mobileStations}
      <g ${h.attributes?h.attributes({id:'origin',name:'ASQ-PHI'}):'data-project="origin" role="button" tabindex="0"'} class="project-node transit-origin" data-x="195" data-y="${originY}">
        <title>ASQ-PHI · Paper, code and dataset</title>
        <circle class="transit-hit-target" data-hit-target="origin" cx="195" cy="${originY}" r="${px(22)}" fill="transparent" />
        <circle cx="195" cy="${originY}" r="${px(10)}" fill="#F6F5F0" stroke="#252523" stroke-width="${px(3)}" />
        <circle cx="195" cy="${originY}" r="${px(3.5)}" fill="#252523" />
        <text class="mobile-origin-label" style="font-size:${px(20)}px" x="${195+px(21)}" y="${originY+px(6)}" font-size="${px(20)}" fill="#252523" font-weight="600" letter-spacing="-.8">ASQ-PHI</text>
      </g>
      <g class="mobile-map-legend" font-size="${px(14)}" fill="#66665F">${[['evaluation','Evaluation'],['integration','Integration'],['adaptation','Methodological adaptation']].map(([type,label],i)=>{
        const y=originY+65+px(i*27);
        return `<path d="M40 ${y} h${px(20)}" stroke="${colors[type]}" stroke-width="${px(3)}" stroke-linecap="round"/><text style="font-size:${px(14)}px" x="${40+px(31)}" y="${y+px(5)}">${label}</text>`;
      }).join('')}</g>
    </g>`;
  }

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
