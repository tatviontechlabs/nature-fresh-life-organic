/* ============================================
   NFL — quote.js
   Request Quote form functionality:
   - Auto-fill product from URL param
   - Populate product dropdown from JSON
   - Client-side validation
   - FormSubmit.co email integration (no account / no login required)
   - Toast notifications
   ============================================ */

/* Email delivery is handled by sendInquiry() in main.js:
   primary = EmailJS, automatic fallback = FormSubmit.co.
   getISTTimestamp() also lives in main.js. */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quoteForm');
  const productSelect = document.getElementById('productSelect');
  const stateSelect = document.getElementById('state');

  // ── Populate Indian States Dropdown ──
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  if (stateSelect) {
    indianStates.forEach(state => {
      const option = document.createElement('option');
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });
  }

  // ── Populate Product Dropdown from JSON ──
  async function loadProducts() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      const products = await response.json();

      if (productSelect) {
        products.forEach(product => {
          const option = document.createElement('option');
          option.value = product.name;
          option.textContent = product.name;
          productSelect.appendChild(option);
        });

        // Auto-select product from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productName = urlParams.get('product');
        if (productName) {
          productSelect.value = decodeURIComponent(productName);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  loadProducts();

  // ── Form Validation Rules ──
  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      message: 'Please enter your full name (at least 2 characters)'
    },
    companyName: {
      required: false,
      message: ''
    },
    phone: {
      required: true,
      pattern: /^[+]?[\d\s()-]{8,15}$/,
      message: 'Please enter a valid phone number'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    state: {
      required: true,
      message: 'Please select your state'
    },
    country: {
      required: true,
      message: 'Please enter your country'
    },
    productSelect: {
      required: true,
      message: 'Please select a product'
    },
    quantity: {
      required: true,
      message: 'Please specify the quantity required'
    }
  };

  // ── Validate Single Field ──
  function validateField(field) {
    const rules = validationRules[field.id];
    if (!rules) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = rules.message;

    // Required check
    if (rules.required && !value) {
      isValid = false;
    }

    // Pattern check
    if (isValid && rules.pattern && value && !rules.pattern.test(value)) {
      isValid = false;
    }

    // Min length check
    if (isValid && rules.minLength && value.length < rules.minLength) {
      isValid = false;
    }

    // Update field UI
    const errorEl = field.parentElement.querySelector('.form-error');
    if (!isValid) {
      field.classList.add('error');
      if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.style.display = 'block';
      }
    } else {
      field.classList.remove('error');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }

    return isValid;
  }

  // ── Real-time Validation on Blur ──
  const formFields = form ? form.querySelectorAll('.form-input') : [];
  formFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  // ── Form Submit Handler ──
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let isFormValid = true;
      formFields.forEach(field => {
        if (!validateField(field)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        showToast('Please fill in all required fields correctly.', 'error');
        // Scroll to first error
        const firstError = form.querySelector('.form-input.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      // Collect form data
      const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        companyName: document.getElementById('companyName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        state: document.getElementById('state').value.trim(),
        country: document.getElementById('country').value.trim(),
        product: document.getElementById('productSelect').value,
        quantity: document.getElementById('quantity').value.trim(),
        cropType: document.getElementById('cropType').value.trim(),
        message: document.getElementById('message').value.trim()
      };

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      `;

      const istTime = getISTTimestamp();
      const subject = `🌱 New Quote Request from ${formData.fullName} — NFL Website`;

      // Pre-formatted HTML body for the EmailJS template ({{message}} variable).
      const messageHtml = `
        <h2 style="margin:0 0 12px;color:#2E7D32;font-family:Arial,sans-serif;">New Quote Request</h2>
        <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;color:#333;">
          <tr><td style="font-weight:bold;background:#f0fdf4;">Full Name</td><td>${formData.fullName}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Company</td><td>${formData.companyName || '—'}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Phone</td><td>${formData.phone}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Email</td><td>${formData.email}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">State</td><td>${formData.state}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Country</td><td>${formData.country}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Product</td><td>${formData.product}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Quantity</td><td>${formData.quantity}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Crop Type</td><td>${formData.cropType || '—'}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Message</td><td>${formData.message || '—'}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Submitted At</td><td>${istTime}</td></tr>
        </table>`;

      // Params for EmailJS (primary).
      const emailjsParams = {
        subject,
        from_name: formData.fullName,
        reply_to: formData.email,
        to_email: 'support@naturefreshlifeorganic.com',
        message: messageHtml
      };

      // Payload for FormSubmit (fallback).
      const formsubmitPayload = {
        'Full Name': formData.fullName,
        'Company': formData.companyName || '—',
        'Phone': formData.phone,
        'Email': formData.email,
        'State': formData.state,
        'Country': formData.country,
        'Product': formData.product,
        'Quantity Required': formData.quantity,
        'Crop Type': formData.cropType || '—',
        'Message': formData.message || '—',
        'Submitted At (IST)': istTime,
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _replyto: formData.email
      };

      try {
        await sendInquiry(emailjsParams, formsubmitPayload);

        // Success
        showToast('Thank you! Your inquiry has been submitted. We will contact you within 24 hours.', 'success');
        form.reset();

        // Re-check URL param to restore product selection
        const urlParams = new URLSearchParams(window.location.search);
        const productName = urlParams.get('product');
        if (productName && productSelect) {
          productSelect.value = decodeURIComponent(productName);
        }

      } catch (error) {
        console.error('Error sending form:', error);
        showToast('Sorry, there was an error sending your inquiry. Please try again or contact us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
