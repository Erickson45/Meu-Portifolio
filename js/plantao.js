/* Minigame "Plantão no NOC": alertas viram monstrinhos em pixel art que andam até o servidor.
   Clique para tratar, deixe os duplicados passarem, use a A.I.D.A. para limpar a tela. */
(function () {
  'use strict';
  var cv = document.getElementById('gcv'), wrap = document.getElementById('gw'), ov = document.getElementById('gov');
  if (!cv || !wrap) return;
  var ctx = cv.getContext('2d');
  var $ = function (id) { return document.getElementById(id); };
  var hSla = $('gsla'), hSlab = $('gslab'), hRes = $('gres'), hMttr = $('gmttr'), hTime = $('gtime'), bAida = $('gaida'), hAida = $('gaidap');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function m(t) { if (window.Mascote) window.Mascote.say(t); }

  var DUR = 30, AIDA_N = 8, LINE = 70, PX = 3;
  var ALERTS = [
    ['CPU 98% · web-03', 1], ['Disk 100% · db-01', 1], ['CrashLoop · atlas-worker', 1], ['Link down · sp-02', 1], ['API fora · checkout', 1],
    ['Latência p99 2s · api', 2], ['Fila RabbitMQ 10k', 2], ['Memória 94% · k8s-node-2', 2], ['5xx em alta · gateway', 2], ['Backup falhou · fs-07', 2],
    ['SSL expira em 3d', 3], ['Swap 70% · app-11', 3], ['NTP fora de sync', 3], ['Inode 85% · log-02', 3], ['Perda de pacote · rtr-4', 3]
  ];
  var SEV = {
    1: { c: '#F87171', l: '#FECACA', d: '#991B1B', hp: 2, v: .17, pen: 20, pts: 150 },
    2: { c: '#FB923C', l: '#FED7AA', d: '#9A3412', hp: 1, v: .13, pen: 12, pts: 100 },
    3: { c: '#FACC15', l: '#FEF9C3', d: '#854D0E', hp: 1, v: .10, pen: 6, pts: 60 },
    0: { c: '#CBD5E1', l: '#F8FAFC', d: '#64748B', hp: 1, v: .12, pen: 0, pts: 0 }
  };
  var BLOB = ['....XXXX....', '..XLLXXXXX..', '.XLLXXXXXXX.', 'XXLXXXXXXXXX', 'XXwwXXXXwwXX', 'XXwpXXXXwpXX', 'XXXXXXXXXXXX', 'XXXXmmmmXXXX', 'DXXXXXXXXXXD', '.DDXDDDDXDD.'];
  var BLINK = ['....XXXX....', '..XLLXXXXX..', '.XLLXXXXXXX.', 'XXLXXXXXXXXX', 'XXXXXXXXXXXX', 'XXppXXXXppXX', 'XXXXXXXXXXXX', 'XXXXmmmmXXXX', 'DXXXXXXXXXXD', '.DDXDDDDXDD.'];
  var GHOST = ['...XXXXXX...', '..XXXXXXXX..', '.XLXXXXXXXX.', '.XppXXXXppX.', '.XppXXXXppX.', '.XXXXXXXXXX.', '.XXXXmmXXXX.', '.XXXXXXXXXX.', '.XXXXXXXXXX.', '.X.XX..XX.X.'];

  var W = 0, H = 0, DPR = 1, running = false, paused = false, visible = false, raf = 0, last = 0;
  var mons, parts, texts, sla, resolved, ttrs, score, tLeft, spawnT, charge, shake, alarm, clock, zaps;

  function reset() { mons = []; parts = []; texts = []; sla = 100; resolved = 0; ttrs = []; score = 0; tLeft = DUR; spawnT = .4; charge = 0; shake = 0; alarm = 0; clock = 0; zaps = []; }
  reset();

  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = W < 600 ? 420 : 380;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!running) { demo(); draw(); }
  }

  function demo() {
    mons = [];
    [[.42, .3, 1], [.6, .62, 2], [.78, .4, 3], [.9, .72, 0]].forEach(function (d, i) {
      mons.push(mk(W * d[0], H * d[1], d[2], i));
    });
  }

  function mk(x, y, sev, i) {
    var pool = ALERTS.filter(function (a) { return a[1] === sev; });
    var a = sev ? pool[Math.floor(Math.random() * pool.length)] : ALERTS[Math.floor(Math.random() * ALERTS.length)];
    return { x: x, y: y, sev: sev, hp: SEV[sev].hp, t0: clock, txt: a[0], ph: Math.random() * 6.28, hit: 0, blink: Math.random() * 3, id: i };
  }

  function spawn() {
    var ghost = Math.random() < .22, r = Math.random();
    var sev = ghost ? 0 : (r < .25 ? 1 : r < .62 ? 2 : 3);
    var top = 56, bot = H - 30, y, tries = 0;
    do { y = top + Math.random() * (bot - top); tries++; } while (tries < 8 && mons.some(function (o) { return o.x > W - 120 && Math.abs(o.y - y) < 46; }));
    mons.push(mk(W + 24, y, sev, 0));
  }

  /* ---------- desenho ---------- */
  function sprite(rows, map, x, y, s) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var ch = rows[j][i]; if (ch === '.') continue;
      ctx.fillStyle = map[ch]; ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s);
    }
  }

  function drawRack() {
    var x = 12, y = H * .14, w = 40, h = H * .72, u = Math.floor(h / 9);
    ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    for (var i = 0; i < 9; i++) {
      var yy = y + 4 + i * u;
      ctx.fillStyle = '#1E293B'; ctx.fillRect(x + 4, yy, w - 8, u - 5);
      var on = ((clock * 4 + i * 1.7) % 3) < 2;
      ctx.fillStyle = alarm > 0 && i % 2 ? '#F87171' : (on ? '#34D399' : '#065F46');
      ctx.fillRect(x + 8, yy + (u - 5) / 2 - 1, 3, 3);
      ctx.fillStyle = 'rgba(148,163,184,.35)'; ctx.fillRect(x + 16, yy + (u - 5) / 2, w - 24, 1);
    }
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (shake > 0 && !reduce) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (var gx = 12; gx < W; gx += 24) for (var gy = 12; gy < H; gy += 24) ctx.fillRect(gx, gy, 1, 1);
    if (alarm > 0) { ctx.fillStyle = 'rgba(248,113,113,' + (alarm * .12) + ')'; ctx.fillRect(0, 0, LINE, H); }
    drawRack();
    ctx.strokeStyle = 'rgba(248,113,113,.7)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(LINE, 8); ctx.lineTo(LINE, H - 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(LINE + 12, H - 14); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(248,113,113,.8)'; ctx.font = '700 10px "JetBrains Mono",monospace'; ctx.fillText('SLA', 0, 0); ctx.restore();

    ctx.font = '500 11px "JetBrains Mono",monospace'; ctx.textBaseline = 'middle';
    mons.forEach(function (o) {
      var S = SEV[o.sev], bob = reduce ? 0 : Math.round(Math.sin(clock * 6 + o.ph) * 2);
      var sx = o.x - 18, sy = o.y - 15 + bob;
      var map = { X: S.c, L: S.l, D: S.d, w: '#fff', p: '#111827', m: '#111827' };
      if (o.hit > 0) map.X = map.L = map.D = '#fff';
      ctx.globalAlpha = o.sev ? 1 : .55;
      if (o.sev === 1) { ctx.fillStyle = S.d; ctx.fillRect(sx + 6, sy - 3, 3, 4); ctx.fillRect(sx + 27, sy - 3, 3, 4); }
      sprite(o.sev ? (((clock + o.blink) % 3) < .12 ? BLINK : BLOB) : GHOST, map, sx, sy, PX);
      if (o.sev === 1) { ctx.fillStyle = '#111827'; ctx.fillRect(sx + 6, sy + 10, 6, 2); ctx.fillRect(sx + 24, sy + 10, 6, 2); }
      ctx.globalAlpha = 1;
      var tag = o.sev ? 'P' + o.sev : 'dup', label = o.sev ? o.txt : 'duplicado';
      var tw = ctx.measureText(label).width + ctx.measureText(tag).width + 18, lx = Math.max(LINE + 4, Math.min(W - tw - 4, o.x - tw / 2)), ly = sy - 14;
      ctx.fillStyle = 'rgba(7,11,20,.82)'; ctx.fillRect(lx, ly - 9, tw, 18);
      ctx.fillStyle = S.c; ctx.fillText(tag, lx + 5, ly);
      ctx.fillStyle = o.sev ? '#E8EEF5' : '#94A3B8'; ctx.fillText(label, lx + 13 + ctx.measureText(tag).width, ly);
      if (o.sev === 1 && o.hp === 1) { ctx.fillStyle = '#F87171'; ctx.fillRect(sx + 6, sy + 34, 24, 3); ctx.fillStyle = '#334155'; ctx.fillRect(sx + 18, sy + 34, 12, 3); }
    });
    zaps.forEach(function (z) {
      ctx.strokeStyle = 'rgba(34,211,238,' + z.a + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(z.x0, z.y0);
      var steps = 6; for (var i = 1; i <= steps; i++) { var k = i / steps; ctx.lineTo(z.x0 + (z.x1 - z.x0) * k + (i < steps ? (Math.random() - .5) * 18 : 0), z.y0 + (z.y1 - z.y0) * k); }
      ctx.stroke();
    });
    parts.forEach(function (p) { ctx.globalAlpha = Math.max(0, p.l); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
    ctx.globalAlpha = 1;
    ctx.font = '700 13px "JetBrains Mono",monospace'; ctx.textAlign = 'center';
    texts.forEach(function (t) { ctx.globalAlpha = Math.max(0, t.l); ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y); });
    ctx.globalAlpha = 1; ctx.textAlign = 'start';
    ctx.restore();
  }

  function burst(x, y, c, n) { for (var i = 0; i < (n || 14); i++) { var a = Math.random() * 6.28, v = 60 + Math.random() * 140; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, l: 1, s: 3 + (Math.random() < .3 ? 3 : 0), c: c }); } }
  function float(s, x, y, c) { texts.push({ s: s, x: Math.max(LINE + 40, Math.min(W - 40, x)), y: y, l: 1.2, c: c }); }

  /* ---------- lógica ---------- */
  function resolve(o, viaAida) {
    o.dead = true; resolved++; var ttr = clock - o.t0; ttrs.push(ttr);
    var S = SEV[o.sev], bonus = Math.max(0, Math.round(80 - ttr * 20));
    score += S.pts + bonus; burst(o.x, o.y, S.c, 16); float('+' + (S.pts + bonus), o.x, o.y - 24, '#34D399');
    if (!viaAida) { charge = Math.min(AIDA_N, charge + 1); }
  }

  function update(dt) {
    clock += dt;
    if (running && !paused) {
      tLeft -= dt; spawnT -= dt;
      var prog = 1 - tLeft / DUR;
      if (spawnT <= 0) { spawn(); if (prog > .5 && Math.random() < .25) spawn(); spawnT = .95 - .55 * prog + Math.random() * .25; }
      mons.forEach(function (o) {
        o.x -= SEV[o.sev].v * W * (1 + prog * .5) * dt;
        if (o.hit > 0) o.hit -= dt;
        if (o.x < LINE + 6 && !o.dead) {
          o.dead = true;
          if (o.sev) {
            sla = Math.max(0, sla - SEV[o.sev].pen); shake = 10; alarm = 1;
            float('SLA −' + SEV[o.sev].pen + '%', LINE + 60, o.y, '#F87171'); burst(LINE + 6, o.y, '#F87171', 10);
            if (sla > 0 && sla <= 40 && !update.warned) { update.warned = true; m('Vixe, o SLA tá derretendo! 🔥 Clica ligeiro, macho!'); }
          } else { score += 20; float('ignorado ✔ +20', LINE + 70, o.y, '#94A3B8'); }
        }
      });
      mons = mons.filter(function (o) { return !o.dead; });
      if (tLeft <= 0 || sla <= 0) { tLeft = Math.max(0, tLeft); end(); }
      hud();
    }
    shake = Math.max(0, shake - dt * 40); alarm = Math.max(0, alarm - dt * 1.5);
    parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt * 1.6; });
    parts = parts.filter(function (p) { return p.l > 0; });
    texts.forEach(function (t) { t.y -= 30 * dt; t.l -= dt; });
    texts = texts.filter(function (t) { return t.l > 0; });
    zaps.forEach(function (z) { z.a -= dt * 2.5; }); zaps = zaps.filter(function (z) { return z.a > 0; });
  }

  function hud() {
    var mt = ttrs.length ? ttrs.reduce(function (a, b) { return a + b; }, 0) / ttrs.length : 0;
    hSla.textContent = Math.round(sla) + '%'; hSlab.style.width = sla + '%';
    hSlab.style.background = sla > 70 ? '#34D399' : sla > 40 ? '#FBBF24' : '#F87171';
    hRes.textContent = resolved; hMttr.textContent = ttrs.length ? mt.toFixed(1) + 's' : '–';
    hTime.textContent = Math.ceil(tLeft) + 's'; hAida.textContent = charge + '/' + AIDA_N;
    bAida.disabled = !running || charge < AIDA_N;
  }

  function loop(t) {
    raf = 0;
    var dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
    if (!paused) update(dt);
    draw();
    if ((running && !paused) || parts.length || texts.length || zaps.length) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

  function start() {
    if (!W) size();
    reset(); update.warned = false; running = true; paused = !visible; ov.hidden = true;
    hud(); kick();
    m('Eita, o pager tocou! Bora, plantonista! 🚨');
  }

  function rank(sl, mt) {
    if (sl >= 95 && resolved >= 25) return ['SRE Lendário 🏆', 'Tu nasceu pra isso. O pager tem medo de ti.'];
    if (sl >= 80) return ['Plantonista de Respeito 💪', 'SLA saudável e time tranquilo. Dá pra dormir hoje.'];
    if (sl >= 50) return ['Estagiário Corajoso 😅', 'Sobreviveu, mas o gerente já tá mandando mensagem no Teams.'];
    return ['Pager em Chamas 🔥', 'Os alertas venceram dessa vez. Normal: humano nenhum dá conta sozinho.'];
  }

  function end() {
    running = false;
    var mt = ttrs.length ? ttrs.reduce(function (a, b) { return a + b; }, 0) / ttrs.length : 0;
    var best = +(store('plantao-recorde') || 0), rec = score > best;
    if (rec) store('plantao-recorde', String(score));
    var r = rank(sla, mt);
    ov.innerHTML = '<div><p class="lab">Fim do plantão</p><h3>' + r[0] + '</h3><p>' + r[1] + '</p>' +
      '<div class="gres"><div><b>' + resolved + '</b>resolvidos</div><div><b>' + Math.round(sla) + '%</b>SLA</div><div><b>' + (ttrs.length ? mt.toFixed(1) + 's' : '–') + '</b>MTTR médio</div><div><b>' + score + '</b>pontos' + (rec ? ' · recorde!' : ' · recorde ' + best) + '</div></div>' +
      '<p>Na vida real são <strong>5 a 7 mil alertas por dia</strong>. Foi por isso que eu criei o Atlas: triagem e correlação automáticas, com a A.I.D.A. entregando o diagnóstico em ~2 min.</p>' +
      '<div class="gbt"><button class="btn" type="button" id="gagain">Jogar de novo</button><a class="btn gh" href="#projetos">Conhecer o Atlas</a></div></div>';
    ov.hidden = false;
    $('gagain').addEventListener('click', start);
    hud();
    m(sla >= 80 ? 'Arretado demais! Pode pegar o próximo plantão comigo, visse? 😎' : 'Fica aperreado não, é pra isso que existe automação 😉');
    if (window.Mascote && sla >= 95 && resolved >= 25) window.Mascote.jump(3);
  }

  function aida() {
    if (!running || charge < AIDA_N) return;
    charge = 0;
    var targets = mons.filter(function (o) { return o.sev; });
    targets.forEach(function (o) { zaps.push({ x0: 32, y0: H * .14, x1: o.x, y1: o.y, a: 1 }); resolve(o, true); });
    mons = mons.filter(function (o) { return !o.dead; });
    float('A.I.D.A.: ' + targets.length + ' diagnósticos!', W / 2, 40, '#22D3EE');
    shake = 4; hud(); kick();
    m('Ôxe, a A.I.D.A. chegou chegando! ⚡');
  }

  cv.addEventListener('pointerdown', function (e) {
    if (!running) return;
    var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, rad = e.pointerType === 'touch' ? 38 : 30;
    var best = null, bd = 1e9;
    mons.forEach(function (o) { var d = Math.hypot(o.x - px, o.y - py); if (d < rad && d < bd) { bd = d; best = o; } });
    if (!best) return;
    if (!best.sev) { best.dead = true; score = Math.max(0, score - 50); float('ruído! −50', best.x, best.y - 20, '#94A3B8'); burst(best.x, best.y, '#CBD5E1', 8); }
    else { best.hp--; best.hit = .08; if (best.hp <= 0) resolve(best); else float('!', best.x, best.y - 26, '#FECACA'); }
    mons = mons.filter(function (o) { return !o.dead; });
    hud(); kick();
  });
  bAida.addEventListener('click', aida);
  addEventListener('keydown', function (e) {
    if (running && visible && (e.key === ' ' || e.key === 'a') && document.activeElement && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); aida(); }
  });
  $('gstart').addEventListener('click', start);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (running) { paused = !visible; if (!paused) kick(); }
    }, { threshold: .25 }).observe(wrap);
  } else visible = true;
  document.addEventListener('visibilitychange', function () { if (document.hidden && running) paused = true; else if (running && visible) { paused = false; kick(); } });
  (window.quandoOcioso || function (f) { setTimeout(f, 1500); })(function () {
    if ('ResizeObserver' in window) new ResizeObserver(function () { if (wrap.clientWidth !== W) size(); }).observe(wrap);
    else { addEventListener('resize', size); size(); }
  });

  window.Plantao = { start: start, alertas: function () { return mons.slice(); } };
})();
