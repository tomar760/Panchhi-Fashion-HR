/* ================================================
   REPORTS.JS — Reports, PDF, Excel, Dashboard
   ================================================ */

const Reports = {

  // ---- Shared PDF Header ----
  _header(doc, title) {
    doc.setFillColor(108, 99, 255);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('PANCHHI FASHION', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 21);
    doc.text(
      'Generated: ' + new Date().toLocaleDateString('en-IN') +
      '  |  By: Aditya (HR Admin)',
      14, 28
    );
    doc.setTextColor(30, 30, 30);
  },

  // ---- Shared PDF Footer ----
  _footer(doc) {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageW = doc.internal.pageSize.getWidth();
      doc.text(
        `Panchhi Fashion  |  Designed by Aditya  |  Page ${i} of ${pages}`,
        14, doc.internal.pageSize.getHeight() - 8
      );
    }
  },

  html() {
    return `
    <div class="section" id="section-reports">
      <div class="page-header">
        <div>
          <div class="page-heading">📊 Reports & Export</div>
          <div class="page-heading-sub">PDF aur Excel mein download karo</div>
        </div>
      </div>

      <!-- REPORT CARDS -->
      <div class="grid-3 mb-20">

        <!-- Employee Report -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">👥</div>
            Employee Report
          </div>
          <p class="text-sm text-muted mb-15">
            Sab employees ki complete list
          </p>
          <div class="download-grid">
            <button class="dl-btn dl-pdf"
                    onclick="Reports.exportEmpPDF()">
              <span class="dl-icon">📄</span>
              <span class="dl-label">PDF</span>
              <span class="dl-sub">Download</span>
            </button>
            <button class="dl-btn dl-excel"
                    onclick="Reports.exportEmpExcel()">
              <span class="dl-icon">📊</span>
              <span class="dl-label">Excel</span>
              <span class="dl-sub">Download</span>
            </button>
          </div>
        </div>

        <!-- Attendance Report -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Attendance Report
          </div>
          <div class="form-group">
            <label class="form-label">Month Select</label>
            <input type="month" class="form-control" id="repAttMonth">
          </div>
          <div class="download-grid">
            <button class="dl-btn dl-pdf"
                    onclick="Attendance.exportPDF()">
              <span class="dl-icon">📄</span>
              <span class="dl-label">PDF</span>
            </button>
            <button class="dl-btn dl-excel"
                    onclick="Attendance.exportExcel()">
              <span class="dl-icon">📊</span>
              <span class="dl-label">Excel</span>
            </button>
          </div>
        </div>

        <!-- Salary Report -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">💰</div>
            Salary Report
          </div>
          <div class="form-group">
            <label class="form-label">Month Select</label>
            <input type="month" class="form-control" id="repSalMonth">
          </div>
          <div class="download-grid">
            <button class="dl-btn dl-pdf"
                    onclick="Salary.exportPDF()">
              <span class="dl-icon">📄</span>
              <span class="dl-label">PDF</span>
            </button>
            <button class="dl-btn dl-excel"
                    onclick="Salary.exportExcel()">
              <span class="dl-icon">📊</span>
              <span class="dl-label">Excel</span>
            </button>
          </div>
        </div>

      </div><!-- /grid-3 -->

      <div class="grid-2 mb-20">

        <!-- Store Report -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">🏪</div>
            Store Report
          </div>
          <div class="form-group">
            <label class="form-label">Month Select</label>
            <input type="month" class="form-control" id="repStoreMonth">
          </div>
          <div class="download-grid">
            <button class="dl-btn dl-pdf"
                    onclick="Store.exportPDF()">
              <span class="dl-icon">📄</span>
              <span class="dl-label">PDF</span>
            </button>
            <button class="dl-btn dl-excel"
                    onclick="Store.exportExcel()">
              <span class="dl-icon">📊</span>
              <span class="dl-label">Excel</span>
            </button>
          </div>
        </div>

        <!-- Full Backup -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">💾</div>
            Full Data Backup
          </div>
          <p class="text-sm text-muted mb-15">
            Pura data ek Excel file mein — sab sheets ke saath
          </p>
          <button class="btn btn-primary btn-block mb-10"
                  onclick="Reports.fullBackup()">
            💾 Full Backup Download Karo
          </button>
          <button class="btn btn-ghost btn-block"
                  style="border-color:rgba(255,101,132,0.4);color:var(--danger);"
                  onclick="Reports.clearAll()">
            ⚠️ Sab Data Clear Karo
          </button>
        </div>

      </div>

      <!-- SUMMARY -->
      <div class="card">
        <div class="card-title">
          <div class="card-icon">📈</div>
          Overall Summary
        </div>
        <div class="grid-4">
          <div class="stat-card">
            <div class="stat-icon-wrap"
                 style="background:rgba(108,99,255,0.15);">👥</div>
            <div class="stat-num text-primary" id="rep-emp">0</div>
            <div class="stat-label">Total Staff</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap"
                 style="background:rgba(255,215,0,0.15);">💰</div>
            <div class="stat-num text-gold" id="rep-sal">Rs.0</div>
            <div class="stat-label">Total Salary Paid</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap"
                 style="background:rgba(247,151,30,0.15);">🏪</div>
            <div class="stat-num text-warning" id="rep-store">0</div>
            <div class="stat-label">Store Entries</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap"
                 style="background:rgba(67,233,123,0.15);">📋</div>
            <div class="stat-num text-success" id="rep-attRate">0%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  // ---- Employee PDF ----
  exportEmpPDF() {
    if (!DB.employees.length) {
      Toast.error('Koi data nahi!', 'Pehle employee add karo');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    this._header(doc, 'Employee Report');

    doc.autoTable({
      startY: 35,
      head: [['ID','Name','Phone','Dept','Designation','Type','Salary','Status','Joining']],
      body: DB.employees.map(e => [
        e.id, e.name, e.phone, e.dept || '—',
        e.desig || '—', e.type || '—',
        Utils.money(e.salary), e.status,
        e.join || '—'
      ]),
      styles:     { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [108, 99, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 255] }
    });

    this._footer(doc);
    doc.save(`Employees_PanchhiFashion_${Utils.today()}.pdf`);
    Toast.success('PDF Downloaded!', 'Employee report save ho gayi');
  },

  // ---- Employee Excel ----
  exportEmpExcel() {
    if (!DB.employees.length) {
      Toast.error('Koi data nahi!');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(DB.employees.map(e => ({
      'Employee ID':    e.id,
      'Name':           e.name,
      'Phone':          e.phone,
      'Department':     e.dept || '',
      'Designation':    e.desig || '',
      'Type':           e.type || '',
      'Monthly Salary': e.salary || 0,
      'Status':         e.status,
      'Joining Date':   e.join || '',
      'Aadhar/ID':      e.aadhar || '',
      'Emergency':      e.emergency || '',
      'Address':        e.address || '',
      'Added On':       e.addedOn || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `Employees_PanchhiFashion_${Utils.today()}.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Full Backup ----
  fullBackup() {
    const wb = XLSX.utils.book_new();
    const addSheet = (name, data) => {
      const ws = XLSX.utils.json_to_sheet(
        data.length ? data : [{ Note: 'No data yet' }]
      );
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    addSheet('Employees',    DB.employees);
    addSheet('Attendance',   DB.attendance);
    addSheet('Salary',       DB.salaries);
    addSheet('Leaves',       DB.leaves);
    addSheet('Store Entries',DB.storeEntries);
    addSheet('Inventory',    DB.inventory);
    addSheet('Reminders',    DB.reminders);

    XLSX.writeFile(wb, `PanchhiFashion_BACKUP_${Utils.today()}.xlsx`);
    Toast.success('Full Backup Downloaded!', 'Sab data Excel mein save ho gaya');
  },

  // ---- Clear All ----
  clearAll() {
    if (!Utils.confirm('DANGER! Sab data delete ho jayega. Pakka karna chahte ho?')) return;
    if (!Utils.confirm('Last chance! Ye undo nahi ho sakta!')) return;
    DB.clearAll();
    App.updateBadges();
    this.update();
    Toast.warning('Sab Data Clear Ho Gaya!', '');
  },

  // ---- Update Summary ----
  _updateSummary() {
    const totalSal = DB.salaries.reduce((sum, s) => {
      return sum + parseInt((s.net || '').replace(/[^0-9]/g, '') || 0);
    }, 0);

    const attRate = DB.attendance.length
      ? Math.round(
          DB.attendance.filter(a => a.status === 'Present').length /
          DB.attendance.length * 100
        )
      : 0;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('rep-emp',     DB.employees.length);
    set('rep-sal',     Utils.money(totalSal));
    set('rep-store',   DB.storeEntries.length);
    set('rep-attRate', attRate + '%');
  },

  // ---- Master Update ----
  update() {
    this._updateSummary();
  }
};

/* ================================================
   DASHBOARD MODULE
   ================================================ */

const Dashboard = {

  html() {
    return `
    <div class="section active" id="section-dashboard">
      <div class="page-header">
        <div>
          <div class="page-heading">🏠 Dashboard</div>
          <div class="page-heading-sub">Company ki puri overview ek nazar mein</div>
        </div>
        <button class="btn btn-ghost btn-sm"
                onclick="Dashboard.update()">🔄 Refresh</button>
      </div>

      <!-- STAT CARDS -->
      <div class="grid-4 mb-20">
        <div class="stat-card"
             onclick="App.navigate('employees', document.getElementById('nav-employees'))">
          <div class="stat-icon-wrap"
               style="background:rgba(108,99,255,0.15);">👥</div>
          <div class="stat-num text-primary" id="d-emp">0</div>
          <div class="stat-label">Total Employees</div>
          <div class="progress-bar">
            <div class="progress-fill" id="d-empBar" style="width:0%"></div>
          </div>
        </div>

        <div class="stat-card"
             onclick="App.navigate('attendance', document.getElementById('nav-attendance'))">
          <div class="stat-icon-wrap"
               style="background:rgba(67,233,123,0.15);">✅</div>
          <div class="stat-num text-success" id="d-present">0</div>
          <div class="stat-label">Aaj Present</div>
          <div class="stat-sub" id="d-presentRate">
            <span>📊</span><span>0% attendance</span>
          </div>
        </div>

        <div class="stat-card"
             onclick="App.navigate('store', document.getElementById('nav-store'))">
          <div class="stat-icon-wrap"
               style="background:rgba(247,151,30,0.15);">🏪</div>
          <div class="stat-num text-warning" id="d-storeTotal">0</div>
          <div class="stat-label">Store Entries</div>
          <div class="stat-sub" id="d-storePending">
            <span>⚠️</span><span>0 pending</span>
          </div>
        </div>

        <div class="stat-card"
             onclick="App.navigate('reminders', document.getElementById('nav-reminders'))">
          <div class="stat-icon-wrap"
               style="background:rgba(255,101,132,0.15);">🔔</div>
          <div class="stat-num text-danger" id="d-remActive">0</div>
          <div class="stat-label">Active Reminders</div>
          <div class="stat-sub" id="d-remToday">
            <span>📅</span><span>0 aaj ke</span>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-20">

        <!-- QUICK ACTIONS -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">⚡</div>
            Quick Actions
          </div>
          <div class="quick-grid">
            <button class="quick-btn"
                    onclick="App.navigate('employees',document.getElementById('nav-employees'))">
              <span class="quick-icon">➕</span>
              <span class="quick-label">Add Employee</span>
            </button>
            <button class="quick-btn"
                    onclick="App.navigate('attendance',document.getElementById('nav-attendance'))">
              <span class="quick-icon">📋</span>
              <span class="quick-label">Mark Attendance</span>
            </button>
            <button class="quick-btn"
                    onclick="App.navigate('store',document.getElementById('nav-store'))">
              <span class="quick-icon">📦</span>
              <span class="quick-label">Store Entry</span>
            </button>
            <button class="quick-btn"
                    onclick="App.navigate('salary',document.getElementById('nav-salary'))">
              <span class="quick-icon">💰</span>
              <span class="quick-label">Salary</span>
            </button>
            <button class="quick-btn"
                    onclick="App.navigate('reminders',document.getElementById('nav-reminders'))">
              <span class="quick-icon">🔔</span>
              <span class="quick-label">Set Reminder</span>
            </button>
            <button class="quick-btn"
                    onclick="App.navigate('reports',document.getElementById('nav-reports'))">
              <span class="quick-icon">📊</span>
              <span class="quick-label">Reports</span>
            </button>
          </div>
        </div>

        <!-- TODAY ALERTS -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">🔔</div>
            Aaj ki Alerts
          </div>
          <div id="dashAlerts">
            <div class="reminder-item success">
              <div class="rem-title" style="color:var(--success);">
                ✅ System Ready
              </div>
              <div class="rem-meta">Sab load ho gaya — Aditya ka tool ✅</div>
            </div>
          </div>
        </div>

      </div>

      <!-- PENDING STORE TABLE -->
      <div class="card">
        <div class="card-title">
          <div class="card-icon">⚠️</div>
          Incomplete Store Entries (PO / PR missing)
          <span class="badge badge-warning" id="d-pendingBadge">0</span>
          <div class="card-actions">
            <button class="btn btn-sm btn-ghost"
                    onclick="App.navigate('store',document.getElementById('nav-store'))">
              View All →
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Date</th>
                <th>Person</th>
                <th>Item</th>
                <th>PO#</th>
                <th>PR#</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="d-storeTable">
              <tr class="empty-row">
                <td colspan="7">✅ Sab entries complete hain!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  update() {
    const today    = Utils.today();
    const todayAtt = DB.attendance.filter(a => a.date === today);
    const present  = todayAtt.filter(a => a.status === 'Present').length;
    const total    = DB.employees.length;
    const rate     = total ? Math.round(present / total * 100) : 0;

    const pending    = DB.storeEntries.filter(e => !e.isComplete);
    const activeRem  = DB.reminders.filter(r => !r.done);
    const todayRem   = activeRem.filter(r => r.datetime?.startsWith(today));

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('d-emp',         total);
    set('d-present',     present);
    set('d-storeTotal',  DB.storeEntries.length);
    set('d-remActive',   activeRem.length);
    set('d-pendingBadge',pending.length);

    const presentRateEl = document.getElementById('d-presentRate');
    if (presentRateEl) {
      presentRateEl.innerHTML = `<span>📊</span><span>${rate}% attendance</span>`;
    }

    const storePendEl = document.getElementById('d-storePending');
    if (storePendEl) {
      storePendEl.innerHTML = `<span>⚠️</span><span>${pending.length} pending</span>`;
    }

    const remTodayEl = document.getElementById('d-remToday');
    if (remTodayEl) {
      remTodayEl.innerHTML = `<span>📅</span><span>${todayRem.length} aaj ke</span>`;
    }

    // Progress bar
    const empBar = document.getElementById('d-empBar');
    if (empBar) empBar.style.width = Math.min(100, total * 5) + '%';

    // Alerts section
    this._updateAlerts(pending, todayRem);

    // Pending store table
    this._updatePendingTable(pending);

    // Notif banner
    App.updateNotifBanner();
    App.updateBadges();
  },

  _updateAlerts(pending, todayRem) {
    const alertsEl = document.getElementById('dashAlerts');
    if (!alertsEl) return;

    let html = '';

    if (todayRem.length) {
      html += `
        <div class="reminder-item urgent">
          <div class="rem-title">
            🔔 ${todayRem.length} Reminder(s) aaj ke hain!
          </div>
          <div class="rem-meta">Reminder section mein dekho</div>
        </div>`;
    }

    if (pending.length) {
      html += `
        <div class="reminder-item warning">
          <div class="rem-title">
            ⚠️ ${pending.length} Store entries incomplete
          </div>
          <div class="rem-meta">PO / PR fill karna baaki hai</div>
        </div>`;
    }

    const lowStock = DB.inventory.filter(
      i => i.minStock > 0 && i.stock <= i.minStock
    );
    if (lowStock.length) {
      html += `
        <div class="reminder-item urgent">
          <div class="rem-title">
            📦 ${lowStock.length} item(s) low stock mein!
          </div>
          <div class="rem-meta">${lowStock.map(i => i.name).join(', ')}</div>
        </div>`;
    }

    if (!html) {
      html = `
        <div class="reminder-item success">
          <div class="rem-title" style="color:var(--success);">✅ Sab theek hai!</div>
          <div class="rem-meta">Koi pending alert nahi</div>
        </div>`;
    }

    alertsEl.innerHTML = html;
  },

  _updatePendingTable(pending) {
    const tbody = document.getElementById('d-storeTable');
    if (!tbody) return;

    if (!pending.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">✅ Sab store entries complete hain!</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = pending.slice(0, 8).map(e => {
      const poBadge = e.po
        ? `<span class="text-success" style="font-size:12px;">${e.po}</span>`
        : `<span class="pending-dot"></span><span class="text-warning text-xs">Missing</span>`;
      const prBadge = e.pr
        ? `<span class="text-success" style="font-size:12px;">${e.pr}</span>`
        : `<span class="pending-dot"></span><span class="text-warning text-xs">Missing</span>`;

      return `
        <tr>
          <td class="text-gold text-bold" style="font-size:12px;">${e.id}</td>
          <td class="text-sm">${e.date}</td>
          <td class="text-bold">${e.personName}</td>
          <td>${e.item}</td>
          <td>${poBadge}</td>
          <td>${prBadge}</td>
          <td>
            <button class="btn btn-sm btn-warning"
                    onclick="Store.edit('${e.id}')">
              ✏️ Fill
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
