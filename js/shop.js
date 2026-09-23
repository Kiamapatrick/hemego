/* HEMEGO TECHPRISE — Shop page specific behavior */

// =========================================
// FILTERING & SORTING
// =========================================

let activeCategory = 'all';
const MIN_POSSIBLE = 0;
const MAX_POSSIBLE = 200000;
const MIN_GAP = 1000;

function setTab(el, cat) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeCategory = cat;
  applyFilters();
}

function parsePriceInput(val) {
  if (val === undefined || val === null || val === '') return 0;
  const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

function getMinPrice() {
  const rangeMin = document.getElementById('rangeMin');
  const inputMin = document.getElementById('priceMin');
  if (inputMin && inputMin.value.trim() !== '') return parsePriceInput(inputMin.value);
  if (rangeMin) return parseInt(rangeMin.value, 10) || 0;
  return 0;
}

function getMaxPrice() {
  const rangeMax = document.getElementById('rangeMax');
  const inputMax = document.getElementById('priceMax');
  if (inputMax && inputMax.value.trim() !== '') return parsePriceInput(inputMax.value);
  if (rangeMax) return parseInt(rangeMax.value, 10) || MAX_POSSIBLE;
  return MAX_POSSIBLE;
}

function updateSliderTrack(minVal, maxVal) {
  const track = document.getElementById('sliderTrack');
  if (!track) return;
  const minPercent = Math.max(0, Math.min(100, (minVal / MAX_POSSIBLE) * 100));
  const maxPercent = Math.max(0, Math.min(100, (maxVal / MAX_POSSIBLE) * 100));
  track.style.background = `linear-gradient(to right, var(--gray-200) 0%, var(--gray-200) ${minPercent}%, var(--blue) ${minPercent}%, var(--blue) ${maxPercent}%, var(--gray-200) ${maxPercent}%, var(--gray-200) 100%)`;
}

function applyFilters() {
  const minPrice = getMinPrice();
  const maxPrice = getMaxPrice();
  const cards = document.querySelectorAll('.shop-layout [data-cat]');
  let count = 0;

  cards.forEach(card => {
    const catMatch = activeCategory === 'all' || card.dataset.cat === activeCategory;
    const price = parseInt(card.dataset.price, 10) || 0;
    const priceMatch = price >= minPrice && price <= maxPrice;
    const show = catMatch && priceMatch;
    card.style.display = show ? '' : 'none';
    if (show) count++;
  });

  const countEl = document.getElementById('filterCount');
  if (countEl) countEl.textContent = 'Showing ' + count + ' products';
}

function sortProducts(val) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('[data-cat]'));

  cards.sort((a, b) => {
    const pa = parseInt(a.dataset.price, 10) || 0;
    const pb = parseInt(b.dataset.price, 10) || 0;
    if (val === 'price-asc') return pa - pb;
    if (val === 'price-desc') return pb - pa;
    if (val === 'newest') {
      return (a.querySelector('.pbadge-new') ? 0 : 1) - (b.querySelector('.pbadge-new') ? 0 : 1);
    }
    if (val === 'featured') {
      return (a.classList.contains('pcard-hero') ? 0 : 1) - (b.classList.contains('pcard-hero') ? 0 : 1);
    }
    return 0;
  });

  cards.forEach(card => grid.appendChild(card));
  applyFilters();
}

function toggleSopt(el) { el.classList.toggle('checked'); }

function clearFilters() {
  document.querySelectorAll('.sopt').forEach(s => s.classList.remove('checked'));
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  const firstTab = document.querySelector('.ftab');
  if (firstTab) firstTab.classList.add('active');
  activeCategory = 'all';

  const rangeMin = document.getElementById('rangeMin');
  const rangeMax = document.getElementById('rangeMax');
  const inputMin = document.getElementById('priceMin');
  const inputMax = document.getElementById('priceMax');

  if (rangeMin) rangeMin.value = 0;
  if (rangeMax) rangeMax.value = MAX_POSSIBLE;
  if (inputMin) inputMin.value = '0';
  if (inputMax) inputMax.value = MAX_POSSIBLE.toLocaleString();

  updateSliderTrack(0, MAX_POSSIBLE);
  applyFilters();
}

