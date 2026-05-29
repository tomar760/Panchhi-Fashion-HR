/* ================================================
   STORE.JS — Store Management Module (Updated)
   Matches Excel Columns + Google Sheets + Photo
   ================================================ */

const Store = {

  _filterType: 'all',

  html() {
    return `
    <div class="section" id="section-store">
      <div class="page-header">
        <div>
          <div class="page-heading">🏪 Store Management</div>
          <div class="page-heading-sub">Kon kya lekar gaya — sab record karo</div>
        </div>
      </div>

      <div class="grid-2">

        <!-- ENTRY FORM -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📝</div>
            Naya Store Entry (Excel Format)
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sl. No. (Auto)</label>
              <input type="text" class="form-control" id="storeId"
                     readonly style="color:var(--accent-gold);font-weight:700;">
            </div>
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" id="storeDate">
            </div>
          </div>

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
                     readonly placeholder="Auto fill">
            </div>
          </div>

          <!-- NEW FIELD: PLANT/HO/GLOBAL -->
          <div class="form-group">
            <label class="form-label">PLANT / HO / GLOBAL *</label>
            <select class="form-control" id="storeLocation">
              <option value="PLANT">PLANT</option>
              <option value="HO">HO (Head Office)</option>
              <option value="GLOBAL">GLOBAL</option>
            </select>
          </div>

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

          <!-- PO / PR SECTION -->
          <div class="form-highlight">
            <div class="form-highlight-title">
              ⚠️ PO / PR Details (Har 3 ghante reminder ayega agar khali chhoda!)
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

          <div class="form-group">
            <label class="form-label">REMARK (IF ANY)</label>
            <input type="text" class="form-control" id="storeRemark"
                   placeholder="Koi note...">
          </div>

          <!-- NEW FIELD: PHOTO ATTACHMENT -->
          <div class="form-group">
            <label class="form-label">📸 Photo Attachment (Max 5MB)</label>
            <input type="file" class="form-control" id="storePhoto"
                   accept="image/*" onchange="Store.checkPhotoSize(this)">
            <div class="form-hint" id="photoStatus">Koi photo nahi chuni gayi</div>
            <input type="hidden" id="storePhotoBase64">
          </div>

          <button class="btn btn-primary btn-block"
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
                      onclick="Store.exportExcel()">📊 Excel</button>
              <button class="btn btn-danger btn-sm"
                      onclick="Store.exportPDF()">📄 PDF</button>
            </div>
          </div>

          <div class="filter-tabs">
            <button class="filter-tab active"
                    onclick="Store.filter('all',this)">All</button>
            <button class="filter-tab"
                    onclick="Store.filter('pending',this)">⚠️ Pending PO/PR</button>
            <button class="filter-tab"
                    onclick="Store.filter('Out',this)">📤 Out</button>
            <button class="filter-tab"
                    onclick="Store.filter('In',this)">📥 In</button>
          </div>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="storeSearch"
                   placeholder="Item, person ya ID se dhundo..."
                   oninput="Store._renderTable()">
          </div>

          <div class="table-wrap" style="max-height:430px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>PO#</th>
                  <th>PR#</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="storeTableBody">
                <tr class="empty-row">
                  <td colspan="8">📭 Koi entry nahi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- PENDING PO/PR SECTION -->
      <div class="card mt-20" style="border-color:rgba(247,151,30,0.3);">
        <div class="card-title" style="color:var(--warning);">
          <div class="card-icon" style="background:rgba(247,151,30,0.2);">⚠️</div>
          Pending PO / PR — Incomplete Entries
          <span class="badge badge-warning" id="pendingCount">0</span>
        </div>
        <div id="pendingPOPRList">
          <p class="text-muted text-center" style="padding:20px;">
            ✅ Sab entries complete hain!
          </p>
        </div>
      </div>

    </div>
    `;
  },

  // ---- Photo Size Check (Max 5MB) ----
  checkPhotoSize(input) {
    const file = input.files[0];
    const statusEl = document.getElementById('photoStatus');
    const base64El = document.getElementById('storePhotoBase64');

    if (!file) {
      statusEl.textContent = 'Koi photo nahi chuni gayi';
      base64El.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Toast.error('Photo bohot badi hai!', 'Max 5MB allowed hai. Doosri photo chuno.');
      input.value = '';
      statusEl.textContent = '❌ File too large (Max 5MB)';
      base64El.value = '';
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = function(e) {
      base64El.value = e.target.result;
      statusEl.textContent = `✅ Photo selected: ${(file.size / 1024).toFixed(1)} KB`;
    };
    reader.readAsDataURL(file);
  },

  // ---- Person Change ----
  onPersonChange() {
    const id  = document.getElementById('storePerson')?.value;
    const emp = DB.employees.find(e => e.id === id);
    const el  = document.getElementById('storeDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  // ---- Add Store Entry ----
  add() {
    const personId   = document.getElementById('storePerson')?.value;
    const date       = document.getElementById('storeDate')?.value;
    const location   = document.getElementById('storeLocation')?.value; // PLANT/HO/GLOBAL
    const item       = document.getElementById('storeItem')?.value.trim();
    const qty        = document.getElementById('storeQty')?.value;
    const serial     = document.getElementById('storeSerial')?.value.trim();
    const condition  = document.getElementById('storeCondition')?.value; // NEW/OLD
    const po         = document.getElementById('storePO')?.value.trim();
    const pr         = document.getElementById('storePR')?.value.trim();
    const remark     = document.getElementById('storeRemark')?.value.trim();
    const photoBase64= document.getElementById('storePhotoBase64')?.value || '';
    const dept       = document.getElementById('storeDept')?.value;

    // Validation
    if (!personId) { Toast.error('Name select karo!'); return; }
    if (!date)     { Toast.error('Date fill karo!');     return; }
    if (!item)     { Toast.error('Item name likho!');    return; }
    if (!qty)      { Toast.error('Quantity fill karo!'); return; }

    const emp   = DB.employees.find(e => e.id === personId);
    const entry = {
      id:         'ST' + String(DB.storeEntries.length + 1).padStart(4, '0'),
      date,
      personId,
      personName: emp ? emp.name : 'Unknown',
      dept,
      location,       // PLANT/HO/GLOBAL
      item,
      qty: parseFloat(qty),
      serial,         // Serial No.
      condition,      // NEW OR OLD
      po,
      pr,
      remark,
      photo: photoBase64, // Base64 image
      isComplete:  !!(po && pr),
      addedOn:     new Date().toISOString()
    };

    DB.storeEntries.push(entry);

    // Auto reminder if PO/PR missing — EVERY 3 HOURS
    if (!entry.isComplete) {
      const missing = [];
      if (!po) missing.push('PO Number');
      if (!pr) missing.push('PR Number');

      // Reminder for 3 hours later
      const reminderTime = new Date(Date.now() + 3 * 3600000); // 3 hours

      DB.reminders.push({
        id:            Date.now(),
        title:         `${entry.id}: ${item} — ${missing.join(' & ')} missing!`,
        desc:          `Store entry ${entry.id} mein ${missing.join(' aur ')} fill karna baaki hai. Har 3 ghante reminder ayega.`,
        datetime:      reminderTime.toISOString().slice(0, 16),
        type:          'store',
        priority:      'High',
        repeat:        'once',
        done:          false,
        linkedStoreId: entry.id,
        isRecurring:   true // Flag to recreate every 3 hours
      });

      Toast.warning(
        'Auto Reminder Set!',
        `${missing.join(' & ')} har 3 ghante baad remind karega`
      );
    }

    DB.save();
    this.update();
    this._clearForm();
    App.updateBadges();

    // Sync to Google Sheets
    this.syncToGoogleSheets(entry);

    Toast.success(`Entry Saved!`, `${entry.id} — ${item}`);
  },

  // ---- Google Sheets Sync ----
  syncToGoogleSheets(entry) {
    // Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      console.log('Google Sheets URL not set. Skipping sync.');
      return;
    }

    const data = {
      slNo: entry.id,
      date: entry.date,
      name: entry.personName,
      department: entry.dept,
      location: entry.location,
      item: entry.item,
      qty: entry.qty,
      serialNo: entry.serial,
      poNumber: entry.po,
      prNumber: entry.pr,
      newOrOld: entry.condition,
      remark: entry.remark
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(() => {
      console.log('Data sent to Google Sheets');
    }).catch(err => {
      console.error('Error syncing to Google Sheets', err);
    });
  },

  // ---- Delete Entry ----
  delete(id) {
    if (!Utils.confirm('Store entry delete karna chahte ho?')) return;
    DB._data.storeEntries = DB.storeEntries.filter(e => e.id !== id);
    DB.save();
    this.update();
    App.updateBadges();
    Toast.warning('Entry deleted', '');
  },

  // ---- Edit Entry (Modal) ----
  edit(id) {
    const entry = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    Modal.show(`✏️ Update Entry — ${entry.id}`, `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Entry ID</label>
          <input class="form-control" value="${entry.id}" readonly style="color:var(--accent-gold);">
        </div>
        <div class="form-group">
          <label class="form-label">Item</label>
          <input class="form-control" value="${entry.item}" readonly>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PO NUMBER</label>
          <input class="form-control" id="edit-po" value="${entry.po || ''}" placeholder="PO-XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">PR NUMBER</label>
          <input class="form-control" id="edit-pr" value="${entry.pr || ''}" placeholder="PR-XXXX">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">REMARK</label>
        <input class="form-control" id="edit-remark" value="${entry.remark || ''}" placeholder="Note...">
      </div>
      <button class="btn btn-primary btn-block mt-15" onclick="Store._saveEdit('${entry.id}')">
        💾 Update Karo
      </button>
    `);
  },

  _saveEdit(id) {
    const entry   = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    entry.po      = document.getElementById('edit-po')?.value.trim()      || '';
    entry.pr      = document.getElementById('edit-pr')?.value.trim()      || '';
    entry.remark  = document.getElementById('edit-remark')?.value.trim()  || '';
    entry.isComplete = !!(entry.po && entry.pr);

    // Mark linked reminders done
    if (entry.isComplete) {
      DB.reminders.forEach(r => {
        if (r.linkedStoreId === entry.id) r.done = true;
      });
    }

    DB.save();
    Modal.close();
    this.update();
    App.updateBadges();
    Toast.success('Updated!', `${entry.id} update ho gaya`);
  },

  // ---- Filter ----
  filter(type, btn) {
    this._filterType = type;
    document.querySelectorAll('#section-store .filter-tab').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody  = document.getElementById('storeTableBody');
    if (!tbody) return;

    const q = (document.getElementById('storeSearch')?.value || '').toLowerCase();
    let list = [...DB.storeEntries].reverse();

    if (this._filterType === 'pending') {
      list = list.filter(e => !e.isComplete);
    } else if (this._filterType !== 'all') {
      list = list.filter(e => e.type === this._filterType);
    }

    if (q) {
      list = list.filter(e =>
        e.item.toLowerCase().includes(q) ||
        e.personName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }

    if (!list.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">📭 Koi entry nahi mili</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(e => {
      const poBadge = e.po
        ? `<span class="text-success text-bold" style="font-size:12px;">${e.po}</span>`
        : `<span><span class="pending-dot"></span><span class="text-warning" style="font-size:11px;">Missing</span></span>`;

      const prBadge = e.pr
        ? `<span class="text-success text-bold" style="font-size:12px;">${e.pr}</span>`
        : `<span><span class="pending-dot"></span><span class="text-warning" style="font-size:11px;">Missing</span></span>`;

      return `
        <tr>
          <td><span class="text-gold text-bold" style="font-size:11px;">${e.id}</span></td>
          <td style="font-size:12px;">${e.date}</td>
          <td>
            <div class="text-bold" style="font-size:13px;">${e.personName}</div>
            <div class="text-xs text-muted">${e.dept || ''} | ${e.location || ''}</div>
          </td>
          <td>
            <div class="text-bold">${e.item}</div>
            <div class="text-xs text-muted">${e.serial ? 'S/N: ' + e.serial : ''}</div>
          </td>
          <td class="text-bold">${e.qty}</td>
          <td>${poBadge}</td>
          <td>${prBadge}</td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-warning" onclick="Store.edit('${e.id}')" title="Edit">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="Store.delete('${e.id}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---- Pending PO/PR Section ----
  _updatePending() {
    const pending = DB.storeEntries.filter(e => !e.isComplete);
    const countEl = document.getElementById('pendingCount');
    if (countEl) countEl.textContent = pending.length;

    const listEl = document.getElementById('pendingPOPRList');
    if (!listEl) return;

    if (!pending.length) {
      listEl.innerHTML = `<p class="text-muted text-center" style="padding:20px;">✅ Sab entries complete hain!</p>`;
      return;
    }

    listEl.innerHTML = pending.map(e => {
      const missing = [];
      if (!e.po) missing.push('PO Number');
      if (!e.pr) missing.push('PR Number');
      return `
        <div class="reminder-item warning">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div>
              <div class="rem-title"><span class="pending-dot"></span>${e.id} — ${e.item}</div>
              <div class="rem-meta">📅 ${e.date} | 👤 ${e.personName} | ❌ Missing: ${missing.join(', ')}</div>
            </div>
            <button class="btn btn-sm btn-warning" onclick="Store.edit('${e.id}')">✏️ Fill Karo</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _updateStoreId() {
    const el = document.getElementById('storeId');
    if (el) el.value = 'ST' + String(DB.storeEntries.length + 1).padStart(4, '0');
  },

  _clearForm() {
    Utils.clearFields([
      'storePerson','storeDept','storeItem','storeQty',
      'storeSerial','storePO','storePR','storeRemark','storePhoto'
    ]);
    document.getElementById('storeLocation').value = 'PLANT';
    document.getElementById('storeCondition').value = 'NEW';
    document.getElementById('storePhotoBase64').value = '';
    document.getElementById('photoStatus').textContent = 'Koi photo nahi chuni gayi';
    this._updateStoreId();
  },

  // ---- Export Excel (Exact Column Names) ----
  exportExcel() {
    if (!DB.storeEntries.length) { Toast.error('Koi data nahi!'); return; }
    const ws = XLSX.utils.json_to_sheet(DB.storeEntries.map((e, idx) => ({
      'Sl. No.':             e.id,
      'Date':                e.date,
      'Name':                e.personName,
      'Department':          e.dept || '',
      'PLANT/HO/GLOBAL':     e.location || '',
      'Item':                e.item,
      'Qty.':                e.qty,
      'Serial No.':          e.serial || '',
      'PO NUMBER':           e.po || 'MISSING',
      'PR NUMBER':           e.pr || 'MISSING',
      'NEW OR OLD':          e.condition || '',
      'REMARK (IF ANY)':     e.remark || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Entries');
    XLSX.writeFile(wb, `Store_Entries_PanchhiFashion.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.storeEntries.length) { Toast.error('Koi data nahi!'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l');

    doc.setFillColor(108, 99, 255);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('PANCHHI FASHION — Store Report', 14, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated: ' + new Date().toLocaleDateString('en-IN') + ' | By: Aditya', 14, 18);
    doc.setTextColor(30, 30, 30);

    doc.autoTable({
      startY: 28,
      head: [['Sl. No.','Date','Name','Dept','Location','Item','Qty.','Serial','PO#','PR#','New/Old','Remark']],
      body: DB.storeEntries.map(e => [
        e.id, e.date, e.personName, e.dept || '—', e.location || '—',
        e.item, e.qty, e.serial || '—',
        e.po || 'MISSING', e.pr || 'MISSING',
        e.condition || '—', e.remark || '—'
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [247, 151, 30], textColor: 30 },
      alternateRowStyles: { fillColor: [255, 253, 245] }
    });

    Reports._footer(doc);
    doc.save('Store_Report_PanchhiFashion.pdf');
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['storePerson']);
    const personEl = document.getElementById('storePerson');
    if (personEl) personEl.onchange = () => Store.onPersonChange();
    this._updateStoreId();
    this._renderTable();
    this._updatePending();
  }
};
