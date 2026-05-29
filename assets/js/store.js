/* ================================================
   STORE.JS — Store Management Module
   Excel Columns + Google Sheets Sync + Photo
   URL: Panchhi Fashion
   ================================================ */

const Store = {

  _filterType: 'all',

  SHEET_URL: 'https://script.google.com/macros/s/AKfycbw-DmUEw4atM28jOeJh4G5lZEXI3lxRu4MGp_FdlHYIAHE6EWMmVFmxfJIX2W-_go2d/exec',

  html() {
    return `
    <div class="section" id="section-store">
      <div class="page-header">
        <div>
          <div class="page-heading">🏪 Store Management</div>
          <div class="page-heading-sub">
            Kon kya lekar gaya — sab record karo
          </div>
        </div>
      </div>

      <div class="grid-2">

        <!-- ENTRY FORM -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📝</div>
            Naya Store Entry
          </div>

          <!-- Sl. No + Date -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sl. No. (Auto)</label>
              <input type="text" class="form-control" id="storeId"
                     readonly
                     style="color:var(--accent-gold);font-weight:700;">
            </div>
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" id="storeDate">
            </div>
          </div>

          <!-- Name + Department -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Name (Employee) *</label>
              <select class="form-control" id="storePerson"
                      onchange="Store.onPersonChange()">
                <option value="">-- Select karo --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Department (Auto)</label>
              <input type="text" class="form-control" id="storeDept"
                     readonly placeholder="Auto fill hoga">
            </div>
          </div>

          <!-- PLANT/HO/GLOBAL -->
          <div class="form-group">
            <label class="form-label">PLANT / HO / GLOBAL *</label>
            <select class="form-control" id="storeLocation">
              <option value="PLANT">PLANT</option>
              <option value="HO">HO (Head Office)</option>
              <option value="GLOBAL">GLOBAL</option>
            </select>
          </div>

          <!-- Item + Qty -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Item *</label>
              <input type="text" class="form-control" id="storeItem"
                     placeholder="Item ka naam">
            </div>
            <div class="form-group">
              <label class="form-label">Qty. *</label>
              <input type="number" class="form-control" id="storeQty"
                     placeholder="Quantity" min="0" step="0.5">
            </div>
          </div>

          <!-- Serial No + NEW OR OLD -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Serial No.</label>
              <input type="text" class="form-control" id="storeSerial"
                     placeholder="Serial number (if any)">
            </div>
            <div class="form-group">
              <label class="form-label">NEW OR OLD</label>
              <select class="form-control" id="storeCondition">
                <option value="NEW">NEW</option>
                <option value="OLD">OLD</option>
                <option value="REFURBISHED">REFURBISHED</option>
              </select>
            </div>
          </div>

          <!-- PO / PR -->
          <div class="form-highlight">
            <div class="form-highlight-title">
              ⚠️ PO / PR Details
              <span style="font-weight:400;
                           color:var(--text-muted);
                           font-size:11px;">
                (Khali chhodo toh har 3 ghante reminder ayega!)
              </span>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PO NUMBER</label>
                <input type="text" class="form-control" id="storePO"
                       placeholder="PO-XXXX">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PR NUMBER</label>
                <input type="text" class="form-control" id="storePR"
                       placeholder="PR-XXXX">
              </div>
            </div>
          </div>

          <!-- Remark -->
          <div class="form-group">
            <label class="form-label">REMARK (IF ANY)</label>
            <input type="text" class="form-control" id="storeRemark"
                   placeholder="Koi note ho toh...">
          </div>

          <!-- Photo Attachment -->
          <div class="form-group">
            <label class="form-label">
              📸 Photo Attachment (Max 5MB)
            </label>
            <input type="file" class="form-control" id="storePhoto"
                   accept="image/*"
                   onchange="Store.checkPhotoSize(this)">
            <div class="form-hint" id="photoStatus">
              Koi photo nahi chuni gayi
            </div>
            <input type="hidden" id="storePhotoBase64">
          </div>

          <!-- Sync Status -->
          <div class="sync-status" id="storeSyncStatus">
            <span id="storeSyncIcon">☁️</span>
            <span id="storeSyncText">
              Google Sheets sync ready
            </span>
          </div>

          <!-- Save Button -->
          <button class="btn btn-primary btn-block mt-10"
                  onclick="Store.add()">
            📦 Store Entry Save Karo
          </button>
        </div>

        <!-- ENTRIES LIST -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Store Entries
            <div class="card-actions">
              <button class="btn btn-success btn-sm"
                      onclick="Store.exportExcel()">
                📊 Excel
              </button>
              <button class="btn btn-danger btn-sm"
                      onclick="Store.exportPDF()">
                📄 PDF
              </button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button class="filter-tab active"
                    onclick="Store.filter('all', this)">
              All
            </button>
            <button class="filter-tab"
                    onclick="Store.filter('pending', this)">
              ⚠️ Pending PO/PR
            </button>
          </div>

          <!-- Search -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="storeSearch"
                   placeholder="Item, person ya ID se dhundo..."
                   oninput="Store._renderTable()">
          </div>

          <!-- Table -->
          <div class="table-wrap"
               style="max-height:430px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>PO#</th>
                  <th>PR#</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="storeTableBody">
                <tr class="empty-row">
                  <td colspan="9">📭 Koi entry nahi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /grid-2 -->

      <!-- PENDING PO/PR SECTION -->
      <div class="card mt-20"
           style="border-color:rgba(247,151,30,0.3);">
        <div class="card-title" style="color:var(--warning);">
          <div class="card-icon"
               style="background:rgba(247,151,30,0.2);">⚠️</div>
          Pending PO / PR — Incomplete Entries
          <span class="badge badge-warning"
                id="pendingCount">0</span>
        </div>
        <div id="pendingPOPRList">
          <p class="text-muted text-center" style="padding:20px;">
            ✅ Sab entries complete hain!
          </p>
        </div>
      </div>

    </div><!-- /section-store -->
    `;
  },

  // ============================================
  // PHOTO CHECK
  // ============================================

  checkPhotoSize(input) {
    const file     = input.files[0];
    const statusEl = document.getElementById('photoStatus');
    const base64El = document.getElementById('storePhotoBase64');

    if (!file) {
      statusEl.textContent = 'Koi photo nahi chuni gayi';
      base64El.value       = '';
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      Toast.error(
        'Photo bohot badi hai!',
        'Max 5MB allowed hai. Chhoti photo chuno.'
      );
      input.value          = '';
      statusEl.textContent = '❌ File too large (Max 5MB)';
      base64El.value       = '';
      return;
    }

    // Base64 convert
    const reader  = new FileReader();
    reader.onload = function(e) {
      base64El.value       = e.target.result;
      const kb             = (file.size / 1024).toFixed(1);
      statusEl.textContent = `✅ Photo ready: ${file.name} (${kb} KB)`;
      statusEl.style.color = 'var(--success)';
    };
    reader.readAsDataURL(file);
  },

  // ============================================
  // PERSON CHANGE — AUTO DEPT FILL
  // ============================================

  onPersonChange() {
    const id  = document.getElementById('storePerson')?.value;
    const emp = DB.employees.find(e => e.id === id);
    const el  = document.getElementById('storeDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  // ============================================
  // ADD STORE ENTRY
  // ============================================

  add() {
    const personId    = document.getElementById('storePerson')?.value;
    const date        = document.getElementById('storeDate')?.value;
    const location    = document.getElementById('storeLocation')?.value;
    const item        = document.getElementById('storeItem')?.value.trim();
    const qty         = document.getElementById('storeQty')?.value;
    const serial      = document.getElementById('storeSerial')?.value.trim();
    const condition   = document.getElementById('storeCondition')?.value;
    const po          = document.getElementById('storePO')?.value.trim();
    const pr          = document.getElementById('storePR')?.value.trim();
    const remark      = document.getElementById('storeRemark')?.value.trim();
    const photoBase64 = document.getElementById('storePhotoBase64')?.value || '';
    const dept        = document.getElementById('storeDept')?.value;

    // Validation
    if (!personId) {
      Toast.error('Name select karo!');
      return;
    }
    if (!date) {
      Toast.error('Date fill karo!');
      return;
    }
    if (!item) {
      Toast.error('Item name likho!');
      return;
    }
    if (!qty) {
      Toast.error('Quantity fill karo!');
      return;
    }

    const emp   = DB.employees.find(e => e.id === personId);
    const entry = {
      id:         'ST' + String(DB.storeEntries.length + 1).padStart(4, '0'),
      date,
      personId,
      personName: emp ? emp.name : 'Unknown',
      dept:       dept || '',
      location,
      item,
      qty:        parseFloat(qty),
      serial:     serial || '',
      condition,
      po:         po || '',
      pr:         pr || '',
      remark:     remark || '',
      photo:      photoBase64,
      isComplete: !!(po && pr),
      synced:     false,
      addedOn:    new Date().toISOString()
    };

    DB.storeEntries.push(entry);

    // PO/PR missing — har 3 ghante reminder
    if (!entry.isComplete) {
      const missing = [];
      if (!po) missing.push('PO Number');
      if (!pr) missing.push('PR Number');

      const nextReminder = new Date(Date.now() + 3 * 3600000);

      DB.reminders.push({
        id:            Date.now(),
        title:         `${entry.id}: ${item} — ${missing.join(' & ')} missing!`,
        desc:          `Store entry mein ${missing.join(' aur ')} fill karna baaki hai`,
        datetime:      nextReminder.toISOString().slice(0, 16),
        type:          'store',
        priority:      'High',
        repeat:        'once',
        done:          false,
        linkedStoreId: entry.id,
        isRecurring:   true
      });

      Toast.warning(
        'Auto Reminder Set! 🔔',
        `${missing.join(' & ')} — har 3 ghante remind karega`
      );
    }

    DB.save();
    this.update();
    this._clearForm();
    App.updateBadges();

    // Google Sheets sync
    this._syncToSheets(entry);

    Toast.success('Entry Saved! ✅', `${entry.id} — ${item}`);
  },

  // ============================================
  // GOOGLE SHEETS SYNC — NEW ENTRY
  // ============================================

  _syncToSheets(entry) {
    this._setSyncStatus('loading', '🔄 Google Sheets mein save ho raha hai...');

    const data = {
      sheetName:  'Store Entries',
      action:     'add',
      slNo:       entry.id,
      date:       entry.date,
      name:       entry.personName,
      department: entry.dept      || '',
      location:   entry.location  || '',
      item:       entry.item,
      qty:        entry.qty,
      serialNo:   entry.serial    || '',
      poNumber:   entry.po        || '',
      prNumber:   entry.pr        || '',
      newOrOld:   entry.condition || '',
      remark:     entry.remark    || ''
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(() => {
      entry.synced = true;
      DB.save();
      this._setSyncStatus(
        'success',
        '✅ Google Sheets mein save ho gaya!'
      );
      setTimeout(() => {
        this._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(err => {
      console.error('Store sync error:', err);
      this._setSyncStatus(
        'error',
        '❌ Sync failed — data local mein saved hai'
      );
    });
  },

  // ============================================
  // GOOGLE SHEETS SYNC — PO/PR UPDATE
  // ============================================

  _syncPOPRUpdate(entry) {
    const data = {
      sheetName: 'Store Entries',
      action:    'updatePOPR',
      slNo:      entry.id,
      poNumber:  entry.po || '',
      prNumber:  entry.pr || ''
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(() => {
      console.log('PO/PR updated in Google Sheets ✅');
      this._setSyncStatus('success', '✅ PO/PR updated in Sheets!');
      setTimeout(() => {
        this._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(err => {
      console.error('PO/PR sync error:', err);
    });
  },

  // ============================================
  // AUTO SYNC — UNSYNCED ENTRIES
  // ============================================

  _autoSyncPending() {
    const unsynced = DB.storeEntries.filter(e => !e.synced);
    if (!unsynced.length) return;

    unsynced.forEach(entry => {
      const data = {
        sheetName:  'Store Entries',
        action:     'add',
        slNo:       entry.id,
        date:       entry.date,
        name:       entry.personName,
        department: entry.dept      || '',
        location:   entry.location  || '',
        item:       entry.item,
        qty:        entry.qty,
        serialNo:   entry.serial    || '',
        poNumber:   entry.po        || '',
        prNumber:   entry.pr        || '',
        newOrOld:   entry.condition || '',
        remark:     entry.remark    || ''
      };

      fetch(this.SHEET_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      })
      .then(() => {
        entry.synced = true;
        DB.save();
        console.log(`Auto synced: ${entry.id} ✅`);
      })
      .catch(err => {
        console.error(`Auto sync failed: ${entry.id}`, err);
      });
    });
  },

  // ============================================
  // SYNC STATUS UI
  // ============================================

  _setSyncStatus(type, msg) {
    const textEl = document.getElementById('storeSyncText');
    if (!textEl) return;

    textEl.textContent = msg;

    const colors = {
      success: 'var(--success)',
      error:   'var(--danger)',
      warning: 'var(--warning)',
      loading: 'var(--info)',
      idle:    'var(--text-muted)'
    };

    textEl.style.color = colors[type] || 'var(--text-muted)';
  },

  // ============================================
  // DELETE ENTRY
  // ============================================

  delete(id) {
    if (!Utils.confirm('Store entry delete karna chahte ho?')) return;
    DB._data.storeEntries = DB.storeEntries.filter(e => e.id !== id);
    DB.save();
    this.update();
    App.updateBadges();
    Toast.warning('Entry deleted', '');
  },

  // ============================================
  // EDIT ENTRY — MODAL
  // ============================================

  edit(id) {
    const entry = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    Modal.show(
      `✏️ Update Entry — ${entry.id}`,
      `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Entry ID</label>
          <input class="form-control" value="${entry.id}"
                 readonly style="color:var(--accent-gold);">
        </div>
        <div class="form-group">
          <label class="form-label">Item</label>
          <input class="form-control" value="${entry.item}" readonly>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PO NUMBER</label>
          <input class="form-control" id="edit-po"
                 value="${entry.po || ''}"
                 placeholder="PO-XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">PR NUMBER</label>
          <input class="form-control" id="edit-pr"
                 value="${entry.pr || ''}"
                 placeholder="PR-XXXX">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">REMARK</label>
        <input class="form-control" id="edit-remark"
               value="${entry.remark || ''}"
               placeholder="Note...">
      </div>

      <button class="btn btn-primary btn-block mt-15"
              onclick="Store._saveEdit('${entry.id}')">
        💾 Update Karo
      </button>
      `
    );
  },

  // ---- Save Edit ----
  _saveEdit(id) {
    const entry = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    entry.po         = document.getElementById('edit-po')?.value.trim()     || '';
    entry.pr         = document.getElementById('edit-pr')?.value.trim()     || '';
    entry.remark     = document.getElementById('edit-remark')?.value.trim() || '';
    entry.isComplete = !!(entry.po && entry.pr);

    // Linked reminders done mark karo
    if (entry.isComplete) {
      DB.reminders.forEach(r => {
        if (r.linkedStoreId === entry.id) r.done = true;
      });
    }

    DB.save();

    // Google Sheets mein PO/PR update karo
    this._syncPOPRUpdate(entry);

    Modal.close();
    this.update();
    App.updateBadges();
    Toast.success('Updated! ✅', `${entry.id} — PO/PR update ho gaya`);
  },

  // ============================================
  // FILTER
  // ============================================

  filter(type, btn) {
    this._filterType = type;
    document.querySelectorAll('#section-store .filter-tab').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  // ============================================
  // RENDER TABLE
  // ============================================

  _renderTable() {
    const tbody = document.getElementById('storeTableBody');
    if (!tbody) return;

    const q = (
      document.getElementById('storeSearch')?.value || ''
    ).toLowerCase();

    let list = [...DB.storeEntries].reverse();

    // Filter
    if (this._filterType === 'pending') {
      list = list.filter(e => !e.isComplete);
    }

    // Search
    if (q) {
      list = list.filter(e =>
        e.item.toLowerCase().includes(q)        ||
        e.personName.toLowerCase().includes(q)  ||
        e.id.toLowerCase().includes(q)          ||
        (e.po || '').toLowerCase().includes(q)  ||
        (e.pr || '').toLowerCase().includes(q)
      );
    }

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">📭 Koi entry nahi mili</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list.map(e => {
      const poBadge = e.po
        ? `<span class="text-success text-bold"
                style="font-size:12px;">${e.po}</span>`
        : `<span>
             <span class="pending-dot"></span>
             <span class="text-warning"
                   style="font-size:11px;">Missing</span>
           </span>`;

      const prBadge = e.pr
        ? `<span class="text-success text-bold"
                style="font-size:12px;">${e.pr}</span>`
        : `<span>
             <span class="pending-dot"></span>
             <span class="text-warning"
                   style="font-size:11px;">Missing</span>
           </span>`;

      const syncIcon = e.synced
        ? `<span title="Synced" style="font-size:10px;">☁️✅</span>`
        : `<span title="Not synced" style="font-size:10px;">☁️⏳</span>`;

      return `
        <tr>
          <td>
            <span class="text-gold text-bold"
                  style="font-size:11px;">${e.id}</span>
            ${syncIcon}
          </td>
          <td style="font-size:12px;">${e.date}</td>
          <td>
            <div class="text-bold" style="font-size:13px;">
              ${e.personName}
            </div>
            <div class="text-xs text-muted">${e.dept || ''}</div>
          </td>
          <td>
            <span class="badge badge-primary"
                  style="font-size:10px;">${e.location || '—'}</span>
          </td>
          <td>
            <div class="text-bold">${e.item}</div>
            <div class="text-xs text-muted">
              ${e.serial ? 'S/N: ' + e.serial : ''}
              ${e.condition ? '| ' + e.condition : ''}
            </div>
          </td>
          <td class="text-bold">${e.qty}</td>
          <td>${poBadge}</td>
          <td>${prBadge}</td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-warning"
                      onclick="Store.edit('${e.id}')"
                      title="Edit / Fill PO-PR">✏️</button>
              <button class="btn btn-sm btn-danger"
                      onclick="Store.delete('${e.id}')"
                      title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ============================================
  // PENDING PO/PR SECTION
  // ============================================

  _updatePending() {
    const pending = DB.storeEntries.filter(e => !e.isComplete);
    const countEl = document.getElementById('pendingCount');
    if (countEl) countEl.textContent = pending.length;

    const listEl = document.getElementById('pendingPOPRList');
    if (!listEl) return;

    if (!pending.length) {
      listEl.innerHTML = `
        <p class="text-muted text-center" style="padding:20px;">
          ✅ Sab entries complete hain!
        </p>`;
      return;
    }

    listEl.innerHTML = pending.map(e => {
      const missing = [];
      if (!e.po) missing.push('PO Number');
      if (!e.pr) missing.push('PR Number');

      return `
        <div class="reminder-item warning">
          <div style="display:flex;justify-content:space-between;
                      align-items:flex-start;gap:10px;">
            <div>
              <div class="rem-title">
                <span class="pending-dot"></span>
                ${e.id} — ${e.item}
              </div>
              <div class="rem-meta">
                📅 ${e.date} &nbsp;|&nbsp;
                👤 ${e.personName} &nbsp;|&nbsp;
                📍 ${e.location || '—'} &nbsp;|&nbsp;
                ❌ Missing: ${missing.join(', ')}
              </div>
            </div>
            <button class="btn btn-sm btn-warning"
                    onclick="Store.edit('${e.id}')">
              ✏️ Fill Karo
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============================================
  // STORE ID UPDATE
  // ============================================

  _updateStoreId() {
    const el = document.getElementById('storeId');
    if (el) {
      el.value = 'ST' + String(
        DB.storeEntries.length + 1
      ).padStart(4, '0');
    }
  },

  // ============================================
  // CLEAR FORM
  // ============================================

  _clearForm() {
    Utils.clearFields([
      'storePerson', 'storeDept',
      'storeItem',   'storeQty',
      'storeSerial', 'storePO',
      'storePR',     'storeRemark',
      'storePhoto',  'storePhotoBase64'
    ]);

    const locEl  = document.getElementById('storeLocation');
    const conEl  = document.getElementById('storeCondition');
    const statEl = document.getElementById('photoStatus');

    if (locEl)  locEl.value  = 'PLANT';
    if (conEl)  conEl.value  = 'NEW';
    if (statEl) {
      statEl.textContent = 'Koi photo nahi chuni gayi';
      statEl.style.color = '';
    }

    this._updateStoreId();
  },

  // ============================================
  // EXPORT EXCEL
  // ============================================

  exportExcel() {
    if (!DB.storeEntries.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(
      DB.storeEntries.map(e => ({
        'Sl. No.':         e.id,
        'Date':            e.date,
        'Name':            e.personName,
        'Department':      e.dept       || '',
        'PLANT/HO/GLOBAL': e.location   || '',
        'Item':            e.item,
        'Qty.':            e.qty,
        'Serial No.':      e.serial     || '',
        'PO NUMBER':       e.po         || 'MISSING',
        'PR NUMBER':       e.pr         || 'MISSING',
        'NEW OR OLD':      e.condition  || '',
        'REMARK (IF ANY)': e.remark     || ''
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Entries');
    XLSX.writeFile(
      wb,
      `Store_Entries_PanchhiFashion_${Utils.today()}.xlsx`
    );
    Toast.success('Excel Downloaded! 📊', '');
  },

  // ============================================
  // EXPORT PDF
  // ============================================

  exportPDF() {
    if (!DB.storeEntries.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF('l'); // Landscape

    // Header
    doc.setFillColor(108, 99, 255);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('PANCHHI FASHION — Store Report', 14, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Generated: ' + new Date().toLocaleDateString('en-IN') +
      '  |  By: Aditya (HR Admin)',
      14, 18
    );
    doc.setTextColor(30, 30, 30);

    doc.autoTable({
      startY: 28,
      head: [[
        'Sl. No.', 'Date', 'Name', 'Dept',
        'Location', 'Item', 'Qty.',
        'Serial', 'PO#', 'PR#',
        'New/Old', 'Remark'
      ]],
      body: DB.storeEntries.map(e => [
        e.id,
        e.date,
        e.personName,
        e.dept       || '—',
        e.location   || '—',
        e.item,
        e.qty,
        e.serial     || '—',
        e.po         || 'MISSING',
        e.pr         || 'MISSING',
        e.condition  || '—',
        e.remark     || '—'
      ]),
      styles:     { fontSize: 7, cellPadding: 2 },
      headStyles: {
        fillColor: [255, 215, 0],
        textColor: 30,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [255, 253, 245] },
      didParseCell(data) {
        if ([8, 9].includes(data.column.index) &&
            data.section === 'body') {
          if (data.cell.raw === 'MISSING') {
            data.cell.styles.textColor = [220, 50, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    Reports._footer(doc);
    doc.save(
      `Store_Report_PanchhiFashion_${Utils.today()}.pdf`
    );
    Toast.success('PDF Downloaded! 📄', '');
  },

  // ============================================
  // MASTER UPDATE
  // ============================================

  update() {
    Utils.populateEmpDropdowns(['storePerson']);

    const personEl = document.getElementById('storePerson');
    if (personEl) {
      personEl.onchange = () => Store.onPersonChange();
    }

    this._updateStoreId();
    this._renderTable();
    this._updatePending();
  }
};
