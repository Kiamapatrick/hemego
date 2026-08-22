/* HEMEGO TECHPRISE — shared behavior (nav, drawer, cart, fade-up, WhatsApp) */

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
const CART_KEY = 'hemego_cart';

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
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const count = getCart().reduce((sum, c) => sum + c.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartPanel() {
  const list = document.getElementById('cartPanelList');
  const totalEl = document.getElementById('cartPanelTotal');
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

document.addEventListener('DOMContentLoaded', renderCartBadge);
