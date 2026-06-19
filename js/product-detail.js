/* ============================================
   NFL — product-detail.js
   Product detail page functionality:
   - Parse URL ?id= parameter
   - Fetch product from products.json
   - Render full product details
   - Image gallery
   - Related products
   - WhatsApp & quote buttons
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));

  if (!productId) {
    showError();
    return;
  }

  loadProduct(productId);
});

// ── Load Product Data ──
async function loadProduct(id) {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const products = await response.json();

    const product = products.find(p => p.id === id);
    if (!product) {
      showError();
      return;
    }

    renderProduct(product, products);
    updatePageMeta(product);

  } catch (error) {
    console.error('Error loading product:', error);
    showError();
  }
}

// ── Render Product Details ──
function renderProduct(product, allProducts) {
  const container = document.getElementById('productContent');
  const badgeClass = getCategoryBadgeClass(product.category);

  // Update breadcrumb
  const breadcrumbName = document.getElementById('breadcrumbProductName');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Build specifications table rows
  const specRows = Object.entries(product.specifications)
    .map(([key, value]) => `
      <tr class="border-b border-gray-100">
        <td class="py-3 pr-4 font-medium text-gray-700 whitespace-nowrap">${key}</td>
        <td class="py-3 text-gray-600">${value}</td>
      </tr>
    `).join('');

  // Build features list
  const featuresList = product.features
    .map(f => `
      <li class="flex items-start gap-3 py-2">
        <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span>${f}</span>
      </li>
    `).join('');

  // Build benefits list
  const benefitsList = product.benefits
    .map(b => `
      <li class="flex items-start gap-3 py-2">
        <svg class="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>${b}</span>
      </li>
    `).join('');

  // Build applications tags
  const applicationTags = product.applications
    .map(a => `<span class="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">${a}</span>`)
    .join('');

  // Build pack sizes
  const packSizeTags = product.packSizes
    .map(s => `
      <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
        <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <span class="font-semibold text-gray-800">${s}</span>
      </div>
    `).join('');

  // WhatsApp message for this product
  const waMessage = `Hello NFL, I am interested in ${product.name}. Please share more details and pricing.`;
  const waLink = `https://wa.me/919638291232?text=${encodeURIComponent(waMessage)}`;

  container.innerHTML = `
    <!-- Product Main Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">

      <!-- Image Gallery -->
      <div class="animate-on-scroll slide-left">
        <div class="bg-gray-50 rounded-2xl p-6 lg:p-8 mb-4">
          <img id="mainProductImage" src="${product.image}" alt="${product.name}" class="w-full h-80 lg:h-96 object-contain" />
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2" id="galleryThumbs">
          ${product.gallery.map((img, i) => `
            <button class="gallery-thumb ${i === 0 ? 'active' : ''} w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg p-2"
                    onclick="changeImage('${img}', this)" aria-label="View image ${i + 1}">
              <img src="${img}" alt="${product.name} view ${i + 1}" class="w-full h-full object-contain" />
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Product Info -->
      <div class="animate-on-scroll slide-right">
        <span class="category-badge ${badgeClass} mb-4">${product.category}</span>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-4">${product.name}</h1>
        <p class="text-gray-600 text-lg leading-relaxed mb-6">${product.description}</p>

        <!-- Pack Sizes -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Pack Sizes</h3>
          <div class="flex flex-wrap gap-3">
            ${packSizeTags}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <a href="quote.html?product=${encodeURIComponent(product.name)}" class="btn-primary justify-center">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Request Quote
          </a>
          <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Inquiry
          </a>
        </div>

        <!-- Call CTA -->
        <a href="tel:+918849425517" class="flex items-center gap-3 text-gray-600 hover:text-green-700 transition-colors mb-4">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span>Call us: +91 88494 25517</span>
        </a>
      </div>
    </div>

    <!-- Detailed Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

      <!-- Benefits -->
      <div class="lg:col-span-1 animate-on-scroll">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm">✓</span>
            Key Benefits
          </h2>
          <ul class="space-y-1">${benefitsList}</ul>
        </div>
      </div>

      <!-- Features -->
      <div class="lg:col-span-1 animate-on-scroll">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">★</span>
            Features
          </h2>
          <ul class="space-y-1">${featuresList}</ul>
        </div>
      </div>

      <!-- Specifications -->
      <div class="lg:col-span-1 animate-on-scroll">
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm">⚙</span>
            Specifications
          </h2>
          <table class="w-full text-sm">${specRows}</table>
        </div>
      </div>
    </div>

    <!-- Usage & Applications Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      <!-- Recommended Usage -->
      <div class="animate-on-scroll">
        <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recommended Usage
          </h2>
          <p class="text-gray-600 leading-relaxed">${product.usage || 'Contact us for detailed usage instructions tailored to your crop and soil conditions.'}</p>
        </div>
      </div>

      <!-- Applications -->
      <div class="animate-on-scroll">
        <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>
            Applications
          </h2>
          <div class="flex flex-wrap gap-2">${applicationTags}</div>
        </div>
      </div>
    </div>

    <!-- Download Brochure CTA -->
    <div class="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 mb-16 text-white animate-on-scroll">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold mb-1">Download Product Brochure</h3>
          <p class="text-green-100">Get detailed information about ${product.name} in PDF format.</p>
        </div>
        <button onclick="alert('Brochure coming soon! Please contact us for product details.')" class="btn-orange whitespace-nowrap">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Download Brochure
        </button>
      </div>
    </div>

    <!-- Related Products -->
    <div class="animate-on-scroll" id="relatedProducts"></div>
  `;

  // Render related products (same category, excluding current)
  renderRelatedProducts(product, allProducts);

  // Re-initialize scroll animations for dynamically added content
  initScrollAnimations();
}

// ── Render Related Products ──
function renderRelatedProducts(product, allProducts) {
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (related.length === 0) return;

  const container = document.getElementById('relatedProducts');
  const badgeClassFn = getCategoryBadgeClass;

  container.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${related.map(p => `
        <a href="product.html?id=${p.id}" class="product-card group block">
          <div class="product-image bg-gray-50" style="height: 180px;">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-4" loading="lazy" />
          </div>
          <div class="p-4">
            <span class="category-badge ${badgeClassFn(p.category)} text-xs">${p.category}</span>
            <h3 class="text-base font-bold text-gray-900 mt-2 group-hover:text-green-700 transition-colors">${p.name}</h3>
            <p class="text-gray-500 text-sm mt-1 line-clamp-2">${p.shortDescription}</p>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

// ── Change Gallery Image ──
function changeImage(src, thumb) {
  document.getElementById('mainProductImage').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
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

// ── Update Page Title & Meta ──
function updatePageMeta(product) {
  document.title = `${product.name} — Nature Fresh Life Organic`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.shortDescription;

  // Dynamic SEO JSON-LD Product Schema
  const existingSchema = document.getElementById('dynamicProductSchema');
  if (existingSchema) {
    existingSchema.remove();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": window.location.origin + '/' + product.image,
    "description": product.description,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": "Nature Fresh Life Organic"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "price": "0.00",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0.00",
        "priceCurrency": "INR"
      }
    }
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
