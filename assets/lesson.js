// Interactions for the rebuilt DesignPlus samples.
(function () {
  const norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');

  // Tooltips: hover/focus via CSS; tap toggles on touch screens.
  document.querySelectorAll('.tt > button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tt = btn.parentElement;
      const open = !tt.classList.contains('open');
      document.querySelectorAll('.tt.open').forEach(t => t.classList.remove('open'));
      tt.classList.toggle('open', open);
    });
    btn.addEventListener('keydown', e => { if (e.key === 'Escape') btn.parentElement.classList.remove('open'); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.tt')) document.querySelectorAll('.tt.open').forEach(t => t.classList.remove('open')); });

  // Fill-in-the-blank Quick Checks.
  document.querySelectorAll('.qc[data-type="fib"]').forEach(qc => {
    const inputs = [...qc.querySelectorAll('input[data-answer]')];
    const score = qc.querySelector('.score');
    qc.querySelector('[data-check]').addEventListener('click', () => {
      let right = 0;
      inputs.forEach(i => {
        const ok = i.dataset.answer.split('|').some(a => norm(a) === norm(i.value));
        i.classList.toggle('right', ok); i.classList.toggle('wrong', !ok);
        i.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (ok) right++;
      });
      score.textContent = right === inputs.length ? `¡Excelente! ${right} de ${inputs.length}.` : `${right} de ${inputs.length} correctas. Revisa las marcadas en rojo.`;
    });
    qc.querySelector('[data-show]').addEventListener('click', () => {
      inputs.forEach(i => { i.value = i.dataset.answer.split('|')[0]; i.classList.add('right'); i.classList.remove('wrong'); });
      score.textContent = 'Respuestas mostradas.';
    });
    qc.querySelector('[data-reset]').addEventListener('click', () => {
      inputs.forEach(i => { i.value = ''; i.classList.remove('right', 'wrong'); i.removeAttribute('aria-invalid'); });
      score.textContent = '';
    });
  });

  // Drag-the-words Quick Check: drag a word onto a blank, or tap a word then tap a blank.
  document.querySelectorAll('.qc[data-type="drag"]').forEach(qc => {
    const bank = qc.querySelector('.bank');
    const slots = [...qc.querySelectorAll('.slot')];
    const score = qc.querySelector('.score');
    const original = [...bank.querySelectorAll('.word')].map(w => w.textContent);
    let picked = null;

    const makeWord = text => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'word'; b.textContent = text; b.draggable = true;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (picked === b) { b.setAttribute('aria-pressed', 'false'); picked = null; return; }
        bank.querySelectorAll('.word').forEach(w => w.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true'); picked = b;
      });
      b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', text); picked = b; });
      return b;
    };
    const resetBank = () => { bank.innerHTML = ''; original.forEach(t => bank.appendChild(makeWord(t))); };
    resetBank();

    const place = (slot, word) => {
      if (slot.dataset.value) bank.appendChild(makeWord(slot.dataset.value));
      slot.dataset.value = word.textContent;
      slot.textContent = word.textContent;
      slot.classList.add('filled'); slot.classList.remove('right', 'wrong');
      slot.setAttribute('aria-label', 'Espacio: ' + word.textContent + '. Pulsa para devolver la palabra.');
      word.remove(); picked = null;
    };
    const clear = slot => {
      if (!slot.dataset.value) return;
      bank.appendChild(makeWord(slot.dataset.value));
      delete slot.dataset.value; slot.textContent = '';
      slot.classList.remove('filled', 'right', 'wrong');
      slot.setAttribute('aria-label', 'Espacio vacío');
    };
    slots.forEach(slot => {
      slot.setAttribute('aria-label', 'Espacio vacío');
      slot.addEventListener('click', () => { picked ? place(slot, picked) : clear(slot); });
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); if (picked) place(slot, picked); });
    });
    qc.querySelector('[data-check]').addEventListener('click', () => {
      let right = 0;
      slots.forEach(s => { const ok = s.dataset.value === s.dataset.answer; s.classList.toggle('right', ok); s.classList.toggle('wrong', !ok); if (ok) right++; });
      score.textContent = right === slots.length ? `¡Excelente! ${right} de ${slots.length}.` : `${right} de ${slots.length} correctas.`;
    });
    qc.querySelector('[data-reset]').addEventListener('click', () => { slots.forEach(s => { delete s.dataset.value; s.textContent = ''; s.className = 'slot'; s.setAttribute('aria-label', 'Espacio vacío'); }); resetBank(); score.textContent = ''; });
  });

  // Accordion.
  document.querySelectorAll('.acc-item > h3 > button').forEach(btn => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
    });
  });

  // Tabs.
  document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });
})();
