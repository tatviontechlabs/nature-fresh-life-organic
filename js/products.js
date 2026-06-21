/* ============================================
   NFL — products.js
   Products page:
   - Fetch & render flippable product cards
   - Bilingual content (English / ગુજરાતી) with a toggle
   - Search, category filter, sort
   - ItemList structured data (SEO)
   ============================================ */

// Flip a card between its front (image) and back (highlights). Global because
// it is referenced from inline onclick handlers in the rendered markup.
function toggleFlip(btn) {
  const card = btn.closest('.flip-card');
  if (card) card.classList.toggle('flipped');
}

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('productSearch');
  const sortSelect = document.getElementById('productSort');
  const filterContainer = document.getElementById('filterButtons');
  const noResults = document.getElementById('noResults');
  const productCount = document.getElementById('productCount');

  let allProducts = [];
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'name-asc';
  let productLang = (localStorage.getItem('nflProductLang') === 'gu') ? 'gu' : 'en';

  // Pick the right language variant of a field (falls back to English).
  const tx = (p, base) => (productLang === 'gu' ? (p[base + 'Gu'] || p[base]) : p[base]);
  const T = (en, gu) => (productLang === 'gu' ? gu : en);

  // ── Fetch Products from JSON ──
  async function loadProducts() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      allProducts = await response.json();
      renderFilters();
      applyFilters();
      injectProductListSchema();
    } catch (error) {
      console.error('Error loading products:', error);
      productGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg">Unable to load products. Please try again later.</p>
        </div>
      `;
    }
  }

  // ── Inject ItemList structured data (SEO) ──
  function injectProductListSchema() {
    const holder = document.getElementById('productListSchema');
    if (!holder || !allProducts.length) return;
    const base = 'https://naturefreshlifeorganic.com/';
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Nature Fresh Life Organic — Product Catalog',
      'numberOfItems': allProducts.length,
      'itemListElement': allProducts.map((p, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': p.name,
        'url': `${base}product.html?id=${p.id}`
      }))
    };
    holder.textContent = JSON.stringify(schema);
  }

  // ── Language Toggle (English / ગુજરાતી) ──
  function buildLangToggle() {
    const wrap = document.createElement('div');
    wrap.className = 'lang-toggle notranslate';
    wrap.setAttribute('translate', 'no');
    wrap.innerHTML = `
      <button type="button" data-l="en">English</button>
      <button type="button" data-l="gu">ગુજરાતી</button>`;
    wrap.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.l === productLang);
      b.addEventListener('click', () => {
        productLang = b.dataset.l;
        localStorage.setItem('nflProductLang', productLang);
        wrap.querySelectorAll('button').forEach(x => x.classList.toggle('active', x.dataset.l === productLang));
        applyFilters();
      });
    });
    return wrap;
  }

  if (sortSelect && sortSelect.parentElement) {
    sortSelect.parentElement.insertBefore(buildLangToggle(), sortSelect);
  }

  // ── Render Category Filter Buttons ──
  function renderFilters() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    let filtersHTML = `<button class="filter-btn active" data-category="all" aria-pressed="true">All Products</button>`;
    categories.forEach(cat => {
      filtersHTML += `<button class="filter-btn" data-category="${cat}" aria-pressed="false">${cat}</button>`;
    });
    filterContainer.innerHTML = filtersHTML;

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentCategory = btn.getAttribute('data-category');
        applyFilters();
      });
    });
  }

  // ── Get Category Badge Class ──
  function getCategoryBadgeClass(category) {
    const map = {
      'Organic Fertilizer': 'badge-organic',
      'Micronutrient Fertilizer': 'badge-micronutrient',
      'Micronutrient Blend': 'badge-micronutrient',
      'Soil Conditioner': 'badge-soil',
      'Bio Stimulant': 'badge-bio',
      'Water Soluble Fertilizer': 'badge-water-soluble',
      'Sulphur Fertilizer': 'badge-micronutrient'
    };
    return map[category] || 'badge-organic';
  }

  // ── Render a single flippable Product Card ──
  function renderProductCard(product) {
    const badgeClass = getCategoryBadgeClass(product.category);
    const name = tx(product, 'name');
    const desc = tx(product, 'shortDescription');
    const feats = (productLang === 'gu' ? product.featuresGu : product.features) || product.features || [];
    const topFeats = feats.slice(0, 4);
    const quoteUrl = `quote.html?product=${encodeURIComponent(product.name)}`;
    const waMsg = encodeURIComponent(`Hello NFL, I am interested in ${product.name}. Please share details and pricing.`);
    const waLink = `https://wa.me/919638291232?text=${waMsg}`;
    const packs = (product.packSizes || [])
      .map(s => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${s}</span>`).join('');

    const flipIcon = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
    const checkIcon = `<svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    const waIcon = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>`;

    return `
      <div class="product-grid-item flip-card" data-id="${product.id}">
        <div class="flip-card-inner">

          <!-- FRONT -->
          <div class="flip-card-front">
            <button class="flip-toggle" type="button" onclick="toggleFlip(this)" aria-label="${T('Show highlights', 'મુખ્ય ફાયદા જુઓ')}" title="${T('Highlights', 'મુખ્ય ફાયદા')}">${flipIcon}</button>
            <div class="product-image relative bg-gray-50" style="height: 180px;">
              <img src="${product.image}" alt="${product.name} - ${product.category} by Nature Fresh Life Organic" class="w-full h-full object-contain p-4" loading="lazy" />
              ${product.featured ? `<span class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">★ ${T('Featured', 'ફીચર્ડ')}</span>` : ''}
            </div>
            <div class="p-5 flex flex-col flex-1">
              <span class="category-badge ${badgeClass} self-start mb-2">${product.category}</span>
              <h3 class="text-lg font-bold text-gray-900 mb-1">${name}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">${desc}</p>
              ${packs ? `<div class="flex flex-wrap gap-2 mb-3">${packs}</div>` : ''}
              <a href="product.html?id=${product.id}" class="btn-primary text-sm w-full justify-center" aria-label="${T('View details for', 'વિગતો જુઓ')} ${product.name}">${T('View Details', 'વિગતો જુઓ')}</a>
            </div>
          </div>

          <!-- BACK -->
          <div class="flip-card-back p-5">
            <button class="flip-toggle" type="button" onclick="toggleFlip(this)" aria-label="${T('Back to image', 'પાછા જાઓ')}" title="${T('Back', 'પાછળ')}">${flipIcon}</button>
            <span class="category-badge ${badgeClass} self-start mb-2">${product.category}</span>
            <h3 class="text-base font-bold text-gray-900 mb-2 pr-10">${name}</h3>
            <p class="text-xs font-semibold uppercase tracking-wider text-nfl-dark-green mb-2">${T('Key Highlights', 'મુખ્ય ફાયદા')}</p>
            <ul class="flip-card-back-body space-y-2 mb-4 text-sm text-gray-600 pr-1">
              ${topFeats.map(f => `<li class="flex items-start gap-2">${checkIcon}<span>${f}</span></li>`).join('')}
            </ul>
            <div class="mt-auto flex gap-2">
              <a href="${quoteUrl}" class="btn-primary text-sm flex-1 justify-center" aria-label="${T('Request quote for', 'ભાવ મેળવો')} ${product.name}">${T('Request Quote', 'ભાવ મેળવો')}</a>
              <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp text-sm px-3" aria-label="WhatsApp inquiry">${waIcon}</a>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ── Apply Search, Filter, and Sort ──
  function applyFilters() {
    let filtered = [...allProducts];

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.nameGu || '').includes(currentSearch.trim()) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    switch (currentSort) {
      case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'category': filtered.sort((a, b) => a.category.localeCompare(b.category)); break;
      case 'featured': filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    const existingCards = productGrid.querySelectorAll('.product-grid-item');
    existingCards.forEach(card => card.classList.add('hiding'));

    setTimeout(() => {
      if (filtered.length === 0) {
        productGrid.innerHTML = '';
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
        productGrid.innerHTML = filtered.map(p => renderProductCard(p)).join('');

        requestAnimationFrame(() => {
          productGrid.querySelectorAll('.product-grid-item').forEach((card, i) => {
            card.style.transitionDelay = `${i * 0.05}s`;
            card.classList.add('showing');
          });
        });
      }

      if (productCount) {
        const label = productLang === 'gu' ? 'ઉત્પાદનો મળ્યાં' : `product${filtered.length !== 1 ? 's' : ''} found`;
        productCount.textContent = `${filtered.length} ${label}`;
      }
    }, 200);
  }

  // ── Event Listeners ──
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        applyFilters();
      }, 300);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  // ── Check URL for category filter ──
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');
  if (urlCategory) {
    currentCategory = urlCategory;
  }

  loadProducts();
});
