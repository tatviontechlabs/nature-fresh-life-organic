/* ============================================
   NFL — product-detail.js
   Product detail page:
   - Parse ?id= and fetch product from products.json
   - Render bilingual details (English / ગુજરાતી) with a toggle
   - Composition, features, usage, pack sizes
   - Related products + SEO structured data
   ============================================ */

let PRODUCT_LANG = (localStorage.getItem('nflProductLang') === 'gu') ? 'gu' : 'en';
let CURRENT_PRODUCT = null;
let CURRENT_ALL = [];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  if (!productId) { showError(); return; }
  loadProduct(productId);
});

// Switch product language and re-render (global — used by inline onclick).
function setProductLang(lang) {
  PRODUCT_LANG = lang;
  localStorage.setItem('nflProductLang', lang);
  if (CURRENT_PRODUCT) renderProduct(CURRENT_PRODUCT, CURRENT_ALL);
}

// ── Load Product Data ──
async function loadProduct(id) {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const products = await response.json();
    const product = products.find(p => p.id === id);
    if (!product) { showError(); return; }
    renderProduct(product, products);
    updatePageMeta(product);
  } catch (error) {
    console.error('Error loading product:', error);
    showError();
  }
}

// ── Render Product Details ──
function renderProduct(product, allProducts) {
  CURRENT_PRODUCT = product;
  CURRENT_ALL = allProducts;

  const gu = PRODUCT_LANG === 'gu';
  const tx = (base) => (gu ? (product[base + 'Gu'] || product[base]) : product[base]);
  const T = (en, g) => (gu ? g : en);

  const container = document.getElementById('productContent');
  const badgeClass = getCategoryBadgeClass(product.category);

  const name = tx('name');
  const description = tx('description');
  const features = (gu ? product.featuresGu : product.features) || product.features || [];
  const usage = gu ? (product.usageGu || product.usage) : product.usage;

  // Breadcrumb
  const breadcrumbName = document.getElementById('breadcrumbProductName');
  if (breadcrumbName) breadcrumbName.textContent = name;

  // Composition (optional, bilingual)
  let compositionBlock = '';
  if (Array.isArray(product.composition) && product.composition.length) {
    const rows = product.composition.map(c => `
      <li class="flex items-start gap-3 py-2 border-b border-green-100 last:border-0">
        <span class="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
        <span class="text-gray-700">${gu ? (c.gu || c.en) : c.en}</span>
      </li>`).join('');
    compositionBlock = `
      <div class="animate-on-scroll">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm">🧪</span>
            ${T('Composition', 'બંધારણ')}
          </h2>
          <ul>${rows}</ul>
        </div>
      </div>`;
  }

  // Features (bilingual)
  const featuresList = features.map(f => `
    <li class="flex items-start gap-3 py-2">
      <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      <span>${f}</span>
    </li>`).join('');

  // Pack sizes (optional)
  const packBlock = (product.packSizes && product.packSizes.length) ? `
    <div class="mb-6">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">${T('Available Pack Sizes', 'ઉપલબ્ધ પેક સાઇઝ')}</h3>
      <div class="flex flex-wrap gap-3">
        ${product.packSizes.map(s => `
          <div class="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span class="font-semibold text-gray-800">${s}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  // Usage (optional)
  const usageBlock = usage ? `
    <div class="animate-on-scroll">
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${T('Recommended Usage', 'ઉપયોગ')}
        </h2>
        <p class="text-gray-600 leading-relaxed">${usage}</p>
      </div>
    </div>` : '';

  const waMessage = `Hello NFL, I am interested in ${product.name}. Please share more details and pricing.`;
  const waLink = `https://wa.me/919638291232?text=${encodeURIComponent(waMessage)}`;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

      <!-- Image -->
      <div class="animate-on-scroll slide-left">
        <div class="bg-gray-50 rounded-2xl p-6 lg:p-8 flex items-center justify-center">
          <img src="${product.image}" alt="${product.name}" class="w-full h-80 lg:h-[26rem] object-contain" />
        </div>
      </div>

      <!-- Info -->
      <div class="animate-on-scroll slide-right">
        <div class="lang-toggle notranslate mb-4" translate="no">
          <button type="button" onclick="setProductLang('en')" class="${gu ? '' : 'active'}">English</button>
          <button type="button" onclick="setProductLang('gu')" class="${gu ? 'active' : ''}">ગુજરાતી</button>
        </div>
        <span class="category-badge ${badgeClass} mb-4">${product.category}</span>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-4">${name}</h1>
        <p class="text-gray-600 text-lg leading-relaxed mb-6">${description}</p>

        ${packBlock}

        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <a href="quote.html?product=${encodeURIComponent(product.name)}" class="btn-primary justify-center">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            ${T('Request Quote', 'ભાવ મેળવો')}
          </a>
          <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
            ${T('WhatsApp Inquiry', 'વોટ્સએપ')}
          </a>
        </div>

        <a href="tel:+918849425517" class="flex items-center gap-3 text-gray-600 hover:text-green-700 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          <span>${T('Call us', 'કૉલ કરો')}: +91 88494 25517</span>
        </a>
      </div>
    </div>

    <!-- Composition + Features + Usage -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      ${compositionBlock}
      <div class="${compositionBlock ? 'lg:col-span-1' : 'lg:col-span-2'} animate-on-scroll">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">★</span>
            ${T('Features & Benefits', 'વિશેષતાઓ અને ફાયદાઓ')}
          </h2>
          <ul class="space-y-1">${featuresList}</ul>
        </div>
      </div>
      ${usageBlock}
    </div>

    <!-- Download Brochure CTA -->
    <div class="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 mb-16 text-white animate-on-scroll">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold mb-1">${T('Need more information?', 'વધુ માહિતી જોઈએ છે?')}</h3>
          <p class="text-green-100">${T('Talk to our team for detailed guidance on', 'અમારી ટીમ સાથે વાત કરો')} ${product.name}.</p>
        </div>
        <a href="quote.html?product=${encodeURIComponent(product.name)}" class="btn-orange whitespace-nowrap">
          ${T('Get a Quote', 'ભાવ મેળવો')}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </div>

    <div class="animate-on-scroll" id="relatedProducts"></div>
  `;

  renderRelatedProducts(product, allProducts, T, gu);
  initScrollAnimations();
}

// ── Render Related Products ──
function renderRelatedProducts(product, allProducts, T, gu) {
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  if (related.length === 0) return;

  const container = document.getElementById('relatedProducts');
  container.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-900 mb-8">${T('Related Products', 'સંબંધિત ઉત્પાદનો')}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${related.map(p => `
        <a href="product.html?id=${p.id}" class="product-card group block">
          <div class="product-image bg-gray-50" style="height: 180px;">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-4" loading="lazy" />
          </div>
          <div class="p-4">
            <span class="category-badge ${getCategoryBadgeClass(p.category)} text-xs">${p.category}</span>
            <h3 class="text-base font-bold text-gray-900 mt-2 group-hover:text-green-700 transition-colors">${gu ? (p.nameGu || p.name) : p.name}</h3>
            <p class="text-gray-500 text-sm mt-1 line-clamp-2">${gu ? (p.shortDescriptionGu || p.shortDescription) : p.shortDescription}</p>
          </div>
        </a>
      `).join('')}
    </div>
  `;
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

// ── Update Page Title, Meta & Structured Data (SEO) ──
function updatePageMeta(product) {
  const origin = 'https://naturefreshlifeorganic.com';
  const pageUrl = `${origin}/product.html?id=${product.id}`;
  const imageUrl = origin + '/' + product.image;
  const title = `${product.name} — ${product.category} | Nature Fresh Life Organic`;
  const desc = product.shortDescription;

  document.title = title;

  function upsertMeta(attr, key, value) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  upsertMeta('name', 'description', desc);
  upsertMeta('name', 'keywords', `${product.name}, ${product.category}, organic fertilizer, ${product.name} price, buy ${product.name}, NFL`);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:image', imageUrl);
  upsertMeta('property', 'og:url', pageUrl);
  upsertMeta('property', 'og:type', 'product');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', desc);
  upsertMeta('name', 'twitter:image', imageUrl);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = pageUrl;

  document.querySelectorAll('#dynamicProductSchema').forEach(s => s.remove());
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.name,
        "image": imageUrl,
        "description": product.description,
        "category": product.category,
        "sku": product.slug || String(product.id),
        "url": pageUrl,
        "brand": { "@type": "Brand", "name": "Nature Fresh Life Organic" },
        "manufacturer": { "@type": "Organization", "name": "Nature Fresh Life Organic" },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "priceCurrency": "INR",
          "url": `${origin}/quote.html?product=${encodeURIComponent(product.name)}`,
          "seller": { "@type": "Organization", "name": "Nature Fresh Life Organic" }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": origin + "/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": origin + "/products.html" },
          { "@type": "ListItem", "position": 3, "name": product.name, "item": pageUrl }
        ]
      }
    ]
  };
  const script = document.createElement('script');
  script.id = 'dynamicProductSchema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ── Show Error State ──
function showError() {
  const container = document.getElementById('productContent');
  container.innerHTML = `
    <div class="text-center py-20">
      <div class="text-6xl mb-4">🌿</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
      <p class="text-gray-600 mb-8">Sorry, the product you're looking for doesn't exist or has been removed.</p>
      <a href="products.html" class="btn-primary">Browse All Products</a>
    </div>
  `;
}

// ── Re-init Scroll Animations for Dynamic Content ──
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll:not(.animated)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}
