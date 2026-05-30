/* ================================================
   EMPLOYEES.JS — Employee Module + Excel Import
   ================================================ */

const Employees = {

  html: function() {
    return '<div class="section" id="section-employees">'
      + '<div class="page-header">'
      + '<div>'
      + '<div class="page-heading">👥 Employee Management</div>'
      + '<div class="page-heading-sub">Staff ki puri info yahan manage karo</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;">'
      + '<button class="btn btn-success btn-sm" onclick="Employees.exportExcel()">📊 Excel</button>'
      + '<button class="btn btn-danger btn-sm" onclick="Employees.exportPDF()">📄 PDF</button>'
      + '<button class="btn btn-primary btn-sm" onclick="document.getElementById(\'importFile\').click()">📤 Import Excel</button>'
      + '<input type="file" id="importFile" accept=".xlsx,.xls,.csv" style="display:none;" onchange="Employees.importExcel(event)">'
      + '</div>'
      + '</div>'

      + '<div class="grid-2">'

      + '<div class="card">'
      + '<div class="card-title"><div class="card-icon">➕</div>Naya Employee Add Karo</div>'

      + '<div class="form-group">'
      + '<label class="form-label">Employee ID (Auto)</label>'
      + '<input type="text" class="form-control" id="empId" readonly style="color:var(--accent-gold);font-weight:700;">'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Pura Naam *</label>'
      + '<input type="text" class="form-control" id="empName" placeholder="Full name">'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Mobile *</label>'
      + '<input type="tel" class="form-control" id="empPhone" placeholder="10 digit" maxlength="10">'
      + '</div>'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Department</label>'
      + '<select class="form-control" id="empDept">'
      + '<option value="">-- Select karo --</option>'
      + '<option>Cutting</option><option>Stitching</option><option>Finishing</option>'
      + '<option>Packing</option><option>Quality Check</option><option>Embroidery</option>'
      + '<option>Design</option><option>Store / Godown</option><option>Accounts</option>'
      + '<option>Management</option><option>Other</option>'
      + '</select>'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Designation</label>'
      + '<input type="text" class="form-control" id="empDesig" placeholder="Worker / Supervisor">'
      + '</div>'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Joining Date</label>'
      + '<input type="date" class="form-control" id="empJoin">'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Monthly Salary (₹)</label>'
      + '<input type="number" class="form-control" id="empSalary" placeholder="Amount" min="0">'
      + '</div>'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Aadhar / ID</label>'
      + '<input type="text" class="form-control" id="empAadhar" placeholder="ID number">'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Emergency Contact</label>'
      + '<input type="tel" class="form-control" id="empEmergency" placeholder="Family member number">'
      + '</div>'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label">Employee Type</label>'
      + '<select class="form-control" id="empType">'
      + '<option value="Permanent">Permanent</option>'
      + '<option value="Contract">Contract</option>'
      + '<option value="Daily Wage">Daily Wage</option>'
      + '<option value="Trainee">Trainee</option>'
      + '</select>'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label">Status</label>'
      + '<select class="form-control" id="empStatus">'
      + '<option value="Active">Active</option>'
      + '<option value="Leave">Leave pe hai</option>'
      + '<option value="Inactive">Inactive</option>'
      + '</select>'
      + '</div>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label">Address</label>'
      + '<input type="text" class="form-control" id="empAddress" placeholder="Ghar ka address (optional)">'
      + '</div>'

      + '<button class="btn btn-primary btn-block" onclick="Employees.add()">✅ Employee Save Karo</button>'
      + '</div>'

      + '<div class="card">'
      + '<div class="card-title">'
      + '<div class="card-icon">👥</div>'
      + 'All Employees'
      + '<div class="card-actions">'
      + '<span class="badge badge-primary" id="empCount">0</span>'
      + '</div>'
      + '</div>'

      + '<div class="search-box">'
      + '<span class="search-icon">🔍</span>'
      + '<input type="text" class="form-control" id="empSearch" placeholder="Naam, dept ya ID se dhundo..." oninput="Employees.search(this.value)">'
      + '</div>'

      + '<div class="filter-tabs">'
      + '<button class="filter-tab active" onclick="Employees.filter(\'All\', this)">All</button>'
      + '<button class="filter-tab" onclick="Employees.filter(\'Active\', this)">✅ Active</button>'
      + '<button class="filter-tab" onclick="Employees.filter(\'Leave\', this)">🏖️ Leave</button>'
      + '<button class="filter-tab" onclick="Employees.filter(\'Inactive\', this)">❌ Inactive</button>'
      + '</div>'

      + '<div class="table-wrap" style="max-height:460px;overflow-y:auto;">'
      + '<table class="data-table" id="empTable">'
      + '<thead><tr>'
      + '<th>ID</th><th>Naam</th><th>Dept</th><th>Salary</th><th>Type</th><th>Status</th><th>Action</th>'
      + '</tr></thead>'
      + '<tbody id="empTableBody">'
      + '<tr class="empty-row"><td colspan="7">📭 Koi employee nahi — Add karo!</td></tr>'
      + '</tbody>'
      + '</table>'
      + '</div>'
      + '</div>'

      + '</div>'

      + '<div class="grid-4 mt-20" id="empStatsRow">'
      + '<div class="stat-card">'
      + '<div class="stat-icon-wrap" style="background:rgba(108,99,255,0.15);">👥</div>'
      + '<div class="stat-num text-primary" id="es-total">0</div>'
      + '<div class="stat-label">Total Staff</div>'
      + '</div>'
      + '<div class="stat-card">'
      + '<div class="stat-icon-wrap" style="background:rgba(67,233,123,0.15);">✅</div>'
      + '<div class="stat-num text-success" id="es-active">0</div>'
      + '<div class="stat-label">Active</div>'
      + '</div>'
      + '<div class="stat-card">'
      + '<div class="stat-icon-wrap" style="background:rgba(247,151,30,0.15);">🏖️</div>'
      + '<div class="stat-num text-warning" id="es-leave">0</div>'
      + '<div class="stat-label">On Leave</div>'
      + '</div>'
      + '<div class="stat-card">'
      + '<div class="stat-icon-wrap" style="background:rgba(255,215,0,0.15);">💰</div>'
      + '<div class="stat-num text-gold" id="es-totalSal">0</div>'
      + '<div class="stat-label">Total Salary/Month</div>'
      + '</div>'
      + '</div>'

      + '</div>';
  },

  _filter: 'All',
  _search: '',

  // ============================================
  // IMPORT EXCEL — TUMHARI MIS FILE
  // ============================================

  importExcel: function(event) {
    var self = this;
    var file = event.target.files[0];

    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: 'array' });

      // Pehli sheet lo
      var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Headers extract karo
      var headers = jsonData[0];
      var rows = jsonData.slice(1);

      // Column mapping tumhari sheet ke hisaab se
      var columnMap = {
        name:       self._findColumn(headers, ['EMPLOYEE FULL NAME (NAME AS PER AADHAR)', 'EMPLOYEE FULL NAME', 'NAME']),
        id:         self._findColumn(headers, ['E - CODE', 'EMPLOYEE CODE', 'CODE', 'EMP CODE']),
        dept:       self._findColumn(headers, ['DEPARTMENT', 'DEPT']),
        desig:      self._findColumn(headers, ['DESIGNATION', 'POST', 'POSITION']),
        phone:      self._findColumn(headers, ['EMPLOYEE PERSONAL CONTACT NO', 'CONTACT NO', 'MOBILE', 'PHONE']),
        join:       self._findColumn(headers, ['JOINING DATE', 'DATE OF JOINING', 'DOJ']),
        salary:     self._findColumn(headers, ['FIX CTC', 'NEW CTC', 'CTC', 'SALARY', 'MONTHLY SALARY']),
        aadhar:     self._findColumn(headers, ['AADHAR CARD NO', 'AADHAR', 'ID NUMBER']),
        emergency:  self._findColumn(headers, ['EMERGENCY CONTACT PERSON NUMBER', 'EMERGENCY CONTACT']),
        address:    self._findColumn(headers, ['EMPLOYEE CURRENT ADDRESS', 'ADDRESS', 'CURRENT ADDRESS']),
        status:     self._findColumn(headers, ['ACTIVE/INACTIVE', 'STATUS', 'EMPLOYEE STATUS'])
      };

      // Validate mapping
      if (!columnMap.name || !columnMap.phone) {
        Toast.error('Excel file sahi nahi!', 'Name aur Phone columns nahi mile');
        return;
      }

      var addedCount = 0;
      var errorCount = 0;

      // Har row process karo
      rows.forEach(function(row) {
        if (!row[columnMap.name] || !row[columnMap.phone]) {
          errorCount++;
          return;
        }

        // Phone number clean karo
        var phone = String(row[columnMap.phone]).replace(/\D/g, '').slice(0, 10);
        if (phone.length !== 10) {
          errorCount++;
          return;
        }

        // Salary clean karo
        var salary = 0;
        if (columnMap.salary && row[columnMap.salary]) {
          salary = parseInt(String(row[columnMap.salary]).replace(/[^0-9]/g, '')) || 0;
        }

        // Status map karo
        var status = 'Active';
        if (columnMap.status && row[columnMap.status]) {
          var s = String(row[columnMap.status]).toLowerCase();
          if (s.includes('inactive')) status = 'Inactive';
          else if (s.includes('leave')) status = 'Leave';
        }

        // Employee object banao
        var emp = {
          id: Utils.nextId('EMP', DB.employees),
          name: String(row[columnMap.name]).trim(),
          phone: phone,
          dept: columnMap.dept && row[columnMap.dept] ? String(row[columnMap.dept]).trim() : '',
          desig: columnMap.desig && row[columnMap.desig] ? String(row[columnMap.desig]).trim() : '',
          join: columnMap.join && row[columnMap.join] ? self._formatDate(row[columnMap.join]) : '',
          salary: salary,
          aadhar: columnMap.aadhar && row[columnMap.aadhar] ? String(row[columnMap.aadhar]).trim() : '',
          emergency: columnMap.emergency && row[columnMap.emergency] ? String(row[columnMap.emergency]).replace(/\D/g, '').slice(0, 10) : '',
          address: columnMap.address && row[columnMap.address] ? String(row[columnMap.address]).trim() : '',
          type: 'Permanent',
          status: status,
          addedOn: Utils.today()
        };

        // Check duplicate phone
        var exists = DB.employees.some(function(e) {
          return e.phone === emp.phone;
        });

        if (!exists) {
          DB.employees.push(emp);
          addedCount++;
        } else {
          errorCount++;
          console.log('Duplicate phone: ' + emp.phone);
        }
      });

      DB.save();
      self.update();
      App.updateBadges();

      // Reset file input
      event.target.value = '';

      if (addedCount > 0) {
        Toast.success(
          'Employees Imported! ✅',
          addedCount + ' employees add ho gaye! ' +
          (errorCount > 0 ? '(Errors: ' + errorCount + ')' : '')
        );
      } else {
        Toast.error('Koi bhi employee nahi add hua!', 'Sahi format ki Excel file upload karo');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  // ---- Find column index ----
  _findColumn: function(headers, possibleNames) {
    for (var i = 0; i < headers.length; i++) {
      var header = String(headers[i]).toUpperCase();
      for (var j = 0; j < possibleNames.length; j++) {
        if (header.includes(possibleNames[j].toUpperCase())) {
          return i;
        }
      }
    }
    return null;
  },

  // ---- Format date (DD/MM/YYYY to YYYY-MM-DD) ----
  _formatDate: function(dateStr) {
    if (!dateStr) return '';
    // Try multiple formats
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try DD/MM/YYYY
      var parts = String(dateStr).split(/[\/\- ]/);
      if (parts.length >= 3) {
        d = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  // ============================================
  // ADD EMPLOYEE
  // ============================================

  add: function() {
    var name      = document.getElementById('empName')    ? document.getElementById('empName').value.trim()       : '';
    var phone     = document.getElementById('empPhone')   ? document.getElementById('empPhone').value.trim()      : '';
    var dept      = document.getElementById('empDept')     ? document.getElementById('empDept').value               : '';
    var desig     = document.getElementById('empDesig')    ? document.getElementById('empDesig').value.trim()      : '';
    var join      = document.getElementById('empJoin')     ? document.getElementById('empJoin').value               : '';
    var salary    = document.getElementById('empSalary')   ? document.getElementById('empSalary').value              : '';
    var aadhar    = document.getElementById('empAadhar')   ? document.getElementById('empAadhar').value.trim()      : '';
    var emergency = document.getElementById('empEmergency')? document.getElementById('empEmergency').value.trim() : '';
    var type      = document.getElementById('empType')     ? document.getElementById('empType').value               : '';
    var status    = document.getElementById('empStatus')   ? document.getElementById('empStatus').value             : '';
    var address   = document.getElementById('empAddress')  ? document.getElementById('empAddress').value.trim()     : '';

    if (!name)  { Toast.error('Naam missing!', 'Employee ka naam likhna zaruri hai'); return; }
    if (!phone) { Toast.error('Phone missing!', 'Mobile number likhna zaruri hai');   return; }
    if (phone.length !== 10) { Toast.error('Phone galat!', '10 digit ka number chahiye'); return; }

    var emp = {
      id:        Utils.nextId('EMP', DB.employees),
      name:      name,
      phone:     phone,
      dept:      dept,
      desig:     desig,
      join:      join,
      salary:    parseInt(salary) || 0,
      aadhar:    aadhar,
      emergency: emergency,
      type:      type || 'Permanent',
      status:    status || 'Active',
      address:   address,
      addedOn:   Utils.today()
    };

    DB.employees.push(emp);
    DB.save();
    this.update();
    this._clearForm();

    Toast.success('Employee Added! ✅', name + ' — ID: ' + emp.id);
    App.updateBadges();
  },

  // ============================================
  // DELETE EMPLOYEE
  // ============================================

  delete: function(idx) {
    if (!Utils.confirm('"' + DB.employees[idx].name + '" ko delete karna chahte ho?')) return;
    DB.employees.splice(idx, 1);
    DB.save();
    this.update();
    App.updateBadges();
    Toast.warning('Employee deleted', '');
  },

  // ============================================
  // VIEW EMPLOYEE
  // ============================================

  view: function(idx) {
    var e = DB.employees[idx];
    Modal.show(
      '👤 ' + e.name,
      '<div class="grid-2" style="gap:10px;">'
        + '<div class="salary-box">'
        + '<div class="s-amt text-gold">' + e.id + '</div>'
        + '<div class="s-lbl">Employee ID</div>'
        + '</div>'
        + '<div class="salary-box">'
        + '<div class="s-amt" style="font-size:14px;">' + e.status + '</div>'
        + '<div class="s-lbl">Status</div>'
        + '</div>'
        + '</div><br>'
        + '<table class="data-table">'
        + '<tbody>'
        + '<tr><td class="text-muted">Naam</td><td><strong>' + e.name + '</strong></td></tr>'
        + '<tr><td class="text-muted">Mobile</td><td>' + e.phone + '</td></tr>'
        + '<tr><td class="text-muted">Department</td><td>' + (e.dept || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Designation</td><td>' + (e.desig || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Type</td><td>' + (e.type || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Joining Date</td><td>' + (e.join || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Salary</td><td><strong class="text-gold">' + Utils.money(e.salary) + '</strong></td></tr>'
        + '<tr><td class="text-muted">Aadhar/ID</td><td>' + (e.aadhar || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Emergency</td><td>' + (e.emergency || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Address</td><td>' + (e.address || '—') + '</td></tr>'
        + '<tr><td class="text-muted">Added On</td><td>' + (e.addedOn || '—') + '</td></tr>'
        + '</tbody>'
        + '</table>'
    );
  },

  // ============================================
  // FILTER
  // ============================================

  filter: function(val, btn) {
    this._filter = val;
    var tabs = document.querySelectorAll('#section-employees .filter-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  // ============================================
  // SEARCH
  // ============================================

  search: function(q) {
    this._search = q.toLowerCase();
    this._renderTable();
  },

  // ============================================
  // RENDER TABLE
  // ============================================

  _renderTable: function() {
    var tbody = document.getElementById('empTableBody');
    if (!tbody) return;

    var list = DB.employees.slice();

    if (this._filter !== 'All') {
      list = list.filter(function(e) { return e.status === this._filter; }.bind(this));
    }

    if (this._search) {
      list = list.filter(function(e) {
        return e.name.toLowerCase().includes(this._search) ||
               (e.dept || '').toLowerCase().includes(this._search) ||
               e.id.toLowerCase().includes(this._search) ||
               (e.phone || '').includes(this._search);
      }.bind(this));
    }

    if (!list.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7">📭 Koi employee nahi mili</td></tr>';
      return;
    }

    var statusBadge = {
      'Active':   'badge-success',
      'Leave':    'badge-warning',
      'Inactive': 'badge-danger'
    };

    var html = '';
    list.forEach(function(e, i) {
      var origIdx = DB.employees.indexOf(e);
      html += '<tr>'
        + '<td><span class="text-gold text-bold" style="font-size:12px;">' + e.id + '</span></td>'
        + '<td><div class="text-bold">' + e.name + '</div><div class="text-xs text-muted">' + e.phone + '</div></td>'
        + '<td><div style="font-size:12px;">' + (e.dept || '—') + '</div><div class="text-xs text-muted">' + (e.desig || '') + '</div></td>'
        + '<td class="text-gold text-bold">' + Utils.money(e.salary) + '</td>'
        + '<td><span class="text-xs text-muted">' + (e.type || '—') + '</span></td>'
        + '<td><span class="badge ' + (statusBadge[e.status] || 'badge-primary') + '">' + e.status + '</span></td>'
        + '<td><div style="display:flex;gap:4px;">'
        + '<button class="btn btn-sm btn-info" onclick="Employees.view(' + origIdx + ')" title="View">👁️</button>'
        + '<button class="btn btn-sm btn-danger" onclick="Employees.delete(' + origIdx + ')" title="Delete">🗑️</button>'
        + '</div></td>'
        + '</tr>';
    });

    tbody.innerHTML = html;
  },

  // ============================================
  // UPDATE STATS
  // ============================================

  _updateStats: function() {
    var total   = DB.employees.length;
    var active  = DB.employees.filter(function(e) { return e.status === 'Active'; }).length;
    var onLeave = DB.employees.filter(function(e) { return e.status === 'Leave'; }).length;
    var totalSal = DB.employees.reduce(function(sum, e) { return sum + (e.salary || 0); }, 0);

    var set = function(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('empCount',   total);
    set('es-total',   total);
    set('es-active',  active);
    set('es-leave',   onLeave);
    set('es-totalSal', Utils.money(totalSal));

    var idEl = document.getElementById('empId');
    if (idEl) idEl.value = Utils.nextId('EMP', DB.employees);
  },

  // ============================================
  // CLEAR FORM
  // ============================================

  _clearForm: function() {
    var fields = ['empName','empPhone','empDept','empDesig','empJoin','empSalary','empAadhar','empEmergency','empAddress'];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });

    var typeEl   = document.getElementById('empType');
    var statusEl = document.getElementById('empStatus');
    if (typeEl)   typeEl.value   = 'Permanent';
    if (statusEl) statusEl.value = 'Active';

    this._updateStats();
  },

  // ============================================
  // EXPORT EXCEL
  // ============================================

  exportExcel: function() {
    if (!DB.employees.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    var rows = DB.employees.map(function(e) {
      return {
        'Employee ID':    e.id,
        'Name':           e.name,
        'Phone':          e.phone,
        'Department':     e.dept    || '',
        'Designation':    e.desig   || '',
        'Type':           e.type    || '',
        'Monthly Salary': e.salary,
        'Status':         e.status,
        'Joining Date':   e.join    || '',
        'Aadhar/ID':      e.aadhar  || '',
        'Emergency':      e.emergency || '',
        'Address':        e.address || '',
        'Added On':       e.addedOn || ''
      };
    });

    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'Employees_PanchhiFashion_' + Utils.today() + '.xlsx');
    Toast.success('Excel Downloaded! 📊', '');
  },

  // ============================================
  // EXPORT PDF
  // ============================================

  exportPDF: function() {
    if (!DB.employees.length) {
      Toast.error('Koi data nahi!');
      return;
    }

    var jsPDF  = window.jspdf.jsPDF;
    var doc    = new jsPDF();

    Reports._header(doc, 'Employee Report');

    var body = DB.employees.map(function(e) {
      return [
        e.id,
        e.name,
        e.phone,
        e.dept || '—',
        e.desig || '—',
        e.type || '—',
        Utils.money(e.salary),
        e.status,
        e.join || '—'
      ];
    });

    doc.autoTable({
      startY: 35,
      head: [['ID','Name','Phone','Dept','Designation','Type','Salary','Status','Joining']],
      body: body,
      styles:     { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [108, 99, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 255] }
    });

    Reports._footer(doc);
    doc.save('Employees_PanchhiFashion_' + Utils.today() + '.pdf');
    Toast.success('PDF Downloaded! 📄', '');
  },

  // ============================================
  // MASTER UPDATE
  // ============================================

  update: function() {
    Utils.populateEmpDropdowns(['attEmp', 'salEmp', 'leaveEmp', 'storePerson', 'gpEmployee']);
    this._updateStats();
    this._renderTable();
  }

};
