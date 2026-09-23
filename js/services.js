/* HEMEGO TECHPRISE — Services page specific behavior */

/* ---- Breakdown Tabs ---- */
function switchTab(btn, id) {
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.breakdown-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
}

function scrollToTab(id) {
  const el = document.getElementById('breakdown');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    const btn = document.getElementById('tab-' + id);
    if (btn) switchTab(btn, id);
  }, 400);
}

// Initialize tab buttons on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up click handlers for overview cards that link to tabs
  document.querySelectorAll('#services-overview-grid .ov-card[onclick]').forEach(card => {
    const onclick = card.getAttribute('onclick');
    if (onclick && onclick.includes("scrollToTab('")) {
      const match = onclick.match(/scrollToTab\('([^']+)'\)/);
      if (match) {
        const tabId = match[1];
        card.addEventListener('click', () => scrollToTab(tabId));
      }
    }
  });
});