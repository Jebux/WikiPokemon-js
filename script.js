// =================== CONFIG ===================
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_PER_PAGE = 12;
const MAX_ID_GEN7 = 809; // So filters can work across Gen 1-7

// National Dex ranges per generation (Gen 1–7)
const GEN_RANGES = {
  all: [1, 809],
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
};

// =================== STATE ====================
let currentPage = 1;               // used both in API mode and filter mode
let totalPokemon = 0;              // count from API when no filters
let pokemonList = [];              // current page items when no filters (API mode)

let allPokemonBasic = [];          // [{id,name,url}] for Gen 1-7 (filter base)
let currentPoolIds = null;         // null = API mode; array = filter mode

// Filters
window.filters = {
  search: '',
  type: 'all',
  gen: 'all',     // 'all' | '1'..'7'
  sort: 'id_asc'  // reserved for future
};

// =================== DOM REFS (late-bound) =================
let pokemonCardsContainer, prevBtn, nextBtn, pageInfo, loadingEl;
let pokemonModal, modalTitle, modalContent, closeModal;
let typeFiltersEl, clearBtn, searchInput, genSelect;

function bindDomRefs() {
  pokemonCardsContainer = document.getElementById('pokemonCardsContainer');
  prevBtn = document.getElementById('prevBtn');
  nextBtn = document.getElementById('nextBtn');
  pageInfo = document.getElementById('pageInfo');
  loadingEl = document.getElementById('loading');

  pokemonModal = document.getElementById('pokemonModal');
  modalTitle = document.getElementById('modalTitle');
  modalContent = document.getElementById('modalContent');
  closeModal = document.getElementById('closeModal');

  typeFiltersEl = document.getElementById('typeFilters');
  clearBtn = document.getElementById('clearFilters');
  searchInput = document.getElementById('searchInput');
  genSelect = document.getElementById('genSelect');
}

// =================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
  bindDomRefs(); // bind after DOM is ready
  showLoading(true);
  try {
    await loadAllPokemonBasic();      // base for filters
    await loadPokemonList();          // first page (API mode)
    setupEventListeners();            // prev/next + modal close
    wireFilters();                    // connect filters UI
  } catch (e) {
    console.error('Init error:', e);
  } finally {
    showLoading(false);
  }
});

// =================== LOADERS ==================

// Safe JSON fetch wrapper (soft fail)
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('fetchJSON failed:', url, err?.message || err);
    return null; // soft: never throw
  }
}

// Base list for filters (ids + names + urls)
async function loadAllPokemonBasic() {
  const data = await fetchJSON(`${API_BASE_URL}/pokemon?limit=${MAX_ID_GEN7}&offset=0`);
  if (!data) return; // soft
  allPokemonBasic = data.results.map((p, idx) => ({ id: idx + 1, name: p.name, url: p.url }));
}

// Page from API (API mode, no filters)
async function loadPokemonList() {
  showLoading(true);
  try {
    const offset = (currentPage - 1) * POKEMON_PER_PAGE;
    const data = await fetchJSON(`${API_BASE_URL}/pokemon?limit=${POKEMON_PER_PAGE}&offset=${offset}`);
    if (!data) return; // soft

    totalPokemon = data.count;
    pokemonList = data.results;

    await displayPokemonList();     // paints cards for API page
    updatePaginationControls();
  } finally {
    showLoading(false);
  }
}

// Details by url (soft)
async function fetchPokemonDetails(url) {
  return await fetchJSON(url);
}

// Details by id (soft)
async function fetchPokemonById(id) {
  return await fetchJSON(`${API_BASE_URL}/pokemon/${id}`);
}

// =================== RENDER ===================

// ---- CARDS (ONLY version) ----
async function displayPokemonList() {
  if (!pokemonCardsContainer) {
    console.warn('pokemonCardsContainer not found');
    return; // guard
  }
  pokemonCardsContainer.innerHTML = '';
  const settled = await Promise.allSettled(pokemonList.map(p => fetchPokemonDetails(p.url)));
  const details = settled.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

  if (details.length === 0) {
    // soft: nothing to render
    return;
  }

  const frag = document.createDocumentFragment();
  details.forEach(p => frag.appendChild(createPokemonCard(p)));
  pokemonCardsContainer.appendChild(frag);
}

