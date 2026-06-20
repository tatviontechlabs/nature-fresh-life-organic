/* ============================================
   NFL — contact.js
   Contact form functionality:
   - Client-side validation
   - FormSubmit.co email integration (no account / no login required)
   - Toast notifications
   ============================================ */

/* Email delivery is handled by sendInquiry() in main.js:
   primary = EmailJS, automatic fallback = FormSubmit.co.
   getISTTimestamp() also lives in main.js. */

document.addEventListener('DOMContentLoaded', () => {
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

      const istTime = getISTTimestamp();
      const subject = `📩 New Contact Message from ${formData.fullName} — NFL Website`;

      // Pre-formatted HTML body for the EmailJS template ({{message}} variable).
      const messageHtml = `
        <h2 style="margin:0 0 12px;color:#2E7D32;font-family:Arial,sans-serif;">New Contact Message</h2>
        <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;color:#333;">
          <tr><td style="font-weight:bold;background:#f0fdf4;">Name</td><td>${formData.fullName}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Email</td><td>${formData.email}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Phone</td><td>${formData.phone || '—'}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Subject</td><td>${formData.subject || 'General Inquiry'}</td></tr>
          <tr><td style="font-weight:bold;background:#f0fdf4;">Message</td><td>${formData.message}</td></tr>
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
        'Name': formData.fullName,
        'Email': formData.email,
        'Phone': formData.phone || '—',
        'Subject': formData.subject || 'General Inquiry',
        'Message': formData.message,
        'Submitted At (IST)': istTime,
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _replyto: formData.email
      };

      try {
        await sendInquiry(emailjsParams, formsubmitPayload);

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
