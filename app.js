(() => {
  'use strict';

  const content = window.ORACLE_CONTENT;
  const STORAGE_KEY = 'oraculo-mama-decks-v1';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  const elements = {
    welcome: document.querySelector('#welcome'),
    menu: document.querySelector('#menu'),
    result: document.querySelector('#result'),
    enter: document.querySelector('#enterButton'),
    orb: document.querySelector('#orbButton'),
    orbHint: document.querySelector('#orbHint'),
    menuMoon: document.querySelector('#menuMoon'),
    categoryButtons: [...document.querySelectorAll('[data-category]')],
    back: document.querySelector('#backButton'),
    menuButton: document.querySelector('#menuButton'),
    again: document.querySelector('#againButton'),
    stage: document.querySelector('#revealStage'),
    mysteryCard: document.querySelector('#mysteryCard'),
    messageCard: document.querySelector('#messageCard'),
    eyebrow: document.querySelector('#resultEyebrow'),
    label: document.querySelector('#messageLabel'),
    title: document.querySelector('#result-title'),
    text: document.querySelector('#messageText'),
    signature: document.querySelector('#messageSignature'),
    miniGame: document.querySelector('#miniGame'),
    stars: document.querySelector('#stars'),
    sparks: document.querySelector('#sparkLayer'),
    toast: document.querySelector('#toast')
  };

  let activeCategory = null;
  let orbTaps = 0;
  let toastTimer = null;
  let fallbackDecks = {};
  let storageAvailable = true;

  function safeStorageGet() {
    if (!storageAvailable) return fallbackDecks;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        fallbackDecks = saved;
        return saved;
      }
      return fallbackDecks;
    } catch (error) {
      storageAvailable = false;
      return fallbackDecks;
    }
  }

  function safeStorageSet(value) {
    fallbackDecks = value;
    if (!storageAvailable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      // El oráculo funciona aunque el navegador bloquee el almacenamiento local.
      storageAvailable = false;
    }
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Usa una "bolsa" barajada: no repite hasta haber recorrido toda la categoría.
  function nextMessage(category) {
    const messages = content[category].messages;
    const saved = safeStorageGet();
    let deck = Array.isArray(saved[category]) ? saved[category] : [];

    const validDeck = deck.filter((index) => Number.isInteger(index) && index >= 0 && index < messages.length);
    deck = validDeck.length ? validDeck : shuffle(messages.map((_, index) => index));

    const index = deck.pop();
    saved[category] = deck;
    safeStorageSet(saved);

    // El hallazgo extraordinario es escaso, pero jamás sustituye la variedad normal.
    if (Math.random() < 0.045) return content[category].special;
    return messages[index];
  }

  function makeStars() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 54; i += 1) {
      const star = document.createElement('i');
      const size = 1 + Math.random() * 3;
      star.style.setProperty('--x', `${Math.random() * 100}%`);
      star.style.setProperty('--y', `${Math.random() * 100}%`);
      star.style.setProperty('--s', `${size}px`);
      star.style.setProperty('--d', `${Math.random() * 5}s`);
      star.style.setProperty('--delay', `${-Math.random() * 5}s`);
      fragment.appendChild(star);
    }
    elements.stars.appendChild(fragment);
  }

  function createSpark(x, y, amount = 7) {
    if (REDUCED_MOTION.matches) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < amount; i += 1) {
      const spark = document.createElement('span');
      const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.45;
      const distance = 24 + Math.random() * 42;
      spark.className = 'touch-spark';
      spark.style.setProperty('--x', `${x}px`);
      spark.style.setProperty('--y', `${y}px`);
      spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--delay', `${Math.random() * 80}ms`);
      fragment.appendChild(spark);
      window.setTimeout(() => spark.remove(), 850);
    }
    elements.sparks.appendChild(fragment);
  }

  function showScreen(name, focusTarget) {
    const selected = elements[name];
    [elements.welcome, elements.menu, elements.result].forEach((screen) => {
      const active = screen === selected;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });

    if (focusTarget) window.setTimeout(() => focusTarget.focus(), 80);
  }

  function showToast(text) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = text;
    elements.toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 4400);
  }

  function showMenu() {
    elements.stage.classList.remove('is-revealing', 'is-luck', 'is-surprise', 'is-challenge');
    showScreen('menu', elements.categoryButtons[0]);
  }

  function categoryPresentation(category) {
    const presentations = {
      luck: { label: 'Tu señal de suerte', signature: '— Las estrellas lo dicen con una sonrisita' },
      surprise: { label: 'El cofre se abrió', signature: '— Sorpresa enviada desde algún rincón del cielo' },
      challenge: { label: 'Tu misión amable', signature: '— El universo confía en ti' }
    };
    return presentations[category];
  }

  function addMiniGame(type) {
    elements.miniGame.replaceChildren();
    elements.miniGame.hidden = true;
    if (type !== 'star-pick') return;

    elements.miniGame.hidden = false;
    const prompt = document.createElement('p');
    prompt.textContent = 'Elige una estrella:';
    const choices = document.createElement('div');
    choices.className = 'star-choices';
    const prizes = [
      'Mini premio: una canción que te haga cantar.',
      'Mini premio: cinco minutos de descanso real.',
      'Mini premio: un abrazo que puedes cobrar cuando quieras.'
    ];

    ['✦', '✧', '✦'].forEach((symbol, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'star-choice';
      button.textContent = symbol;
      button.setAttribute('aria-label', `Elegir estrella ${index + 1}`);
      button.addEventListener('click', () => {
        choices.querySelectorAll('button').forEach((item) => { item.disabled = true; });
        button.classList.add('is-picked');
        const answer = document.createElement('p');
        answer.className = 'game-answer';
        answer.textContent = prizes[index];
        elements.miniGame.appendChild(answer);
        const box = button.getBoundingClientRect();
        createSpark(box.left + box.width / 2, box.top + box.height / 2, 10);
      }, { once: true });
      choices.appendChild(button);
    });

    elements.miniGame.append(prompt, choices);
  }

  function showResult(category) {
    activeCategory = category;
    const entry = nextMessage(category);
    const presentation = categoryPresentation(category);
    const details = content[category];

    elements.eyebrow.textContent = details.lead;
    elements.label.textContent = entry.rare ? '✦ Mensaje extraordinario' : presentation.label;
    elements.title.textContent = entry.rare ? 'Una señal especial' : details.label;
    elements.text.textContent = entry.text;
    elements.signature.textContent = presentation.signature;
    addMiniGame(entry.game);

    elements.stage.classList.remove('is-revealing', 'is-luck', 'is-surprise', 'is-challenge');
    void elements.stage.offsetWidth;
    elements.stage.classList.add('is-revealing', `is-${category}`);

    showScreen('result');
    window.setTimeout(() => elements.messageCard.focus({ preventScroll: true }), REDUCED_MOTION.matches ? 20 : 650);

    if (entry.rare) {
      const rect = elements.messageCard.getBoundingClientRect();
      createSpark(rect.left + rect.width / 2, rect.top + 80, 18);
    }
  }

  function resetToWelcome() {
    showScreen('welcome', elements.enter);
  }

  function moonSecret() {
    const secret = content.secrets[Math.floor(Math.random() * content.secrets.length)];
    showToast(secret);
    const rect = elements.menuMoon.getBoundingClientRect();
    createSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
  }

  elements.enter.addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    createSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    showMenu();
  });

  elements.orb.addEventListener('click', (event) => {
    orbTaps += 1;
    const rect = event.currentTarget.getBoundingClientRect();
    createSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    if (orbTaps === 3) elements.orbHint.textContent = 'La esfera está guardando un secreto...';
    if (orbTaps >= 7) {
      elements.orbHint.textContent = '¡Secreto de luna desbloqueado!';
      showToast(content.secrets[0]);
      orbTaps = 0;
    }
  });

  elements.menuMoon.addEventListener('click', moonSecret);
  elements.categoryButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      createSpark(rect.right - 30, rect.top + rect.height / 2, 8);
      showResult(button.dataset.category);
    });
  });
  elements.back.addEventListener('click', showMenu);
  elements.menuButton.addEventListener('click', showMenu);
  elements.again.addEventListener('click', () => {
    if (activeCategory) showResult(activeCategory);
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button, a, input, textarea, select')) return;
    createSpark(event.clientX, event.clientY, 4);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.result.hidden) showMenu();
  });

  makeStars();
  // Evita que una pantalla rota deje a la persona sin salida: vuelve al inicio ante errores no previstos.
  window.addEventListener('error', () => {
    if (elements.welcome.hidden && elements.menu.hidden && elements.result.hidden) resetToWelcome();
  });
})();
