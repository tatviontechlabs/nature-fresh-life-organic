/* ============================================
   NFL — products.js
   Products page functionality:
   - Fetch & render product grid
   - Search by name/description
   - Category filter buttons
   - Sort (A-Z, Z-A)
   - Smooth filter animations
   ============================================ */

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

  // ── Fetch Products from JSON ──
  async function loadProducts() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      allProducts = await response.json();
      renderFilters();
      applyFilters();
    } catch (error) {
      console.error('Error loading products:', error);
      productGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg">Unable to load products. Please try again later.</p>
        </div>
      `;
    }
  }

  // ── Render Category Filter Buttons ──
  function renderFilters() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    let filtersHTML = `<button class="filter-btn active" data-category="all" aria-pressed="true">All Products</button>`;

    categories.forEach(cat => {
      filtersHTML += `<button class="filter-btn" data-category="${cat}" aria-pressed="false">${cat}</button>`;
    });

    filterContainer.innerHTML = filtersHTML;

    // Add click handlers to filter buttons
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
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
      'Phosphate Rich Organic Manure (PROM)': 'badge-organic',
      'Sulphur Fertilizer': 'badge-micronutrient'
    };
    return map[category] || 'badge-organic';
  }

  // ── Render Product Card HTML ──
  function renderProductCard(product) {
    const badgeClass = getCategoryBadgeClass(product.category);
    return `
      <div class="product-grid-item product-card" data-id="${product.id}">
        <div class="product-image relative bg-gray-50" style="height: 220px;">
          <img
            src="${product.image}"
            alt="${product.name} - ${product.category} by Nature Fresh Life Organic"
            class="w-full h-full object-contain p-4"
            loading="lazy"
          />
          ${product.featured ? '<span class="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">★ Featured</span>' : ''}
        </div>
        <div class="p-5">
          <span class="category-badge ${badgeClass} mb-3">${product.category}</span>
          <h3 class="text-lg font-bold text-gray-900 mt-2 mb-2">${product.name}</h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.shortDescription}</p>
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            ${product.packSizes.map(size => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${size}</span>`).join('')}
          </div>
          <div class="flex gap-2">
            <a href="product.html?id=${product.id}" class="btn-primary text-sm flex-1 justify-center" aria-label="View details for ${product.name}">
              View Details
            </a>
            <a href="quote.html?product=${encodeURIComponent(product.name)}" class="btn-secondary text-sm px-4" aria-label="Request quote for ${product.name}" title="Request Quote">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ── Apply Search, Filter, and Sort ──
  function applyFilters() {
    let filtered = [...allProducts];

    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Search filter
    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (currentSort) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    // Animate out existing cards, then render new ones
    const existingCards = productGrid.querySelectorAll('.product-grid-item');
    existingCards.forEach(card => card.classList.add('hiding'));

    setTimeout(() => {
      if (filtered.length === 0) {
        productGrid.innerHTML = '';
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
        productGrid.innerHTML = filtered.map(p => renderProductCard(p)).join('');

        // Animate in new cards
        requestAnimationFrame(() => {
          productGrid.querySelectorAll('.product-grid-item').forEach((card, i) => {
            card.style.transitionDelay = `${i * 0.05}s`;
            card.classList.add('showing');
          });
        });
      }

      // Update product count
      if (productCount) {
        productCount.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;
      }
    }, 200);
  }

  // ── Event Listeners ──
  if (searchInput) {
    // Debounced search
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

  // ── Initialize ──
  loadProducts();
});
