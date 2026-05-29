/* ================================================
   STORE.JS — Store Management Module
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
            Naya Store Entry
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Entry ID (Auto)</label>
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
              <label class="form-label">Person / Employee *</label>
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

          <div class="form-group">
            <label class="form-label">Item / Material Name *</label>
            <input type="text" class="form-control" id="storeItem"
                   placeholder="Kya item lekar gaya?">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" id="storeCategory">
                <option value="">-- Select --</option>
                <option>Fabric / Kapda</option>
                <option>Thread / Dhaga</option>
                <option>Button / Accessories</option>
                <option>Packaging Material</option>
                <option>Machine Parts</option>
                <option>Stationery</option>
                <option>Chemicals / Dyes</option>
                <option>Tools / Equipment</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Entry Type</label>
              <select class="form-control" id="storeType">
                <option value="Out">📤 Material Out (Lekar gaya)</option>
                <option value="In">📥 Material In (Aaya)</option>
                <option value="Return">🔄 Return</option>
                <option value="Damage">❌ Damage / Loss</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input type="number" class="form-control" id="storeQty"
                     placeholder="Amount" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-control" id="storeUnit">
                <option>Pieces</option>
                <option>Meters</option>
                <option>Kg</option>
                <option>Grams</option>
                <option>Liters</option>
                <option>Boxes</option>
                <option>Bundles</option>
                <option>Rolls</option>
                <option>Pairs</option>
                <option>Sets</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Value / Amount (Rs.)</label>
            <input type="number" class="form-control" id="storeValue"
                   placeholder="Item ki value (optional)" min="0">
          </div>

          <!-- PO / PR SECTION -->
          <div class="form-highlight">
            <div class="form-highlight-title">
              ⚠️ PO / PR Details
              <span style="font-weight:400;color:var(--text-muted);font-size:11px;">
                (Abhi nahi hai toh khali chhod do — reminder ayega!)
              </span>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PO Number</label>
                <input type="text" class="form-control" id="storePO"
                       placeholder="PO-XXXX">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PR Number</label>
                <input type="text" class="form-control" id="storePR"
                       placeholder="PR-XXXX">
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Invoice / Bill No</label>
              <input type="text" class="form-control" id="storeInvoice"
                     placeholder="Invoice number">
            </div>
            <div class="form-group">
              <label class="form-label">Supplier / Vendor</label>
              <input type="text" class="form-control" id="storeVendor"
                     placeholder="Supplier ka naam">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Remark / Note</label>
            <input type="text" class="form-control" id="storeRemark"
                   placeholder="Koi extra note...">
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
                      onclick="Store.exportExcel()">📊</button>
              <button class="btn btn-danger btn-sm"
                      onclick="Store.exportPDF()">📄</button>
            </div>
          </div>

          <!-- Filter tabs -->
          <div class="filter-tabs">
            <button class="filter-tab active"
                    onclick="Store.filter('all',this)">All</button>
            <button class="filter-tab"
                    onclick="Store.filter('pending',this)">
              ⚠️ Pending
            </button>
            <button class="filter-tab"
                    onclick="Store.filter('Out',this)">📤 Out</button>
            <button class="filter-tab"
                    onclick="Store.filter('In',this)">📥 In</button>
            <button class="filter-tab"
                    onclick="Store.filter('Return',this)">🔄 Return</button>
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
                  <th>ID</th>
                  <th>Date</th>
                  <th>Person</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>PO#</th>
                  <th>PR#</th>
                  <th>Type</th>
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
          <span class="badge badge-warning" id="pendingCount">0</span>
        </div>
        <div id="pendingPOPRList">
          <p class="text-muted text-center" style="padding:20px;">
            ✅ Sab entries complete hain!
          </p>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  // ---- Person Change — Auto fill Dept ----
  onPersonChange() {
    const id  = document.getElementById('storePerson')?.value;
    const emp = DB.employees.find(e => e.id === id);
    const el  = document.getElementById('storeDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  // ---- Add Store Entry ----
  add() {
    const personId = document.getElementById('storePerson')?.value;
    const date     = document.getElementById('storeDate')?.value;
    const item     = document.getElementById('storeItem')?.value.trim();
    const qty      = document.getElementById('storeQty')?.value;
    const unit     = document.getElementById('storeUnit')?.value;
    const category = document.getElementById('storeCategory')?.value;
    const type     = document.getElementById('storeType')?.value;
    const value    = document.getElementById('storeValue')?.value;
    const po       = document.getElementById('storePO')?.value.trim();
    const pr       = document.getElementById('storePR')?.value.trim();
    const invoice  = document.getElementById('storeInvoice')?.value.trim();
    const vendor   = document.getElementById('storeVendor')?.value.trim();
    const remark   = document.getElementById('storeRemark')?.value.trim();
    const dept     = document.getElementById('storeDept')?.value;

    // Validation
    if (!personId) { Toast.error('Person select karo!'); return; }
    if (!date)     { Toast.error('Date fill karo!');     return; }
    if (!item)     { Toast.error('Item name likhо!');    return; }
    if (!qty)      { Toast.error('Quantity fill karo!'); return; }

    const emp   = DB.employees.find(e => e.id === personId);
    const entry = {
      id:         'ST' + String(DB.storeEntries.length + 1).padStart(4, '0'),
      date,
      personId,
      personName: emp ? emp.name : 'Unknown',
      dept,
      item, qty: parseFloat(qty), unit, category,
      type, value: parseFloat(value) || 0,
      po, pr, invoice, vendor, remark,
      isComplete:  !!(po && pr),
      addedOn:     new Date().toISOString()
    };

    DB.storeEntries.push(entry);

    // Auto reminder if PO/PR missing
    if (!entry.isComplete) {
      const missing = [];
      if (!po) missing.push('PO Number');
      if (!pr) missing.push('PR Number');

      DB.reminders.push({
        id:            Date.now(),
        title:         `${entry.id}: ${item} — ${missing.join(' & ')} missing!`,
        desc:          `Store entry ${entry.id} mein ${missing.join(' aur ')} fill karna baaki hai`,
        datetime:      new Date(Date.now() + 2 * 86400000)
                         .toISOString().slice(0, 16),
        type:          'store',
        priority:      'High',
        repeat:        'once',
        done:          false,
        linkedStoreId: entry.id
      });

      Toast.warning(
        'Auto Reminder Set!',
        `${missing.join(' & ')} 2 din baad remind karega`
      );
    }

    DB.save();
    this.update();
    this._clearForm();
    App.updateBadges();

    Toast.success(`Entry Saved!`, `${entry.id} — ${item}`);
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
          <input class="form-control" value="${entry.id}" readonly
                 style="color:var(--accent-gold);">
        </div>
        <div class="form-group">
          <label class="form-label">Item</label>
          <input class="form-control" value="${entry.item}" readonly>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PO Number</label>
          <input class="form-control" id="edit-po"
                 value="${entry.po || ''}" placeholder="PO-XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">PR Number</label>
          <input class="form-control" id="edit-pr"
                 value="${entry.pr || ''}" placeholder="PR-XXXX">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Invoice</label>
          <input class="form-control" id="edit-invoice"
                 value="${entry.invoice || ''}" placeholder="Invoice number">
        </div>
        <div class="form-group">
          <label class="form-label">Vendor</label>
          <input class="form-control" id="edit-vendor"
                 value="${entry.vendor || ''}" placeholder="Vendor name">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Remark</label>
        <input class="form-control" id="edit-remark"
               value="${entry.remark || ''}" placeholder="Note...">
      </div>
      <button class="btn btn-primary btn-block mt-15"
              onclick="Store._saveEdit('${entry.id}')">
        💾 Update Karo
      </button>
    `);
  },

  _saveEdit(id) {
    const entry   = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    entry.po      = document.getElementById('edit-po')?.value.trim()      || '';
    entry.pr      = document.getElementById('edit-pr')?.value.trim()      || '';
    entry.invoice = document.getElementById('edit-invoice')?.value.trim() || '';
    entry.vendor  = document.getElementById('edit-vendor')?.value.trim()  || '';
    entry.remark  = document.getElementById('edit-remark')?.value.trim()  || '';
    entry.isComplete = !!(entry.po && entry.pr);

    // Mark linked reminder done
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

    const q = (document.getElementById('storeSearch')?.value || '')
      .toLowerCase();

    let list = [...DB.storeEntries].reverse();

    // Filter by type
    if (this._filterType === 'pending') {
      list = list.filter(e => !e.isComplete);
    } else if (this._filterType !== 'all') {
      list = list.filter(e => e.type === this._filterType);
    }

    // Search
    if (q) {
      list = list.filter(e =>
        e.item.toLowerCase().includes(q) ||
        e.personName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.po || '').toLowerCase().includes(q) ||
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

    const typeBadge = {
      Out:    'badge-danger',
      In:     'badge-success',
      Return: 'badge-info',
      Damage: 'badge-warning'
    };

    const typeIcon = {
      Out: '📤', In: '📥', Return: '🔄', Damage: '❌'
    };

    tbody.innerHTML = list.map(e => {
      const poBadge = e.po
        ? `<span class="text-success text-bold" style="font-size:12px;">${e.po}</span>`
        : `<span><span class="pending-dot"></span><span class="text-warning" style="font-size:11px;">Missing</span></span>`;

      const prBadge = e.pr
        ? `<span class="text-success text-bold" style="font-size:12px;">${e.pr}</span>`
        : `<span><span class="pending-dot"></span><span class="text-warning" style="font-size:11px;">Missing</span></span>`;

      return `
        <tr>
          <td>
            <span class="text-gold text-bold"
                  style="font-size:11px;">${e.id}</span>
          </td>
          <td style="font-size:12px;">${e.date}</td>
          <td>
            <div class="text-bold" style="font-size:13px;">${e.personName}</div>
            <div class="text-xs text-muted">${e.dept || ''}</div>
          </td>
          <td>
            <div class="text-bold">${e.item}</div>
            <div class="text-xs text-muted">${e.category || ''}</div>
          </td>
          <td class="text-bold">${e.qty} ${e.unit}</td>
          <td>${poBadge}</td>
          <td>${prBadge}</td>
          <td>
            <span class="badge ${typeBadge[e.type] || 'badge-primary'}">
              ${typeIcon[e.type] || ''} ${e.type}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-warning"
                      onclick="Store.edit('${e.id}')"
                      title="Edit">✏️</button>
              <button class="btn btn-sm btn-danger"
                      onclick="Store.delete('${e.id}')"
                      title="Delete">🗑️</button>
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

  // ---- Update Store ID ----
  _updateStoreId() {
    const el = document.getElementById('storeId');
    if (el) {
      el.value = 'ST' + String(DB.storeEntries.length + 1).padStart(4, '0');
    }
  },

  // ---- Clear Form ----
  _clearForm() {
    Utils.clearFields([
      'storePerson','storeDept','storeItem','storeQty',
      'storeValue','storePO','storePR','storeInvoice',
      'storeVendor','storeRemark'
    ]);
    const catEl  = document.getElementById('storeCategory');
    const typeEl = document.getElementById('storeType');
    if (catEl)  catEl.value  = '';
    if (typeEl) typeEl.value = 'Out';
    this._updateStoreId();
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.storeEntries.length) { Toast.error('Koi data nahi!'); return; }
    const ws = XLSX.utils.json_to_sheet(DB.storeEntries.map(e => ({
      'Entry ID':  e.id,
      'Date':      e.date,
      'Person':    e.personName,
      'Dept':      e.dept || '',
      'Item':      e.item,
      'Category':  e.category || '',
      'Qty':       e.qty,
      'Unit':      e.unit,
      'Value Rs.': e.value || 0,
      'Type':      e.type,
      'PO Number': e.po || 'MISSING',
      'PR Number': e.pr || 'MISSING',
      'Invoice':   e.invoice || '',
      'Vendor':    e.vendor || '',
      'Remark':    e.remark || '',
      'Complete':  e.isComplete ? 'Yes' : 'No'
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
    const doc = new jsPDF('l'); // Landscape

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
      'Generated: ' + new Date().toLocaleDateString('en-IN') + ' | By: Aditya',
      14, 18
    );
    doc.setTextColor(30, 30, 30);

    doc.autoTable({
      startY: 28,
      head: [[
        'ID','Date','Person','Item','Qty',
        'PO#','PR#','Type','Value','Vendor'
      ]],
      body: DB.storeEntries.map(e => [
        e.id, e.date, e.personName, e.item,
        `${e.qty} ${e.unit}`,
        e.po || 'MISSING',
        e.pr || 'MISSING',
        e.type,
        Utils.money(e.value),
        e.vendor || '—'
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [247, 151, 30], textColor: 30 },
      alternateRowStyles: { fillColor: [255, 253, 245] },
      didParseCell(data) {
        if ([5, 6].includes(data.column.index) && data.section === 'body') {
          if (data.cell.raw === 'MISSING') {
            data.cell.styles.textColor = [220, 50, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    Reports._footer(doc);
    doc.save('Store_Report_PanchhiFashion.pdf');
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['storePerson']);
    // Re-attach person change listener
    const personEl = document.getElementById('storePerson');
    if (personEl) personEl.onchange = () => Store.onPersonChange();
    this._updateStoreId();
    this._renderTable();
    this._updatePending();
  }
};
