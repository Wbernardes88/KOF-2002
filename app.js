/* ═══════════════════════════════════════════════════════
   KOF 2002 — MOVE DATABASE
   Application Logic & Data
═══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────
   DATA
────────────────────────────────────────────────────── */

const DB = {
  characters: [
    {
      id: 'athena',
      name: 'Athena',
      fullName: 'Athena Asamiya',
      team: 'Psycho Soldiers',
      style: 'Psycho Power',
      tier: 'S',
      image: 'Imagens/Athena.png',
      avatarGradient: ['#8b1a6b', '#5a1080'],
      avatarText: 'A',
      tags: ['PSYCHO POWER', 'PROJECTILE', 'OVERHEAD'],
      categories: [
        {
          id: 'combos',
          name: 'Combos e Combos com Especiais',
          type: 'combo',
          description: 'Sequências de ataque e combos ligados a golpes especiais.',
          moves: [
            /* Exemplo de estrutura — será populado pelo usuário
            {
              id: 'c1',
              name: 'BnB Básico',
              inputs: ['⬇️', '↘️', '➡️', '+', 'A'],
              description: 'Meia lua para frente + botão A',
              notes: 'Funciona no canto'
            }
            */
          ]
        },
        {
          id: 'secrets',
          name: 'Secreto',
          type: 'secret',
          description: 'Movimentos secretos, técnicas avançadas e setups ocultos.',
          moves: []
        },
        {
          id: 'specials',
          name: 'Especiais',
          type: 'special',
          description: 'Golpes especiais, DMs e SDMs da personagem.',
          moves: []
        }
      ]
    },
    {
      id: 'kim',
      name: 'Kim',
      fullName: 'Kim Kaphwan',
      team: 'Corea Team',
      style: 'Flame Mastery',
      tier: 'S',
      image: 'Imagens/Kim.png',  // Opcional: imagem real. Se omitido, usa avatarGradient + avatarText
      avatarGradient: ['#d4641e', '#8b3f00'],
      avatarText: 'K',
      tags: ['FIRE', 'RUSHDOWN', 'OVERHEAD'],
      categories: [
        {
          id: 'combos',
          name: 'Combos e Combos com Especiais',
          type: 'combo',
          description: 'Sequências de ataque e combos ligados a golpes especiais.',
          moves: []
        },
        {
          id: 'secrets',
          name: 'Secreto',
          type: 'secret',
          description: 'Movimentos secretos, técnicas avançadas e setups ocultos.',
          moves: []
        },
        {
          id: 'specials',
          name: 'Especiais',
          type: 'special',
          description: 'Golpes especiais, DMs e SDMs da personagem.',
          moves: []
        }
      ]
    }

    /*
    ESTRUTURA PRONTA PARA EXPANSÃO:
    Para adicionar novos personagens, siga o padrão abaixo:

    {
      id: 'kim',
      name: 'Kyo',
      fullName: 'Kyo Kusanagi',
      team: 'Japan Team',
      style: 'Flame Mastery',
      tier: 'S',
      image: 'Imagens/Kyo.png',  // Opcional: imagem real. Se omitido, usa avatarGradient + avatarText
      avatarGradient: ['#d4641e', '#8b3f00'],
      avatarText: 'K',
      tags: ['FIRE', 'RUSHDOWN', 'OVERHEAD'],
      categories: [
        {
          id: 'combos',
          name: 'Combos e Combos com Especiais',
          type: 'combo',
          description: 'Sequências de ataque e combos ligados a golpes especiais.',
          moves: []
        },
        {
          id: 'secrets',
          name: 'Secreto',
          type: 'secret',
          description: 'Movimentos secretos, técnicas avançadas e setups ocultos.',
          moves: []
        },
        {
          id: 'specials',
          name: 'Especiais',
          type: 'special',
          description: 'Golpes especiais, DMs e SDMs da personagem.',
          moves: []
        }
      ]
    },
    */

   ]
};

/* ──────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────── */

const state = {
  currentView: 'characters',   // 'characters' | 'character-detail' | 'category-detail' | 'favorites' | 'settings'
  currentCharacter: null,       // character object
  currentCategory: null,        // category object
  searchQuery: '',
  editingMoveId: null,          // ID do movimento sendo editado (null = novo)
};

/* ──────────────────────────────────────────────────────
   INTRO ANIMATION
────────────────────────────────────────────────────── */

