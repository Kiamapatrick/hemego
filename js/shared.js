/* HEMEGO TECHPRISE — shared behavior (nav, drawer, cart, fade-up, WhatsApp, search, product tilt, booking form) */

const WA_NUMBER = '254703768321';

function openWA(msg) {
  const text = encodeURIComponent(msg || 'Hi HEMEGO, I have a question.');
  window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
}

/* ---- Top nav scroll state ---- */
(function () {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---- Mobile drawer ---- */
function toggleDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;
  const opening = !drawer.classList.contains('active');
  drawer.classList.toggle('active', opening);
  overlay.classList.toggle('active', opening);
  document.body.style.overflow = opening ? 'hidden' : '';
}

/* ---- Fade-up / stagger scroll reveal ---- */
(function () {
  const targets = document.querySelectorAll('.fade-up, .stagger');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 }
  );
  targets.forEach((el) => io.observe(el));
})();

/* ---- Cart (shared across pages via localStorage) ---- */
const CART_KEY = 'HEMEGO_CART';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  renderCartPanel();
}

function removeFromCart(id) {
  const cart = getCart().filter((c) => c.id !== id);
  saveCart(cart);
  renderCartPanel();
}

function cartTotal(cart) {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function renderCartBadge() {
  const badge = document.getElementById('cartCount') || document.getElementById('cartCountLabel');
  if (!badge) return;
  const count = getCart().reduce((sum, c) => sum + c.qty, 0);
  if (badge.id === 'cartCount') {
    badge.textContent = count + (count === 1 ? ' item' : ' items');
    badge.style.display = count > 0 ? 'flex' : 'none';
  } else {
    badge.textContent = count > 0 ? `${count} item${count !== 1 ? 's' : ''} in cart` : 'Your cart is empty';
  }
}

function renderCartPanel() {
  const list = document.getElementById('cartPanelList') || document.getElementById('cartItems');
  const totalEl = document.getElementById('cartPanelTotal') || document.getElementById('cartTotal');
  if (!list) return;
  const cart = getCart();

  if (!cart.length) {
    list.innerHTML = '<li class="cart-empty">Your cart is empty. Browse the shop to add devices and accessories.</li>';
  } else {
    list.innerHTML = cart
      .map(
        (c) => `
      <li class="cart-panel-item">
        <div>
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-details">Qty ${c.qty} &middot; KES ${(c.price * c.qty).toLocaleString()}</div>
        </div>
        <button class="drawer-close" style="font-size:1.2rem" onclick="removeFromCart('${c.id}')" aria-label="Remove ${c.name}">&times;</button>
      </li>`
      )
      .join('');
  }

  if (totalEl) totalEl.textContent = `KES ${cartTotal(cart).toLocaleString()}`;
}

function toggleCart() {
  const panel = document.getElementById('cartPanel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) renderCartPanel();
}

function checkoutViaWhatsApp() {
  const cart = getCart();
  if (!cart.length) {
    openWA('Hi HEMEGO, I would like to place an order.');
    return;
  }
  const lines = cart.map((c) => `- ${c.name} x${c.qty} (KES ${(c.price * c.qty).toLocaleString()})`).join('\n');
  openWA(`Hi HEMEGO, I would like to order:\n${lines}\nTotal: KES ${cartTotal(cart).toLocaleString()}`);
}

/* ---- Search Overlay ---- */
let searchProducts = [];

function initSearchProducts() {
  // Collect product data from shop page if present
  const cards = document.querySelectorAll('[data-cat][data-price]');
  searchProducts = Array.from(cards).map((card) => {
    const nameEl = card.querySelector('.pname');
    const brandEl = card.querySelector('.pbrand');
    const priceEl = card.querySelector('.pprice');
    const imgEl = card.querySelector('img');
    const cat = card.dataset.cat;
    const price = parseInt(card.dataset.price, 10);
    return {
      id: card.dataset.id || nameEl?.textContent?.toLowerCase().replace(/\s+/g, '-') || 'product',
      name: nameEl?.textContent?.trim() || 'Product',
      brand: brandEl?.textContent?.trim() || '',
      category: cat,
      price: price,
      image: imgEl?.src || '',
      element: card
    };
  });
}

function openSearch() {
  let overlay = document.getElementById('searchOverlay');
  if (!overlay) {
    overlay = createSearchOverlay();
    document.body.appendChild(overlay);
  }
  initSearchProducts();
  
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // Focus the input after animation
  setTimeout(() => {
    const input = overlay.querySelector('.search-input');
    if (input) input.focus();
  }, 150);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  
  // Clear input and results
  setTimeout(() => {
    const input = overlay.querySelector('.search-input');
    const results = overlay.querySelector('.search-results');
    const suggestions = overlay.querySelector('.search-suggestions');
    const clearBtn = overlay.querySelector('.search-input-clear');
    if (input) input.value = '';
    if (results) results.classList.remove('open');
    if (suggestions) suggestions.style.display = 'block';
    if (clearBtn) clearBtn.classList.remove('visible');
  }, 300);
}

function createSearchOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-overlay-header">
      <span class="search-overlay-title">Search Products</span>
      <button class="search-overlay-close" aria-label="Close search">&times;</button>
    </div>
    <div class="search-overlay-body">
      <div class="search-input-wrap">
        <input type="text" class="search-input" placeholder="Search phones, laptops, watches, accessories..." autocomplete="off" spellcheck="false">
        <button class="search-input-clear" aria-label="Clear search">&times;</button>
      </div>
      <div class="search-results">
        <div class="search-results-header">
          <span class="search-results-count">0 results</span>
        </div>
        <div class="search-results-list"></div>
        <div class="search-empty" style="display:none;">No products found matching your search.</div>
      </div>
      <div class="search-suggestions">
        <div class="search-suggestions-title">Popular searches</div>
        <div class="search-suggestions-grid">
          <button class="search-suggestion" data-query="iPhone"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="18" r="1"/></svg><span class="search-suggestion-name">iPhone</span></button>
          <button class="search-suggestion" data-query="Samsung"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="18" r="1"/></svg><span class="search-suggestion-name">Samsung</span></button>
          <button class="search-suggestion" data-query="MacBook"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M1 19h22"/></svg><span class="search-suggestion-name">MacBook</span></button>
          <button class="search-suggestion" data-query="Watch"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="7"/><path d="M12 8v4l2 1"/></svg><span class="search-suggestion-name">Smart Watch</span></button>
          <button class="search-suggestion" data-query="Earbuds"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12V9a4 4 0 0 1 8 0v6a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-2z"/><path d="M20 12V9a4 4 0 0 0-8 0v6a3 3 0 0 0 3 3h3a2 2 0 0 0 2-2v-2z"/></svg><span class="search-suggestion-name">Earbuds</span></button>
          <button class="search-suggestion" data-query="Charger"><svg class="search-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2L6 14h5l-1 8 9-12h-5l1-8z"/></svg><span class="search-suggestion-name">Chargers</span></button>
        </div>
      </div>
    </div>
  `;
  
  // Event listeners
  overlay.querySelector('.search-overlay-close').addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
  
  const input = overlay.querySelector('.search-input');
  const clearBtn = overlay.querySelector('.search-input-clear');
  const results = overlay.querySelector('.search-results');
  const resultsList = overlay.querySelector('.search-results-list');
  const resultsCount = overlay.querySelector('.search-results-count');
  const emptyMsg = overlay.querySelector('.search-empty');
  const suggestions = overlay.querySelector('.search-suggestions');
  
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    clearBtn.classList.toggle('visible', term.length > 0);
    
    if (term.length === 0) {
      results.classList.remove('open');
      suggestions.style.display = 'block';
      return;
    }
    
    suggestions.style.display = 'none';
    results.classList.add('open');
    
    // Filter products
    const filtered = searchProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
    
    resultsCount.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
    
    if (filtered.length === 0) {
      resultsList.innerHTML = '';
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      resultsList.innerHTML = filtered.map(p => `
        <a href="shop.html#product-${p.id}" class="search-result-card" data-id="${p.id}">
          <div class="search-result-image">
            ${p.image ? `<img src="${p.image}" alt="${p.name}">` : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>'}
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-brand">${p.brand}</div>
          </div>
          <div class="search-result-price">KES ${p.price.toLocaleString()}</div>
        </a>
      `).join('');
    }
  });
  
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    results.classList.remove('open');
    suggestions.style.display = 'block';
    input.focus();
  });
  
  // Suggestion clicks
  overlay.querySelectorAll('.search-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      input.value = query;
      clearBtn.classList.add('visible');
      suggestions.style.display = 'none';
      results.classList.add('open');
      input.dispatchEvent(new Event('input'));
    });
  });
  
  // Keyboard: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSearch();
    }
  });
  
  return overlay;
}

function runSearch(term) {
  const trimmed = term.trim();
  if (!trimmed) return;
  
  // If on shop page, filter in place
  if (window.location.pathname.includes('shop.html')) {
    openSearch();
    const input = document.querySelector('.search-input');
    if (input) {
      input.value = trimmed;
      input.dispatchEvent(new Event('input'));
    }
  } else {
    // Redirect to shop with query param
    window.location.href = `shop.html?q=${encodeURIComponent(trimmed)}`;
  }
}

// Initialize search buttons
function initSearchButtons() {
  const desktopBtn = document.getElementById('desktopSearchBtn');
  const mobileBtn = document.getElementById('mobileSearchBtn');
  
  if (desktopBtn) {
    desktopBtn.addEventListener('click', openSearch);
  }
  if (mobileBtn) {
    mobileBtn.addEventListener('click', openSearch);
  }
  
  // Check for search query param on shop page
  if (window.location.pathname.includes('shop.html')) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      // Wait for DOM to be ready
      setTimeout(() => runSearch(q), 100);
    }
  }
}

/* ---- FAQ Toggle (unified for both button and item element) ---- */
function toggleFaq(el) {
  // Handle both button (faq-question) and item (faq-item) elements
  const item = el.closest('.faq-item');
  if (!item) return;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

/* ---- Product card tilt effect ---- */
function initProductTilt() {
  const cards = document.querySelectorAll('.pcard-hero, .pcard-sm, .pcard-feat, .pcard');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `translateY(-3px)
      rotateX(${-y * 2.5}deg)
      rotateY(${x * 2.5}deg)`;
      card.style.transition = 'box-shadow .2s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all .35s cubic-bezier(.4,0,.2,1)';
    });
  });
}

/* ---- Booking form WhatsApp handler ---- */
function initBookingForm() {
  const bookingWa = document.getElementById('bookingWa');
  if (!bookingWa) return;
  
  bookingWa.addEventListener('click', () => {
    const device = document.getElementById('deviceSelect')?.value || '';
    const model = document.getElementById('modelInput')?.value || '';
    const issue = document.getElementById('issueSelect')?.value || '';
    const details = document.getElementById('detailsInput')?.value || '';
    const phone = document.getElementById('phoneInput')?.value || '';
    
    const msg = `Hi Hemego Techprise,

I need a repair estimate.

Device: ${device}
Model: ${model}
Issue: ${issue}
Details: ${details}
My number: ${phone}

Please advise. Thank you.`;
    
    openWA(msg);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  initSearchButtons();
  initProductTilt();
  initBookingForm();
});
