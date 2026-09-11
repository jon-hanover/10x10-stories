/* =============================================================================
   H3 Ecosystem Constellation
   A 3D map of the people and institutions around the H3 Institute.
   No libraries: custom perspective projection, DOM nodes, canvas edges.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.H3DATA;
  const LEVER = {}; D.LEVERS.forEach(l => LEVER[l.id] = l);
  const PILLAR = {}; D.PILLARS.forEach(p => PILLAR[p.id] = p);
  const OUTCOME = {}; D.OUTCOMES.forEach(o => OUTCOME[o.id] = o);
  const GROUP = {}; D.GROUPS.forEach(g => GROUP[g.id] = g);
  const byId = {}; D.nodes.forEach(n => byId[n.id] = n);

  const EDGE_KIND = {
    home:    { label: "Part of",       c: "#ffd166" },
    employs: { label: "People",        c: "#8fa7d8" },
    ally:    { label: "Close tie",     c: "#7ef2b0" },
    collab:  { label: "Working together", c: "#8ef1ff" },
    intro:   { label: "Path in",       c: "#ffb54d" },
    funds:   { label: "Capital",       c: "#c79bff" },
    target:  { label: "Pursuing",      c: "#ff9ec4" },
    peer:    { label: "Peer to watch", c: "#7d8bad" }
  };
  const SIZE = { P1: 1.0, P2: 0.76, P3: 0.58, P4: 0.46 };

  /* ----------------------------------------------------------- avatars -- */
  function initials(name) {
    const skip = { of:1, the:1, for:1, and:1, in:1, on:1, a:1, an:1 };
    const w = name.replace(/[^A-Za-z0-9 .]/g, " ").split(/\s+/)
      .filter(s => s && !skip[s.toLowerCase()]);
    if (!w.length) return "?";
    if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
    return (w[0][0] + w[1][0]).toUpperCase();
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
  function monogram(node) {
    const h = hash(node.id);
    const base = { core: 44, university: 214, field: 158, funder: 272 }[node.group] || 220;
    const hue = (base + (h % 46) - 23 + 360) % 360;
    const isOrg = node.kind === "org";
    const a = `hsl(${hue},${isOrg ? 24 : 42}%,${isOrg ? 30 : 44}%)`;
    const b = `hsl(${(hue + 34) % 360},${isOrg ? 30 : 52}%,${isOrg ? 13 : 20}%)`;
    const fg = isOrg ? "rgba(233,240,255,.88)" : "rgba(255,255,255,.93)";
    const t = initials(node.name);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` +
      `<radialGradient id="s" cx=".32" cy=".26" r=".75">` +
      `<stop offset="0" stop-color="rgba(255,255,255,.34)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/>` +
      `</radialGradient></defs>` +
      `<rect width="100" height="100" fill="url(#g)"/><rect width="100" height="100" fill="url(#s)"/>` +
      `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="${fg}" ` +
      `font-family="Georgia,serif" font-size="${t.length > 2 ? 30 : 37}" letter-spacing="1">${t}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function sources(node) {
    const out = [];
    if (node.photo) out.push(node.photo);
    if (node.kind === "org" && node.domain) {
      out.push("https://logo.clearbit.com/" + node.domain);
      out.push("https://www.google.com/s2/favicons?domain=" + node.domain + "&sz=128");
    }
    out.push(monogram(node));
    return out;
  }
  function makeImg(node) {
    const src = sources(node);
    const img = document.createElement("img");
    img.alt = node.name; img.loading = "eager"; img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    let i = 0;
    const mark = function () {
      if (img.src.slice(0, 10) === "data:image" && img.parentNode) img.parentNode.classList.add("fallback");
    };
    img.onerror = function () { i++; if (i < src.length) { img.src = src[i]; mark(); } };
    img.onload = mark;
    img.src = src[0];
    if (src.length === 1) setTimeout(mark, 0);
    return img;
  }

  /* ------------------------------------------------------------- layout -- */
  const P = D.nodes.map(n => ({ id: n.id, n, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phase: Math.random() * 6.28 }));
  const pos = {}; P.forEach(p => pos[p.id] = p);

  const LOBE = {
    core:       [0, 0, 0],
    university: [-0.95, 0.42, -0.25],
    field:      [0.88, -0.18, 0.42],
    funder:     [0.02, -0.62, -0.95]
  };
  const R = 430;
  P.forEach((p, i) => {
    const l = LOBE[p.n.group] || [0, 0, 0];
    const j = i * 0.618;
    p.x = l[0] * R + (Math.sin(j * 7.1) * 130);
    p.y = l[1] * R + (Math.cos(j * 5.3) * 130);
    p.z = l[2] * R + (Math.sin(j * 3.7) * 130);
  });

  const links = D.edges.map(e => ({ a: pos[e.s], b: pos[e.t], w: e.w, e }));
  D.nodes.forEach(n => { if (n.home && pos[n.home]) links.push({ a: pos[n.id], b: pos[n.home], w: 3, e: null }); });

  function simulate(steps) {
    const n = P.length;
    for (let s = 0; s < steps; s++) {
      const cool = 1 - s / steps;
      for (let i = 0; i < n; i++) {
        const a = P[i];
        for (let k = i + 1; k < n; k++) {
          const b = P[k];
          let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          let d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 1) { d2 = 1; dx = Math.random() - .5; dy = Math.random() - .5; dz = Math.random() - .5; }
          const d = Math.sqrt(d2);
          const f = 78000 / d2;
          const ux = dx / d, uy = dy / d, uz = dz / d;
          a.vx -= ux * f; a.vy -= uy * f; a.vz -= uz * f;
          b.vx += ux * f; b.vy += uy * f; b.vz += uz * f;
        }
      }
      links.forEach(l => {
        const a = l.a, b = l.b;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const rest = 210 - l.w * 14;
        const f = (d - rest) * 0.016 * (0.5 + l.w * 0.25);
        const ux = dx / d, uy = dy / d, uz = dz / d;
        a.vx += ux * f; a.vy += uy * f; a.vz += uz * f;
        b.vx -= ux * f; b.vy -= uy * f; b.vz -= uz * f;
      });
      P.forEach(p => {
        const l = LOBE[p.n.group] || [0, 0, 0];
        const cx = l[0] * R, cy = l[1] * R, cz = l[2] * R;
        p.vx += (cx - p.x) * 0.0026 + (0 - p.x) * 0.0007;
        p.vy += (cy - p.y) * 0.0026 + (0 - p.y) * 0.0007;
        p.vz += (cz - p.z) * 0.0026 + (0 - p.z) * 0.0007;
        const damp = 0.62 * cool + 0.12;
        p.vx *= damp; p.vy *= damp; p.vz *= damp;
        const cap = 26;
        p.vx = Math.max(-cap, Math.min(cap, p.vx));
        p.vy = Math.max(-cap, Math.min(cap, p.vy));
        p.vz = Math.max(-cap, Math.min(cap, p.vz));
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
      });
    }
    const hub = pos["h3-institute"];
    hub.x *= 0.12; hub.y *= 0.12; hub.z *= 0.12;
  }
  simulate(440);

  // Normalize the cloud to a predictable radius so the camera always frames it.
  (function normalize() {
    const r = P.map(p => Math.hypot(p.x, p.y, p.z)).sort((a, b) => a - b);
    const p92 = r[Math.floor(r.length * 0.92)] || 1;
    const k = 560 / p92;
    P.forEach(p => { p.x *= k; p.y *= k; p.z *= k; });
  })();

  /* ------------------------------------------------------------ adjacency -- */
  const adj = {}; D.nodes.forEach(n => adj[n.id] = []);
  D.edges.forEach(e => { adj[e.s].push({ id: e.t, e, dir: 1 }); adj[e.t].push({ id: e.s, e, dir: -1 }); });

  /* ------------------------------------------------------------------ UI -- */
  const app = document.getElementById("app");
  app.innerHTML =
    '<div id="stage"><canvas id="sky"></canvas><canvas id="edges"></canvas><div id="nodes"></div></div>' +
    '<div class="chrome" id="topbar">' +
      '<div class="brand"><h1>H3 Ecosystem Constellation</h1>' +
      '<div class="sub">People &amp; institutions around the H3 Institute</div></div>' +
      '<div class="spacer"></div><div id="count"></div>' +
      '<div class="search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input id="q" type="search" placeholder="Search people, institutions" autocomplete="off" /></div>' +
      '<button class="ghostbtn" id="labelbtn">Names: key</button>' +
      '<button class="ghostbtn" id="resetbtn">Reset view</button>' +
    '</div>' +
    '<div class="chrome" id="note"><b>Proof of concept.</b> Entities come from the live Ecosystem Map. ' +
      'Lever tags and most connections are invented for this demo, and portraits are placeholders ' +
      'until real headshots and logos are loaded.</div>' +
    '<div class="chrome" id="hint"><b>Drag</b> to orbit &nbsp; <b>Scroll</b> to zoom<br>' +
      '<b>Click</b> a node to open it and follow its threads</div>' +
    '<div class="chrome" id="filters">' +
      '<div class="filterrow" id="leverrow"><span class="rowlabel">Levers</span></div>' +
      '<div class="filterrow" id="grouprow"><span class="rowlabel">Who</span></div>' +
      '<div class="filterrow" id="pillarrow"><span class="rowlabel">Pillar</span>' +
        '<span class="spacer"></span></div>' +
    '</div>' +
    '<aside id="panel"><button class="panel-close" aria-label="Close">&times;</button>' +
      '<div class="panel-scroll" id="panelbody"></div></aside>' +
    '<div id="loader"><div class="l">Mapping the constellation</div></div>';

  const stage = document.getElementById("stage");
  const layer = document.getElementById("nodes");
  const edgeCv = document.getElementById("edges");
  const skyCv = document.getElementById("sky");
  const ectx = edgeCv.getContext("2d");
  const sctx = skyCv.getContext("2d");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panelbody");
  const countEl = document.getElementById("count");

  /* chips */
  function chip(parent, label, color, onclick, small) {
    const b = document.createElement("button");
    b.className = "chip" + (small ? " small" : "");
    b.style.setProperty("--c", color);
    b.innerHTML = '<span class="dot"></span>' + label;
    b.addEventListener("click", () => onclick(b));
    parent.appendChild(b);
    return b;
  }
  const state = { levers: new Set(), groups: new Set(), pillars: new Set(), q: "", sel: null, hot: null, labels: 1 };
  const leverChips = {}, groupChips = {}, pillarChips = {};

  D.LEVERS.forEach(l => {
    leverChips[l.id] = chip(document.getElementById("leverrow"), l.n, l.c, b => {
      toggle(state.levers, l.id); b.classList.toggle("on"); apply();
    });
    leverChips[l.id].title = l.s;
  });
  D.GROUPS.forEach(g => {
    groupChips[g.id] = chip(document.getElementById("grouprow"), g.n, g.c, b => {
      toggle(state.groups, g.id); b.classList.toggle("on"); apply();
    }, true);
  });
  ["person", "org"].forEach(k => {
    groupChips[k] = chip(document.getElementById("grouprow"), k === "person" ? "People" : "Institutions", "#9fb3d9", b => {
      toggle(state.groups, k); b.classList.toggle("on"); apply();
    }, true);
  });
  D.PILLARS.forEach(p => {
    pillarChips[p.id] = chip(document.getElementById("pillarrow"), p.n, p.c, b => {
      toggle(state.pillars, p.id); b.classList.toggle("on"); apply();
    }, true);
  });
  function toggle(set, v) { set.has(v) ? set.delete(v) : set.add(v); }

  /* nodes in the DOM */
  const els = {};
  D.nodes.forEach(n => {
    const el = document.createElement("div");
    el.className = "node " + n.kind + " " + n.group + (n.pri === "P1" ? " named" : "");
    el.style.setProperty("--hc", GROUP[n.group].c);
    const disc = document.createElement("div"); disc.className = "disc";
    disc.appendChild(makeImg(n));
    const halo = document.createElement("div"); halo.className = "halo";
    const lab = document.createElement("div"); lab.className = "label";
    lab.innerHTML = esc(n.name) + '<span class="sublabel">' + esc(n.role || "") + "</span>";
    el.appendChild(halo); el.appendChild(disc); el.appendChild(lab);
    el.addEventListener("pointerenter", () => { if (!drag.moved) { state.hot = n.id; apply(); } });
    el.addEventListener("pointerleave", () => { if (state.hot === n.id) { state.hot = null; apply(); } });
    el.addEventListener("click", ev => { ev.stopPropagation(); if (!drag.moved) select(n.id); });
    layer.appendChild(el);
    els[n.id] = el;
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* ------------------------------------------------------------- camera -- */
  const cam = { yaw: 0.5, pitch: -0.22, dist: 1150, tx: 0, ty: 0, tz: 0 };
  const want = { yaw: 0.5, pitch: -0.22, dist: 1150, tx: 0, ty: 0, tz: 0 };
  let W = 0, H = 0, dpr = 1, spin = true, lastUser = 0;

  function fitDist() { return Math.max(950, Math.min(2400, 1150 * (1280 / Math.max(560, W)))); }
  function resize() {
    W = stage.clientWidth; H = stage.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    [edgeCv, skyCv].forEach(c => { c.width = W * dpr; c.height = H * dpr; c.style.width = W + "px"; c.style.height = H + "px"; });
    ectx.setTransform(dpr, 0, 0, dpr, 0, 0); sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!centerX) centerX = W / 2;
    if (!state.sel && !wasFiltering) { want.dist = fitDist(); cam.dist = cam.dist || want.dist; }
    drawSky();
  }
  window.addEventListener("resize", resize);

  const stars = [];
  for (let i = 0; i < 340; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.25 + .2, a: Math.random() * .55 + .12 });
  function drawSky() {
    sctx.clearRect(0, 0, W, H);
    let g = sctx.createRadialGradient(W * .5, H * .46, 0, W * .5, H * .46, Math.max(W, H) * .78);
    g.addColorStop(0, "#101a36"); g.addColorStop(.45, "#080e1e"); g.addColorStop(1, "#03050c");
    sctx.fillStyle = g; sctx.fillRect(0, 0, W, H);
    [[.22, .28, "rgba(120,90,220,.16)"], [.82, .72, "rgba(60,160,190,.13)"], [.62, .18, "rgba(220,140,90,.09)"]]
      .forEach(n => {
        const gr = sctx.createRadialGradient(W * n[0], H * n[1], 0, W * n[0], H * n[1], Math.max(W, H) * .42);
        gr.addColorStop(0, n[2]); gr.addColorStop(1, "rgba(0,0,0,0)");
        sctx.fillStyle = gr; sctx.fillRect(0, 0, W, H);
      });
    stars.forEach(s => {
      sctx.globalAlpha = s.a; sctx.fillStyle = "#cfe0ff";
      sctx.beginPath(); sctx.arc(s.x * W, s.y * H, s.r, 0, 6.284); sctx.fill();
    });
    sctx.globalAlpha = 1;
  }

  const FOCAL = 1020;
  let centerX = 0, wantCenterX = 0;
  const proj = {};
  function project(t) {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      const bob = Math.sin(t * 0.0006 + p.phase) * 5;
      const x = p.x - cam.tx, y = p.y + bob - cam.ty, z = p.z - cam.tz;
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const zc = cam.dist - z2;
      const o = proj[p.id] || (proj[p.id] = {});
      o.vis = zc > 60;
      o.s = FOCAL / Math.max(zc, 60);
      o.x = centerX + x1 * o.s;
      o.y = H / 2 - y2 * o.s;
      o.zc = zc;
    }
  }

  /* ------------------------------------------------------------- filters -- */
  function matches(n) {
    if (state.levers.size) { if (!n.levers.some(l => state.levers.has(l))) return false; }
    if (state.pillars.size) { if (!n.pillars.some(p => state.pillars.has(p))) return false; }
    if (state.groups.size) {
      const g = state.groups;
      const groupSel = ["core", "university", "field", "funder"].filter(x => g.has(x));
      const kindSel = ["person", "org"].filter(x => g.has(x));
      if (groupSel.length && groupSel.indexOf(n.group) === -1) return false;
      if (kindSel.length && kindSel.indexOf(n.kind) === -1) return false;
    }
    if (state.q) {
      const q = state.q.toLowerCase();
      const hay = (n.name + " " + (n.role || "") + " " + (n.blurb || "")).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
  const vis = {};
  let wasFiltering = false, frameKey = "";
  function autoFrame(filtering) {
    if (state.sel) return;
    const set = D.nodes.filter(n => vis[n.id]);
    const key = filtering ? set.map(n => n.id).join(",") : "ALL";
    if (key === frameKey) return;
    frameKey = key;
    if (!filtering || !set.length) {
      want.tx = want.ty = want.tz = 0; want.dist = fitDist(); return;
    }
    let cx = 0, cy = 0, cz = 0;
    set.forEach(n => { const p = pos[n.id]; cx += p.x; cy += p.y; cz += p.z; });
    cx /= set.length; cy /= set.length; cz /= set.length;
    let r = 0;
    set.forEach(n => { const p = pos[n.id]; r = Math.max(r, Math.hypot(p.x - cx, p.y - cy, p.z - cz)); });
    want.tx = cx; want.ty = cy; want.tz = cz;
    want.dist = Math.max(430, Math.min(1900, (r * 1.9 + 240) * (1280 / Math.max(700, W))));
  }
  function apply() {
    let count = 0;
    const focus = state.sel || state.hot;
    const near = {};
    if (focus) { near[focus] = 1; adj[focus].forEach(a => near[a.id] = 1); }
    D.nodes.forEach(n => {
      const m = matches(n);
      vis[n.id] = m;
      if (m) count++;
      const el = els[n.id];
      el.classList.toggle("dim", !m);
      el.classList.toggle("ghost", !!focus && m && !near[n.id]);
      el.classList.toggle("hot", state.hot === n.id || (!!focus && m && !!near[n.id] && n.id !== state.sel));
      el.classList.toggle("sel", state.sel === n.id);
      const lv = n.levers.find(l => state.levers.has(l));
      el.style.setProperty("--hc", lv ? LEVER[lv].c : GROUP[n.group].c);
    });
    const filtering = !!(state.levers.size || state.pillars.size || state.groups.size || state.q);
    D.nodes.forEach(n => {
      els[n.id].classList.toggle("named",
        (filtering && vis[n.id] && count <= 42) ||
        state.labels === 2 ||
        (state.labels === 1 && n.pri === "P1" && (!filtering || vis[n.id])));
    });
    if (filtering !== wasFiltering || filtering) autoFrame(filtering);
    wasFiltering = filtering;
    countEl.textContent = filtering ? count + " of " + D.nodes.length + " shown" : D.nodes.length + " entities, " + D.edges.length + " connections";
  }

  /* ------------------------------------------------------------- render -- */
  function frame(t) {
    if (spin && !drag.on && !state.sel && Date.now() - lastUser > 2600) want.yaw += 0.00085;
    cam.yaw += (want.yaw - cam.yaw) * .09;
    cam.pitch += (want.pitch - cam.pitch) * .09;
    cam.dist += (want.dist - cam.dist) * .07;
    cam.tx += (want.tx - cam.tx) * .07;
    cam.ty += (want.ty - cam.ty) * .07;
    cam.tz += (want.tz - cam.tz) * .07;

    wantCenterX = (panel.classList.contains("open") && W > 900) ? (W - 388) / 2 : W / 2;
    centerX += (wantCenterX - centerX) * .08;
    project(t);
    const focus = state.sel || state.hot;
    const near = {};
    if (focus) { near[focus] = 1; adj[focus].forEach(a => near[a.id] = 1); }

    /* edges */
    ectx.clearRect(0, 0, W, H);
    ectx.lineCap = "round";
    D.edges.forEach(e => {
      const a = proj[e.s], b = proj[e.t];
      if (!a || !b || !a.vis || !b.vis) return;
      const on = vis[e.s] && vis[e.t];
      if (!on) return;
      const lit = focus && (near[e.s] && near[e.t]) && (e.s === focus || e.t === focus);
      if (focus && !lit) {
        ectx.strokeStyle = "rgba(120,150,220,.05)"; ectx.lineWidth = .7;
      } else {
        const depth = Math.max(.18, Math.min(1, 1300 / ((a.zc + b.zc) / 2)));
        const k = EDGE_KIND[e.type] || EDGE_KIND.peer;
        if (lit) { ectx.strokeStyle = k.c + "cc"; ectx.lineWidth = 1.7 + e.w * .35; }
        else { ectx.strokeStyle = "rgba(150,185,255," + (0.13 + depth * 0.17) + ")"; ectx.lineWidth = .55 + e.w * .22; }
      }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const bow = 0.09;
      ectx.beginPath();
      ectx.moveTo(a.x, a.y);
      ectx.quadraticCurveTo(mx - dy * bow, my + dx * bow, b.x, b.y);
      ectx.stroke();
    });

    /* nodes */
    const labelQueue = [];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], o = proj[p.id], el = els[p.id];
      if (!o.vis) { el.style.display = "none"; continue; }
      if (el.style.display === "none") el.style.display = "";
      const base = SIZE[p.n.pri] || .5;
      const boost = p.id === "h3-institute" ? 1.55 : (p.n.id === state.sel ? 1.18 : 1);
      const s = Math.min(1.75, o.s * base * boost);
      el.style.transform = "translate3d(" + o.x.toFixed(1) + "px," + o.y.toFixed(1) + "px,0) scale(" + s.toFixed(3) + ")";
      el.style.zIndex = el.classList.contains("sel") ? "999999" : String(Math.round(30000 - o.zc));
      const lab = el.lastChild;
      const inv = Math.max(.45, Math.min(1.9, 1 / s));
      lab.style.transform = "translateX(-50%) scale(" + inv.toFixed(2) + ")";
      const wants = !el.classList.contains("dim") && !el.classList.contains("ghost") &&
        (el.classList.contains("sel") || el.classList.contains("hot") || el.classList.contains("named"));
      if (wants) labelQueue.push({ el: lab, o: o, w: Math.max(p.n.name.length * 6.6, (p.n.role || "").length * 5.4) + 16, sel: el.classList.contains("sel") });
      else lab.style.visibility = "hidden";
      const fog = Math.max(.2, Math.min(1, 1 - (o.zc - cam.dist) / 900));
      el.style.opacity = el.classList.contains("dim") ? .08 : (el.classList.contains("ghost") ? .13 * fog : fog);
    }
    // Label collision culling: nearest label wins its patch of screen.
    labelQueue.sort((a, b) => (b.sel - a.sel) || (a.o.zc - b.o.zc));
    const taken = [];
    for (let i = 0; i < labelQueue.length; i++) {
      const L = labelQueue[i];
      const x = L.o.x - L.w / 2, y = L.o.y + 34, w = L.w, h = 30;
      let hit = false;
      for (let k = 0; k < taken.length; k++) {
        const t = taken[k];
        if (x < t.x + t.w && x + w > t.x && y < t.y + t.h && y + h > t.y) { hit = true; break; }
      }
      if (hit || x < -80 || x > W + 80 || y < 0 || y > H) { L.el.style.visibility = "hidden"; }
      else { L.el.style.visibility = "visible"; taken.push({ x, y, w, h }); }
    }
    requestAnimationFrame(frame);
  }

  /* -------------------------------------------------------- interaction -- */
  const drag = { on: false, moved: false, x: 0, y: 0 };
  stage.addEventListener("pointerdown", e => {
    drag.on = true; drag.moved = false; drag.x = e.clientX; drag.y = e.clientY;
    stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", e => {
    if (!drag.on) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    want.yaw -= dx * 0.0055;
    want.pitch = Math.max(-1.25, Math.min(1.25, want.pitch + dy * 0.0045));
    drag.x = e.clientX; drag.y = e.clientY; lastUser = Date.now();
  });
  function endDrag(e) {
    if (!drag.on) return;
    drag.on = false; stage.classList.remove("dragging");
    setTimeout(() => { drag.moved = false; }, 30);
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("click", e => {
    if (drag.moved) return;
    if (e.target === stage || e.target.tagName === "CANVAS") select(null);
  });
  stage.addEventListener("wheel", e => {
    e.preventDefault();
    want.dist = Math.max(260, Math.min(2400, want.dist * (1 + Math.sign(e.deltaY) * 0.1)));
    lastUser = Date.now();
  }, { passive: false });

  let pinch = 0;
  stage.addEventListener("touchmove", e => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinch) want.dist = Math.max(260, Math.min(2400, want.dist * (pinch / d)));
      pinch = d; lastUser = Date.now();
    }
  }, { passive: true });
  stage.addEventListener("touchend", () => { pinch = 0; });

  document.getElementById("q").addEventListener("input", e => { state.q = e.target.value.trim(); apply(); });
  document.getElementById("resetbtn").addEventListener("click", () => {
    want.dist = fitDist(); want.tx = want.ty = want.tz = 0; want.pitch = -0.22; select(null);
  });
  const labelBtn = document.getElementById("labelbtn");
  labelBtn.addEventListener("click", () => {
    state.labels = (state.labels + 1) % 3;
    labelBtn.textContent = "Names: " + ["off", "key", "all"][state.labels];
    D.nodes.forEach(n => {
      els[n.id].classList.toggle("named",
        state.labels === 2 || (state.labels === 1 && n.pri === "P1"));
    });
  });
  panel.querySelector(".panel-close").addEventListener("click", () => select(null));
  document.addEventListener("keydown", e => { if (e.key === "Escape") select(null); });

  /* --------------------------------------------------------------- panel -- */
  function select(id) {
    state.sel = id;
    if (!id) { panel.classList.remove("open"); apply(); return; }
    const p = pos[id];
    want.tx = p.x; want.ty = p.y; want.tz = p.z;
    want.dist = Math.max(780, 780 * (1100 / Math.max(600, W)));
    renderPanel(byId[id]);
    panel.classList.add("open");
    apply();
  }

  function renderPanel(n) {
    const groups = {};
    adj[n.id].forEach(a => {
      const t = a.e.type;
      (groups[t] = groups[t] || []).push(a);
    });
    const order = ["home", "ally", "collab", "funds", "intro", "target", "employs", "peer"];

    let html = '<div class="p-head"><div class="p-avatar ' + (n.kind === "org" ? "org" : "") + '" id="pav"></div>' +
      '<div><h2 class="p-name">' + esc(n.name) + "</h2>" +
      '<div class="p-role">' + esc(n.role || "") + "</div></div></div>";

    html += '<div class="p-meta">' +
      '<span class="pill ' + n.status + '">' + n.status + "</span>" +
      '<span class="pill">' + n.pri + "</span>" +
      '<span class="pill" style="color:' + GROUP[n.group].c + ';border-color:' + GROUP[n.group].c + '55">' + GROUP[n.group].n + "</span>" +
      (n.home && byId[n.home] ? '<span class="pill">' + esc(byId[n.home].name) + "</span>" : "") +
      "</div>";

    if (n.blurb) html += '<p class="p-blurb">' + esc(n.blurb) + "</p>";

    if (n.levers.length) {
      html += '<div class="p-sec"><h3>Levers</h3><div class="tagwrap">' +
        n.levers.map(l => '<span class="tag" style="--c:' + LEVER[l].c + '"><span class="dot"></span>' + esc(LEVER[l].n) + "</span>").join("") +
        "</div></div>";
    }
    if (n.pillars.length || n.outcomes.length) {
      html += '<div class="p-sec"><h3>Pillars and outcomes</h3><div class="tagwrap">' +
        n.pillars.map(p => '<span class="tag" style="--c:' + PILLAR[p].c + '"><span class="dot"></span>' + esc(PILLAR[p].n) + "</span>").join("") +
        n.outcomes.map(o => '<span class="tag" style="--c:#8fa7d8"><span class="dot"></span>' + esc(OUTCOME[o].n) + "</span>").join("") +
        "</div></div>";
    }

    const total = adj[n.id].length;
    html += '<div class="p-sec"><h3>' + total + " connection" + (total === 1 ? "" : "s") + "</h3>";
    order.forEach(t => {
      if (!groups[t]) return;
      const k = EDGE_KIND[t];
      html += '<div style="margin:12px 0 4px"><span class="edgekind" style="color:' + k.c + ';background:' + k.c + '1f">' + k.label + "</span></div>";
      groups[t].forEach(a => {
        const o = byId[a.id];
        html += '<div class="conn" data-go="' + o.id + '">' +
          '<div class="ca ' + (o.kind === "org" ? "org" : "") + '" data-av="' + o.id + '"></div>' +
          '<div><div class="cn">' + esc(o.name) + "</div>" +
          (a.e.label ? '<div class="cl">' + esc(a.e.label) + "</div>" : "") +
          "</div></div>";
      });
    });
    html += "</div>";
    panelBody.innerHTML = html;
    document.getElementById("pav").appendChild(makeImg(n));
    panelBody.querySelectorAll("[data-av]").forEach(d => d.appendChild(makeImg(byId[d.getAttribute("data-av")])));
    panelBody.querySelectorAll("[data-go]").forEach(d => d.addEventListener("click", () => select(d.getAttribute("data-go"))));
    panelBody.scrollTop = 0;
  }

  /* ----------------------------------------------------------------- go -- */
  resize();
  apply();
  requestAnimationFrame(frame);
  setTimeout(() => document.getElementById("loader").classList.add("gone"), 450);
  window.H3 = { select, state, cam, want, pos };
})();