(function runIntro() {
  const intro      = document.getElementById('intro-screen');
  const progress   = document.querySelector('.loading-progress');
  const glow       = document.querySelector('.loading-glow');
  const pct        = document.getElementById('loading-pct');
  const DURATION   = 3800; // ms until auto-dismiss
  const DELAY_BTN  = 2600; // ms until "PRESS START" appears

  let start = null;

  function animateLoading(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const raw = Math.min(elapsed / (DURATION - 600), 1); // reach 100% slightly before dismiss
    const val = easeInOut(raw) * 100;

    progress.style.width = val + '%';
    glow.style.left = val + '%';
    pct.textContent = Math.floor(val) + '%';

    if (raw < 1) {
      requestAnimationFrame(animateLoading);
    }
  }

  requestAnimationFrame(animateLoading);

  // Wait for user action (Enter key or button click) — no auto-dismiss
  function onEnterKey(e) {
    if (e.key === 'Enter') {
      document.removeEventListener('keydown', onEnterKey);
      dismissIntro();
    }
  }
  document.addEventListener('keydown', onEnterKey);
})();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function skipIntro() {
  dismissIntro();
}

function dismissIntro() {
  const intro = document.getElementById('intro-screen');
  const app   = document.getElementById('app');

  // Force progress to 100%
  const progress = document.querySelector('.loading-progress');
  const glow     = document.querySelector('.loading-glow');
  const pct      = document.getElementById('loading-pct');
  if (progress) progress.style.width = '100%';
  if (glow) glow.style.left = '100%';
  if (pct) pct.textContent = '100%';

  // Short delay then transition
  setTimeout(() => {
    intro.classList.add('fade-out');
    app.classList.remove('app-hidden');
    app.classList.add('app-visible');

    // Render initial view
    setTimeout(() => {
      renderCharacterList();
    }, 200);

    // Fully remove intro after animation
    setTimeout(() => {
      intro.remove();
    }, 800);
  }, 200);
}

/* ──────────────────────────────────────────────────────
   NAVIGATION
────────────────────────────────────────────────────── */

function navigate(view, navElement) {
  // Update state
  state.currentView = view;

  // Update sidebar active state
  if (navElement) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    navElement.classList.add('active');
  }

  // Handle sidebar for sub-views
  if (view === 'characters' || view === 'favorites' || view === 'settings') {
    // Re-activate correct sidebar item
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.view === view) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  // Deactivate all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Activate target view
  const target = document.getElementById('view-' + view.replace('-', '-'));

  if (view === 'characters') {
    showView('view-characters');
  } else if (view === 'character-detail') {
    showView('view-character-detail');
  } else if (view === 'category-detail') {
    showView('view-category-detail');
  } else if (view === 'favorites') {
    showView('view-favorites');
  } else if (view === 'settings') {
    showView('view-settings');
  }
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    el.scrollTop = 0;
  }
}

function openCharacter(char) {
  state.currentCharacter = char;
  renderCharacterDetail(char);
  navigate('character-detail');
}

function openCategory(char, category) {
  state.currentCategory = category;
  renderCategoryDetail(char, category);
  navigate('category-detail');

  // Update back button
  const lbl = document.getElementById('back-char-label');
  if (lbl) lbl.textContent = char.name;
}

function backToCharacter() {
  if (state.currentCharacter) {
    renderCharacterDetail(state.currentCharacter);
    navigate('character-detail');
  } else {
    navigate('characters');
  }
}

/* ──────────────────────────────────────────────────────
   RENDER: CHARACTER LIST
────────────────────────────────────────────────────── */

