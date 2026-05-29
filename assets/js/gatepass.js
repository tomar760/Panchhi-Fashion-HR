/* ================================================
   GATEPASS.JS — Gate Pass Module
   Columns: S.N, Date, Employee Name, 
   Department, Out Time, In Time, Purpose
   + Google Sheets Auto Sync
   + Auto Save (every 30 seconds)
   ================================================ */

const GatePass = {

  // ---- Google Sheets URL ----
  // Apna Google Apps Script URL yahan daal do
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbw-DmUEw4atM28jOeJh4G5lZEXI3lxRu4MGp_FdlHYIAHE6EWMmVFmxfJIX2W-_go2d/exec',
  html() {
    return `
    <div class="section" id="section-gatepass">
      <div class="page-header">
        <div>
          <div class="page-heading">🚪 Gate Pass</div>
          <div class="page-heading-sub">
            Employee entry/exit record karo
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <!-- Auto Save Indicator -->
          <div class="auto-save-chip" id="autoSaveChip">
            💾 Auto Save: ON
          </div>
          <button class="btn btn-success btn-sm"
                  onclick="GatePass.exportExcel()">
            📊 Excel
          </button>
          <button class="btn btn-danger btn-sm"
                  onclick="GatePass.exportPDF()">
            📄 PDF
          </button>
        </div>
      </div>

      <div class="grid-2">

        <!-- ADD FORM -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">➕</div>
            Naya Gate Pass
          </div>

          <!-- S.N Auto -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">S.N. (Auto)</label>
              <input type="text" class="form-control" id="gpId"
                     readonly
                     style="color:var(--accent-gold);font-weight:700;">
            </div>
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" id="gpDate">
            </div>
          </div>

          <!-- Employee Name -->
          <div class="form-group">
            <label class="form-label">Employee Name *</label>
            <select class="form-control" id="gpEmployee"
                    onchange="GatePass.onEmpChange()">
              <option value="">-- Select karo --</option>
            </select>
          </div>

          <!-- Department (Auto fill) -->
          <div class="form-group">
            <label class="form-label">Department (Auto)</label>
            <input type="text" class="form-control" id="gpDept"
                   readonly placeholder="Employee select karne par auto fill">
          </div>

          <!-- Out Time & In Time -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Out Time</label>
              <input type="time" class="form-control" id="gpOutTime">
            </div>
            <div class="form-group">
              <label class="form-label">In Time</label>
              <input type="time" class="form-control" id="gpInTime">
              <div class="form-hint">
                Baad mein bhi fill kar sakte ho
              </div>
            </div>
          </div>

          <!-- Purpose -->
          <div class="form-group">
            <label class="form-label">Purpose *</label>
            <input type="text" class="form-control" id="gpPurpose"
                   placeholder="Kahan ja rahe ho / Kaam kya hai">
          </div>

          <!-- Quick Purpose Buttons -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
            <button class="btn btn-ghost btn-sm"
                    onclick="GatePass.setPurpose('Personal Work')">
              Personal Work
            </button>
            <button class="btn btn-ghost btn-sm"
                    onclick="GatePass.setPurpose('Bank Work')">
              Bank Work
            </button>
            <button class="btn btn-ghost btn-sm"
                    onclick="GatePass.setPurpose('Site Visit')">
              Site Visit
            </button>
            <button class="btn btn-ghost btn-sm"
                    onclick="GatePass.setPurpose('Material Delivery')">
              Material Delivery
            </button>
            <button class="btn btn-ghost btn-sm"
                    onclick="GatePass.setPurpose('Official Work')">
              Official Work
            </button>
          </div>

          <button class="btn btn-primary btn-block"
                  onclick="GatePass.add()">
            ✅ Gate Pass Save Karo
          </button>

          <!-- Sync Status -->
          <div class="sync-status mt-10" id="syncStatus">
            <span id="syncIcon">☁️</span>
            <span id="syncText">Google Sheets sync ready</span>
          </div>
        </div>

        <!-- TODAY SUMMARY + QUICK TABLE -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📊</div>
            Aaj ka Summary
          </div>

          <!-- Stats -->
          <div class="salary-grid mb-15"
               style="grid-template-columns:repeat(3,1fr);">
            <div class="salary-box">
              <div class="s-amt text-primary" id="gp-totalToday">0</div>
              <div class="s-lbl">Aaj Total</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-warning" id="gp-out">0</div>
              <div class="s-lbl">Bahar Hain</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-success" id="gp-returned">0</div>
              <div class="s-lbl">Wapas Aa Gaye</div>
            </div>
          </div>

          <!-- Still Outside Alert -->
          <div id="stillOutside"></div>

          <hr class="divider">

          <!-- Today's List -->
          <div class="card-title"
               style="border:none;padding:0;margin-bottom:10px;font-size:13px;">
            <div class="card-icon">📋</div>
            Aaj Ke Gate Pass
          </div>
          <div id="todayGPList"
               style="max-height:300px;overflow-y:auto;">
            <p class="text-muted text-center" style="padding:20px;">
              Aaj koi gate pass nahi
            </p>
          </div>
        </div>

      </div><!-- /grid-2 -->

      <!-- ALL RECORDS TABLE -->
      <div class="card mt-20">
        <div class="card-title">
          <div class="card-icon">📋</div>
          Sab Gate Pass Records
          <div class="card-actions">
            <!-- Date Filter -->
            <input type="date" class="form-control"
                   id="gpFilterDate"
                   style="width:150px;padding:5px 10px;font-size:12px;"
                   oninput="GatePass._renderTable()">
            <!-- Employee Filter -->
            <select class="form-control"
                    id="gpFilterEmp"
                    style="width:160px;padding:5px 10px;font-size:12px;"
                    onchange="GatePass._renderTable()">
              <option value="">All Employees</option>
            </select>
          </div>
        </div>

        <div class="table-wrap" style="max-height:400px;overflow-y:auto;">
          <table class="data-table" id="gpMainTable">
            <thead>
              <tr>
                <th>S.N.</th>
                <th>Date</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Out Time</th>
                <th>In Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="gpTableBody">
              <tr class="empty-row">
                <td colspan="9">📭 Koi gate pass nahi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  // ---- Employee Change — Auto Fill Dept ----
  onEmpChange() {
    const id  = document.getElementById('gpEmployee')?.value;
    const emp = DB.employees.find(e => e.id === id);
    const el  = document.getElementById('gpDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  // ---- Quick Purpose Fill ----
  setPurpose(text) {
    const el = document.getElementById('gpPurpose');
    if (el) el.value = text;
  },

  // ---- Add Gate Pass ----
  add() {
    const empId   = document.getElementById('gpEmployee')?.value;
    const date    = document.getElementById('gpDate')?.value;
    const outTime = document.getElementById('gpOutTime')?.value;
    const inTime  = document.getElementById('gpInTime')?.value;
    const purpose = document.getElementById('gpPurpose')?.value.trim();
    const dept    = document.getElementById('gpDept')?.value;
    const emp     = DB.employees.find(e => e.id === empId);

    // Validation
    if (!empId)   { Toast.error('Employee select karo!');  return; }
    if (!date)    { Toast.error('Date fill karo!');         return; }
    if (!outTime) { Toast.error('Out Time fill karo!');     return; }
    if (!purpose) { Toast.error('Purpose likhna zaruri!'); return; }

    const pass = {
      id:       'GP' + String(DB.gatePasses.length + 1).padStart(4, '0'),
      date,
      empId,
      empName:  emp ? emp.name : 'Unknown',
      dept:     dept || '',
      outTime,
      inTime:   inTime || '',
      purpose,
      isReturned: !!(inTime),
      addedOn:  new Date().toISOString(),
      synced:   false
    };

    DB.gatePasses.push(pass);
    DB.save();

    this.update();
    this._clearForm();
    App.updateBadges();

    // Sync to Google Sheets
    this._syncToSheets(pass);

    Toast.success(
      'Gate Pass Saved!',
      `${pass.id} — ${emp ? emp.name : ''}`
    );
  },

  // ---- Update In Time ----
  updateInTime(id) {
    const pass = DB.gatePasses.find(p => p.id === id);
    if (!pass) return;

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    pass.inTime     = timeStr;
    pass.isReturned = true;

    DB.save();
    this.update();

    // Update in Google Sheets too
    this._syncUpdateToSheets(pass);

    Toast.success('In Time Updated!', `${pass.empName} — ${timeStr}`);
  },

  // ---- Delete ----
  delete(id) {
    if (!Utils.confirm('Gate pass delete karna chahte ho?')) return;
    DB._data.gatePasses = DB.gatePasses.filter(p => p.id !== id);
    DB.save();
    this.update();
    Toast.warning('Gate pass deleted', '');
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody     = document.getElementById('gpTableBody');
    const filterEmp = document.getElementById('gpFilterEmp');
    if (!tbody) return;

    const dateFilter = document.getElementById('gpFilterDate')?.value || '';
    const empFilter  = filterEmp?.value || '';

    // Update filter emp dropdown
    if (filterEmp) {
      const cur = filterEmp.value;
      filterEmp.innerHTML =
        '<option value="">All Employees</option>' +
        DB.employees.map(e =>
          `<option value="${e.id}" ${e.id === cur ? 'selected' : ''}>
            ${e.name}
          </option>`
        ).join('');
      filterEmp.value = cur;
    }

    let list = [...DB.gatePasses].reverse();

    if (dateFilter) list = list.filter(p => p.date === dateFilter);
    if (empFilter)  list = list.filter(p => p.empId === empFilter);

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">📭 Koi gate pass nahi</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td>
          <span class="text-gold text-bold"
                style="font-size:12px;">${p.id}</span>
        </td>
        <td style="font-size:12px;">${p.date}</td>
        <td><div class="text-bold">${p.empName}</div></td>
        <td class="text-sm text-muted">${p.dept || '—'}</td>
        <td class="text-bold text-warning">${p.outTime || '—'}</td>
        <td>
          ${p.inTime
            ? `<span class="text-success text-bold">${p.inTime}</span>`
            : `<button class="btn btn-sm btn-info"
                       onclick="GatePass.updateInTime('${p.id}')">
                 ⏱️ Mark In
               </button>`
          }
        </td>
        <td style="font-size:12px;">${p.purpose}</td>
        <td>
          ${p.isReturned
            ? '<span class="badge badge-success">✅ Returned</span>'
            : '<span class="badge badge-warning">⏳ Outside</span>'
          }
        </td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="GatePass.delete('${p.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  // ---- Today Summary ----
  _updateTodaySummary() {
    const today    = Utils.today();
    const todayGPs = DB.gatePasses.filter(p => p.date === today);
    const out      = todayGPs.filter(p => !p.isReturned);
    const returned = todayGPs.filter(p => p.isReturned);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('gp-totalToday', todayGPs.length);
    set('gp-out',        out.length);
    set('gp-returned',   returned.length);

    // Still Outside Alert
    const outsideEl = document.getElementById('stillOutside');
    if (outsideEl) {
      if (out.length > 0) {
        outsideEl.innerHTML = `
          <div class="reminder-item urgent mb-10">
            <div class="rem-title">
              ⚠️ ${out.length} employee(s) abhi bahar hain!
            </div>
            <div class="rem-meta">
              ${out.map(p => `${p.empName} (Out: ${p.outTime})`).join(', ')}
            </div>
          </div>`;
      } else {
        outsideEl.innerHTML = '';
      }
    }

    // Today's list
    const listEl = document.getElementById('todayGPList');
    if (!listEl) return;

    if (!todayGPs.length) {
      listEl.innerHTML = `
        <p class="text-muted text-center" style="padding:20px;">
          Aaj koi gate pass nahi
        </p>`;
      return;
    }

    listEl.innerHTML = [...todayGPs].reverse().map(p => `
      <div style="display:flex;align-items:center;gap:10px;
                  padding:9px 0;border-bottom:1px solid var(--card-border);">
        <span style="font-size:18px;">
          ${p.isReturned ? '✅' : '⏳'}
        </span>
        <div style="flex:1;">
          <div class="text-bold" style="font-size:13px;">${p.empName}</div>
          <div class="text-xs text-muted">
            Out: ${p.outTime}
            ${p.inTime ? ' | In: ' + p.inTime : ' | Still Outside'}
          </div>
          <div class="text-xs text-muted">${p.purpose}</div>
        </div>
        ${!p.inTime ? `
          <button class="btn btn-sm btn-info"
                  onclick="GatePass.updateInTime('${p.id}')">
            ⏱️ Mark In
          </button>
        ` : ''}
      </div>
    `).join('');
  },

  // ---- Update Gate Pass ID ----
  _updateGPId() {
    const el = document.getElementById('gpId');
    if (el) {
      el.value = 'GP' + String(DB.gatePasses.length + 1).padStart(4, '0');
    }
  },

  // ---- Clear Form ----
  _clearForm() {
    Utils.clearFields(['gpEmployee','gpDept','gpOutTime','gpInTime','gpPurpose']);
    this._updateGPId();
  },

  // ============================================
  // GOOGLE SHEETS SYNC
  // ============================================

  // ---- New Entry Sync ----
  _syncToSheets(pass) {
    if (this.SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      this._setSyncStatus('warning', '⚠️ Google Sheets URL set nahi hai');
      return;
    }

    this._setSyncStatus('loading', '🔄 Syncing...');

    const data = {
      action:   'add',
      slNo:     pass.id,
      date:     pass.date,
      empName:  pass.empName,
      dept:     pass.dept,
      outTime:  pass.outTime,
      inTime:   pass.inTime || '',
      purpose:  pass.purpose
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(() => {
      pass.synced = true;
      DB.save();
      this._setSyncStatus('success', '✅ Google Sheets synced!');
      setTimeout(() => {
        this._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(err => {
      this._setSyncStatus('error', '❌ Sync failed — data local mein saved hai');
      console.error('Sync error:', err);
    });
  },

  // ---- Update In Time Sync ----
  _syncUpdateToSheets(pass) {
    if (this.SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') return;

    const data = {
      action:  'updateInTime',
      slNo:    pass.id,
      inTime:  pass.inTime
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(() => {
      this._setSyncStatus('success', '✅ In Time updated in Sheets!');
      setTimeout(() => {
        this._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(err => {
      console.error('Update sync error:', err);
    });
  },

  // ---- Sync Status UI ----
  _setSyncStatus(type, msg) {
    const iconEl = document.getElementById('syncIcon');
    const textEl = document.getElementById('syncText');
    if (!iconEl || !textEl) return;

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

  // ---- Auto Save Check ----
  // Har 30 seconds mein jo unsynced hain unhe sync karo
  _autoSyncPending() {
    if (this.SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') return;

    const unsynced = DB.gatePasses.filter(p => !p.synced);
    if (unsynced.length === 0) return;

    unsynced.forEach(pass => {
      this._syncToSheets(pass);
    });
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.gatePasses.length) {
      Toast.error('Koi data nahi!');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(DB.gatePasses.map(p => ({
      'S.N':           p.id,
      'DATE':          p.date,
      'EMPLOYEE NAME': p.empName,
      'DEPARTMENT':    p.dept || '',
      'OUT TIME':      p.outTime || '',
      'IN TIME':       p.inTime  || '',
      'PURPOSE':       p.purpose || ''
    })));

    // Style header row yellow (Excel mein)
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gate Pass');
    XLSX.writeFile(wb, `GatePass_PanchhiFashion_${Utils.today()}.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.gatePasses.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    Reports._header(doc, 'Gate Pass Report');

    doc.autoTable({
      startY: 35,
      head: [['S.N.','Date','Employee Name','Department','Out Time','In Time','Purpose']],
      body: DB.gatePasses.map(p => [
        p.id,
        p.date,
        p.empName,
        p.dept    || '—',
        p.outTime || '—',
        p.inTime  || 'Still Outside',
        p.purpose
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [255, 215, 0],
        textColor: 30,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [255, 253, 235] },
      didParseCell(data) {
        if (data.column.index === 5 && data.section === 'body') {
          if (data.cell.raw === 'Still Outside') {
            data.cell.styles.textColor = [220, 50, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    Reports._footer(doc);
    doc.save(`GatePass_PanchhiFashion_${Utils.today()}.pdf`);
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['gpEmployee']);

    // Re-attach onchange
    const empEl = document.getElementById('gpEmployee');
    if (empEl) empEl.onchange = () => GatePass.onEmpChange();

    this._updateGPId();
    this._updateTodaySummary();
    this._renderTable();

    // Set today's date default
    const dateEl = document.getElementById('gpDate');
    if (dateEl && !dateEl.value) dateEl.value = Utils.today();
  }
};
