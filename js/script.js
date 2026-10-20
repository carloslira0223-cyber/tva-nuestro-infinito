(() => {
  "use strict";
  const config = window.INFINITO_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const scenes = $$('[data-scene]');
  const sceneNames = ['Sistema TVA', 'La agente', 'La anomalía más bonita', 'Nuestros recuerdos', 'Las seis gemas', 'La revelación', 'La carta', 'La próxima misión', 'Poscréditos'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visited = new Set();
  let current = 0;
  let bootTimer;
  let bootFinished = false;
  let lastDialogTrigger = null;
  let toastTimer;
  let soundEnabled = false;
  let audioContext;
  let music = null;
  let musicFailed = false;
  const icons = () => window.lucide?.createIcons();
  const unlocked = () => config.gems.every(gem => visited.has(gem.id));
  const gemTitle = gem => `Gema ${['realidad', 'mente'].includes(gem.id) ? 'de la' : 'del'} ${gem.name}`;
  const personalize = value => String(value).replace(/\{(name|wife|playful)\}/g, (_, key) => ({ name: config.name, wife: config.nicknames.wife, playful: config.nicknames.playful })[key]);

  try {
    const saved = JSON.parse(localStorage.getItem(config.storageKey) || '[]');
    if (Array.isArray(saved)) saved.forEach(id => {
      if (config.gems.some(gem => gem.id === id)) visited.add(id);
    });
  } catch { /* The experience remains usable when browser storage is unavailable. */ }

  function text(tag, content, className) {
    const element = document.createElement(tag);
    element.textContent = content;
    if (className) element.className = className;
    return element;
  }

  function icon(name) {
    const element = document.createElement('i');
    element.dataset.lucide = name;
    element.setAttribute('aria-hidden', 'true');
    return element;
  }

  function placeholder() {
    const el = document.createElement('div');
    el.className = 'photo-placeholder';
    const infinity = text('span', '∞', 'placeholder-infinity');
    infinity.setAttribute('aria-hidden', 'true');
    el.append(infinity, text('span', 'ARCHIVO PENDIENTE', 'placeholder-label'), text('span', 'Un lugar reservado para nosotros.', 'placeholder-sub'));
    return el;
  }

  function photo(key, alt, className = 'photo-slot') {
    const slot = document.createElement('div');
    slot.className = className;
    fillPhoto(slot, config.photos[key], alt);
    return slot;
  }

  function fillPhoto(slot, src, alt) {
    slot.replaceChildren(placeholder());
    if (!src) return;
    const image = new Image();
    image.alt = alt || config.mainPhotoAlt;
    image.decoding = 'async';
    image.loading = 'lazy';
    image.addEventListener('load', () => {
      const fallback = $('.photo-placeholder', slot);
      if (fallback) fallback.remove();
    }, { once: true });
    image.addEventListener('error', () => {
      image.remove();
      if (!$('.photo-placeholder', slot)) slot.append(placeholder());
    }, { once: true });
    slot.append(image);
    image.src = src;
  }

  // Original faceted crystal artwork. No canvas, WebGL or remote assets required.
  function gemArt(gem, index = 0) {
    const art = document.createElement('div');
    art.className = 'gem-art';
    art.style.setProperty('--gem', gem.color);
    art.style.setProperty('--delay', `${index * -.7}s`);
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" fill="none">
      <path d="M31 9 67 5 91 44 77 108 46 135 12 94 8 40Z" fill="currentColor"/>
      <path d="m31 9 8 36 28-40Z" fill="#fff" opacity=".62"/>
      <path d="m67 5-6 51 30-12Z" fill="#fff" opacity=".26"/>
      <path d="M31 9 8 40l31 5Z" fill="#fff" opacity=".2"/>
      <path d="m8 40 4 54 27-49Z" fill="#080e1e" opacity=".32"/>
      <path d="m39 45 22 11 6-51Z" fill="#fff" opacity=".4"/>
      <path d="m39 45-12 48 34-37Z" fill="#fff" opacity=".17"/>
      <path d="m61 56 16 52 14-64Z" fill="#080e1e" opacity=".45"/>
      <path d="m61 56-6 43 22 9Z" fill="#080e1e" opacity=".15"/>
      <path d="m27 93 28 6 6-43Z" fill="#fff" opacity=".46"/>
      <path d="m12 94 34 41-19-42Z" fill="#080e1e" opacity=".55"/>
      <path d="m27 93 19 42 9-36Z" fill="#fff" opacity=".2"/>
      <path d="m55 99-9 36 31-27Z" fill="#080e1e" opacity=".3"/>
      <path d="m31 9 8 36 22 11 30-12M12 94l15-1 28 6 22 9M39 45 27 93M61 56l-6 43" stroke="#fff" stroke-width=".65" opacity=".45"/>
      <path d="m31 9 36-4 24 39-14 64-31 27-34-41-4-54Z" stroke="#fff" stroke-opacity=".4"/>
      <path d="M35 25v14m-7-7h14" stroke="#fff" stroke-width="1.4" opacity=".95"/>
    </svg><span class="gem-particle"></span>`;
    art.style.color = gem.color;
    return art;
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3800);
  }

  function renderPersonalContent() {
    $('#agentName').textContent = config.name;
    $('#mainQuote').textContent = config.mainQuote;
    $('#specialDate').textContent = config.specialDate;
    $('.terminal-topline>span:last-child').textContent = config.dateCode;
    $('#letterGreeting').textContent = personalize(config.letter.greeting);
    $('#letterBody').replaceChildren(...config.letter.paragraphs.map(p => text('p', personalize(p))));
    $('#letterSignature').textContent = config.letter.signature;
    $('#anniversaryTitle').textContent = personalize(config.letter.celebration).toUpperCase();
    $('#closingMessage').textContent = config.letter.closing;
    $('#anomalyNarrative').replaceChildren(...config.anomalyNarrative.map(p => text('p', p, 'reveal-paragraph')));
    $('#missionSteps').replaceChildren(...config.missionSteps.map(p => text('li', p)));
    $('#creditsOpening').textContent = config.postcredits.opening;
    // Preserve the editorial line breaks for the default title; custom titles wrap naturally.
    if (config.postcredits.title !== 'Las aventuras de mi niña hermosa y su esposito') $('#credits-title').textContent = config.postcredits.title;
    $('.credits-next').textContent = config.postcredits.next;
    $('.credits-quote').textContent = `“${config.postcredits.quote}”`;
    $$('[data-photo]').forEach(slot => fillPhoto(slot, config.photos[slot.dataset.photo], config.mainPhotoAlt));
  }

  function renderMemories() {
    $('#memoryCount').textContent = `${String(config.memories.length).padStart(2, '0')} ARCHIVOS`;
    config.memories.forEach((memory, index) => {
      const card = document.createElement('button');
      card.className = 'memory-card';
      card.setAttribute('aria-label', `Abrir recuerdo: ${memory.title}`);
      const heading = document.createElement('div');
      heading.className = 'memory-card-heading';
      heading.append(text('h3', memory.title), icon('arrow-up-right'));
      card.append(text('span', `EVIDENCIA ${String(index + 1).padStart(3, '0')}`, 'memory-number'), photo(memory.id, memory.alt), heading, text('p', memory.date || 'ARCHIVO PERSONAL / SIN FECHA', 'memory-date'));
      card.addEventListener('click', () => {
        $('#archiveVisual').replaceChildren(photo(memory.id, memory.alt));
        $('#archiveLabel').textContent = `EVIDENCIA ${String(index + 1).padStart(3, '0')}${memory.date ? ` / ${memory.date}` : ''}`;
        $('#archiveTitle').textContent = memory.title;
        $('#archiveText').textContent = memory.note;
        $('#archiveStamp').textContent = 'TVA / RECUERDO PROTEGIDO';
        $('#archiveBack').firstChild.textContent = 'Volver a los recuerdos ';
        openDialog('archiveDialog', card);
      });
      $('#memoryGrid').append(card);
    });
  }

  function renderGems() {
    config.gems.forEach((gem, index) => {
      const button = document.createElement('button');
      button.className = 'gem-button';
      button.dataset.gem = gem.id;
      button.style.setProperty('--gem', gem.color);
      const read = text('span', '', 'gem-read');
      read.setAttribute('aria-hidden', 'true');
      button.append(text('span', `0${index + 1} / ∞`, 'gem-serial'), read, gemArt(gem, index), text('h3', gem.name), text('p', gem.meaning));
      button.addEventListener('click', () => {
        $('#archiveVisual').replaceChildren(gemArt(gem));
        if (gem.photo) {
          const slot = document.createElement('div');
          slot.className = 'photo-slot gem-photo';
          fillPhoto(slot, gem.photo, gem.photoAlt || config.mainPhotoAlt);
          $('#archiveVisual').append(slot);
        }
        $('#archiveLabel').textContent = `GEMA ${String(index + 1).padStart(2, '0')} / ${gem.meaning}`;
        $('#archiveTitle').textContent = gemTitle(gem);
        $('#archiveText').textContent = personalize(gem.dedication);
        $('#archiveStamp').textContent = 'TVA / EXPEDIENTE DIGITAL EXPLORADO';
        $('#archiveBack').firstChild.textContent = 'Volver a las gemas ';
        visited.add(gem.id);
        try { localStorage.setItem(config.storageKey, JSON.stringify([...visited])); } catch { /* Optional persistence. */ }
        updateProgress();
        openDialog('archiveDialog', button);
        tone(440 + index * 70, .14);
      });
      $('#gemGrid').append(button);
      const dot = text('span', '', 'gem-dot');
      dot.dataset.gemDot = gem.id;
      dot.style.setProperty('--gem', gem.color);
      $('#gemDots').append(dot);
    });
  }

  function updateProgress() {
    config.gems.forEach(gem => {
      const isRead = visited.has(gem.id);
      const button = $(`[data-gem="${gem.id}"]`);
      button.setAttribute('aria-label', `Abrir ${gemTitle(gem).toLowerCase()}${isRead ? ', expediente explorado' : ''}`);
      $('.gem-read', button).replaceChildren(...(isRead ? [icon('check')] : []));
      $(`[data-gem-dot="${gem.id}"]`).classList.toggle('visited', isRead);
    });
    $('#gemProgress').textContent = `${visited.size} de ${config.gems.length} expedientes explorados`;
    $('#revealButton').disabled = !unlocked();
    $('#revealButton').replaceChildren(icon(unlocked() ? 'sparkles' : 'lock-keyhole'), document.createTextNode(unlocked() ? ' Revelar nuestra anomalía' : ' Revelar la anomalía'));
    $('#discoveryStatus').textContent = unlocked() ? 'CONEXIÓN CONFIRMADA. El archivo final está listo para ti.' : 'El archivo final espera a que conozcas las seis gemas.';
    $('#discoveryStatus').classList.toggle('complete', unlocked());
    renderMenu();
    icons();
  }

  function renderMenu() {
    $('#sceneNav').replaceChildren(...sceneNames.map((name, index) => {
      const button = document.createElement('button');
      button.dataset.go = String(index);
      button.append(text('span', String(index + 1).padStart(2, '0')), document.createTextNode(name));
      if (index >= 5 && !unlocked()) button.append(icon('lock-keyhole'));
      if (index === current) button.setAttribute('aria-current', 'step');
      return button;
    }));
  }

  function openDialog(id, trigger) {
    lastDialogTrigger = trigger;
    const dialog = $(`#${id}`);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (id === 'journeyMenu') $('#menuToggle').setAttribute('aria-expanded', 'true');
  }

  function closeDialog(id) { $(`#${id}`).close(); }

  function go(index, { historyMode = 'push', focus = true, playIntro = false } = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= scenes.length) index = 0;
    if (index >= 5 && !unlocked()) {
      index = 4;
      toast('El desenlace se abre al explorar las seis gemas.');
    }
    $$('dialog[open]').forEach(dialog => dialog.close());
    clearTimeout(bootTimer);
    if (!playIntro || index !== 0 || bootFinished) finishBoot();
    current = index;
    scenes.forEach((scene, i) => { scene.hidden = index !== i; });
    $('#sceneName').textContent = sceneNames[index].toUpperCase();
    $('#sceneCount').textContent = `${String(index + 1).padStart(2, '0')} / 09`;
    $('#journeyFill').style.width = `${(index + 1) / scenes.length * 100}%`;
    const hash = `#${scenes[index].id}`;
    try {
      if (historyMode === 'push' && location.hash !== hash) history.pushState(null, '', hash);
      if (historyMode === 'replace') history.replaceState(null, '', hash);
    } catch { /* Some file viewers restrict history. Navigation still works. */ }
    window.scrollTo({ top: 0, behavior: 'instant' });
    renderMenu();
    icons();
    if (focus) {
      const title = $('h1,h2', scenes[index]);
      if (title && !title.closest('[hidden]')) title.focus({ preventScroll: true });
    }
    observeNarrative();
  }

  function finishBoot() {
    bootFinished = true;
    clearTimeout(bootTimer);
    $('#boot').hidden = true;
    $('#welcome').hidden = false;
    $('#skipIntro').hidden = true;
  }

  function startBoot() {
    if (reducedMotion.matches) return finishBoot();
    const lines = ['INICIANDO SISTEMA TVA', 'VERIFICANDO LÍNEAS TEMPORALES', 'ANALIZANDO ANOMALÍAS', 'ADVERTENCIA: ANOMALÍA DETECTADA'];
    $('#terminalLines').replaceChildren();
    let lineIndex = 0;
    let character = 0;
    let line = text('p', '▌');
    $('#terminalLines').append(line);
    function type() {
      if (current !== 0 || bootFinished) return;
      character++;
      line.textContent = lines[lineIndex].slice(0, character) + ' ▌';
      $('#bootProgress').style.width = `${(lineIndex + character / lines[lineIndex].length) / lines.length * 100}%`;
      if (character < lines[lineIndex].length) {
        bootTimer = setTimeout(type, 24);
      } else {
        line.textContent = lines[lineIndex];
        lineIndex++;
        if (lineIndex === lines.length) {
          bootTimer = setTimeout(finishBoot, 850);
        } else {
          line = text('p', '▌');
          $('#terminalLines').append(line);
          character = 0;
          bootTimer = setTimeout(type, 280);
        }
      }
    }
    bootTimer = setTimeout(type, 250);
  }

  let narrativeObserver;
  function observeNarrative() {
    narrativeObserver?.disconnect();
    if (current !== 2) return;
    const paragraphs = $$('.reveal-paragraph');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      paragraphs.forEach(p => p.classList.add('visible'));
      return;
    }
    narrativeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          narrativeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .2 });
    paragraphs.forEach(p => narrativeObserver.observe(p));
  }

  function tone(frequency = 420, duration = .06) {
    if (!soundEnabled || !config.audio.effects || !audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.035, audioContext.currentTime + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  function updateSoundButton() {
    $('#soundToggle').setAttribute('aria-pressed', String(soundEnabled));
    const label = soundEnabled ? 'Desactivar sonido' : 'Activar sonido';
    $('#soundToggle').setAttribute('aria-label', label);
    $('#soundToggle').title = label;
    $('#soundToggle').replaceChildren(icon(soundEnabled ? 'volume-2' : 'volume-x'));
    icons();
  }

  async function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass && config.audio.effects) {
          audioContext ||= new AudioContextClass();
          await audioContext.resume();
        }
        if (config.audio.src && !musicFailed) {
          if (!music) {
            music = new Audio(config.audio.src);
            music.loop = true;
            music.volume = Math.max(0, Math.min(1, config.audio.volume ?? .24));
            music.addEventListener('error', () => { musicFailed = true; toast('La música no está disponible. Puedes seguir disfrutando la historia.'); });
          }
          if (soundEnabled) await music.play();
        }
        tone(560, .16);
        if (soundEnabled) toast(config.audio.src && !musicFailed ? 'Sonido activado' : 'Efectos suaves activados');
      } catch {
        toast('El audio no está disponible en este navegador. La historia continúa.');
      }
    } else {
      music?.pause();
      if (audioContext?.state === 'running') await audioContext.suspend();
    }
    updateSoundButton();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.id !== 'soundToggle' && !button.dataset.gem) tone();
    if (button.dataset.go !== undefined) go(Number(button.dataset.go));
    if (button.dataset.close) closeDialog(button.dataset.close);
  });
  $('#skipIntro').addEventListener('click', () => go(1));
  $('#menuToggle').addEventListener('click', () => openDialog('journeyMenu', $('#menuToggle')));
  $('#soundToggle').addEventListener('click', toggleSound);
  $('#missionToggle').addEventListener('click', () => {
    const instructions = $('#missionInstructions');
    instructions.hidden = !instructions.hidden;
    $('#missionToggle').setAttribute('aria-expanded', String(!instructions.hidden));
    $('#missionToggle').replaceChildren(document.createTextNode(instructions.hidden ? 'Ver instrucciones de mi próxima misión ' : 'Guardar las instrucciones '), icon(instructions.hidden ? 'arrow-down' : 'arrow-up'));
    icons();
    if (!instructions.hidden) instructions.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog.id === 'journeyMenu') $('#menuToggle').setAttribute('aria-expanded', 'false');
      if (lastDialogTrigger?.isConnected && !lastDialogTrigger.closest('[hidden]')) lastDialogTrigger.focus({ preventScroll: true });
    });
  });
  window.addEventListener('popstate', () => {
    const index = scenes.findIndex(scene => `#${scene.id}` === location.hash);
    go(Math.max(0, index), { historyMode: 'replace' });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music?.pause();
    else if (soundEnabled && music && !musicFailed) music.play().catch(() => {});
  });

  renderPersonalContent();
  renderMemories();
  renderGems();
  updateProgress();
  const initial = scenes.findIndex(scene => `#${scene.id}` === location.hash);
  go(Math.max(0, initial), { historyMode: 'replace', focus: false, playIntro: true });
  if (current === 0 && !bootFinished) startBoot();
  icons();
})();