function renderCharacterList(filter = '') {
  const container = document.getElementById('character-list');
  const countEl   = document.getElementById('roster-count');
  if (!container) return;

  const chars = DB.characters.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.team.toLowerCase().includes(filter.toLowerCase())
  );

  countEl.textContent = chars.length + (chars.length === 1 ? ' lutador' : ' lutadores');

  if (chars.length === 0) {
    container.innerHTML = `
      <div style="padding: 32px; text-align: center; color: var(--gray-600); font-family: var(--font-ui); font-size: 13px;">
        Nenhum personagem encontrado para "${filter}"
      </div>
    `;
    return;
  }

  container.innerHTML = chars.map(char => {
    const avatarContent = char.image
      ? `<img src="${char.image}" alt="${char.name}">`
      : `<div class="char-avatar-placeholder" style="background: linear-gradient(135deg, ${char.avatarGradient[0]}, ${char.avatarGradient[1]});">${char.avatarText}</div>`;

    return `
    <div class="char-card" onclick="openCharacter(DB.characters.find(c => c.id === '${char.id}'))">
      <div class="char-avatar">
        ${avatarContent}
      </div>

      <div class="char-info">
        <div class="char-name">${char.name.toUpperCase()}</div>
        <div class="char-team">${char.team}</div>
        <div class="char-tag">
          <span style="color: var(--red);">◆</span>
          ${char.style}
        </div>
      </div>

      <svg class="char-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  `;
  }).join('');

       container.innerHTML = chars.map(char => {
    const avatarContent = char.image
      ? `<img src="${char.image}" alt="${char.name}">`
      : `<div class="char-avatar-placeholder" style="background: linear-gradient(135deg, ${char.avatarGradient[0]}, ${char.avatarGradient[1]});">${char.avatarText}</div>`;

    return `
    <div class="char-card" onclick="openCharacter(DB.characters.find(c => c.id === '${char.id}'))">
      <div class="char-avatar">
        ${avatarContent}
      </div>

      <div class="char-info">
        <div class="char-name">${char.name.toUpperCase()}</div>
        <div class="char-team">${char.team}</div>
        <div class="char-tag">
          <span style="color: var(--red);">◆</span>
          ${char.style}
        </div>
      </div>

      <svg class="char-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  `;
  }).join('');

  // Add mouse flashlight to cards
  requestAnimationFrame(() => attachFlashlight('.char-card'));
}

function filterCharacters(query) {
  state.searchQuery = query;
  renderCharacterList(query);
}

/* ──────────────────────────────────────────────────────
   RENDER: CHARACTER DETAIL
────────────────────────────────────────────────────── */

function renderCharacterDetail(char) {
  const body = document.getElementById('character-detail-body');
  if (!body) return;

  const tierColor = { 'S': '#ffd700', 'A': '#e02020', 'B': '#00c8f0' };

  const heroAvatarContent = char.image
    ? `<img src="${char.image}" alt="${char.name}">`
    : `<div class="char-avatar-placeholder" style="background: linear-gradient(135deg, ${char.avatarGradient[0]}, ${char.avatarGradient[1]}); font-family: var(--font-display); font-size: 38px; font-weight: 900; color: rgba(255,255,255,0.9); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${char.avatarText}</div>`;

  body.innerHTML = `
    <!-- HERO -->
    <div class="char-hero">
      <div class="char-hero-avatar">
        ${heroAvatarContent}
      </div>

      <div class="char-hero-info">
        <div class="char-hero-name">${char.name.toUpperCase()}</div>
        <div class="char-hero-team">${char.team} · ${char.fullName}</div>
        <div class="char-hero-tags">
          <span class="hero-tag red">TIER ${char.tier}</span>
          ${char.tags.map((tag, i) => `
            <span class="hero-tag ${i === 0 ? 'red' : i === 1 ? 'cyan' : 'purple'}">${tag}</span>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div class="categories-label">SELECIONE UMA CATEGORIA</div>
    <div class="category-list">
      ${char.categories.map(cat => renderCategoryCard(char, cat)).join('')}
    </div>
  `;

  requestAnimationFrame(() => attachFlashlight('.cat-card'));
}

function renderCategoryCard(char, cat) {
  const icons = {
    combo:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>`,
    secret:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>`,
    special: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>`
  };

  const count = cat.moves.length;
  const countLabel = count === 0 ? 'Nenhum registrado' : `${count} ${count === 1 ? 'movimento' : 'movimentos'}`;

  return `
    <div class="cat-card" onclick="openCategory(DB.characters.find(c => c.id === '${char.id}'), DB.characters.find(c => c.id === '${char.id}').categories.find(cat => cat.id === '${cat.id}'))">
      <div class="cat-icon-wrap ${cat.type}">
        ${icons[cat.type] || icons.combo}
      </div>

      <div class="cat-info">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-desc">${cat.description}</div>
        <div class="cat-meta">
          <div class="cat-count">
            <span class="cat-count-dot"></span>
            ${countLabel}
          </div>
          ${count === 0 ? `<span class="cat-badge-empty">VAZIO</span>` : ''}
        </div>
      </div>

      <svg class="cat-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────
   RENDER: CATEGORY DETAIL
────────────────────────────────────────────────────── */

function renderCategoryDetail(char, category) {
  const body = document.getElementById('category-detail-body');
  if (!body) return;

  const iconColors = {
    combo:   { bg: 'rgba(220,31,31,0.1)',    border: 'rgba(220,31,31,0.2)',   iconColor: 'var(--red)' },
    secret:  { bg: 'rgba(139,43,232,0.1)',   border: 'rgba(139,43,232,0.2)',  iconColor: '#a855f7' },
    special: { bg: 'rgba(0,200,240,0.1)',    border: 'rgba(0,200,240,0.2)',   iconColor: 'var(--cyan)' },
  };

  const style = iconColors[category.type] || iconColors.combo;

  const icons = {
    combo:   `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${style.iconColor}" stroke-width="1.8" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    secret:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${style.iconColor}" stroke-width="1.8" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    special: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${style.iconColor}" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  };

  const movesContent = category.moves.length === 0
    ? renderEmptyMoves(category)
    : renderMovesList(category);

  body.innerHTML = `
    <div class="cat-detail-header">
      <div class="cat-detail-icon" style="background: ${style.bg}; border: 1px solid ${style.border};">
        ${icons[category.type] || icons.combo}
      </div>
      <div>
        <div class="cat-detail-title">${category.name.toUpperCase()}</div>
        <div class="cat-detail-char">${char.name.toUpperCase()} · ${char.team}</div>
      </div>
    </div>

    ${movesContent}
  `;
}

