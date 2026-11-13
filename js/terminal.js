/* Terminal interativo do topo: animação de abertura + comandos de verdade. */
(function () {
  'use strict';
  var out = document.getElementById('tout'), form = document.getElementById('tin'), inp = document.getElementById('tcmd'), term = document.getElementById('term');
  if (!out || !form) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CV = 'Erickson-Queiroz-Curriculo.pdf';
  var PR = '<span class="k">erickson@ops</span><span class="d">:~$</span> ';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function print(html) { out.insertAdjacentHTML('beforeend', html + '\n'); out.scrollTop = out.scrollHeight; }
  function a(href, txt, ext) { return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a>'; }
  function go(id) { var s = document.getElementById(id); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  function m(t) { if (window.Mascote) window.Mascote.say(t); }

  /* ---------- abertura animada ---------- */
  var INTRO = [
    ['$ ', 'kubectl get pods -n atlas'],
    ['', '<span class="d">NAME              READY   STATUS</span>', 1],
    ['', 'atlas-api-7f9c    <span class="g">1/1     Running</span>', 1],
    ['', 'atlas-worker-2b   <span class="g">1/1     Running</span>', 1],
    ['$ ', 'atlas alerts --today'],
    ['<span class="g">✔</span> ', '<span class="v">5.214</span> alertas processados', 1],
    ['<span class="g">✔</span> ', '<span class="v">38</span> incidentes correlacionados', 1],
    ['<span class="y">⚡</span> ', 'diagnóstico A.I.D.A. em <span class="v">1m52s</span>', 1],
    ['$ ', 'toil --remove'],
    ['<span class="k">→</span> ', '<span class="k">automação aplicada.</span>', 1]
  ];
  var HINT = '\n<span class="d">Este terminal funciona de verdade. Digite</span> <span class="k">help</span> <span class="d">ou clique num comando abaixo.</span>';
  var introDone = false, timers = [], buf = '';
  function line(l) { return (l[0] === '$ ' ? PR : l[0]) + l[1]; }
  function draw(partial) { out.innerHTML = buf + (partial || '') + (introDone ? '' : '<span class="car"></span>'); out.scrollTop = out.scrollHeight; }
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function finishIntro() {
    if (introDone) return;
    introDone = true; timers.forEach(clearTimeout); timers = [];
    buf = INTRO.map(line).join('\n') + '\n' + HINT + '\n';
    out.innerHTML = buf; out.scrollTop = out.scrollHeight;
    out.setAttribute('aria-live', 'polite');
  }
  function intro() {
    if (reduce) { finishIntro(); return; }
    var li = 0;
    (function nx() {
      if (introDone) return;
      if (li >= INTRO.length) { later(finishIntro, 500); return; }
      var l = INTRO[li++];
      if (l[2]) { later(function () { buf += line(l) + '\n'; draw(); nx(); }, 260); return; }
      var s = l[1], i = 0;
      (function ty() {
        if (introDone) return;
        draw(PR + s.slice(0, i));
        if (i++ < s.length) later(ty, 34 + Math.random() * 36);
        else { buf += PR + s + '\n'; later(nx, 320); }
      })();
    })();
  }

  /* ---------- comandos ---------- */
  var CMDS = {
    help: function () {
      return '<span class="v">comandos disponíveis</span>\n' + [
        ['whoami', 'quem sou eu'], ['projetos', 'o que eu coloquei em produção'], ['stack', 'ferramentas do dia a dia'],
        ['carreira', 'a jornada, nível por nível'], ['contato', 'bora conversar'], ['curriculo', 'baixar meu currículo (PDF)'],
        ['plantao', 'jogar o minigame do NOC'], ['neofetch', 'info do sistema'], ['mascote', 'mostrar/esconder o mini-Erickson'], ['clear', 'limpar a tela']
      ].map(function (c) { return '  <span class="k">' + (c[0] + '            ').slice(0, 11) + '</span> ' + c[1]; }).join('\n') +
        '\n<span class="d">dica: tem comandos escondidos. ↑↓ navega no histórico, Tab completa.</span>';
    },
    whoami: function () {
      return '<span class="v">Erickson Queiroz</span> — Analista de Aplicação e Infraestrutura\nDevOps · SRE · AIOps · São Miguel/RN\n+5 anos em TI. Transformo trabalho manual em automação\nobservável, com Python, Docker, Kubernetes e IA local.';
    },
    projetos: function () {
      setTimeout(function () { go('projetos'); }, 900);
      return [
        ['Atlas', 'AIOps interno: 5 mil alertas/dia, −60% no tempo de chamado', 'https://github.com/Erickson45/Atlas-Zabbix'],
        ['SRE-Copilot', 'webhooks do Zabbix + RAG + LLM local', 'https://github.com/Erickson45/sre-copilot'],
        ['Nativy', 'tradução simultânea em vídeo, IA 100% local', 'https://github.com/Erickson45/nativy'],
        ['RPG IA', 'RPG em pixel art pra aprender IA, open source', 'https://github.com/Erickson45/RPG-IA'],
        ['PC Estribado', 'manutenção do Windows numa janela só, open source', 'https://github.com/Erickson45/pc-estribado'],
        ['Relatórios', '1.000 sites 4G/5G, −20 h/mês de trabalho manual', '']
      ].map(function (p) { return '<span class="g">▸</span> ' + (p[2] ? a(p[2], p[0], 1) : '<span class="k">' + p[0] + '</span>') + ' <span class="d">— ' + p[1] + '</span>'; }).join('\n') +
        '\n<span class="d">rolando até os projetos…</span>';
    },
    stack: function () {
      return [['devops', 'Linux · Docker · Kubernetes/Rancher · Nginx · GitHub Actions'], ['observab.', 'Zabbix · Grafana · gestão de incidentes · MTTR · SLA'],
        ['ia/aiops', 'Ollama · RAG · Whisper · busca semântica'], ['backend', 'Python · Flask · FastAPI · PostgreSQL · Redis'],
        ['mensageria', 'RabbitMQ · Celery · WebSockets · webhooks'], ['integração', 'Microsoft Graph · Teams · Azure AD · Power Automate']]
        .map(function (s) { return '<span class="k">' + (s[0] + '          ').slice(0, 11) + '</span>' + s[1]; }).join('\n');
    },
    carreira: function () {
      setTimeout(function () { go('carreira'); }, 900);
      return ['Nv.1 Suporte de Redes · Brisanet', 'Nv.2 Técnico de TI · Telecardio', 'Nv.3 Suporte (estágio) · DBcorp', 'Nv.4 Analista de Suporte · Tivit',
        'Nv.5 Analista de NOC · MDsystems', 'Nv.6 Analista de Telecom · Brisanet', 'Nv.7 Técnico de Infra · Softplan', '<span class="v">Nv.8 Analista de Aplicação e Infra · Softplan ★</span>']
        .map(function (l) { return '<span class="g">▸</span> ' + l; }).join('\n');
    },
    contato: function () {
      return '<span class="k">email   </span> ' + a('mailto:erickson.queiroz65@gmail.com', 'erickson.queiroz65@gmail.com') +
        '\n<span class="k">linkedin</span> ' + a('https://www.linkedin.com/in/erickson-queiroz/', 'linkedin.com/in/erickson-queiroz', 1) +
        '\n<span class="k">github  </span> ' + a('https://github.com/Erickson45', 'github.com/Erickson45', 1);
    },
    curriculo: function () {
      fetch(CV, { method: 'HEAD' }).then(function (r) {
        if (!r.ok) throw 0;
        var l = document.createElement('a'); l.href = CV; l.download = CV; document.body.appendChild(l); l.click(); l.remove();
        print('<span class="g">✔</span> download iniciado: ' + a(CV, CV));
      }).catch(function () {
        print('<span class="y">⚠</span> o PDF ainda não está publicado. Enquanto isso, a trajetória completa está no ' + a('https://www.linkedin.com/in/erickson-queiroz/', 'LinkedIn', 1) + '.');
      });
      return '<span class="d">buscando o currículo…</span>';
    },
    plantao: function () {
      go('plantao');
      setTimeout(function () { if (window.Plantao) window.Plantao.start(); }, reduce ? 50 : 900);
      return '<span class="y">⚠</span> pager tocando… <span class="d">abrindo o plantão.</span>';
    },
    neofetch: function () {
      var logo = ['███████  ██████ ', '██      ██    ██', '█████   ██    ██', '██      ██ ▄▄ ██', '███████  ██████ ', '             ▀▀ '];
      var info = ['<span class="k">erickson</span>@<span class="k">ops</span>', '<span class="d">────────────</span>',
        '<span class="k">OS</span>: Linux (de coração)', '<span class="k">Host</span>: São Miguel/RN · Brasil', '<span class="k">Uptime</span>: 5+ anos em TI',
        '<span class="k">Shell</span>: python3 + bash', '<span class="k">Pacotes</span>: docker, k8s, zabbix, grafana, ollama', '<span class="k">Alertas/dia</span>: 5–7 mil',
        '<span class="k">Chamados</span>: −60% no tempo de abertura', '<span class="k">Café</span>: ∞'];
      return '<span class="gt" style="line-height:1.15;display:inline-block">' + logo.join('\n') + '</span>\n' + info.join('\n') +
        '\n' + ['#F87171', '#FBBF24', '#34D399', '#22D3EE', '#60A5FA', '#8B5CF6'].map(function (c) { return '<span style="color:' + c + '">███</span>'; }).join('');
    },
    mascote: function () {
      if (!window.Mascote) return 'mascote não carregou.';
      return window.Mascote.toggle() ? 'mini-Erickson: <span class="g">on</span>' : 'mini-Erickson: <span class="d">off</span> (digite mascote de novo pra trazer ele de volta)';
    },
    ls: function () { return '<span class="k">projetos/</span>  <span class="k">segredos/</span>  sobre.txt  ' + CV; },
    date: function () { return new Date().toLocaleString('pt-BR'); },
    uptime: function () { return 'up 5+ anos · load average: 5214 alertas, 38 incidentes, 0 pânico'; },
    ping: function () { return 'PING erickson.queiroz65@gmail.com: resposta em <span class="g">&lt; 24h</span> ✔'; },
    history: function () { return hist.length ? hist.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }).join('\n') : '(vazio)'; },
    cafe: function () { m('Um cafezinho passado na hora, igual o de vó ☕'); return '☕ <span class="g">cafe.service</span>: active (running) desde 06:00'; },
    exit: function () { return 'Não dá pra sair do plantão. 😄 Mas dá pra me chamar: digite <span class="k">contato</span>'; },
    matrix: function () { var s = '', i, j, ch = 'アイウエオ01ZBXK8S'; for (i = 0; i < 6; i++) { for (j = 0; j < 34; j++) s += ch[Math.floor(Math.random() * ch.length)]; s += '\n'; } return '<span class="g">' + s + '</span><span class="d">acorda, Neo… o Zabbix tá chamando.</span>'; },
    konami: function () { if (window.Mascote) window.Mascote.party(); return '🎮 cheat ativado!'; }
  };
  var ALIAS = { ajuda: 'help', '?': 'help', sobre: 'whoami', 'cat sobre.txt': 'whoami', 'ls projetos': 'projetos', 'cd projetos': 'projetos', skills: 'stack',
    experiencia: 'carreira', cv: 'curriculo', 'currículo': 'curriculo', jogar: 'plantao', game: 'plantao', 'plantão': 'plantao', coffee: 'cafe', 'café': 'cafe', cls: 'clear', quit: 'exit' };
  var NAMES = Object.keys(CMDS).concat(['clear', 'sudo', 'kubectl get pods', 'echo']);

  var hist = [], hi = 0;
  function run(raw) {
    finishIntro();
    var cmd = raw.trim();
    print(PR + esc(cmd));
    if (!cmd) return;
    hist.push(cmd); if (hist.length > 50) hist.shift(); hi = hist.length;
    var low = cmd.toLowerCase().replace(/\s+/g, ' '), res;
    if (ALIAS[low]) low = ALIAS[low];
    if (low === 'clear') { out.innerHTML = ''; buf = ''; return; }
    if (CMDS[low]) res = CMDS[low]();
    else if (/^rm -r?f/.test(low) || /^sudo rm/.test(low)) { res = '<span class="rd">nope.</span> Aqui tem backup diário e SRE de plantão. 🛡️'; m('Ôxe! rm -rf não, pelo amor! 😱'); }
    else if (/^sudo( |$)/.test(low)) res = '[sudo] senha para visitante: ********\n<span class="g">acesso root concedido</span>… brincadeira 😄 mas tu ganhou um café virtual ☕';
    else if (/^echo /.test(low)) res = esc(cmd.slice(5));
    else if (/^kubectl get pods/.test(low)) res = '<span class="d">NAME                READY   STATUS    RESTARTS</span>\natlas-api-7f9c      <span class="g">1/1     Running</span>   0\natlas-worker-2b     <span class="g">1/1     Running</span>   0\naida-rag-5d1e       <span class="g">1/1     Running</span>   0\nmini-erickson-8bit  <span class="g">1/1     Running</span>   ∞';
    else if (/^kubectl/.test(low)) res = 'tenta: <span class="k">kubectl get pods</span>';
    else if (/^(cd|cat|ls) .*segredo/.test(low)) res = '<span class="rd">permissão negada.</span> mas o código Konami funciona… ↑↑↓↓←→←→BA';
    else if (/^(vim|nano|emacs)/.test(low)) res = 'abrindo editor… brincadeira, ninguém sai do vim. 😅';
    else if (/^(oi|ola|olá|eai|e ai|e aí|salve|fala)\b/.test(low)) { res = 'Ôxe, salve! 👋 Digite <span class="k">help</span> pra ver o que dá pra fazer.'; m('Eita, e aí! Tudo nos conformes? 👋'); }
    else res = 'comando não encontrado: <span class="rd">' + esc(cmd.split(' ')[0]) + '</span>. Digite <span class="k">help</span>.';
    if (res) print(res);
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; run(v); });
  inp.addEventListener('keydown', function (e) {
    if (!introDone) finishIntro();
    if (e.key === 'ArrowUp') { if (hi > 0) { hi--; inp.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hi < hist.length - 1) { hi++; inp.value = hist[hi]; } else { hi = hist.length; inp.value = ''; } e.preventDefault(); }
    else if (e.key === 'Tab') {
      var v = inp.value.toLowerCase(); if (!v) return;
      var opts = NAMES.filter(function (n) { return n.indexOf(v) === 0; });
      if (opts.length === 1) { inp.value = opts[0]; e.preventDefault(); }
      else if (opts.length > 1) { print(PR + esc(inp.value) + '\n' + opts.join('  ')); e.preventDefault(); }
    }
  });
  inp.addEventListener('focus', finishIntro);
  term.addEventListener('click', function (e) {
    if (e.target.closest('a') || String(getSelection()).length) return;
    inp.focus({ preventScroll: true });
  });
  document.querySelectorAll('.qk [data-cmd]').forEach(function (b) {
    b.addEventListener('click', function () { run(b.getAttribute('data-cmd')); });
  });

  intro();
})();
