# ASQ-PHI — In the Wild

A calm, source-linked map of research and software reuse of ASQ-PHI.

**[Explore the map](https://jamesweatherhead.github.io/asq-phi-in-the-wild/)** · [Evidence and methodology](https://jamesweatherhead.github.io/asq-phi-in-the-wild/audit-report.html)

The October 23, 2026 audit documents **11 external reuse projects**: 8 evaluations, 2 software integrations, and 1 methodological adaptation. Two mention-only records are listed separately and excluded from reuse counts. Related papers, versions, repositories and model cards are grouped into one project record.

Select a station for its project and sources. Hover or keyboard focus reveals its documented date and reference. Select the ASQ-PHI origin for the original paper, repository and dataset. On phones, the map becomes a taller, scrollable composition with readable names and 44-pixel station targets.

## Original work

Weatherhead, Golovko & McCaffrey. *Data in Brief* (2026).

- [Peer-reviewed paper · 10.1016/j.dib.2026.112586](https://doi.org/10.1016/j.dib.2026.112586)
- [ASQ-PHI repository](https://github.com/JamesWeatherhead/asq-phi)
- [Dataset v1 · 10.17632/csz5dzp7nx.1](https://doi.org/10.17632/csz5dzp7nx.1)

## Reading the map

Routes group **evaluation**, **integration**, and **methodological adaptation**. Their joins do not establish collaboration or dependence between projects. Stations proceed from earlier to later documented dates along each route; the map is not a shared calendar scale.

Dates refer to the cited submission, commit, release or page update. They do not necessarily establish the first use of ASQ-PHI. Undated records stay outside the dated cumulative History view. Verification establishes a supported relationship; performance results have not been independently rerun. The evidence report records methods, scoring differences, publication status, search limits and caveats.

## Update the record

Edit [`data/adoptions.json`](data/adoptions.json). Keep one record per related project family, with primary sources, an evidence locator, date basis, review date, methodology and caveats. Never assign a date from the order in which a project was discovered.

- `verified` means primary evidence supports the classified relationship.
- `external` excludes creator-owned work.
- `countedAsReuse` excludes citation or mention alone.
- `date`, `dateLabel`, and `dateSourceUrl` document the evidence date; use `null` when unknown.
- `display` and `hover` hold concise labels; `origin` holds original-work metadata.
- `auditDate` is the audit cutoff. Change a record's `verifiedAt` only after reviewing its sources again.

Counts, filters, project panels, History and the report derive from the JSON. The SVG route composition lives in `theme-transit.js`; review label spacing and route geometry when adding stations.

Rebuild and check after edits:

```sh
python3 scripts/build-report.py
python3 scripts/validate.py
node scripts/verify-map.mjs
node --check app.js
node --check art.js
```

Preview locally from this directory:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765/`. Project links use `#project/<id>`.

## Publishing

GitHub Pages serves `main` from the repository root. A push to `main` triggers the Pages build. Relative assets and `.nojekyll` support the repository site path. No build framework, runtime package installation, external fonts, analytics or CDN dependencies are required. When changing code or styles, update the asset version in the HTML and module imports so returning visitors receive the new files; evidence JSON is fetched without browser caching.

To suggest a documented use or correction, [open an issue](https://github.com/JamesWeatherhead/asq-phi-in-the-wild/issues/new) with the project name and primary evidence URL.

## Audit scope and rights

This is a bounded public-source audit through October 23, 2026. Direct Google Scholar access was blocked, and citation-index coverage was incomplete. Sources may change after review. No benchmark results were independently rerun; scores from different methods should not be ranked as a single leaderboard.

The website code is MIT licensed. Linked papers, datasets, software, project names and attributed evidence excerpts retain their respective rights and licenses. This record does not imply endorsement by the listed projects.
