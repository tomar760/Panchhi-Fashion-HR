/* ================================================
   EMPLOYEES.JS — Employee Module
   ================================================ */

const Employees = {

  // ---- HTML Template ----
  html() {
    return `
    <div class="section" id="section-employees">
      <div class="page-header">
        <div>
          <div class="page-heading">👥 Employee Management</div>
          <div class="page-heading-sub">Staff ki puri info yahan manage karo</div>
        </div>
      </div>

      <div class="grid-2">

        <!-- ADD FORM -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">➕</div>
            Naya Employee Add Karo
          </div>

          <div class="form-group">
            <label class="form-label">Employee ID (Auto)</label>
            <input type="text" class="form-control" id="empId"
                   readonly style="color:var(--accent-gold);font-weight:700;">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pura Naam *</label>
              <input type="text" class="form-control" id="empName"
                     placeholder="Full name likho">
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number *</label>
              <input type="tel" class="form-control" id="empPhone"
                     placeholder="10 digit number" maxlength="10">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Department</label>
              <select class="form-control" id="empDept">
                <option value="">-- Select karo --</option>
                <option>Cutting</option>
                <option>Stitching</option>
                <option>Finishing</option>
                <option>Packing</option>
                <option>Quality Check</option>
                <option>Embroidery</option>
                <option>Design</option>
                <option>Store / Godown</option>
                <option>Accounts</option>
                <option>Management</option>
                <option>Security</option>
                <option>Housekeeping</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Designation</label>
              <input type="text" class="form-control" id="empDesig"
                     placeholder="Worker / Supervisor / etc">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Joining Date</label>
              <input type="date" class="form-control" id="empJoin">
            </div>
            <div class="form-group">
              <label class="form-label">Monthly Salary (Rs.)</label>
              <input type="number" class="form-control" id="empSalary"
                     placeholder="Amount" min="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Aadhar / ID Number</label>
              <input type="text" class="form-control" id="empAadhar"
                     placeholder="ID number">
            </div>
            <div class="form-group">
              <label class="form-label">Emergency Contact</label>
              <input type="tel" class="form-control" id="empEmergency"
                     placeholder="Family member number">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Employee Type</label>
              <select class="form-control" id="empType">
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Daily Wage">Daily Wage</option>
                <option value="Trainee">Trainee</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" id="empStatus">
                <option value="Active">Active</option>
                <option value="Leave">Leave pe hai</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" id="empAddress"
                   placeholder="Ghar ka address (optional)">
          </div>

          <button class="btn btn-primary btn-block" onclick="Employees.add()">
            ✅ Employee Save Karo
          </button>
        </div>

        <!-- EMPLOYEE LIST -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">👥</div>
            All Employees
            <div class="card-actions">
              <span class="badge badge-primary" id="empCount">0</span>
            </div>
          </div>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="empSearch"
                   placeholder="Naam, dept ya ID se dhundo..."
                   oninput="Employees.search(this.value)">
          </div>

          <!-- Filter tabs -->
          <div class="filter-tabs">
            <button class="filter-tab active" onclick="Employees.filter('All', this)">All</button>
            <button class="filter-tab" onclick="Employees.filter('Active', this)">✅ Active</button>
            <button class="filter-tab" onclick="Employees.filter('Leave', this)">🏖️ Leave</button>
            <button class="filter-tab" onclick="Employees.filter('Inactive', this)">❌ Inactive</button>
          </div>

          <div class="table-wrap" style="max-height:460px;overflow-y:auto;">
            <table class="data-table" id="empTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naam</th>
                  <th>Dept</th>
                  <th>Salary</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="empTableBody">
                <tr class="empty-row">
                  <td colspan="7">📭 Koi employee nahi — Add karo!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /grid-2 -->

      <!-- EMPLOYEE STATS ROW -->
      <div class="grid-4 mt-20" id="empStatsRow">
        <div class="stat-card">
          <div class="stat-icon-wrap" style="background:rgba(108,99,255,0.15);">👥</div>
          <div class="stat-num text-primary" id="es-total">0</div>
          <div class="stat-label">Total Staff</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap" style="background:rgba(67,233,123,0.15);">✅</div>
          <div class="stat-num text-success" id="es-active">0</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap" style="background:rgba(247,151,30,0.15);">🏖️</div>
          <div class="stat-num text-warning" id="es-leave">0</div>
          <div class="stat-label">On Leave</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap" style="background:rgba(255,215,0,0.15);">💰</div>
          <div class="stat-num text-gold" id="es-totalSal">0</div>
          <div class="stat-label">Total Salary/Month</div>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  // ---- Current filter ----
  _filter: 'All',
  _search: '',

  // ---- Add Employee ----
  add() {
    const name      = document.getElementById('empName').value.trim();
    const phone     = document.getElementById('empPhone').value.trim();
    const dept      = document.getElementById('empDept').value;
    const desig     = document.getElementById('empDesig').value.trim();
    const join      = document.getElementById('empJoin').value;
    const salary    = document.getElementById('empSalary').value;
    const aadhar    = document.getElementById('empAadhar').value.trim();
    const emergency = document.getElementById('empEmergency').value.trim();
    const type      = document.getElementById('empType').value;
    const status    = document.getElementById('empStatus').value;
    const address   = document.getElementById('empAddress').value.trim();

    // Validation
    if (!name)  { Toast.error('Naam missing!', 'Employee ka naam likhna zaruri hai'); return; }
    if (!phone) { Toast.error('Phone missing!', 'Mobile number likhna zaruri hai');   return; }
    if (phone.length !== 10) { Toast.error('Phone galat!', '10 digit ka number chahiye'); return; }

    const emp = {
      id:        Utils.nextId('EMP', DB.employees),
      name, phone, dept, desig, join,
      salary:    parseInt(salary) || 0,
      aadhar, emergency, type, status, address,
      addedOn:   Utils.today()
    };

    DB.employees.push(emp);
    DB.save();

    this.update();
    this._clearForm();

    Toast.success(`${name} add ho gaya!`, `ID: ${emp.id}`);
    App.updateBadges();
  },

  // ---- Delete Employee ----
  delete(idx) {
    const emp = DB.employees[idx];
    if (!Utils.confirm(`"${emp.name}" ko delete karna chahte ho?`)) return;
    DB.employees.splice(idx, 1);
    DB.save();
    this.update();
    App.updateBadges();
    Toast.warning('Employee deleted', emp.name);
  },

  // ---- View Employee Detail ----
  view(idx) {
    const e = DB.employees[idx];
    Modal.show(
      `👤 ${e.name}`,
      `
      <div class="grid-2" style="gap:10px;">
        <div class="salary-box">
          <div class="s-amt text-gold">${e.id}</div>
          <div class="s-lbl">Employee ID</div>
        </div>
        <div class="salary-box">
          <div class="s-amt" style="font-size:14px;">${e.status}</div>
          <div class="s-lbl">Status</div>
        </div>
      </div>
      <br>
      <table class="data-table">
        <tbody>
          <tr><td class="text-muted">Naam</td><td><strong>${e.name}</strong></td></tr>
          <tr><td class="text-muted">Mobile</td><td>${e.phone}</td></tr>
          <tr><td class="text-muted">Department</td><td>${e.dept || '—'}</td></tr>
          <tr><td class="text-muted">Designation</td><td>${e.desig || '—'}</td></tr>
          <tr><td class="text-muted">Type</td><td>${e.type || '—'}</td></tr>
          <tr><td class="text-muted">Joining Date</td><td>${e.join || '—'}</td></tr>
          <tr><td class="text-muted">Salary</td><td><strong class="text-gold">${Utils.money(e.salary)}</strong></td></tr>
          <tr><td class="text-muted">Aadhar/ID</td><td>${e.aadhar || '—'}</td></tr>
          <tr><td class="text-muted">Emergency</td><td>${e.emergency || '—'}</td></tr>
          <tr><td class="text-muted">Address</td><td>${e.address || '—'}</td></tr>
          <tr><td class="text-muted">Added On</td><td>${e.addedOn || '—'}</td></tr>
        </tbody>
      </table>
      `
    );
  },

  // ---- Filter ----
  filter(val, btn) {
    this._filter = val;
    document.querySelectorAll('#section-employees .filter-tab').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  // ---- Search ----
  search(q) {
    this._search = q.toLowerCase();
    this._renderTable();
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody = document.getElementById('empTableBody');
    if (!tbody) return;

    let list = [...DB.employees];

    // Apply filter
    if (this._filter !== 'All') {
      list = list.filter(e => e.status === this._filter);
    }

    // Apply search
    if (this._search) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(this._search) ||
        (e.dept || '').toLowerCase().includes(this._search) ||
        e.id.toLowerCase().includes(this._search) ||
        (e.phone || '').includes(this._search)
      );
    }

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">📭 Koi employee nahi mila</td>
        </tr>`;
      return;
    }

    const statusBadge = {
      'Active':   'badge-success',
      'Leave':    'badge-warning',
      'Inactive': 'badge-danger'
    };

    tbody.innerHTML = list.map(e => {
      const origIdx = DB.employees.findIndex(emp => emp.id === e.id);
      return `
        <tr>
          <td>
            <span class="text-gold text-bold" style="font-size:12px;">${e.id}</span>
          </td>
          <td>
            <div class="text-bold">${e.name}</div>
            <div class="text-xs text-muted">${e.phone}</div>
          </td>
          <td>
            <div style="font-size:12px;">${e.dept || '—'}</div>
            <div class="text-xs text-muted">${e.desig || ''}</div>
          </td>
          <td class="text-gold text-bold">${Utils.money(e.salary)}</td>
          <td>
            <span class="text-xs text-muted">${e.type || '—'}</span>
          </td>
          <td>
            <span class="badge ${statusBadge[e.status] || 'badge-primary'}">
              ${e.status}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-info"
                      onclick="Employees.view(${origIdx})"
                      title="View">👁️</button>
              <button class="btn btn-sm btn-danger"
                      onclick="Employees.delete(${origIdx})"
                      title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---- Update Stats ----
  _updateStats() {
    const total   = DB.employees.length;
    const active  = DB.employees.filter(e => e.status === 'Active').length;
    const onLeave = DB.employees.filter(e => e.status === 'Leave').length;
    const totalSal = DB.employees.reduce((s, e) => s + (e.salary || 0), 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('empCount',   total);
    set('es-total',   total);
    set('es-active',  active);
    set('es-leave',   onLeave);
    set('es-totalSal', Utils.money(totalSal));

    // Update employee ID field
    const idEl = document.getElementById('empId');
    if (idEl) idEl.value = Utils.nextId('EMP', DB.employees);
  },

  // ---- Clear Form ----
  _clearForm() {
    Utils.clearFields([
      'empName','empPhone','empDept','empDesig',
      'empJoin','empSalary','empAadhar',
      'empEmergency','empAddress'
    ]);
    const typeEl   = document.getElementById('empType');
    const statusEl = document.getElementById('empStatus');
    if (typeEl)   typeEl.value   = 'Permanent';
    if (statusEl) statusEl.value = 'Active';
    this._updateStats();
  },

  // ---- Master Update ----
  update() {
    this._updateStats();
    this._renderTable();
    Utils.populateEmpDropdowns([
      'attEmp', 'salEmp', 'leaveEmp', 'storePerson'
    ]);
  }
};
