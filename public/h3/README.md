# H3 Ecosystem Constellation

A three-dimensional, interactive map of the people and institutions in the
H3 Institute ecosystem. Served at `/h3/` by the existing Express app
(`public/` is the static root), so `npm start` then open
`http://localhost:3000/h3/`.

## What is real and what is invented

| Layer | Source |
|---|---|
| Entities (137) | The live **H3 Institute \| Ecosystem Map** workbook: universities, field and funders tabs, plus the LearnerStudio roster |
| Profile blurbs | Condensed from the Status, Detail, Ultimate Role and Key Relationship columns |
| Lever tags | **Invented.** Mapped by hand against the nine Learning to Flourish Network levers plus Measurement as a cross-cutting thread |
| Pillar and outcome tags | **Invented.** Mapped against the 3x3 (Agency, Connection, Sustainability by Good Life, Economy, Democracy) |
| Connections (185) | A mix. Employment and the named ties in the Key Relationship column are real; the rest are plausible and unverified |
| Portraits | Generated monograms. Institution logos load live from the web when the browser can reach them |

Everything marked invented exists so the interaction model can be judged.
Confirm any connection before it travels anywhere.

## Files

- `data.js` sets `window.H3DATA = { nodes, edges, LEVERS, PILLARS, OUTCOMES, GROUPS }`
- `app.js` holds the layout simulation, the projection and all interaction
- `style.css` holds the visual system
- No build step, no dependencies, no network required

## Adding real headshots and logos

Each node takes an optional `photo` field. The renderer tries sources in order
and falls back silently, so a single URL is the whole change:

```js
N("kim-smith", "Kim Smith", "person", "core", "CEO, LearnerStudio", "learnerstudio",
  "P1", "active", "...", ["L1"], ["agency"], ["goodlife"], null);
// then, anywhere after the nodes are built:
nodes.find(n => n.id === "kim-smith").photo = "/h3/assets/people/kim-smith.jpg";
```

Simpler still for a batch: drop files into `public/h3/assets/people/<id>.jpg`
and add one line to `sources()` in `app.js` that tries that path first.

Institutions resolve through `domain`: Clearbit first, then Google's favicon
service, then a monogram. Setting `photo` on an institution overrides both.

## Data model

```
node  { id, name, kind: person|org, group: core|university|field|funder,
        role, home, pri: P1..P4, status: active|warm|prospect|parked,
        blurb, levers[], pillars[], outcomes[], domain, photo }
edge  { s, t, type, label, w }
```

Edge types carry their own color and label in the panel: `home`, `employs`,
`ally`, `collab`, `intro`, `funds`, `target`, `peer`.

## Controls

Drag to orbit, scroll or pinch to zoom, click a node to open it and follow its
threads, Escape or the background to close. Lever, audience and pillar chips
filter and auto-frame what is left. Search matches names, roles and blurbs.

## What this is missing, in priority order

1. Real headshots and logos
2. Real lever tagging, ideally in the workbook itself as a multi-select column
3. Real edges with a type and a date, so the map can show how the network moved
4. A way to write back: tagging a connection from the map rather than the sheet
