/* ================================================
   GATEPASS.JS — Gate Pass Module
   Columns: S.N, Date, Employee Name,
   Department, Out Time, In Time, Purpose
   + Google Sheets Auto Sync
   ================================================ */

var GatePass = {

  SHEET_URL: 'https://script.google.com/macros/s/AKfycbw-DmUEw4atM28jOeJh4G5lZEXI3lxRu4MGp_FdlHYIAHE6EWMmVFmxfJIX2W-_go2d/exec',

  html: function() {
    return '<div class="section" id="section-gatepass">'
      + '<div class="page-header">'
      + '<div>'
      + '<div class="page-heading">🚪 Gate Pass</div>'
      + '<div class="page-heading-sub">Employee entry / exit record karo</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;align-items:center;">'
      + '<div class="auto-save-chip" id="autoSaveChip">💾 Auto Save: ON</div>'
      + '<button class="btn btn-success btn-sm" onclick="GatePass.exportExcel()">📊 Excel</button>'
      + '<button class="btn btn-danger btn-sm" onclick="GatePass.exportPDF()">📄 PDF</button>'
      + '</div>'
      + '</div>'

      + '<div class="grid-2">'

      + '<div class="card">'
      + '<div class="card-title"><div class="card-icon">➕</div>Naya Gate Pass</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">S.N. (Auto)</label>'
      + '<input type="text" class="form-control" id="gpId" readonly style="color:var(--accent-gold);font-weight:700;">'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Date *</label>'
      + '<input type="date" class="form-control" id="gpDate">'
      + '</div>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label">Employee Name *</label>'
      + '<select class="form-control" id="gpEmployee" onchange="GatePass.onEmpChange()">'
      + '<option value="">-- Select karo --</option>'
      + '</select>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label">Department (Auto)</label>'
      + '<input type="text" class="form-control" id="gpDept" readonly placeholder="Employee select karne par auto fill">'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Out Time *</label>'
      + '<input type="time" class="form-control" id="gpOutTime">'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">In Time</label>'
      + '<input type="time" class="form-control" id="gpInTime">'
      + '<div class="form-hint">Baad mein bhi fill kar sakte ho</div>'
      + '</div>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label">Purpose *</label>'
      + '<input type="text" class="form-control" id="gpPurpose" placeholder="Kahan ja rahe ho / Kaam kya hai">'
      + '</div>'

      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'
      + '<button class="btn btn-ghost btn-sm" onclick="GatePass.setPurpose(\'Personal Work\')">Personal Work</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="GatePass.setPurpose(\'Bank Work\')">Bank Work</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="GatePass.setPurpose(\'Site Visit\')">Site Visit</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="GatePass.setPurpose(\'Material Delivery\')">Material Delivery</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="GatePass.setPurpose(\'Official Work\')">Official Work</button>'
      + '</div>'

      + '<div class="sync-status" id="gpSyncStatus">'
      + '<span>☁️</span>'
      + '<span id="gpSyncText">Google Sheets sync ready</span>'
      + '</div>'

      + '<button class="btn btn-primary btn-block mt-10" onclick="GatePass.add()">✅ Gate Pass Save Karo</button>'
      + '</div>'

      + '<div class="card">'
      + '<div class="card-title"><div class="card-icon">📊</div>Aaj ka Summary</div>'

      + '<div class="salary-grid mb-15" style="grid-template-columns:repeat(3,1fr);">'
      + '<div class="salary-box"><div class="s-amt text-primary" id="gp-totalToday">0</div><div class="s-lbl">Aaj Total</div></div>'
      + '<div class="salary-box"><div class="s-amt text-warning" id="gp-out">0</div><div class="s-lbl">Bahar Hain</div></div>'
      + '<div class="salary-box"><div class="s-amt text-success" id="gp-returned">0</div><div class="s-lbl">Wapas Aa Gaye</div></div>'
      + '</div>'

      + '<div id="stillOutside"></div>'

      + '<hr class="divider">'
      + '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">📋 Aaj Ke Gate Pass</div>'
      + '<div id="todayGPList" style="max-height:300px;overflow-y:auto;">'
      + '<p class="text-muted text-center" style="padding:20px;">Aaj koi gate pass nahi</p>'
      + '</div>'
      + '</div>'

      + '</div>'

      + '<div class="card mt-20">'
      + '<div class="card-title">'
      + '<div class="card-icon">📋</div>'
      + 'Sab Gate Pass Records'
      + '<div class="card-actions">'
      + '<input type="date" class="form-control" id="gpFilterDate" style="width:150px;padding:5px 10px;font-size:12px;" oninput="GatePass._renderTable()">'
      + '<select class="form-control" id="gpFilterEmp" style="width:160px;padding:5px 10px;font-size:12px;" onchange="GatePass._renderTable()">'
      + '<option value="">All Employees</option>'
      + '</select>'
      + '</div>'
      + '</div>'

      + '<div class="table-wrap" style="max-height:400px;overflow-y:auto;">'
      + '<table class="data-table">'
      + '<thead><tr>'
      + '<th>S.N.</th>'
      + '<th>Date</th>'
      + '<th>Employee Name</th>'
      + '<th>Department</th>'
      + '<th>Out Time</th>'
      + '<th>In Time</th>'
      + '<th>Purpose</th>'
      + '<th>Status</th>'
      + '<th>Action</th>'
      + '</tr></thead>'
      + '<tbody id="gpTableBody">'
      + '<tr class="empty-row"><td colspan="9">📭 Koi gate pass nahi</td></tr>'
      + '</tbody>'
      + '</table>'
      + '</div>'
      + '</div>'

      + '</div>';
  },

  // ---- Employee Change ----
  onEmpChange: function() {
    var id  = document.getElementById('gpEmployee') ? document.getElementById('gpEmployee').value : '';
    var emp = DB.employees.find(function(e) { return e.id === id; });
    var el  = document.getElementById('gpDept');
    if (el) el.value = emp ? (emp.dept || '') : '';
  },

  // ---- Quick Purpose ----
  setPurpose: function(text) {
    var el = document.getElementById('gpPurpose');
    if (el) el.value = text;
  },

  // ---- Add Gate Pass ----
  add: function() {
    var empId   = document.getElementById('gpEmployee')  ? document.getElementById('gpEmployee').value   : '';
    var date    = document.getElementById('gpDate')       ? document.getElementById('gpDate').value       : '';
    var outTime = document.getElementById('gpOutTime')    ? document.getElementById('gpOutTime').value    : '';
    var inTime  = document.getElementById('gpInTime')     ? document.getElementById('gpInTime').value     : '';
    var purpose = document.getElementById('gpPurpose')    ? document.getElementById('gpPurpose').value.trim() : '';
    var dept    = document.getElementById('gpDept')       ? document.getElementById('gpDept').value       : '';
    var emp     = DB.employees.find(function(e) { return e.id === empId; });

    if (!empId)   { Toast.error('Employee select karo!');  return; }
    if (!date)    { Toast.error('Date fill karo!');         return; }
    if (!outTime) { Toast.error('Out Time fill karo!');     return; }
    if (!purpose) { Toast.error('Purpose likhna zaruri!'); return; }

    var pass = {
      id:         'GP' + String(DB.gatePasses.length + 1).padStart(4, '0'),
      date:       date,
      empId:      empId,
      empName:    emp ? emp.name : 'Unknown',
      dept:       dept || '',
      outTime:    outTime,
      inTime:     inTime || '',
      purpose:    purpose,
      isReturned: !!(inTime),
      synced:     false,
      addedOn:    new Date().toISOString()
    };

    DB.gatePasses.push(pass);
    DB.save();

    this.update();
    this._clearForm();
    App.updateBadges();

    this._syncToSheets(pass);

    Toast.success('Gate Pass Saved! ✅', pass.id + ' — ' + (emp ? emp.name : ''));
  },

  // ---- Mark In Time ----
  updateInTime: function(id) {
    var pass = DB.gatePasses.find(function(p) { return p.id === id; });
    if (!pass) return;

    var now     = new Date();
    var hours   = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var timeStr = hours + ':' + minutes;

    pass.inTime     = timeStr;
    pass.isReturned = true;

    DB.save();
    this.update();
    this._syncUpdateToSheets(pass);

    Toast.success('In Time Updated!', pass.empName + ' — ' + timeStr);
  },

  // ---- Delete ----
  delete: function(id) {
    if (!Utils.confirm('Gate pass delete karna chahte ho?')) return;
    DB._data.gatePasses = DB.gatePasses.filter(function(p) { return p.id !== id; });
    DB.save();
    this.update();
    Toast.warning('Gate pass deleted', '');
  },

  // ---- Render Table ----
  _renderTable: function() {
    var tbody     = document.getElementById('gpTableBody');
    var filterEmp = document.getElementById('gpFilterEmp');
    if (!tbody) return;

    var dateFilter = document.getElementById('gpFilterDate') ? document.getElementById('gpFilterDate').value : '';
    var empFilter  = filterEmp ? filterEmp.value : '';

    if (filterEmp) {
      var cur = filterEmp.value;
      var opts = '<option value="">All Employees</option>';
      DB.employees.forEach(function(e) {
        opts += '<option value="' + e.id + '"' + (e.id === cur ? ' selected' : '') + '>' + e.name + '</option>';
      });
      filterEmp.innerHTML = opts;
      filterEmp.value = cur;
    }

    var list = DB.gatePasses.slice().reverse();

    if (dateFilter) {
      list = list.filter(function(p) { return p.date === dateFilter; });
    }
    if (empFilter) {
      list = list.filter(function(p) { return p.empId === empFilter; });
    }

    if (!list.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="9">📭 Koi gate pass nahi</td></tr>';
      return;
    }

    var rows = '';
    list.forEach(function(p) {
      var inTimeHTML = p.inTime
        ? '<span class="text-success text-bold">' + p.inTime + '</span>'
        : '<button class="btn btn-sm btn-info" onclick="GatePass.updateInTime(\'' + p.id + '\')">⏱️ Mark In</button>';

      var statusHTML = p.isReturned
        ? '<span class="badge badge-success">✅ Returned</span>'
        : '<span class="badge badge-warning">⏳ Outside</span>';

      var syncIcon = p.synced ? '☁️✅' : '☁️⏳';

      rows += '<tr>'
        + '<td><span class="text-gold text-bold" style="font-size:12px;">' + p.id + '</span> <span style="font-size:10px;">' + syncIcon + '</span></td>'
        + '<td style="font-size:12px;">' + p.date + '</td>'
        + '<td><div class="text-bold">' + p.empName + '</div></td>'
        + '<td class="text-sm text-muted">' + (p.dept || '—') + '</td>'
        + '<td class="text-bold text-warning">' + (p.outTime || '—') + '</td>'
        + '<td>' + inTimeHTML + '</td>'
        + '<td style="font-size:12px;">' + p.purpose + '</td>'
        + '<td>' + statusHTML + '</td>'
        + '<td><button class="btn btn-sm btn-danger" onclick="GatePass.delete(\'' + p.id + '\')">🗑️</button></td>'
        + '</tr>';
    });

    tbody.innerHTML = rows;
  },

  // ---- Today Summary ----
  _updateTodaySummary: function() {
    var today    = Utils.today();
    var todayGPs = DB.gatePasses.filter(function(p) { return p.date === today; });
    var out      = todayGPs.filter(function(p) { return !p.isReturned; });
    var returned = todayGPs.filter(function(p) { return p.isReturned; });

    var totalEl    = document.getElementById('gp-totalToday');
    var outEl      = document.getElementById('gp-out');
    var returnedEl = document.getElementById('gp-returned');

    if (totalEl)    totalEl.textContent    = todayGPs.length;
    if (outEl)      outEl.textContent      = out.length;
    if (returnedEl) returnedEl.textContent = returned.length;

    var outsideEl = document.getElementById('stillOutside');
    if (outsideEl) {
      if (out.length > 0) {
        var names = out.map(function(p) {
          return p.empName + ' (Out: ' + p.outTime + ')';
        }).join(', ');
        outsideEl.innerHTML = '<div class="reminder-item urgent mb-10">'
          + '<div class="rem-title">⚠️ ' + out.length + ' employee(s) abhi bahar hain!</div>'
          + '<div class="rem-meta">' + names + '</div>'
          + '</div>';
      } else {
        outsideEl.innerHTML = '';
      }
    }

    var listEl = document.getElementById('todayGPList');
    if (!listEl) return;

    if (!todayGPs.length) {
      listEl.innerHTML = '<p class="text-muted text-center" style="padding:20px;">Aaj koi gate pass nahi</p>';
      return;
    }

    var html = '';
    todayGPs.slice().reverse().forEach(function(p) {
      var markBtn = !p.inTime
        ? '<button class="btn btn-sm btn-info" onclick="GatePass.updateInTime(\'' + p.id + '\')">⏱️ Mark In</button>'
        : '';

      html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--card-border);">'
        + '<span style="font-size:18px;">' + (p.isReturned ? '✅' : '⏳') + '</span>'
        + '<div style="flex:1;">'
        + '<div class="text-bold" style="font-size:13px;">' + p.empName + '</div>'
        + '<div class="text-xs text-muted">Out: ' + p.outTime + (p.inTime ? ' | In: ' + p.inTime : ' | Still Outside') + '</div>'
        + '<div class="text-xs text-muted">' + p.purpose + '</div>'
        + '</div>'
        + markBtn
        + '</div>';
    });

    listEl.innerHTML = html;
  },

  // ============================================
  // GOOGLE SHEETS SYNC — NEW ENTRY
  // ============================================

  _syncToSheets: function(pass) {
    var self = this;
    self._setSyncStatus('loading', '🔄 Google Sheets mein save ho raha hai...');

    var data = {
      sheetName: 'Gate Pass',
      action:    'add',
      slNo:      pass.id,
      date:      pass.date,
      empName:   pass.empName,
      dept:      pass.dept    || '',
      outTime:   pass.outTime || '',
      inTime:    pass.inTime  || '',
      purpose:   pass.purpose
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function() {
      pass.synced = true;
      DB.save();
      self._setSyncStatus('success', '✅ Google Sheets mein save ho gaya!');
      setTimeout(function() {
        self._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(function(err) {
      console.error('GatePass sync error:', err);
      self._setSyncStatus('error', '❌ Sync failed — data local mein saved hai');
    });
  },

  // ---- In Time Update Sync ----
  _syncUpdateToSheets: function(pass) {
    var self = this;

    var data = {
      sheetName: 'Gate Pass',
      action:    'updateInTime',
      slNo:      pass.id,
      inTime:    pass.inTime
    };

    fetch(this.SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function() {
      self._setSyncStatus('success', '✅ In Time updated in Sheets!');
      setTimeout(function() {
        self._setSyncStatus('idle', '☁️ Google Sheets sync ready');
      }, 3000);
    })
    .catch(function(err) {
      console.error('In time sync error:', err);
    });
  },

  // ---- Auto Sync Pending ----
  _autoSyncPending: function() {
    var self     = this;
    var unsynced = DB.gatePasses.filter(function(p) { return !p.synced; });
    if (!unsynced.length) return;

    unsynced.forEach(function(pass) {
      var data = {
        sheetName: 'Gate Pass',
        action:    'add',
        slNo:      pass.id,
        date:      pass.date,
        empName:   pass.empName,
        dept:      pass.dept    || '',
        outTime:   pass.outTime || '',
        inTime:    pass.inTime  || '',
        purpose:   pass.purpose
      };

      fetch(self.SHEET_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      })
      .then(function() {
        pass.synced = true;
        DB.save();
        console.log('Auto synced: ' + pass.id + ' ✅');
      })
      .catch(function(err) {
        console.error('Auto sync failed: ' + pass.id, err);
      });
    });
  },

  // ---- Sync Status UI ----
  _setSyncStatus: function(type, msg) {
    var textEl = document.getElementById('gpSyncText');
    if (!textEl) return;

    textEl.textContent = msg;

    var colors = {
      success: 'var(--success)',
      error:   'var(--danger)',
      warning: 'var(--warning)',
      loading: 'var(--info)',
      idle:    'var(--text-muted)'
    };

    textEl.style.color = colors[type] || 'var(--text-muted)';
  },

  // ---- Update GP ID ----
  _updateGPId: function() {
    var el = document.getElementById('gpId');
    if (el) {
      el.value = 'GP' + String(DB.gatePasses.length + 1).padStart(4, '0');
    }
  },

  // ---- Clear Form ----
  _clearForm: function() {
    var fields = ['gpEmployee', 'gpDept', 'gpOutTime', 'gpInTime', 'gpPurpose'];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    this._updateGPId();
  },

  // ============================================
  // EXPORT EXCEL
  // ============================================

  exportExcel: function() {
    if (!DB.gatePasses.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    var rows = DB.gatePasses.map(function(p) {
      return {
        'S.N':           p.id,
        'DATE':          p.date,
        'EMPLOYEE NAME': p.empName,
        'DEPARTMENT':    p.dept    || '',
        'OUT TIME':      p.outTime || '',
        'IN TIME':       p.inTime  || '',
        'PURPOSE':       p.purpose || ''
      };
    });

    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gate Pass');
    XLSX.writeFile(wb, 'GatePass_PanchhiFashion_' + Utils.today() + '.xlsx');
    Toast.success('Excel Downloaded! 📊', '');
  },

  // ============================================
  // EXPORT PDF
  // ============================================

  exportPDF: function() {
    if (!DB.gatePasses.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    var jsPDF  = window.jspdf.jsPDF;
    var doc    = new jsPDF();

    Reports._header(doc, 'Gate Pass Report');

    var body = DB.gatePasses.map(function(p) {
      return [
        p.id,
        p.date,
        p.empName,
        p.dept    || '—',
        p.outTime || '—',
        p.inTime  || 'Still Outside',
        p.purpose
      ];
    });

    doc.autoTable({
      startY: 35,
      head: [['S.N.', 'Date', 'Employee Name', 'Department', 'Out Time', 'In Time', 'Purpose']],
      body: body,
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [255, 215, 0], textColor: 30, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 253, 235] },
      didParseCell: function(data) {
        if (data.column.index === 5 && data.section === 'body') {
          if (data.cell.raw === 'Still Outside') {
            data.cell.styles.textColor = [220, 50, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    Reports._footer(doc);
    doc.save('GatePass_PanchhiFashion_' + Utils.today() + '.pdf');
    Toast.success('PDF Downloaded! 📄', '');
  },

  // ============================================
  // MASTER UPDATE
  // ============================================

  update: function() {
    Utils.populateEmpDropdowns(['gpEmployee']);

    var empEl = document.getElementById('gpEmployee');
    if (empEl) {
      empEl.onchange = function() { GatePass.onEmpChange(); };
    }

    this._updateGPId();
    this._updateTodaySummary();
    this._renderTable();

    var dateEl = document.getElementById('gpDate');
    if (dateEl && !dateEl.value) {
      dateEl.value = Utils.today();
    }
  }

};
