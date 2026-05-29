/* ================================================
   UTILS.JS — Toast, Modal, Helpers
   ================================================ */

/* ---- TOAST ---- */
const Toast = {
  show(title, msg = '', type = 'info', duration = 4000) {
    const icons = {
      success: '✅',
      error:   '❌',
      warning: '⚠️',
      info:    'ℹ️'
    };

    const el = document.createElement('div');
    el.className = `toast t-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
      </div>
    `;

    el.addEventListener('click', () => el.remove());
    document.getElementById('toastContainer').appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, duration);
  },

  success(title, msg) { this.show(title, msg, 'success'); },
  error(title, msg)   { this.show(title, msg, 'error');   },
  warning(title, msg) { this.show(title, msg, 'warning'); },
  info(title, msg)    { this.show(title, msg, 'info');    }
};

/* ---- MODAL ---- */
const Modal = {
  show(title, bodyHTML, onConfirm) {
    const existing = document.getElementById('globalModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'globalModal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" onclick="Modal.close()">&#x2715;</button>
        </div>
        <div id="modalBody">${bodyHTML}</div>
        ${onConfirm ? `
          <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
            <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" id="modalConfirmBtn">Confirm</button>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('modalContainer').appendChild(overlay);

    if (onConfirm) {
      document.getElementById('modalConfirmBtn').addEventListener('click', () => {
        onConfirm();
        this.close();
      });
    }

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
  },

  close() {
    const m = document.getElementById('globalModal');
    if (m) m.remove();
  }
};

/* ---- HELPERS ---- */
const Utils = {
  // Clear multiple inputs
  clearFields(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
  },

  // Format money
  money(num) {
    return '₹' + Number(num || 0).toLocaleString('en-IN');
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  // Get today
  today() {
    return new Date().toISOString().split('T')[0];
  },

  // Get this month
  thisMonth() {
    return new Date().toISOString().slice(0, 7);
  },

  // Days between two dates
  daysBetween(from, to) {
    const a = new Date(from);
    const b = new Date(to);
    return Math.max(1, Math.ceil((b - a) / 86400000) + 1);
  },

  // Populate <select> from employees
  populateEmpDropdowns(ids) {
    const opts = DB.employees.length === 0
      ? '<option value="">-- Pehle employee add karo --</option>'
      : '<option value="">-- Select karo --</option>' +
        DB.employees.map(e =>
          `<option value="${e.id}">${e.name} (${e.dept || 'No Dept'})</option>`
        ).join('');

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = opts;
    });
  },

  // Confirm dialog
  confirm(msg) {
    return window.confirm(msg);
  },

  // Generate ID
  nextId(prefix, arr) {
    return prefix + String(arr.length + 1).padStart(3, '0');
  }
};