function renderEmptyMoves(category) {
  const emojis = {
    combo:   '⚡',
    secret:  '🔒',
    special: '✦'
  };

  const tips = {
    combo:   'Registre combos e sequências de ataque que ligam a golpes especiais.',
    secret:  'Adicione técnicas ocultas, despertadores e moves menos conhecidos.',
    special: 'Cadastre os golpes especiais, DMs e SDMs com inputs completos.'
  };

  return `
    <div class="moves-empty">
      <div class="moves-empty-icon">${emojis[category.type] || '◆'}</div>
      <div class="moves-empty-title">Nenhum movimento registrado</div>
      <div class="moves-empty-desc">${tips[category.type] || 'Adicione movimentos a esta categoria.'}</div>
      <button class="moves-add-btn" onclick="openAddMoveModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar movimento
      </button>
    </div>
  `;
}

function renderMovesList(category) {
  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${category.moves.map(move => {
        // Handle inputs - if it's a string (from manual entry), wrap in array
        const inputs = Array.isArray(move.inputs) ? move.inputs : [move.inputs];
        const rawCommand = inputs.join(' ');
        const commandHtml = rawCommand.split('\n').map(line => {
          const lineHtml = line.split(' ').filter(t => t !== '').map(token => {
            if (token === '+') return `<span class="move-input-plus">+</span>`;
            return `<span class="move-input-token">${token}</span>`;
          }).join('');
          return `<div class="move-inputs-line">${lineHtml}</div>`;
        }).join('');

        return `
          <div class="move-card">
            <div class="move-header">
              <div class="move-title">${move.name}</div>
              <div class="move-actions">
                <button class="move-edit-btn" onclick="openAddMoveModal('${move.id}')" title="Editar movimento">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="move-delete-btn" onclick="deleteMove('${move.id}')" title="Excluir movimento">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="move-inputs">
              ${commandHtml}
            </div>
            ${move.description ? `<div class="move-desc">${move.description}</div>` : ''}
            ${move.notes ? `<div class="move-notes">${move.notes}</div>` : ''}
          </div>
        `;
      }).join('')}
      <button class="moves-add-btn" onclick="openAddMoveModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar movimento
      </button>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────
   MOUSE FLASHLIGHT EFFECT
────────────────────────────────────────────────────── */

function attachFlashlight(selector) {
  document.querySelectorAll(selector).forEach(card => {
    // Remove old listener to avoid duplicates
    card.removeEventListener('mousemove', card._flashlight);
    card.removeEventListener('mouseleave', card._flashlightOut);

    card._flashlight = function(e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    };

    card._flashlightOut = function() {
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    };

    card.addEventListener('mousemove', card._flashlight);
    card.addEventListener('mouseleave', card._flashlightOut);
  });
}

/* ──────────────────────────────────────────────────────
   LOCAL STORAGE — PERSISTENCE
────────────────────────────────────────────────────── */

const Storage = {
  key: 'kof2002_app_data',

  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch(e) {
      console.warn('[KOF2002] Falha ao salvar:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      console.warn('[KOF2002] Falha ao carregar:', e);
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch(e) {
      console.warn('[KOF2002] Falha ao limpar:', e);
    }
  }
};

/* ──────────────────────────────────────────────────────
   INIT — LOAD SAVED DATA
────────────────────────────────────────────────────── */

(function loadAppData() {
  const saved = Storage.load();
  if (saved && saved.characters) {
    // Restaurar dados salvos para cada personagem e categoria
    saved.characters.forEach(savedChar => {
      const char = DB.characters.find(c => c.id === savedChar.id);
      if (!char) return;
      savedChar.categories.forEach(savedCat => {
        const cat = char.categories.find(c => c.id === savedCat.id);
        if (cat && savedCat.moves) {
          cat.moves = savedCat.moves;
        }
      });
    });
  }
})();

/* ──────────────────────────────────────────────────────
   SIDEBAR — COLLAPSE (desktop) & DRAWER (mobile)
────────────────────────────────────────────────────── */

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

function toggleMobileSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');

  if (sidebar.classList.contains('mobile-open')) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    overlay.style.display = 'block';
  }
}

function closeMobileSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('active');
  // Wait for transition before hiding overlay
  setTimeout(() => { overlay.style.display = 'none'; }, 250);
}

// Close mobile sidebar when a nav item is clicked
(function patchNavForMobile() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMobileSidebar();
    });
  });
})();

/* ──────────────────────────────────────────────────────
   ADD MOVE MODAL
────────────────────────────────────────────────────── */

/* ── Command Builder ─────────────────────────────────── */

function cmdInsert(token) {
  const input = document.getElementById('move-command-input');
  const cur = input.value;
  // "/" e "+" não recebem espaço automático — colam ao anterior
  const noSpace = ['/', '+'];
  // se o token atual não precisa de espaço à esquerda
  if (noSpace.includes(token)) {
    input.value = cur + token;
  } else {
    // se o último char já for "/", "+" ou início do campo, não adicionar espaço
    const lastChar = cur.slice(-1);
    if (cur === '' || noSpace.includes(lastChar)) {
      input.value = cur + token;
    } else {
      input.value = cur + ' ' + token;
    }
  }
  input.focus();
}

function cmdNewLine() {
  const input = document.getElementById('move-command-input');
  input.value = input.value.trimEnd() + '\n';
  input.focus();
  // Move cursor to end
  input.selectionStart = input.selectionEnd = input.value.length;
}

function cmdDeleteLast() {
  const input = document.getElementById('move-command-input');
  const val = input.value;
  if (!val) return;
  // Se termina com \n, remove a quebra de linha
  if (val.endsWith('\n')) {
    input.value = val.slice(0, -1);
    input.focus();
    return;
  }
  // Remove o último token (separado por espaço ou o último char se não houver espaço)
  const trimmed = val.trimEnd();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) {
    input.value = '';
  } else {
    input.value = trimmed.slice(0, lastSpace);
  }
  input.focus();
}

function cmdClear() {
  const input = document.getElementById('move-command-input');
  input.value = '';
  input.focus();
}

/* ────────────────────────────────────────────────────── */

function openAddMoveModal(moveId = null) {
  state.editingMoveId = moveId;

  const titleEl = document.querySelector('.add-move-title');

  // Clear form
  document.getElementById('move-name-input').value = '';
  document.getElementById('move-command-input').value = '';
  document.getElementById('move-desc-input').value = '';
  document.getElementById('move-notes-input').value = '';

  // Se estamos editando, preencher com dados do movimento
  if (moveId && state.currentCategory) {
    const move = state.currentCategory.moves.find(m => m.id === moveId);
    if (move) {
      titleEl.textContent = 'Editar Movimento';
      document.getElementById('move-name-input').value = move.name;
      document.getElementById('move-command-input').value = move.inputs[0] || '';
      document.getElementById('move-desc-input').value = move.description;
      document.getElementById('move-notes-input').value = move.notes;
    }
  } else {
    titleEl.textContent = 'Adicionar Movimento';
  }

  // Clear error state
  const cmdInput = document.getElementById('move-command-input');
  const cmdError = document.getElementById('move-command-error');
  cmdInput.classList.remove('error');
  cmdError.classList.remove('show');
  cmdError.textContent = '';

  // Show modal
  document.getElementById('add-move-modal').classList.add('active');

  // Focus command input
  setTimeout(() => document.getElementById('move-command-input').focus(), 100);
}

