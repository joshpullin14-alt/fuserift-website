(() => {
  'use strict';
  const config = window.FUSERIFT_CONFIG || {};
  const httpsURL = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
    catch { return null; }
  };
  document.querySelectorAll('[data-config-link]').forEach(link => {
    const url = httpsURL(config[link.dataset.configLink]);
    if (url) {
      link.href = url;
      link.removeAttribute('aria-disabled');
      if (link.dataset.configLink !== 'DOWNLOAD_URL') link.rel = 'noopener noreferrer';
      if (link.dataset.availableText) link.textContent = link.dataset.availableText;
    }
  });
  document.querySelectorAll('[data-version]').forEach(el => {
    el.textContent = config.LATEST_VERSION || 'Experimental Early Alpha';
  });
  document.querySelectorAll('[data-filename]').forEach(el => {
    el.textContent = config.DOWNLOAD_FILENAME || 'Release file not yet provided';
  });
  const download = httpsURL(config.DOWNLOAD_URL);
  document.querySelectorAll('[data-release-status]').forEach(el => {
    el.textContent = download ? 'The complete installer is ready to download.' : 'The installer is prepared. The public download is being connected.';
  });
  document.querySelectorAll('[data-show-when]').forEach(el => {
    el.hidden = !httpsURL(config[el.dataset.showWhen]);
  });
  document.querySelectorAll('[data-hide-when]').forEach(el => {
    el.hidden = !!httpsURL(config[el.dataset.hideWhen]);
  });
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (menuButton && nav) {
    menuButton.hidden = false;
    const closeMenu = (focus = false) => {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      if (focus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true); });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
    document.addEventListener('focusin', event => { if (!event.target.closest('.site-header')) closeMenu(); });
    matchMedia('(min-width: 821px)').addEventListener('change', () => closeMenu());
  }
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-fusion-card]')];
  const search = document.querySelector('#fusion-search');
  let selectedFilter = 'All';
  const filterCards = () => {
    const term = search?.value.trim().toLowerCase() || '';
    let visible = 0;
    cards.forEach(card => {
      const matches = (selectedFilter === 'All' || card.dataset.type === selectedFilter) && card.dataset.search.includes(term);
      card.hidden = !matches;
      if (matches) visible++;
    });
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${visible} ${visible === 1 ? 'Fusion' : 'Fusions'} shown`;
    const empty = document.querySelector('#no-results');
    if (empty) empty.hidden = visible !== 0;
  };
  filters.forEach(button => button.addEventListener('click', () => {
    selectedFilter = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterCards();
  }));
  search?.addEventListener('input', filterCards);
  const copy = document.querySelector('[data-copy-report]');
  copy?.addEventListener('click', async () => {
    const template = document.querySelector('#report-template');
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(template.value);
      status.textContent = 'Bug report template copied.';
    } catch {
      template.focus(); template.select();
      status.textContent = 'Template selected. Use Ctrl+C (or your device’s Copy action).';
    }
  });
})();