// Render current page in FILTER mode
async function renderCurrentFilteredPage() {
  if (!Array.isArray(currentPoolIds) || !pokemonCardsContainer) return;
  pokemonCardsContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * POKEMON_PER_PAGE;
  const pageIds = currentPoolIds.slice(startIndex, startIndex + POKEMON_PER_PAGE);

  const settled = await Promise.allSettled(pageIds.map(id => fetchPokemonById(id)));
  const details = settled.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

  if (details.length === 0) {
    pokemonCardsContainer.innerHTML = '<p class="text-center text-gray-600">No hay resultados.</p>';
    return;
  }

  const frag = document.createDocumentFragment();
  details.forEach(p => frag.appendChild(createPokemonCard(p)));
  pokemonCardsContainer.appendChild(frag);
}

// =================== FILTERS ==================
const typeToIdsCache = new Map();
async function getIdsByType(typeName) {
  if (typeName === 'all') return null;
  if (typeToIdsCache.has(typeName)) return typeToIdsCache.get(typeName);
  const data = await fetchJSON(`${API_BASE_URL}/type/${typeName}`);
  if (!data) return new Set(); // soft: empty set
  const ids = new Set(
    data.pokemon
      .map(x => {
        const m = x.pokemon.url.match(/\/pokemon\/(\d+)\//);
        return m ? Number(m[1]) : null;
      })
      .filter(n => n && n <= MAX_ID_GEN7)
  );
  typeToIdsCache.set(typeName, ids);
  return ids;
}

// Recompute + render (FILTER MODE ON)
window.recomputePoolAndRender = async function () {
  showLoading(true);
  try {
    // Base desde el listado completo (ids+name)
    let pool = allPokemonBasic.slice();

    // 🔹 Generación primero
    const [gStart, gEnd] = GEN_RANGES[filters.gen] || GEN_RANGES.all;
    pool = pool.filter(p => p.id >= gStart && p.id <= gEnd);

    // 🔹 Tipo
    if (filters.type !== 'all') {
      const idsByType = await getIdsByType(filters.type);
      pool = pool.filter(p => idsByType.has(p.id));
    }

    // 🔹 Búsqueda por nombre
    if (filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      pool = pool.filter(p => p.name.includes(q));
    }

    currentPoolIds = pool.map(p => p.id);

    // Paginación segura
    const totalPages = Math.max(1, Math.ceil(currentPoolIds.length / POKEMON_PER_PAGE));
    if (currentPage > totalPages) currentPage = 1;

    await renderCurrentFilteredPage();
    updatePaginationControls();
  } catch (e) {
    console.error('Filter recompute error (soft):', e);
  } finally {
    showLoading(false);
  }
};

// =================== UI & EVENTS ==============
function setupEventListeners() {
  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      if (currentPage <= 1) return;
      currentPage--;
      if (currentPoolIds) {
        await renderCurrentFilteredPage();
        updatePaginationControls();
      } else {
        await loadPokemonList();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      const total = currentPoolIds ? currentPoolIds.length : totalPokemon;
      const totalPages = Math.max(1, Math.ceil(total / POKEMON_PER_PAGE));
      if (currentPage >= totalPages) return;
      currentPage++;
      if (currentPoolIds) {
        await renderCurrentFilteredPage();
        updatePaginationControls();
      } else {
        await loadPokemonList();
      }
    });
  }

  // Modal close
  if (closeModal && pokemonModal) {
    closeModal.addEventListener('click', () => {
      pokemonModal.classList.add('hidden');
      pokemonModal.classList.remove('flex');
    });
    pokemonModal.addEventListener('click', (e) => {
      if (e.target === pokemonModal) {
        pokemonModal.classList.add('hidden');
        pokemonModal.classList.remove('flex');
      }
    });
  }
}

// Static filters wiring
function wireFilters() {
  // Type buttons
  if (typeFiltersEl) {
    typeFiltersEl.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const t = btn.dataset.type || 'all';
        filters.type = t;
        currentPage = 1;

        // visual state (safe)
        typeFiltersEl.querySelectorAll('.type-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-indigo-700', 'scale-105');
        });
        btn.classList.add('ring-2', 'ring-indigo-700', 'scale-105');

        await recomputePoolAndRender();
      });
    });
  }

  // Generation select
  if (genSelect) {
    genSelect.addEventListener('change', async (e) => {
      filters.gen = e.target.value;   // 'all' | '1'..'7'
      currentPage = 1;

      // If no other filters and gen=all -> back to API mode
      if (filters.type === 'all' && filters.search === '' && filters.gen === 'all') {
        currentPoolIds = null;
        await loadPokemonList();
      } else {
        await recomputePoolAndRender();
      }
    });
  }

  // Name search
  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      filters.search = e.target.value.toLowerCase().trim();
      currentPage = 1;
      if (filters.type === 'all' && filters.search === '' && filters.gen === 'all') {
        currentPoolIds = null;
        await loadPokemonList();
      } else {
        await recomputePoolAndRender();
      }
    }, 200));
  }

  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      filters = { search: '', type: 'all', gen: 'all', sort: 'id_asc' };
      currentPage = 1;
      currentPoolIds = null; // back to API mode
      if (searchInput) searchInput.value = '';
      if (genSelect) genSelect.value = 'all';
      if (typeFiltersEl) {
        typeFiltersEl.querySelectorAll('.type-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-indigo-700', 'scale-105');
        });
      }
      await loadPokemonList();
    });
  }
}