function closeAddMoveModal() {
  const modal = document.getElementById('add-move-modal');
  modal.classList.remove('active');
  state.editingMoveId = null;
}

function saveNewMove() {
  if (!state.currentCharacter || !state.currentCategory) {
    return;
  }

  const nameInput = document.getElementById('move-name-input').value.trim();
  const commandInput = document.getElementById('move-command-input').value.trim();
  const descInput = document.getElementById('move-desc-input').value.trim();
  const notesInput = document.getElementById('move-notes-input').value.trim();

  // Validation
  const cmdError = document.getElementById('move-command-error');
  const cmdInputEl = document.getElementById('move-command-input');

  if (!commandInput) {
    cmdInputEl.classList.add('error');
    cmdError.classList.add('show');
    cmdError.textContent = 'Campo obrigatório';
    return;
  }

  cmdInputEl.classList.remove('error');
  cmdError.classList.remove('show');

  // Se estamos editando
  if (state.editingMoveId) {
    const moveIndex = state.currentCategory.moves.findIndex(m => m.id === state.editingMoveId);
    if (moveIndex !== -1) {
      // Atualizar movimento existente
      state.currentCategory.moves[moveIndex] = {
        ...state.currentCategory.moves[moveIndex],
        name: nameInput || state.currentCategory.moves[moveIndex].name,
        inputs: [commandInput],
        description: descInput,
        notes: notesInput
      };
    }
  } else {
    // Criar novo movimento
    const finalName = nameInput || generateMoveName(state.currentCategory);

    const newMove = {
      id: Date.now().toString(36),
      name: finalName,
      inputs: [commandInput],
      description: descInput || '',
      notes: notesInput || ''
    };

    // Add to database
    state.currentCategory.moves.push(newMove);
  }

  // Salvar no localStorage
  Storage.save(DB);

  // Close modal
  closeAddMoveModal();

  // Re-render category detail
  renderCategoryDetail(state.currentCharacter, state.currentCategory);
}

function generateMoveName(category) {
  const typeNames = {
    combo: 'Combo',
    secret: 'Secreto',
    special: 'Especial'
  };

  const baseName = typeNames[category.type] || 'Movimento';
  const count = category.moves.length + 1;

  return `${baseName} ${String(count).padStart(2, '0')}`;
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAddMoveModal();
  }
});

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('add-move-overlay')) {
    closeAddMoveModal();
  }
});

/* ──────────────────────────────────────────────────────
   DELETE MOVE
────────────────────────────────────────────────────── */

function deleteMove(moveId) {
  if (!state.currentCharacter || !state.currentCategory) {
    return;
  }

  const move = state.currentCategory.moves.find(m => m.id === moveId);
  if (!move) return;

  // Confirmação
  const confirmed = confirm(`Tem certeza que deseja excluir este movimento?\n\n"${move.name}"`);
  if (!confirmed) return;

  // Remover movimento
  const moveIndex = state.currentCategory.moves.findIndex(m => m.id === moveId);
  if (moveIndex !== -1) {
    state.currentCategory.moves.splice(moveIndex, 1);
  }

  // Salvar no localStorage
  Storage.save(DB);

  // Re-render categoria
  renderCategoryDetail(state.currentCharacter, state.currentCategory);
}

// Expose globally for inline onclick use
window.DB           = DB;
window.navigate     = navigate;
window.openCharacter = openCharacter;
window.openCategory  = openCategory;
window.backToCharacter = backToCharacter;
window.filterCharacters = filterCharacters;
window.skipIntro    = skipIntro;
window.toggleSidebar      = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.openAddMoveModal = openAddMoveModal;
window.closeAddMoveModal = closeAddMoveModal;
window.saveNewMove = saveNewMove;
window.deleteMove = deleteMove;

/* ──────────────────────────────────────────────────────
   PWA — SERVICE WORKER REGISTRATION
────────────────────────────────────────────────────── */

(function registerServiceWorker() {
  if (!navigator.serviceWorker) {
    console.log('[PWA] Service Worker not supported');
    return;
  }

  navigator.serviceWorker.register('service-worker.js')
    .then(registration => {
      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    })
    .catch(error => {
      console.warn('[PWA] Service Worker registration failed:', error);
    });

  // Handle update notifications
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
})();
