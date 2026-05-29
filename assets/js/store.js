/* ================================================
   STORE.JS — Store Module with Google Sheets & Attachments
   ================================================ */

const Store = {

  _filterType: 'all',
  _attachments: [], // Temporary storage for files before upload

  html() {
    return `
    <div class="section" id="section-store">
      <div class="page-header">
        <div>
          <div class="page-heading">🏪 Store Management</div>
          <div class="page-heading-sub">Material In/Out Tracking with Google Sheets Sync</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-success btn-sm" onclick="Store.syncWithSheets()">
            🔄 Sync to Sheets
          </button>
        </div>
      </div>

      <div class="grid-2">

        <!-- ENTRY FORM -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📝</div>
            New Store Entry
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Entry ID (Auto)</label>
              <input type="text" class="form-control" id="storeId" readonly 
                     style="color:var(--accent-gold);font-weight:700;">
            </div>
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" id="storeDate">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Person / Employee *</label>
              <select class="form-control" id="storePerson" onchange="Store.onPersonChange()">
                <option value="">-- Select --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Department (Auto)</label>
              <input type="text" class="form-control" id="storeDept" readonly placeholder="Auto-fill">
            </div>
          </div>

          <!-- NEW: PLANT/HO/GLOBAL -->
          <div class="form-group">
            <label class="form-label">Plant / HO / Global *</label>
            <select class="form-control" id="storeLocation">
              <option value="">-- Select Location --</option>
              <option value="PLANT">🏭 PLANT</option>
              <option value="HO">🏢 HO (Head Office)</option>
              <option value="GLOBAL">🌍 GLOBAL</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Item / Material Name *</label>
            <input type="text" class="form-control" id="storeItem" placeholder="Item name">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input type="number" class="form-control" id="storeQty" placeholder="Amount" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-control" id="storeUnit">
                <option>Pieces</option>
                <option>Meters</option>
                <option>Kg</option>
                <option>Sets</option>
                <option>Rolls</option>
                <option>Boxes</option>
              </select>
            </div>
          </div>

          <!-- NEW: SERIAL NUMBER -->
          <div class="form-group">
            <label class="form-label">Serial No. (Optional)</label>
            <input type="text" class="form-control" id="storeSerial" placeholder="Equipment serial number if any">
          </div>

          <!-- NEW: NEW OR OLD -->
          <div class="form-group">
            <label class="form-label">Condition *</label>
            <select class="form-control" id="storeCondition">
              <option value="">-- Select --</option>
              <option value="NEW">✨ NEW</option>
              <option value="OLD">♻️ OLD / Used</option>
              <option value="REFURBISHED">🔧 Refurbished</option>
            </select>
          </div>

          <!-- PO/PR SECTION with 3-hour warning -->
          <div class="form-highlight" style="border-color:rgba(255,101,132,0.4);">
            <div class="form-highlight-title" style="color:var(--danger);">
              ⚠️ PO / PR Details (Mandatory for complete entry)
              <span style="font-weight:400;color:var(--text-muted);font-size:11px;">
                (If empty, reminder every 3 hours)
              </span>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PO Number</label>
                <input type="text" class="form-control" id="storePO" placeholder="PO-XXXX">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">PR Number</label>
                <input type="text" class="form-control" id="storePR" placeholder="PR-XXXX">
              </div>
            </div>
          </div>

          <!-- ATTACHMENT SECTION -->
          <div class="form-group mt-15">
            <label class="form-label">
              📎 Attach Photos (Max 5MB each, Max 3 files)
            </label>
            <input type="file" class="form-control" id="storeFiles" 
                   accept="image/*" multiple 
                   onchange="Store.handleFiles(this)"
                   style="padding:8px;font-size:12px;">
            <div class="form-hint" id="fileHint">No files selected</div>
            
            <!-- Preview Container -->
            <div id="filePreview" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
              <!-- Thumbnails will appear here -->
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Remark (If any)</label>
            <input type="text" class="form-control" id="storeRemark" placeholder="Additional notes...">
          </div>

          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" style="flex:1;" onclick="Store.add()">
              📦 Save & Sync to Sheets
            </button>
            <button class="btn btn-ghost" onclick="Store.clearForm()">
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- ENTRIES LIST -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Store Entries
            <div class="card-actions">
              <button class="btn btn-success btn-sm" onclick="Store.exportExcel()">📊</button>
              <button class="btn btn-danger btn-sm" onclick="Store.exportPDF()">📄</button>
            </div>
          </div>

          <div class="filter-tabs">
            <button class="filter-tab active" onclick="Store.filter('all',this)">All</button>
            <button class="filter-tab" onclick="Store.filter('pending',this)">⚠️ Pending PO/PR</button>
            <button class="filter-tab" onclick="Store.filter('NEW',this)">✨ New Items</button>
            <button class="filter-tab" onclick="Store.filter('OLD',this)">♻️ Old Items</button>
          </div>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="storeSearch" 
                   placeholder="Search by item, person, serial no..." 
                   oninput="Store._renderTable()">
          </div>

          <div class="table-wrap" style="max-height:500px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sl.</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Serial</th>
                  <th>PO#</th>
                  <th>PR#</th>
                  <th>Condition</th>
                  <th>Photo</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="storeTableBody">
                <tr class="empty-row">
                  <td colspan="12">📭 No entries found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- PENDING ALERTS SECTION -->
      <div class="card mt-20" style="border-color:rgba(255,101,132,0.3);">
        <div class="card-title" style="color:var(--danger);">
          <div class="card-icon" style="background:rgba(255,101,132,0.2);">⏰</div>
          Pending PO/PR Entries (Auto-reminder every 3 hours)
          <span class="badge badge-danger" id="pendingCount">0</span>
        </div>
        <div id="pendingPOPRList">
          <p class="text-muted text-center" style="padding:20px;">✅ All entries complete!</p>
        </div>
      </div>

    </div>
    `;
  },

  // ---- Handle File Uploads ----
  handleFiles(input) {
    const files = Array.from(input.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 3;
    
    if (files.length > maxFiles) {
      Toast.error(`Max ${maxFiles} files allowed!`);
      input.value = '';
      return;
    }

    this._attachments = [];
    const previewContainer = document.getElementById('filePreview');
    previewContainer.innerHTML = '';
    let validFiles = 0;

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        Toast.warning(`${file.name} is too large (Max 5MB)`);
        return;
      }

      validFiles++;
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store base64
        this._attachments.push({
          name: file.name,
          type: file.type,
          data: e.target.result,
          size: file.size
        });

        // Show preview
        const thumb = document.createElement('div');
        thumb.style.cssText = 'width:60px;height:60px;border-radius:8px;overflow:hidden;position:relative;border:1px solid var(--card-border);';
        thumb.innerHTML = `
          <img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">
          <button onclick="Store.removeFile(${index})" 
                  style="position:absolute;top:2px;right:2px;background:rgba(255,0,0,0.8);color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;">×</button>
        `;
        previewContainer.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('fileHint').textContent = 
      validFiles > 0 ? `${validFiles} file(s) selected` : 'No files selected';
  },

  removeFile(index) {
    this._attachments.splice(index, 1);
    // Re-render previews
    const input = document.getElementById('storeFiles');
    this.handleFiles(input); // This will clear and re-add remaining (simplified)
  },

  // ---- Google Sheets Sync ----
  async syncWithSheets() {
    if (!DB.storeEntries.length) {
      Toast.error('No data to sync!');
      return;
    }

    Toast.info('Syncing to Google Sheets...', 'Please wait');

    // Your Google Apps Script Web App URL (you'll provide this)
    const SCRIPT_URL = localStorage.getItem('googleScriptURL') || 
                       prompt('Enter Google Sheets Script URL:');
    
    if (!SCRIPT_URL) return;
    localStorage.setItem('googleScriptURL', SCRIPT_URL);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: DB.storeEntries,
          timestamp: new Date().toISOString()
        })
      });

      Toast.success('Synced to Google Sheets!', 'Data updated successfully');
    } catch (error) {
      Toast.error('Sync failed!', error.message);
      console.error('Sheets sync error:', error);
    }
  },

  // ---- Auto-sync single entry ----
  async syncSingleEntry(entry) {
    const SCRIPT_URL = localStorage.getItem('googleScriptURL');
    if (!SCRIPT_URL) return; // Silently fail if not configured

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry, action: 'add' })
      });
    } catch (e) {
      console.log('Background sync failed', e);
    }
  },

  // ---- Add Entry ----
  add() {
    const personId  = document.getElementById('storePerson')?.value;
    const date      = document.getElementById('storeDate')?.value;
    const item      = document.getElementById('storeItem')?.value.trim();
    const qty       = document.getElementById('storeQty')?.value;
    const location  = document.getElementById('storeLocation')?.value;
    const serial    = document.getElementById('storeSerial')?.value.trim();
    const condition = document.getElementById('storeCondition')?.value;
    const po        = document.getElementById('storePO')?.value.trim();
    const pr        = document.getElementById('storePR')?.value.trim();
    const remark    = document.getElementById('storeRemark')?.value.trim();
    const dept      = document.getElementById('storeDept')?.value;

    if (!personId)  { Toast.error('Select Person!'); return; }
    if (!date)      { Toast.error('Select Date!'); return; }
    if (!item)      { Toast.error('Enter Item Name!'); return; }
    if (!qty)       { Toast.error('Enter Quantity!'); return; }
    if (!location)  { Toast.error('Select Plant/HO/Global!'); return; }
    if (!condition) { Toast.error('Select Condition (New/Old)!'); return; }

    const emp = DB.employees.find(e => e.id === personId);
    const entry = {
      id:          'ST' + String(DB.storeEntries.length + 1).padStart(4, '0'),
      slNo:        DB.storeEntries.length + 1,
      date,
      name:        emp ? emp.name : 'Unknown',
      department:  dept || '',
      location,    // PLANT/HO/GLOBAL
      item,
      qty:         parseFloat(qty),
      unit:        document.getElementById('storeUnit')?.value || 'Pieces',
      serialNo:    serial || '',
      poNumber:    po || '',
      prNumber:    pr || '',
      condition,   // NEW/OLD/REFURBISHED
      remark:      remark || '',
      attachments: this._attachments.map(f => f.name), // Store filenames
      isComplete:  !!(po && pr),
      addedOn:     new Date().toISOString()
    };

    DB.storeEntries.push(entry);
    DB.save();

    // Sync to Google Sheets
    this.syncSingleEntry(entry);

    // Set 3-hour reminder if PO/PR missing
    if (!entry.isComplete) {
      const missing = [];
      if (!po) missing.push('PO Number');
      if (!pr) missing.push('PR Number');

      // Create reminder for every 3 hours
      const now = new Date();
      for (let i = 1; i <= 8; i++) { // Next 24 hours (8 x 3 hours)
        const reminderTime = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000));
        DB.reminders.push({
          id:            Date.now() + i,
          title:         `⏰ ${entry.id}: ${item} — ${missing.join(' & ')} missing!`,
          desc:          `Store entry ${entry.id} incomplete. ${missing.join(' & ')} required.`,
          datetime:      reminderTime.toISOString().slice(0, 16),
          type:          'store',
          priority:      'High',
          repeat:        'once',
          done:          false,
          linkedStoreId: entry.id
        });
      }
      
      Toast.warning('Auto-reminder set!', `Every 3 hours until ${missing.join(' & ')} filled`);
    }

    this.update();
    this.clearForm();
    App.updateBadges();
    Toast.success('Entry Saved!', `${entry.id} — Synced to Sheets`);
  },

  // ---- Clear Form ----
  clearForm() {
    Utils.clearFields(['storePerson','storeDept','storeItem','storeQty',
                      'storeSerial','storePO','storePR','storeRemark']);
    document.getElementById('storeLocation').value = '';
    document.getElementById('storeCondition').value = '';
    this._attachments = [];
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('fileHint').textContent = 'No files selected';
    document.getElementById('storeFiles').value = '';
    this._updateStoreId();
  },

  // ---- Filter ----
  filter(type, btn) {
    this._filterType = type;
    document.querySelectorAll('#section-store .filter-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  // ---- Render Table (Updated with new columns) ----
  _renderTable() {
    const tbody = document.getElementById('storeTableBody');
    if (!tbody) return;

    const q = (document.getElementById('storeSearch')?.value || '').toLowerCase();
    let list = [...DB.storeEntries].reverse();

    if (this._filterType === 'pending') {
      list = list.filter(e => !e.isComplete);
    } else if (['NEW','OLD','REFURBISHED'].includes(this._filterType)) {
      list = list.filter(e => e.condition === this._filterType);
    }

    if (q) {
      list = list.filter(e =>
        e.item.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.serialNo.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }

    if (!list.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="12">📭 No entries found</td></tr>`;
      return;
    }

    const condBadge = {
      'NEW': 'badge-success',
      'OLD': 'badge-warning',
      'REFURBISHED': 'badge-info'
    };

    tbody.innerHTML = list.map(e => {
      const poBadge = e.poNumber 
        ? `<span class="text-success" style="font-size:11px;">${e.poNumber}</span>`
        : `<span class="pending-dot"></span><span class="text-warning text-xs">Missing</span>`;
      
      const prBadge = e.prNumber
        ? `<span class="text-success" style="font-size:11px;">${e.prNumber}</span>`
        : `<span class="pending-dot"></span><span class="text-warning text-xs">Missing</span>`;

      const photoIcon = e.attachments?.length 
        ? `📎 ${e.attachments.length}` 
        : '—';

      return `
        <tr>
          <td style="font-size:11px;color:var(--text-muted);">${e.slNo}</td>
          <td style="font-size:12px;">${e.date}</td>
          <td>
            <div class="text-bold" style="font-size:13px;">${e.name}</div>
            <div class="text-xs text-muted">${e.department}</div>
          </td>
          <td>
            <span class="badge badge-primary" style="font-size:10px;">
              ${e.location}
            </span>
          </td>
          <td>
            <div class="text-bold">${e.item}</div>
          </td>
          <td class="text-bold">${e.qty} ${e.unit}</td>
          <td style="font-size:11px;color:var(--text-muted);">${e.serialNo || '—'}</td>
          <td>${poBadge}</td>
          <td>${prBadge}</td>
          <td>
            <span class="badge ${condBadge[e.condition] || 'badge-primary'}" style="font-size:10px;">
              ${e.condition}
            </span>
          </td>
          <td style="font-size:12px;">${photoIcon}</td>
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

  // ---- 3-Hour Reminder Check ----
  checkReminders() {
    const now = new Date();
    DB.reminders
      .filter(r => !r.done && r.type === 'store')
      .forEach(r => {
        const rTime = new Date(r.datetime);
        const diff = now - rTime;
        // Alert if within last 5 minutes of the 3-hour mark
        if (diff >= 0 && diff <= 300000) {
          Toast.warning(`⏰ REMINDER!`, r.title);
          // Play sound if allowed
          this.playAlertSound();
        }
      });
  },

  playAlertSound() {
    // Simple beep using Web Audio API
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audio.currentTime);
      gainNode.gain.setValueAtTime(0.1, audio.currentTime);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.2);
    } catch(e) {}
  },

  // ---- Edit/Delete (same as before with new fields) ----
  edit(id) {
    const entry = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    Modal.show(`✏️ Update Entry — ${entry.id}`, `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PO Number</label>
          <input class="form-control" id="edit-po" value="${entry.poNumber || ''}" placeholder="PO-XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">PR Number</label>
          <input class="form-control" id="edit-pr" value="${entry.prNumber || ''}" placeholder="PR-XXXX">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Serial Number</label>
        <input class="form-control" id="edit-serial" value="${entry.serialNo || ''}" placeholder="Serial No">
      </div>
      <div class="form-group">
        <label class="form-label">Remark</label>
        <input class="form-control" id="edit-remark" value="${entry.remark || ''}" placeholder="Note...">
      </div>
      <button class="btn btn-primary btn-block mt-15" onclick="Store._saveEdit('${entry.id}')">
        💾 Update Entry
      </button>
    `);
  },

  _saveEdit(id) {
    const entry = DB.storeEntries.find(e => e.id === id);
    if (!entry) return;

    entry.poNumber = document.getElementById('edit-po')?.value.trim() || '';
    entry.prNumber = document.getElementById('edit-pr')?.value.trim() || '';
    entry.serialNo = document.getElementById('edit-serial')?.value.trim() || '';
    entry.remark   = document.getElementById('edit-remark')?.value.trim() || '';
    entry.isComplete = !!(entry.poNumber && entry.prNumber);

    // Mark related reminders done
    if (entry.isComplete) {
      DB.reminders.forEach(r => {
        if (r.linkedStoreId === entry.id) r.done = true;
      });
    }

    DB.save();
    Modal.close();
    this.update();
    App.updateBadges();
    Toast.success('Updated!', `${entry.id} updated successfully`);
  },

  delete(id) {
    if (!Utils.confirm('Delete this entry?')) return;
    DB._data.storeEntries = DB.storeEntries.filter(e => e.id !== id);
    // Re-index slNo
    DB.storeEntries.forEach((e, i) => e.slNo = i + 1);
    DB.save();
    this.update();
    App.updateBadges();
  },

  _updatePending() {
    const pending = DB.storeEntries.filter(e => !e.isComplete);
    const countEl = document.getElementById('pendingCount');
    if (countEl) countEl.textContent = pending.length;

    const listEl = document.getElementById('pendingPOPRList');
    if (!listEl) return;

    if (!pending.length) {
      listEl.innerHTML = `<p class="text-muted text-center" style="padding:20px;">✅ All entries complete!</p>`;
      return;
    }

    listEl.innerHTML = pending.map(e => {
      const missing = [];
      if (!e.poNumber) missing.push('PO');
      if (!e.prNumber) missing.push('PR');
      return `
        <div class="reminder-item urgent">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div>
              <div class="rem-title">
                <span class="pending-dot"></span>
                ${e.id} — ${e.item}
              </div>
              <div class="rem-meta">
                📅 ${e.date} | 👤 ${e.name} | 📍 ${e.location} | ❌ Missing: ${missing.join(' & ')}
              </div>
              <div class="text-xs text-muted mt-5">
                Next reminder in 3 hours
              </div>
            </div>
            <button class="btn btn-sm btn-warning" onclick="Store.edit('${e.id}')">
              ✏️ Complete
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  _updateStoreId() {
    const el = document.getElementById('storeId');
    if (el) el.value = 'ST' + String(DB.storeEntries.length + 1).padStart(4, '0');
  },

  onPersonChange() {
    const id = document.getElementById('storePerson')?.value;
    const emp = DB.employees.find(e => e.id === id);
    const el = document.getElementById('storeDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  exportExcel() {
    if (!DB.storeEntries.length) { Toast.error('No data!'); return; }
    const ws = XLSX.utils.json_to_sheet(DB.storeEntries.map(e => ({
      'Sl. No.':     e.slNo,
      'Date':        e.date,
      'Name':        e.name,
      'Department':  e.department,
      'Location':    e.location,
      'Item':        e.item,
      'Qty':         e.qty,
      'Unit':        e.unit,
      'Serial No.':  e.serialNo || '',
      'PO Number':   e.poNumber || 'PENDING',
      'PR Number':   e.prNumber || 'PENDING',
      'Condition':   e.condition,
      'Remark':      e.remark || '',
      'Attachments': e.attachments?.join(', ') || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Entries');
    XLSX.writeFile(wb, `Store_Entries_PanchhiFashion_${Utils.today()}.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  exportPDF() {
    if (!DB.storeEntries.length) { Toast.error('No data!'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l');
    Reports._header(doc, 'Store Report');
    
    doc.autoTable({
      startY: 28,
      head: [['Sl','Date','Name','Dept','Location','Item','Qty','Serial','PO#','PR#','Condition']],
      body: DB.storeEntries.map(e => [
        e.slNo, e.date, e.name, e.department, e.location,
        e.item, `${e.qty} ${e.unit}`, e.serialNo || '—',
        e.poNumber || 'PENDING', e.prNumber || 'PENDING', e.condition
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [247, 151, 30], textColor: 30 }
    });
    
    Reports._footer(doc);
    doc.save('Store_Report_PanchhiFashion.pdf');
    Toast.success('PDF Downloaded!', '');
  },

  update() {
    Utils.populateEmpDropdowns(['storePerson']);
    const personEl = document.getElementById('storePerson');
    if (personEl) personEl.onchange = () => Store.onPersonChange();
    this._updateStoreId();
    this._renderTable();
    this._updatePending();
  }
};

// Start 3-hour reminder checker
setInterval(() => Store.checkReminders(), 300000); // Check every 5 minutes
