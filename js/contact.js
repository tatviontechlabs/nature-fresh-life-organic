/* ============================================
   NFL — contact.js
   Contact form functionality:
   - Client-side validation
   - EmailJS integration
   - Toast notifications
   ============================================ */

const EMAILJS_PUBLIC_KEY = '1nn3PNH16FC1lFnPN';
const EMAILJS_SERVICE_ID = 'fVk58b5vvbtVJ67lZvGwo';
const EMAILJS_TEMPLATE_ID = 'template_contact'; // Configure this template ID in EmailJS dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('EmailJS SDK not loaded. Forms will run in simulation mode.');
  }

  const form = document.getElementById('contactForm');

  // ── Form Validation Rules ──
  const validationRules = {
    contactName: {
      required: true,
      minLength: 2,
      message: 'Please enter your full name (at least 2 characters)'
    },
    contactEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    contactPhone: {
      required: false,
      pattern: /^[+]?[\d\s()-]{8,15}$/,
      message: 'Please enter a valid phone number'
    },
    contactMessage: {
      required: true,
      minLength: 5,
      message: 'Please enter a message (at least 5 characters)'
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

    // Pattern check (only if there is a value or if it is required)
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
  const formFields = form ? form.querySelectorAll('.form-input, textarea') : [];
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
        const firstError = form.querySelector('.form-input.error, textarea.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      // Collect form data
      const formData = {
        fullName: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value.trim()
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

      try {
        if (typeof emailjs !== 'undefined') {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData);
        } else {
          // Simulation fallback
          console.log('EmailJS not loaded, simulating submission:', formData);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Success
        showToast('Thank you! Your message has been sent. We will respond shortly.', 'success');
        form.reset();

      } catch (error) {
        console.error('Error sending contact form:', error);
        showToast('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
