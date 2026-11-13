/* Carreira como progressão de RPG (barra de XP, níveis, LEVEL UP)
   e certificações como conquistas que desbloqueiam ao aparecer na tela. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = 'IntersectionObserver' in window;

  /* ---------- carreira ---------- */
  var tl = document.getElementById('tl'), tf = document.querySelector('.tf'), xp = document.getElementById('xp');
  if (tl && xp) {
    var items = [].slice.call(tl.querySelectorAll('li'));
    var xpn = document.getElementById('xpn'), xpt = document.getElementById('xpt'), xpf = document.getElementById('xpf'), xpp = document.getElementById('xpp');
    items.forEach(function (li, i) { li.querySelector('.yr').insertAdjacentHTML('beforeend', '<span class="lvl">Nv. ' + (i + 1) + '</span>'); });
    var lvl = -1, maxed = false;

    var setLevel = function (n, up) {
      var i = Math.max(n, 1) - 1;
      xpn.innerHTML = '<span><small>NV.</small>' + (i + 1) + '</span>';
      xpt.textContent = items[i].querySelector('h3').textContent;
      if (up && n > 1 && !reduce) {
        var f = document.createElement('span'); f.className = 'xpf';
        f.textContent = n === items.length ? 'LEVEL UP!' : '+XP';
        xp.appendChild(f); setTimeout(function () { f.remove(); }, 1700);
      }
      if (up && n === items.length && !maxed) {
        maxed = true; xp.classList.remove('up'); void xp.offsetWidth; xp.classList.add('up');
        if (window.Mascote) { window.Mascote.say('Eita, LEVEL UP! 🎉 Nível 8: Analista de Aplicação e Infraestrutura. Do sertão pro mundo!'); window.Mascote.jump(2); }
      }
    };

    var sc = function () {
      var r = tl.getBoundingClientRect(), mid = innerHeight * .6;
      var k = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
      tf.style.height = (k * (r.height - 16)) + 'px';
      var n = 0;
      items.forEach(function (li) { var on = li.getBoundingClientRect().top < mid; li.classList.toggle('lit', on); if (on) n++; });
      xpf.style.width = (k * 100).toFixed(1) + '%';
      xpp.textContent = Math.round(k * 100) + '% XP';
      if (n !== lvl) { var up = n > lvl && lvl >= 0; lvl = n; setLevel(n, up); }
    };
    var tk = false, onScroll = function () { if (tk) return; tk = true; requestAnimationFrame(function () { tk = false; sc(); }); };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    (window.quandoOcioso || function (f) { setTimeout(f, 1500); })(sc);
  }

  /* ---------- conquistas ---------- */
  var ce = document.getElementById('ce'), achn = document.getElementById('achn');
  if (ce && achn && IO && !reduce) {
    var cards = [].slice.call(ce.querySelectorAll('.card'));
    cards.forEach(function (c) { c.classList.add('lock'); });
    achn.textContent = '0';
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      cards.forEach(function (c, i) {
        setTimeout(function () {
          c.classList.remove('lock'); c.classList.add('unl'); achn.textContent = String(i + 1);
          if (i === cards.length - 1 && window.Mascote) window.Mascote.say('8/8 conquistas desbloqueadas! Bonito demais, rapaz! 🏆');
        }, 500 + i * 280);
      });
    }, { threshold: .3 });
    io.observe(ce);
  }
})();