function initPriceRangeFilter() {
  const rangeMin = document.getElementById('rangeMin');
  const rangeMax = document.getElementById('rangeMax');
  const inputMin = document.getElementById('priceMin');
  const inputMax = document.getElementById('priceMax');

  if (!rangeMin || !rangeMax || !inputMin || !inputMax) return;

  // Initialize track
  updateSliderTrack(parseInt(rangeMin.value, 10) || 0, parseInt(rangeMax.value, 10) || MAX_POSSIBLE);

  // Range Min slider
  rangeMin.addEventListener('input', () => {
    let minVal = parseInt(rangeMin.value, 10) || 0;
    let maxVal = parseInt(rangeMax.value, 10) || MAX_POSSIBLE;
    if (minVal > maxVal - MIN_GAP) {
      minVal = Math.max(0, maxVal - MIN_GAP);
      rangeMin.value = minVal;
    }
    inputMin.value = minVal.toLocaleString();
    updateSliderTrack(minVal, maxVal);
    applyFilters();
  });

  // Range Max slider
  rangeMax.addEventListener('input', () => {
    let minVal = parseInt(rangeMin.value, 10) || 0;
    let maxVal = parseInt(rangeMax.value, 10) || MAX_POSSIBLE;
    if (maxVal < minVal + MIN_GAP) {
      maxVal = Math.min(MAX_POSSIBLE, minVal + MIN_GAP);
      rangeMax.value = maxVal;
    }
    inputMax.value = maxVal.toLocaleString();
    updateSliderTrack(minVal, maxVal);
    applyFilters();
  });

  // Type in Min input (filters live as you type)
  inputMin.addEventListener('input', () => {
    const rawVal = parsePriceInput(inputMin.value);
    const minVal = Math.min(rawVal, MAX_POSSIBLE);
    const maxVal = parseInt(rangeMax.value, 10) || MAX_POSSIBLE;
    rangeMin.value = minVal;
    updateSliderTrack(minVal, maxVal);
    applyFilters();
  });

  // Type in Max input (filters live as you type)
  inputMax.addEventListener('input', () => {
    const rawVal = parsePriceInput(inputMax.value);
    const maxVal = Math.min(rawVal, MAX_POSSIBLE);
    const minVal = parseInt(rangeMin.value, 10) || 0;
    rangeMax.value = maxVal;
    updateSliderTrack(minVal, maxVal);
    applyFilters();
  });

  // Finalize / format on blur or Enter
  const handleFinalize = (isMin) => {
    let minVal = parsePriceInput(inputMin.value);
    let maxVal = parsePriceInput(inputMax.value);

    minVal = Math.max(MIN_POSSIBLE, Math.min(minVal, MAX_POSSIBLE));
    maxVal = Math.max(MIN_POSSIBLE, Math.min(maxVal, MAX_POSSIBLE));

    if (minVal > maxVal) {
      if (isMin) minVal = maxVal;
      else maxVal = minVal;
    }

    rangeMin.value = minVal;
    rangeMax.value = maxVal;
    inputMin.value = minVal.toLocaleString();
    inputMax.value = maxVal.toLocaleString();
    updateSliderTrack(minVal, maxVal);
    applyFilters();
  };

  inputMin.addEventListener('change', () => handleFinalize(true));
  inputMin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      inputMin.blur();
      handleFinalize(true);
    }
  });

  inputMax.addEventListener('change', () => handleFinalize(false));
  inputMax.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      inputMax.blur();
      handleFinalize(false);
    }
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initPriceRangeFilter();
  applyFilters();
});

// =========================================
// SEARCH INTEGRATION (handled by shared.js)
// =========================================
// The search functionality is in shared.js and auto-initializes
// This page just provides the product data via [data-cat][data-price] attributes