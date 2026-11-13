/* Diagrama animado do Atlas: partículas (alertas) correndo entre os componentes.
   Clicar num componente abre o painel com o funcionamento dele (baseado na documentação do Atlas e da A.I.D.A.). */
(function () {
  'use strict';
  var box = document.getElementById('flow'), panel = document.getElementById('fxd');
  if (!box) return;
  var cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = {};
  [].forEach.call(box.querySelectorAll('.nd'), function (n) { nodes[n.getAttribute('data-node')] = { el: n, hot: 0 }; });

  /* [de, para, partículas por segundo, tipo] */
  var EDGES = [['zbx', 'api', 2.4, 'a'], ['api', 'live', .9, 'b'], ['api', 'pg', .7, 'b'], ['api', 'cel', 1.6, 'a'],
    ['cel', 'teams', .6, 'c'], ['cel', 'plan', .55, 'c'], ['cel', 'aida', .7, 'c'], ['aida', 'noc', .6, 'g']];
  var COL = { a: ['#F87171', '#FB923C', '#FACC15'], b: ['#C4B5FD'], c: ['#22D3EE'], g: ['#34D399'] };

  /* ---------- conteúdo do painel ---------- */
  var DET = {
    zbx: {
      k: 'Entrada · ingestão reativa', t: 'Zabbix empurra o alerta, o Atlas não fica esperando',
      li: ['<b>Webhook em tempo real:</b> cada evento chega em segundos, autenticado por token com comparação em tempo constante (HMAC).',
        '<b>Multi-instância:</b> o Zabbix global e o Zabbix próprio de cada equipe (inclusive v7) entram na mesma esteira.',
        '<b>Shadow Mode:</b> se a equipe tem Zabbix próprio, o alerta duplicado do global é descartado na porta.',
        '<b>Rede de segurança:</b> o polling agendado continua rodando e recupera qualquer webhook que se perca no caminho.'],
      tags: ['Webhook', 'HMAC', 'Multi-tenant', 'Shadow Mode']
    },
    api: {
      k: 'Núcleo · orquestração', t: 'Atlas: Flask + Socket.IO atrás do Nginx',
      li: ['<b>Triagem na entrada:</b> blacklist silencia ruído, regras de prioridade furam a fila e o buffer espera o flap se resolver sozinho.',
        '<b>Severidade 4/5</b> já nasce com a transição agendada para o segundo exato em que o buffer estoura.',
        '<b>Infra:</b> Gunicorn + Eventlet, Nginx como proxy reverso (SSL e WSS), tudo orquestrado em Docker Compose.',
        '<b>Identidade:</b> login via Azure AD (OAuth2) com tokens cifrados com Fernet antes de ir pro banco.'],
      tags: ['Flask', 'Socket.IO', 'Nginx', 'Docker Compose', 'Azure AD', 'Fernet']
    },
    live: {
      k: 'Interface · Centro de Comando', t: 'Painel NOC: um Kanban operacional em tempo real',
      li: ['<b>Jornada do incidente:</b> Triagem → Em atuação → Meus alertas → Atuados → Acompanhamento.',
        '<b>Buraco Negro:</b> alertas idênticos em 10 minutos viram um card pai com os filhos dentro. Um switch caído não inunda a tela.',
        '<b>Delta fetch por WebSocket:</b> só o que mudou nos últimos segundos trafega. Aguenta crises com +10 mil alertas.',
        '<b>Sem travar:</b> DocumentFragment, Web Worker e Optimistic UI (a tela responde antes do banco confirmar).'],
      tags: ['WebSockets', 'Web Worker', 'Optimistic UI', 'Kanban']
    },
    pg: {
      k: 'Persistência', t: 'PostgreSQL 15, afinado para concorrência',
      li: ['<b>Upsert idempotente</b> por evento + origem, à prova de corrida entre requisições simultâneas.',
        '<b>Advisory locks</b> (Postgres + Redis) garantem que nenhum incidente tenha dois donos.',
        '<b>Sem N+1:</b> o painel inteiro sai em uma única query com joinedload, na casa dos 50 ms.',
        '<b>Memória da IA:</b> diagnósticos aprovados pelo time ficam salvos e voltam instantaneamente.'],
      tags: ['PostgreSQL 15', 'SQLAlchemy', 'ON CONFLICT', 'Advisory locks']
    },
    cel: {
      k: 'Assíncrono · robôs', t: 'Celery + Redis: o trabalho pesado fora da tela',
      li: ['<b>Filas dedicadas</b> para sync e para chamadas à API do Zabbix: rede lenta lá nunca trava a interface aqui.',
        '<b>Debounce natural:</b> uma rajada de webhooks vira uma única sync consolidada segundos depois.',
        '<b>Celery Beat</b> como agendador único: sync de segurança, limpeza de alertas antigos e relatórios.',
        '<b>Robôs:</b> passagem de turno automática no Teams e auto-close de chamados que normalizaram sozinhos.'],
      tags: ['Celery', 'Celery Beat', 'Redis', 'Filas']
    },
    aida: {
      k: 'Atlas Intelligent Digital Assistant', t: 'A.I.D.A.: RAG 100% local que diagnostica em ~2 min',
      rag: [['Sinônimos', '"banco" vira database, Postgres, SQL. Jargão do time não confunde a busca.'],
        ['Busca vetorial', 'Bi-Encoder (MiniLM) + busca por palavra-chave, fundidas por ranking (RRF).'],
        ['Re-ranking', 'Cross-Encoder julga os 20 melhores e corta falso positivo ("pod" ≠ "pode").'],
        ['Geração', 'Qwen 2.5 no Ollama recebe o POP vencedor + métricas ao vivo do Zabbix.']],
      li: ['<b>On-premise:</b> o LLM roda num contêiner da empresa. Nenhum IP, senha ou dado interno sai pra internet.',
        '<b>Temperatura 0.2</b> e prompt confinado aos POPs: zero criatividade onde criatividade é risco.',
        '<b>Aprende com o time:</b> 👍 vira memória rápida (resposta instantânea na próxima vez), 👎 gera um novo diagnóstico.',
        '<b>Esquece o que é ruim:</b> aprendizados mal avaliados são apagados, e POPs sem revisão há 1 ano são sinalizados.'],
      tags: ['RAG', 'Ollama', 'Qwen 2.5', 'MiniLM', 'Cross-Encoder', 'RLHF']
    },
    teams: {
      k: 'Saída · comunicação', t: 'Teams + e-mail no momento certo',
      li: ['<b>Fast Ping:</b> um clique e o card do alerta chega no canal do Teams do cliente responsável.',
        '<b>Aprende a rota:</b> se o Atlas não sabe de quem é o servidor, pergunta uma vez e lembra para todos os alertas futuros daquele host.',
        '<b>Permissões delegadas:</b> os disparos usam o token do próprio analista no MS Graph, então a auditoria é fiel.'],
      tags: ['MS Graph', 'Teams', 'OAuth2']
    },
    plan: {
      k: 'Saída · gestão', t: 'Atlas Desk, Planner e dossiês executivos',
      li: ['<b>Chamado pré-preenchido:</b> cliente, POP e host já vêm do alerta. É aqui que os 20 minutos viraram 8.',
        '<b>Microsoft Planner:</b> tarefas importadas, assumidas no Atlas e concluídas de volta no board, sem retrabalho.',
        '<b>Dossiês em PDF</b> (WeasyPrint) com MTTR, MTTA e um resumo em linguagem humana, enviados à gestão.',
        '<b>Evidências em um clique:</b> snapshot do alerta + gráfico de 24h, empacotados em ZIP direto na memória.'],
      tags: ['Planner', 'WeasyPrint', 'MTTR / MTTA']
    },
    noc: {
      k: 'Pessoas', t: 'NOC: 20 analistas com carga justa',
      li: ['<b>Auto-Assign com nivelamento justo:</b> quem tem menos alertas na tela, e está há mais tempo sem receber, leva o próximo.',
        '<b>Sem dono duplicado:</b> se 5 telas pedem o mesmo alerta no mesmo segundo, só a primeira ganha a trava.',
        '<b>Diagnóstico pronto:</b> o analista já recebe a análise da A.I.D.A. e as respostas rápidas aprovadas pelo time.'],
      tags: ['Auto-Assign', 'Redis', 'Fair load balancing']
    }
  };

  var sel = 'aida', ragI = 0, ragT = 0;
  function show(k, fromClick) {
    sel = k; var d = DET[k];
    Object.keys(nodes).forEach(function (n) { var on = n === k; nodes[n].el.classList.toggle('sel', on); nodes[n].el.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    if (!panel || !d) return;
    var h = '<p class="lab">' + d.k + '</p><h4>' + d.t + '</h4>';
    if (d.rag) h += '<ol class="rag">' + d.rag.map(function (r) { return '<li><b>' + r[0] + '</b><span>' + r[1] + '</span></li>'; }).join('') + '</ol>';
    h += '<ul>' + d.li.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
    h += '<div class="tags">' + d.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>';
    panel.innerHTML = h;
    if (fromClick && !reduce) { panel.classList.remove('in'); void panel.offsetWidth; panel.classList.add('in'); }
    clearInterval(ragT); ragT = 0; ragI = 0;
    if (d.rag) { stepRag(); if (!reduce) ragT = setInterval(stepRag, 1400); }
    if (!visible || reduce) draw();
  }
  function stepRag() {
    var li = panel.querySelectorAll('.rag li'); if (!li.length) return;
    li.forEach(function (x, i) { x.classList.toggle('on', i === ragI); });
    ragI = (ragI + 1) % li.length;
  }

  /* ---------- geometria e desenho ---------- */
  var W = 0, H = 0, geo = [], dots = [], acc = [], visible = false, raf = 0, last = 0, hover = null;

  function rel(el) {
    var b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - b.left, t: r.top - b.top, r: r.right - b.left, b: r.bottom - b.top, cx: (r.left + r.right) / 2 - b.left, cy: (r.top + r.bottom) / 2 - b.top };
  }

  function layout() {
    var d = Math.min(devicePixelRatio || 1, 2);
    W = box.clientWidth; H = box.clientHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    geo = EDGES.map(function (e) {
      var a = rel(nodes[e[0]].el), b = rel(nodes[e[1]].el), dx = b.cx - a.cx, dy = b.cy - a.cy, p0, p1, c0, c1;
      if (Math.abs(dx) > Math.abs(dy)) {
        p0 = [dx > 0 ? a.r : a.l, a.cy]; p1 = [dx > 0 ? b.l : b.r, b.cy];
        var mx = (p1[0] - p0[0]) * .55; c0 = [p0[0] + mx, p0[1]]; c1 = [p1[0] - mx, p1[1]];
      } else {
        p0 = [a.cx, dy > 0 ? a.b : a.t]; p1 = [b.cx, dy > 0 ? b.t : b.b];
        var my = (p1[1] - p0[1]) * .55; c0 = [p0[0], p0[1] + my]; c1 = [p1[0], p1[1] - my];
      }
      return { p0: p0, c0: c0, c1: c1, p1: p1, from: e[0], to: e[1], rate: e[2], kind: e[3] };
    });
    acc = geo.map(function () { return Math.random(); });
    if (reduce || !visible) draw();
  }

  function pt(g, t) {
    var u = 1 - t;
    return [u * u * u * g.p0[0] + 3 * u * u * t * g.c0[0] + 3 * u * t * t * g.c1[0] + t * t * t * g.p1[0],
      u * u * u * g.p0[1] + 3 * u * u * t * g.c0[1] + 3 * u * t * t * g.c1[1] + t * t * t * g.p1[1]];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var focus = hover || sel;
    geo.forEach(function (g) {
      var lit = g.from === focus || g.to === focus;
      ctx.strokeStyle = lit ? 'rgba(139,92,246,.6)' : 'rgba(255,255,255,.12)'; ctx.lineWidth = lit ? 2 : 1.5;
      ctx.beginPath(); ctx.moveTo(g.p0[0], g.p0[1]); ctx.bezierCurveTo(g.c0[0], g.c0[1], g.c1[0], g.c1[1], g.p1[0], g.p1[1]); ctx.stroke();
      var e = pt(g, .985), f = pt(g, 1), ang = Math.atan2(f[1] - e[1], f[0] - e[0]);
      ctx.fillStyle = lit ? 'rgba(139,92,246,.85)' : 'rgba(255,255,255,.25)';
      ctx.beginPath(); ctx.moveTo(f[0], f[1]); ctx.lineTo(f[0] - 7 * Math.cos(ang - .45), f[1] - 7 * Math.sin(ang - .45)); ctx.lineTo(f[0] - 7 * Math.cos(ang + .45), f[1] - 7 * Math.sin(ang + .45)); ctx.fill();
    });
    if (reduce) { geo.forEach(function (g, i) { [.3, .65].forEach(function (t) { dot(pt(g, t), COL[g.kind][i % COL[g.kind].length]); }); }); return; }
    dots.forEach(function (d) { dot(pt(geo[d.e], d.t), d.c); });
  }

  function dot(p, c) {
    ctx.globalAlpha = .25; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, 6.283); ctx.fill();
  }

  function frame(t) {
    raf = 0;
    var dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
    geo.forEach(function (g, i) {
      acc[i] += g.rate * dt;
      while (acc[i] >= 1) { acc[i]--; var cs = COL[g.kind]; dots.push({ e: i, t: 0, v: 1 / (1.1 + Math.random() * .6), c: cs[Math.floor(Math.random() * cs.length)] }); }
    });
    dots.forEach(function (d) {
      d.t += d.v * dt;
      if (d.t >= 1) { d.dead = true; nodes[geo[d.e].to].hot = t + 240; }
    });
    dots = dots.filter(function (d) { return !d.dead; });
    Object.keys(nodes).forEach(function (k) { var n = nodes[k], on = n.hot > t; if (on !== n.on) { n.on = on; n.el.classList.toggle('hot', on); } });
    draw();
    if (visible) raf = requestAnimationFrame(frame);
  }

  Object.keys(nodes).forEach(function (k) {
    var el = nodes[k].el;
    el.addEventListener('click', function () { show(k, true); });
    el.addEventListener('pointerenter', function () { hover = k; if (!visible || reduce) draw(); });
    el.addEventListener('pointerleave', function () { hover = null; if (!visible || reduce) draw(); });
  });

  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(box); else addEventListener('resize', layout);
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!visible) { clearInterval(ragT); ragT = 0; } else if (DET[sel].rag && !ragT) { ragT = setInterval(stepRag, 1400); }
    }).observe(box);
  }
  layout();
  show(sel, false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