// =================== CARDS & HELPERS ==========
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow';

  const mainType = pokemon.types[0].type.name;
  const colorClass = getTypeColor(mainType);
  const typesPlain = pokemon.types.map(t => t.type.name).join(', ');

  card.innerHTML = `
    <div class="w-full h-2 ${colorClass}"></div>
    <div class="p-4 flex flex-col items-center space-y-3">
      <span class="text-gray-500 font-medium">#${pokemon.id}</span>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" loading="lazy" class="w-20 h-20 object-contain" />
      <h2 class="font-bold text-lg capitalize">${pokemon.name}</h2>
      <div class="flex flex-wrap justify-center gap-2" title="${typesPlain}">
        ${createTypesBadges(pokemon.types)}
      </div>
      <button onclick="showPokemonDetails(${pokemon.id})"
              class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              aria-label="Ver detalle de ${pokemon.name}">
        Ver Detalle
      </button>
    </div>
  `;
  return card;
}

function createTypesBadges(types) {
  return types.map(typeInfo => {
    const typeName = typeInfo.type.name;
    const colorClass = getTypeColor(typeName);
    return `<span class="inline-block px-2 py-1 text-xs rounded-full text-white ${colorClass}">
      ${capitalize(typeName)}
    </span>`;
  }).join('');
}

function getTypeColor(type) {
  const colors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400 text-black',
    grass: 'bg-green-500',
    ice: 'bg-blue-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
  };
  return colors[type] || 'bg-gray-400';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

async function showPokemonDetails(pokemonId) {
  showLoading(true);
  try {
    const pokemon = await fetchPokemonById(pokemonId);
    if (!pokemon) return;
    modalTitle.textContent = `#${pokemon.id} ${capitalize(pokemon.name)}`;
    modalContent.innerHTML = `
      <div class="text-center mb-4">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-32 h-32 mx-auto">
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div><h3 class="font-semibold text-gray-700">Altura:</h3><p>${pokemon.height / 10} m</p></div>
        <div><h3 class="font-semibold text-gray-700">Peso:</h3><p>${pokemon.weight / 10} kg</p></div>
      </div>
      <div class="mb-4">
        <h3 class="font-semibold text-gray-700 mb-2">Tipos:</h3>
        ${createTypesBadges(pokemon.types)}
      </div>
      <div class="mb-4">
        <h3 class="font-semibold text-gray-700 mb-2">Habilidades:</h3>
        <ul class="list-disc list-inside">
          ${pokemon.abilities.map(a => `<li class="capitalize">${a.ability.name.replace('-', ' ')}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Estadísticas Base:</h3>
        ${createStatsDisplay(pokemon.stats)}
      </div>
    `;
    pokemonModal.classList.remove('hidden');
    pokemonModal.classList.add('flex');
  } finally {
    showLoading(false);
  }
}

function createStatsDisplay(stats) {
  return stats.map(stat => {
    const statName = stat.stat.name.replace('-', ' ');
    const statValue = stat.base_stat;
    const percentage = Math.min((statValue / 200) * 100, 100);
    return `
      <div class="mb-2">
        <div class="flex justify-between text-sm">
          <span class="capitalize">${statName}</span>
          <span>${statValue}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full" style="width:${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// =================== UTILS ====================
function showLoading(show) {
  if (!loadingEl) return;
  loadingEl.classList.toggle('hidden', !show);
}

// Soft error logger: NO alert
function showError(message) {
  console.warn(message);
}

function debounce(fn, wait = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function updatePaginationControls() {
  if (!pageInfo || !prevBtn || !nextBtn) return;
  const total = currentPoolIds ? currentPoolIds.length : totalPokemon;
  const totalPages = Math.max(1, Math.ceil(total / POKEMON_PER_PAGE));

  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
  prevBtn.classList.toggle('cursor-not-allowed', prevBtn.disabled);
  nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
  nextBtn.classList.toggle('cursor-not-allowed', nextBtn.disabled);
}
