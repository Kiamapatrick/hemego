/* HEMEGO TECHPRISE — Shop page specific behavior */

const WA_NUMBER = '254703768321';

function openWA(msg) {
  const text = encodeURIComponent(msg || 'Hi HEMEGO, I have a question.');
  window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
}

// =========================================
// CART (uses shared.js functions, but shop-specific additions)
// =========================================

function getProductFromButton(btn) {
  const card = btn.closest('[data-cat]');
  if (!card) return null;
  const name = card.querySelector('.pname')?.textContent.trim() || 'Product';
  const brand = card.querySelector('.pbrand')?.textContent.trim() || '';
  const priceEl = card.querySelector('.pprice');
  const price = priceEl ? parsePrice(priceEl.textContent || '') : 0;
  return { name, brand, price };
}

function parsePrice(text) {
  const m = text.replace(/,/g, '').match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

// Add event listeners for add-to-cart buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = getProductFromButton(btn);
      if (product) addToCart(product);
    });
  });
});

// =========================================
// FILTERING & SORTING
// =========================================

let activeCategory = 'all';

function setTab(el, cat) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeCategory = cat;
  applyFilters();
}

function getMaxPrice() {
  const slider = document.querySelector('.price-slider');
  return slider ? parseInt(slider.value) : 200000;
}

function applyFilters() {
  const maxPrice = getMaxPrice();
  const cards = document.querySelectorAll('#productsGrid [data-cat]');
  let count = 0;

  cards.forEach(card => {
    const catMatch = activeCategory === 'all' || card.dataset.cat === activeCategory;
    const price = parseInt(card.dataset.price) || 0;
    const priceMatch = price <= maxPrice;
    const show = catMatch && priceMatch;
    card.style.display = show ? '' : 'none';
    if (show) count++;
  });

  const countEl = document.getElementById('filterCount');
  if (countEl) countEl.textContent = 'Showing ' + count + ' products';
}

function sortProducts(val) {
  const grid = document.getElementById('productsGrid');
  const pagination = grid.querySelector('.pagination');
  const cards = Array.from(grid.querySelectorAll('[data-cat]'));

  cards.sort((a, b) => {
    const pa = parseInt(a.dataset.price) || 0;
    const pb = parseInt(b.dataset.price) || 0;
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

  cards.forEach(card => grid.insertBefore(card, pagination));
  applyFilters();
}

function toggleSopt(el) { el.classList.toggle('checked'); }

function clearFilters() {
  document.querySelectorAll('.sopt').forEach(s => s.classList.remove('checked'));
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  document.querySelector('.ftab').classList.add('active');
  activeCategory = 'all';
  const slider = document.querySelector('.price-slider');
  if (slider) { slider.value = slider.max; updatePrice(slider.value); }
  applyFilters();
}

function updatePrice(v) {
  const el = document.getElementById('priceMax');
  if (el) el.value = parseInt(v).toLocaleString();
  applyFilters();
}

// Initialize filters on load
document.addEventListener('DOMContentLoaded', () => {
  applyFilters();
});

// =========================================
// PAGINATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ppage:not(.arrow)').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.ppage:not(.arrow)').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
});

// =========================================
// SEARCH INTEGRATION (handled by shared.js)
// =========================================
// The search functionality is in shared.js and auto-initializes
// This page just provides the product data via [data-cat][data-price] attributes