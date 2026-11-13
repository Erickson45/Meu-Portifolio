/* Mini-Erickson: mascote em pixel art desenhado por código, com sotaque potiguar.
   - anda pelo rodapé conforme a rolagem e comenta cada seção
   - o balão sai da cabeça dele (efeito mola + digitação) e acompanha cada passo
   - clique: fala e pula · duplo clique: forró · arrastar: muda ele de lugar
   - os olhos seguem o mouse, ele comenta os cards em que o mouse passa e dá dicas quando a página fica parada
   API pública: window.Mascote.say(texto), .jump(), .party(), .dance(), .toggle() */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = $('masc'), cv = $('mcv'), bub = $('bub'), bubt = $('bubt'), bubsr = $('bubsr'), bubx = $('bubx');
  if (!el || !cv || !bub) return;
  var bubi = bub.querySelector('.bubi');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- sprite (18 x 25, com 1 px de folga em volta para o contorno) ---------- */
  var C = { o: 'rgba(232,238,245,.92)', h: '#1A120D', H: '#4A3426', s: '#E6B992', S: '#C99470', b: '#5A3E2E', e: '#17121F', m: '#9B3F36',
    t: '#1E1D29', T: '#2E2C3D', g: '#A78BFA', p: '#9AA3AE', P: '#7D8693', k: '#F1F5F9', r: '#E2E8F0' };
  var GW = 18, GH = 25, OY = 0;
  var spr = document.createElement('canvas'); spr.width = GW; spr.height = GH; var g = spr.getContext('2d');
  var sil = document.createElement('canvas'); sil.width = GW; sil.height = GH; var sg = sil.getContext('2d');
  var ctx = cv.getContext('2d');
  function R(x, y, w, h, c) { g.fillStyle = C[c]; g.fillRect(x + 1, y + 2 + OY, w, h); }

  function paint(p) {
    g.clearRect(0, 0, GW, GH); OY = 0;
    if (p.legs === 'walkA') { R(4, 18, 3, 2, 'p'); R(4, 20, 3, 1, 'k'); R(9, 18, 3, 3, 'p'); R(9, 21, 3, 1, 'k'); }
    else if (p.legs === 'walkB') { R(4, 18, 3, 3, 'p'); R(4, 21, 3, 1, 'k'); R(9, 18, 3, 2, 'p'); R(9, 20, 3, 1, 'k'); }
    else if (p.legs === 'jump') { R(4, 18, 3, 2, 'p'); R(9, 18, 3, 2, 'p'); R(3, 20, 3, 1, 'k'); R(10, 20, 3, 1, 'k'); }
    else { R(4, 18, 3, 3, 'p'); R(9, 18, 3, 3, 'p'); R(4, 21, 3, 1, 'k'); R(9, 21, 3, 1, 'k'); }
    R(7, 18, 2, 1, 'p'); R(7, 19, 2, p.legs === 'jump' ? 1 : 2, 'T'); R(6, 18, 1, 2, 'P'); R(9, 18, 1, 2, 'P');
    OY = p.bob || 0;
    /* camiseta preta com o fantasminha roxo */
    R(3, 12, 10, 6, 't'); R(3, 17, 10, 1, 'T'); R(6, 12, 4, 1, 'T');
    R(6, 13, 4, 1, 'g'); R(5, 14, 6, 2, 'g'); R(5, 16, 1, 1, 'g'); R(7, 16, 2, 1, 'g'); R(10, 16, 1, 1, 'g');
    R(6, 14, 1, 1, 't'); R(9, 14, 1, 1, 't'); R(7, 15, 2, 1, 't');
    /* braços */
    var A = p.arms;
    if (A === 'up') { R(2, 12, 1, 1, 't'); R(1, 8, 1, 4, 's'); R(13, 12, 1, 1, 't'); R(14, 8, 1, 4, 's'); }
    else if (A === 'wave1' || A === 'wave2') {
      R(2, 12, 1, 3, 't'); R(2, 15, 1, 2, 's'); R(13, 12, 1, 1, 't'); R(14, 10, 1, 2, 's');
      if (A === 'wave1') R(14, 7, 2, 3, 's'); else R(13, 7, 2, 3, 's');
    }
    else if (A === 'swingA') { R(2, 12, 1, 3, 't'); R(2, 15, 1, 2, 's'); R(13, 12, 1, 2, 't'); R(13, 14, 1, 2, 's'); }
    else if (A === 'swingB') { R(2, 12, 1, 2, 't'); R(2, 14, 1, 2, 's'); R(13, 12, 1, 3, 't'); R(13, 15, 1, 2, 's'); }
    else { R(2, 12, 1, 3, 't'); R(2, 15, 1, 2, 's'); R(13, 12, 1, 3, 't'); R(13, 15, 1, 2, 's'); }
    /* rosto */
    R(6, 11, 4, 1, 'S');
    R(4, 4, 8, 7, 's'); R(3, 6, 1, 2, 's'); R(12, 6, 1, 2, 's'); R(3, 8, 1, 1, 'r');
    /* cabelo cacheado */
    R(5, 0, 2, 1, 'h'); R(9, 0, 3, 1, 'h'); R(4, 1, 8, 1, 'h'); R(3, 2, 10, 2, 'h'); R(2, 3, 1, 2, 'h'); R(13, 3, 1, 1, 'h');
    R(3, 4, 2, 1, 'h'); R(7, 4, 2, 1, 'h'); R(11, 4, 2, 1, 'h'); R(3, 5, 1, 1, 'h'); R(12, 5, 1, 1, 'h');
    R(5, 1, 1, 1, 'H'); R(8, 1, 1, 1, 'H'); R(10, 2, 1, 1, 'H'); R(4, 2, 1, 1, 'H'); R(6, 3, 1, 1, 'H'); R(11, 3, 1, 1, 'H');
    /* sobrancelhas e olhos (seguem o mouse) */
    R(5, 5, 2, 1, 'h'); R(9, 5, 2, 1, 'h');
    if (p.eyes === 'closed') { R(5, 7, 2, 1, 'e'); R(9, 7, 2, 1, 'e'); }
    else if (p.eyes === 'happy') { R(5, 7, 1, 1, 'e'); R(6, 6, 1, 1, 'e'); R(9, 6, 1, 1, 'e'); R(10, 7, 1, 1, 'e'); }
    else { var dx = p.eyes === 'L' ? -1 : p.eyes === 'R' ? 1 : 0; R(6 + dx, 6, 1, 2, 'e'); R(9 + dx, 6, 1, 2, 'e'); }
    /* nariz, barba e boca */
    R(8, 8, 1, 1, 'S');
    R(4, 8, 1, 3, 'b'); R(11, 8, 1, 3, 'b'); R(5, 10, 6, 1, 'b'); R(6, 9, 4, 1, 'b');
    if (p.mouth === 'open') R(7, 9, 2, 2, 'm'); else if (p.mouth === 'smile') R(7, 9, 2, 1, 'm');
  }

  function render() {
    sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, GW, GH);
    sg.drawImage(spr, 1, 0); sg.drawImage(spr, -1, 0); sg.drawImage(spr, 0, 1); sg.drawImage(spr, 0, -1);
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = C.o; sg.fillRect(0, 0, GW, GH);
    sg.globalCompositeOperation = 'source-over'; sg.drawImage(spr, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(sil, 0, 0, cv.width, cv.height);
  }

  /* ---------- tamanho ---------- */
  var S, w, h, BASE = 12;
  function size() {
    S = innerWidth < 761 ? 2 : 3; w = GW * S; h = GH * S;
    var d = Math.min(devicePixelRatio || 1, 2);
    cv.width = w * d; cv.height = h * d; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    bub.style.bottom = (BASE + h + 6) + 'px';
    lastKey = ''; lastX = -1e9;
  }

  /* ---------- estado ---------- */
  var off = store('mascote') === 'off';
  var x = 12, face = 1, lastKey = '', t0 = performance.now(), act = t0, lastSay = t0;
  var sleeping = false, nextZ = 0, waveUntil = 0, waveCD = 0, talkUntil = 0, jumpT = -1, jumps = 0, danceUntil = 0, nextNote = 0;
  var mouseX = -1, press = null, drag = null, manual = null, lastX = -1e9, lastY = -1e9, hoverCD = 0;
  var bubOn = false, bubW = 220, bubTimer = 0, typeT = 0, fullText = '', greeted = false;

  function targetX() {
    if (manual) { if (Math.abs(scrollY - manual.sy) < 260) return manual.x; manual = null; }
    var H = document.documentElement.scrollHeight - innerHeight, p = H > 0 ? scrollY / H : 0;
    return 12 + p * Math.max(0, innerWidth - w - 24);
  }

  function pose(now, moving) {
    var t = now - t0;
    if (drag) return { legs: 'jump', arms: 'up', eyes: 'open', mouth: 'open', bob: 0 };
    if (jumpT >= 0) return { legs: 'jump', arms: 'up', eyes: 'happy', mouth: 'open', bob: 0 };
    if (sleeping) return { legs: 'stand', arms: 'down', eyes: 'closed', mouth: 'flat', bob: Math.floor(t / 900) % 2 ? -1 : 0 };
    var talk = now < talkUntil ? (Math.floor(t / 120) % 2 ? 'open' : 'smile') : 'smile';
    if (now < danceUntil) {
      var k = Math.floor(t / 260) % 2;
      return { legs: k ? 'walkA' : 'walkB', arms: k ? 'wave1' : 'up', eyes: 'happy', mouth: 'open', bob: k ? -1 : 0 };
    }
    if (moving) {
      var f = Math.floor(t / 140) % 2;
      return { legs: f ? 'walkA' : 'walkB', arms: f ? 'swingA' : 'swingB', eyes: 'open', mouth: talk, bob: f ? -1 : 0 };
    }
    if (now < waveUntil) return { legs: 'stand', arms: Math.floor(t / 200) % 2 ? 'wave1' : 'wave2', eyes: 'happy', mouth: 'open', bob: 0 };
    var eyes = 'open';
    if ((t % 3800) < 130) eyes = 'closed';
    else if (mouseX >= 0) {
      var d = mouseX - (x + w / 2);
      if (Math.abs(d) > 40) eyes = (d < 0) === (face > 0) ? 'L' : 'R';
    }
    return { legs: 'stand', arms: 'down', eyes: eyes, mouth: talk, bob: reduce ? 0 : (Math.floor(t / 700) % 2 ? -1 : 0) };
  }

  /* o balão acompanha a cabeça: posição por transform (sem recalcular layout) */
  function placeBubble(ry) {
    var cx = x + w / 2, left = Math.max(8, Math.min(innerWidth - bubW - 8, cx - 30));
    bub.style.transform = 'translate3d(' + Math.round(left) + 'px,' + ry + 'px,0)';
    bubi.style.setProperty('--ax', Math.max(14, Math.min(bubW - 26, cx - left - 6)) + 'px');
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (off) return;
    var moving = false, jy = 0;
    if (drag) { x = drag.x; jy = -14; }
    else {
      var tx = targetX(), dx = tx - x;
      if (reduce) x = tx;
      else if (Math.abs(dx) > 2 && !sleeping && now > danceUntil) {
        var sp = Math.max(150, Math.abs(dx) * 3) / 60;
        x += Math.sign(dx) * Math.min(Math.abs(dx), sp); face = dx > 0 ? 1 : -1; moving = true;
      }
    }
    if (jumpT >= 0) {
      var k = (now - jumpT) / 520;
      if (k >= 1) { jumps--; jumpT = jumps > 0 ? now : -1; } else jy = -Math.sin(Math.PI * k) * 30;
    }
    if (now < danceUntil) {
      if (!reduce) face = Math.floor((now - t0) / 520) % 2 ? 1 : -1;
      if (now > nextNote && !reduce) { nextNote = now + 320; floatChar(rand(['♪', '♫', '♬']), rand(['#22D3EE', '#C4B5FD', '#34D399', '#FBBF24'])); }
    }
    if (!sleeping && !drag && now - act > 22000 && jumpT < 0 && now > talkUntil && !bubOn) { sleeping = true; nextZ = now; }
    if (sleeping && now > nextZ && !reduce) { nextZ = now + 1300; floatChar(Math.random() < .5 ? 'z' : 'Z', '#22D3EE'); }
    var p = pose(now, moving), key = p.legs + p.arms + p.eyes + p.mouth + p.bob + face;
    if (key !== lastKey) { lastKey = key; paint(p); render(); cv.style.transform = face < 0 ? 'scaleX(-1)' : ''; }
    var rx = Math.round(x), ry = Math.round(jy);
    if (rx !== lastX || ry !== lastY) {
      lastX = rx; lastY = ry;
      el.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      if (bubOn) placeBubble(ry);
    }
  }

  function floatChar(ch, color) {
    var z = document.createElement('span'); z.className = 'zz'; z.textContent = ch; z.style.color = color;
    z.style.left = (x + w * (.55 + Math.random() * .3)) + 'px'; z.style.bottom = (BASE + h - 6) + 'px'; z.style.fontSize = (S * 5) + 'px';
    document.body.appendChild(z); setTimeout(function () { z.remove(); }, 2500);
  }

  /* ---------- falas: o balão sai da cabeça e o texto vai sendo digitado ---------- */
  function say(text, ms) {
    if (off || !text || el.hidden) return;
    wake(true);
    clearTimeout(bubTimer); clearInterval(typeT); typeT = 0;
    var chars = Array.from(text); fullText = text;
    bubsr.textContent = text;
    bubi.style.width = ''; bubt.textContent = text; bub.hidden = false;
    bubW = Math.ceil(bubi.offsetWidth); bubi.style.width = bubW + 'px';
    bubOn = true; placeBubble(lastY > -1e8 ? lastY : 0);
    bub.classList.remove('on'); void bub.offsetWidth; bub.classList.add('on');
    lastSay = performance.now();
    if (reduce) { talkUntil = lastSay + 900; }
    else {
      bubt.textContent = ''; bub.classList.add('typing');
      var i = 0; talkUntil = lastSay + chars.length * 26 + 150;
      typeT = setInterval(function () {
        i += chars[i] === ' ' ? 2 : 1;
        bubt.textContent = chars.slice(0, i).join('');
        if (i >= chars.length) { clearInterval(typeT); typeT = 0; bub.classList.remove('typing'); }
      }, 26);
    }
    bubTimer = setTimeout(hideBubble, (ms || Math.max(4200, chars.length * 75)) + chars.length * 26);
  }
  function finishTyping() {
    if (!typeT) return false;
    clearInterval(typeT); typeT = 0; bubt.textContent = fullText; bub.classList.remove('typing'); talkUntil = 0; return true;
  }
  function hideBubble() {
    finishTyping(); bub.classList.remove('on'); clearTimeout(bubTimer);
    bubTimer = setTimeout(function () { if (!bub.classList.contains('on')) { bub.hidden = true; bubOn = false; } }, 300);
  }
  function jump(n) { if (off || reduce) return; wake(true); jumps = n || 1; jumpT = performance.now(); }
  function dance() { if (off) return; wake(true); danceUntil = performance.now() + 2800; say(rand(DANCE)); }
  function wake(silent) {
    act = performance.now();
    if (sleeping) { sleeping = false; if (!silent) setTimeout(function () { say('Vixe! Cochilei no plantão… ninguém viu, né? 😅'); }, 50); }
  }

  var LINES = {
    inicio: 'Ôxe, chegou visita! 👋 Eu sou o mini-Erickson, direto de São Miguel/RN. Clica em mim, me arrasta ou testa o terminal aí em cima, visse?',
    sobre: 'Esse aí sou eu em HD. Eu sou a versão 8-bit, mais arretada. 😎',
    carreira: 'Cada emprego foi um nível, macho. Rola aí pra me ver upar!',
    projetos: 'O Atlas é meu xodó, visse? −60% no tempo de abrir chamado. Arretado demais!',
    plantao: 'Duvido tu segurar 30 segundos de plantão sem ficar aperreado 😏',
    palestras: 'Já falei de IA pra mais de 50 cabras de uma vez só! 🎤',
    certificacoes: 'Estudo aqui não para não. Olha as conquistas desbloqueando!',
    stack: 'Essa é minha mochila de ferramenta. Tem de tudo, que nem bodega de interior.',
    quem: 'Fora do terminal eu gosto é de trilha no sertão. 🌵',
    contato: 'Bora trocar uma ideia? Respondo ligeirinho, prometo!'
  };
  var CLICK = [
    'Eita! Faz cócega não, rapaz. 😂',
    'kubectl get cafe → 1/1 Running ☕ Sem café o sertanejo não sobe.',
    'Já digitou "neofetch" no terminal? É massa demais!',
    'Zero alerta por aqui. Por enquanto, né… 👀',
    'Toil é meu inimigo número 1. Trabalho repetido? Vixe, automatiza logo!',
    'Ó, tem um minigame mais pra baixo. Vai lá, oxe!',
    'Se cair, a gente sobe de novo. Nordestino é resiliente por natureza. 💪',
    'Aqui é sol de 40 graus e servidor no ar. Tamo junto! ☀️',
    'Pode mexer à vontade, que aqui tem backup. 😄',
    'Clica duas vezes que eu mostro meu forró. 🪗'
  ];
  var TIPS = [
    'Psiu… digita "matrix" no terminal pra ver uma coisa. 👀',
    'Sabia que dá pra me arrastar? Me pega aqui e solta onde quiser!',
    'O diagrama do Atlas é clicável, visse? Cada caixinha conta um segredo.',
    'Tô de olho no SLA desse site. Por enquanto, 100%! 💚',
    'Bebe água, viu? No sertão a gente não brinca com isso. 💧',
    'Já tentou o código Konami? ↑↑↓↓←→←→BA. Fica a dica…'
  ];
  var DROP = ['Ôxe, me larga, homi! 😂', 'Eita, que voo! Aqui tá bom.', 'Vixe, deu até tontura 🌀', 'Pronto, fico aqui mesmo. Mas se rolar a página eu volto pro meu canto!'];
  var DANCE = ['Ôxe, toca um forró aí! 🪗', 'Arrasta o pé, minha gente! 💃', 'Xote, baião e deploy sem erro! 🎶'];
  var ci = Math.floor(Math.random() * CLICK.length), lastClick = 0;

  /* ---------- confete (Konami) ---------- */
  function party() {
    if (off) toggle(true);
    say('Eita, que é forró! MODO LENDÁRIO ATIVADO! 🎉🎮', 4200); jump(4);
    if (reduce) return;
    var c = document.createElement('canvas'), q = c.getContext('2d'), W = innerWidth, H = innerHeight, cols = ['#22D3EE', '#8B5CF6', '#34D399', '#FBBF24', '#F87171', '#60A5FA'];
    c.width = W; c.height = H; c.style.cssText = 'position:fixed;inset:0;z-index:95;pointer-events:none';
    document.body.appendChild(c);
    var P = [], i; for (i = 0; i < 140; i++) P.push({ x: Math.random() * W, y: -20 - Math.random() * H * .5, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, s: 4 + Math.floor(Math.random() * 3) * 2, c: cols[i % cols.length] });
    var ts = performance.now();
    (function f(t) {
      q.clearRect(0, 0, W, H);
      P.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .05; q.fillStyle = p.c; q.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
      if (t - ts < 4000) requestAnimationFrame(f); else c.remove();
    })(ts);
  }

  function toggle(force) {
    off = force === undefined ? !off : !force;
    store('mascote', off ? 'off' : null);
    el.hidden = off;
    if (off) { finishTyping(); bub.classList.remove('on'); bub.hidden = true; bubOn = false; }
    else { act = performance.now(); lastX = -1e9; setTimeout(function () { say('Voltei, visse! Sentiu minha falta? 😄'); jump(); }, 60); }
    return !off;
  }

  /* ---------- interações ---------- */
  function clickAct() {
    var now = performance.now();
    if (now - lastClick < 330) { lastClick = 0; dance(); return; }
    lastClick = now;
    ci = (ci + 1) % CLICK.length; say(CLICK[ci]); jump();
  }
  cv.addEventListener('pointerdown', function (e) {
    if (off || e.button > 0) return;
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (err) { /* sem captura */ }
    press = { x0: e.clientX, x1: x, moved: false };
  });
  cv.addEventListener('pointermove', function (e) {
    if (!press) return;
    var dx = e.clientX - press.x0;
    if (!press.moved && Math.abs(dx) > 6) { press.moved = true; drag = { x: x }; wake(true); sleeping = false; hideBubble(); }
    if (press.moved) { drag.x = Math.max(4, Math.min(innerWidth - w - 4, press.x1 + dx)); face = dx < 0 ? -1 : 1; }
  });
  function release() {
    if (!press) return;
    var moved = press.moved; press = null;
    if (moved) { x = drag.x; manual = { x: x, sy: scrollY }; drag = null; say(rand(DROP)); jump(); }
    else clickAct();
  }
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', function () { press = null; drag = null; });
  cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickAct(); } });
  bubi.addEventListener('click', function (e) { if (e.target === bubx) return; if (!finishTyping()) hideBubble(); });
  bubx.addEventListener('click', function () { toggle(false); });

  ['scroll', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, function () { wake(); }, { passive: true }); });
  addEventListener('pointermove', function (e) {
    wake(); mouseX = e.clientX;
    if (off || reduce || drag) return;
    var now = performance.now(), cx = x + w / 2, cy = innerHeight - BASE - h / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 150 && now > waveCD && jumpT < 0) {
      waveUntil = now + 1300; waveCD = now + 6000;
      if (!greeted) { greeted = true; say('Eita, oi! Tudo nos conformes? 👋'); }
    }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouseX = -1; });
  addEventListener('resize', function () { size(); });

  /* comenta o que estiver debaixo do mouse (elementos com data-m) */
  [].forEach.call(document.querySelectorAll('[data-m]'), function (t) {
    t.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || off || drag) return;
      var now = performance.now(); if (now < hoverCD) return;
      hoverCD = now + 9000; say(t.getAttribute('data-m')); waveUntil = now + 900;
    });
  });

  /* dicas quando a página fica parada um tempo */
  setInterval(function () {
    var now = performance.now();
    if (off || sleeping || bubOn || drag || document.hidden || now - lastSay < 40000 || now - act > 20000) return;
    say(rand(TIPS));
  }, 8000);

  var KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], kp = 0;
  addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kp = k === KON[kp] ? kp + 1 : (k === KON[0] ? 1 : 0);
    if (kp === KON.length) { kp = 0; party(); }
  });

  if ('IntersectionObserver' in window) {
    var seen = {}, io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var id = e.target.id;
        if (!e.isIntersecting || seen[id] || !LINES[id]) return;
        seen[id] = 1; if (id === 'inicio') return;
        say(LINES[id]);
      });
    }, { threshold: .35 });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* o mascote só entra em cena depois que a página carregou (não disputa CPU com o primeiro carregamento) */
  var ocioso = window.quandoOcioso || function (f) { setTimeout(f, 1500); };
  el.hidden = true;
  ocioso(function () {
    size();
    el.hidden = off;
    if (!off) x = targetX();
    requestAnimationFrame(tick);
    setTimeout(function () { if (!off && scrollY < innerHeight * .5) say(LINES.inicio, 6500); }, 900);
  });

  window.Mascote = { say: say, jump: jump, party: party, dance: dance, toggle: toggle, on: function () { return !off; } };
})();
