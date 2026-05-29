/* ================================================
   SALARY.JS — Salary Module
   ================================================ */

const Salary = {

  html() {
    return `
    <div class="section" id="section-salary">
      <div class="page-header">
        <div>
          <div class="page-heading">💰 Salary Management</div>
          <div class="page-heading-sub">Calculate karo aur record rakho</div>
        </div>
      </div>

      <div class="grid-2">

        <!-- CALCULATOR -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">🧮</div>
            Salary Calculator
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Employee *</label>
              <select class="form-control" id="salEmp"
                      onchange="Salary.loadEmpInfo()">
                <option value="">-- Select karo --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Month *</label>
              <input type="month" class="form-control" id="salMonth"
                     onchange="Salary.calculate()">
            </div>
          </div>

          <!-- Calculation Result -->
          <div class="salary-grid">
            <div class="salary-box">
              <div class="s-amt text-primary" id="s-basic">Rs. 0</div>
              <div class="s-lbl">Basic Salary</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-success" id="s-present">0</div>
              <div class="s-lbl">Present Days</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-danger" id="s-absent">0</div>
              <div class="s-lbl">Absent Days</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-danger" id="s-deduction">Rs. 0</div>
              <div class="s-lbl">Deduction</div>
            </div>
            <div class="salary-box">
              <div class="s-amt" style="color:var(--info);" id="s-overtime">Rs. 0</div>
              <div class="s-lbl">Overtime</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-warning" id="s-advance">Rs. 0</div>
              <div class="s-lbl">Advance</div>
            </div>
          </div>

          <!-- Net Salary -->
          <div class="salary-box net-salary-box mt-10" style="padding:18px;">
            <div class="s-amt" id="s-net">Rs. 0</div>
            <div class="s-lbl" style="font-size:12px;">NET SALARY TO PAY</div>
          </div>

          <hr class="divider">

          <!-- Manual Inputs -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Overtime (Rs.)</label>
              <input type="number" class="form-control" id="s-otInput"
                     placeholder="0" min="0"
                     oninput="Salary.calculate()">
            </div>
            <div class="form-group">
              <label class="form-label">Advance Deduct (Rs.)</label>
              <input type="number" class="form-control" id="s-advInput"
                     placeholder="0" min="0"
                     oninput="Salary.calculate()">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Bonus (Rs.)</label>
              <input type="number" class="form-control" id="s-bonusInput"
                     placeholder="0" min="0"
                     oninput="Salary.calculate()">
            </div>
            <div class="form-group">
              <label class="form-label">Working Days/Month</label>
              <select class="form-control" id="s-workDays"
                      onchange="Salary.calculate()">
                <option value="26">26 days</option>
                <option value="25">25 days</option>
                <option value="27">27 days</option>
                <option value="28">28 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Remark / Note</label>
            <input type="text" class="form-control" id="s-remark"
                   placeholder="Koi note ho toh...">
          </div>

          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" style="flex:1;"
                    onclick="Salary.save()">
              💾 Record Save Karo
            </button>
            <button class="btn btn-ghost"
                    onclick="Salary.calculate()">
              🔄 Recalculate
            </button>
          </div>
        </div>

        <!-- SALARY HISTORY -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Salary History
            <div class="card-actions">
              <input type="month" class="form-control"
                     id="salFilterMonth"
                     style="width:140px;padding:5px 10px;font-size:12px;"
                     oninput="Salary.update()">
              <button class="btn btn-success btn-sm"
                      onclick="Salary.exportExcel()">📊</button>
              <button class="btn btn-danger btn-sm"
                      onclick="Salary.exportPDF()">📄</button>
            </div>
          </div>

          <div class="table-wrap" style="max-height:500px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Net</th>
                  <th>Remark</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody id="salTableBody">
                <tr class="empty-row">
                  <td colspan="6">📭 Koi salary record nahi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <hr class="divider">
          <div class="salary-grid" style="grid-template-columns:1fr 1fr;">
            <div class="salary-box">
              <div class="s-amt text-gold" id="sal-totalPaid">Rs. 0</div>
              <div class="s-lbl">Total Paid (Filter)</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-primary" id="sal-records">0</div>
              <div class="s-lbl">Records</div>
            </div>
          </div>
        </div>

      </div><!-- /grid-2 -->
    </div>
    `;
  },

  // ---- Load Employee Info ----
  loadEmpInfo() {
    const empId = document.getElementById('salEmp')?.value;
    const emp   = DB.employees.find(e => e.id === empId);
    if (!emp) return;
    const el = document.getElementById('s-basic');
    if (el) el.textContent = Utils.money(emp.salary);
    this.calculate();
  },

  // ---- Calculate Salary ----
  calculate() {
    const empId    = document.getElementById('salEmp')?.value;
    const month    = document.getElementById('salMonth')?.value;
    const workDays = parseInt(document.getElementById('s-workDays')?.value) || 26;
    const emp      = DB.employees.find(e => e.id === empId);

    if (!emp || !month) return;

    const monthAtt  = DB.attendance.filter(
      a => a.empId === empId && a.date.startsWith(month)
    );
    const present  = monthAtt.filter(a => a.status === 'Present').length;
    const halfDays = monthAtt.filter(a => a.status === 'Half Day').length;
    const absent   = monthAtt.filter(a => a.status === 'Absent').length;

    const effective  = present + halfDays * 0.5;
    const perDay     = emp.salary / workDays;
    const deduction  = absent * perDay;
    const ot         = parseFloat(document.getElementById('s-otInput')?.value)    || 0;
    const adv        = parseFloat(document.getElementById('s-advInput')?.value)   || 0;
    const bonus      = parseFloat(document.getElementById('s-bonusInput')?.value) || 0;
    const net        = Math.max(0, emp.salary - deduction + ot + bonus - adv);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('s-basic',     Utils.money(emp.salary));
    set('s-present',   effective);
    set('s-absent',    absent);
    set('s-deduction', Utils.money(Math.round(deduction)));
    set('s-overtime',  Utils.money(ot));
    set('s-advance',   Utils.money(adv));
    set('s-net',       Utils.money(Math.round(net)));
  },

  // ---- Save Salary ----
  save() {
    const empId = document.getElementById('salEmp')?.value;
    const month = document.getElementById('salMonth')?.value;
    const emp   = DB.employees.find(e => e.id === empId);

    if (!emp)  { Toast.error('Employee select karo!'); return; }
    if (!month){ Toast.error('Month select karo!');    return; }

    // Check duplicate
    const dup = DB.salaries.find(s => s.empId === empId && s.month === month);
    if (dup) {
      if (!Utils.confirm(`${emp.name} ka ${month} ka record already hai. Update karein?`)) return;
      Object.assign(dup, this._buildRecord(emp, month));
    } else {
      DB.salaries.push(this._buildRecord(emp, month));
    }

    DB.save();
    this.update();
    Toast.success(`Salary Saved!`, `${emp.name} — ${month}`);

    // Clear manual inputs
    Utils.clearFields(['s-otInput','s-advInput','s-bonusInput','s-remark']);
  },

  _buildRecord(emp, month) {
    return {
      id:       Date.now(),
      empId:    emp.id,
      empName:  emp.name,
      dept:     emp.dept || '',
      month,
      basic:    emp.salary,
      net:      document.getElementById('s-net')?.textContent || 'Rs. 0',
      deduction:document.getElementById('s-deduction')?.textContent || 'Rs. 0',
      overtime: document.getElementById('s-overtime')?.textContent || 'Rs. 0',
      advance:  document.getElementById('s-advance')?.textContent || 'Rs. 0',
      remark:   document.getElementById('s-remark')?.value || '',
      savedOn:  Utils.today()
    };
  },

  // ---- Delete ----
  delete(id) {
    DB._data.salaries = DB.salaries.filter(s => s.id !== id);
    DB.save();
    this.update();
    Toast.warning('Record deleted', '');
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody       = document.getElementById('salTableBody');
    const monthFilter = document.getElementById('salFilterMonth')?.value || '';
    if (!tbody) return;

    let list = [...DB.salaries].reverse();
    if (monthFilter) {
      list = list.filter(s => s.month === monthFilter);
    }

    // Summary
    const totalPaid = list.reduce((sum, s) => {
      return sum + parseInt((s.net || '').replace(/[^0-9]/g, '') || 0);
    }, 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('sal-totalPaid', Utils.money(totalPaid));
    set('sal-records',   list.length);

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">📭 Koi salary record nahi</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td>
          <div class="text-bold">${s.empName}</div>
          <div class="text-xs text-muted">${s.dept || ''}</div>
        </td>
        <td style="font-size:12px;">${s.month}</td>
        <td class="text-muted text-sm">${Utils.money(s.basic)}</td>
        <td class="text-gold text-bold">${s.net}</td>
        <td class="text-sm text-muted">${s.remark || '—'}</td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="Salary.delete(${s.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.salaries.length) { Toast.error('Koi data nahi!'); return; }
    const month = document.getElementById('salFilterMonth')?.value || '';
    const list  = month ? DB.salaries.filter(s => s.month === month) : DB.salaries;

    const ws = XLSX.utils.json_to_sheet(list.map(s => ({
      'Employee':   s.empName,
      'Department': s.dept || '',
      'Month':      s.month,
      'Basic':      s.basic,
      'Net Salary': s.net,
      'Deduction':  s.deduction || '',
      'Overtime':   s.overtime || '',
      'Advance':    s.advance || '',
      'Remark':     s.remark || '',
      'Saved On':   s.savedOn || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary');
    XLSX.writeFile(wb, `Salary_${month || 'All'}_PanchhiFashion.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.salaries.length) { Toast.error('Koi data nahi!'); return; }
    const month = document.getElementById('salFilterMonth')?.value || '';
    const list  = month ? DB.salaries.filter(s => s.month === month) : DB.salaries;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    Reports._header(doc, `Salary Report ${month ? '— ' + month : ''}`);

    doc.autoTable({
      startY: 42,
      head: [['Employee','Dept','Month','Basic','Deduction','OT','Net','Remark']],
      body: list.map(s => [
        s.empName, s.dept || '—', s.month,
        Utils.money(s.basic), s.deduction || '—',
        s.overtime || '—', s.net, s.remark || '—'
      ]),
      styles:     { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [255, 215, 0], textColor: 30 },
      alternateRowStyles: { fillColor: [255, 253, 245] }
    });

    Reports._footer(doc);
    doc.save(`Salary_${month || 'All'}_PanchhiFashion.pdf`);
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['salEmp']);
    this._renderTable();
  }
};
