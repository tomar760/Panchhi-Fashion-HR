/* ================================================
   LEAVE.JS — Leave Management Module
   ================================================ */

const Leave = {

  html() {
    return `
    <div class="section" id="section-leave">
      <div class="page-header">
        <div>
          <div class="page-heading">🏖️ Leave Management</div>
          <div class="page-heading-sub">Leave applications manage karo</div>
        </div>
      </div>

      <div class="grid-2">

        <!-- ADD LEAVE -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📝</div>
            Leave Record Karo
          </div>

          <div class="form-group">
            <label class="form-label">Employee *</label>
            <select class="form-control" id="leaveEmp">
              <option value="">-- Select karo --</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">From Date *</label>
              <input type="date" class="form-control" id="leaveFrom"
                     oninput="Leave.calcDays()">
            </div>
            <div class="form-group">
              <label class="form-label">To Date *</label>
              <input type="date" class="form-control" id="leaveTo"
                     oninput="Leave.calcDays()">
            </div>
          </div>

          <!-- Days display -->
          <div class="salary-box mb-15"
               style="text-align:center;padding:10px;">
            <div class="s-amt text-warning" id="leaveDaysCount">0</div>
            <div class="s-lbl">Total Days</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Leave Type</label>
              <select class="form-control" id="leaveType">
                <option value="Casual Leave">🏖️ Casual Leave</option>
                <option value="Sick Leave">😷 Sick Leave</option>
                <option value="Emergency">🚨 Emergency</option>
                <option value="Festival">🎊 Festival / Holiday</option>
                <option value="Maternity">🤱 Maternity</option>
                <option value="Unpaid Leave">💸 Unpaid Leave</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" id="leaveStatus">
                <option value="Approved">✅ Approved</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Reason</label>
            <input type="text" class="form-control" id="leaveReason"
                   placeholder="Leave ka reason likhо...">
          </div>

          <div class="form-group">
            <label class="form-label">Approved By</label>
            <input type="text" class="form-control" id="leaveApprovedBy"
                   placeholder="Manager / HR name" value="Aditya">
          </div>

          <button class="btn btn-primary btn-block"
                  onclick="Leave.add()">
            ✅ Leave Record Karo
          </button>
        </div>

        <!-- LEAVE LIST -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Leave Records
            <div class="card-actions">
              <button class="btn btn-success btn-sm"
                      onclick="Leave.exportExcel()">📊</button>
              <button class="btn btn-danger btn-sm"
                      onclick="Leave.exportPDF()">📄</button>
            </div>
          </div>

          <!-- Summary -->
          <div class="salary-grid mb-15"
               style="grid-template-columns:repeat(3,1fr);">
            <div class="salary-box">
              <div class="s-amt text-success" id="lv-approved">0</div>
              <div class="s-lbl">Approved</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-warning" id="lv-pending">0</div>
              <div class="s-lbl">Pending</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-danger" id="lv-rejected">0</div>
              <div class="s-lbl">Rejected</div>
            </div>
          </div>

          <div class="table-wrap" style="max-height:430px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="leaveTableBody">
                <tr class="empty-row">
                  <td colspan="7">📭 Koi leave record nahi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /grid-2 -->
    </div>
    `;
  },

  // ---- Calc Days ----
  calcDays() {
    const from = document.getElementById('leaveFrom')?.value;
    const to   = document.getElementById('leaveTo')?.value;
    const el   = document.getElementById('leaveDaysCount');
    if (!el) return;
    if (from && to) {
      el.textContent = Utils.daysBetween(from, to);
    } else {
      el.textContent = 0;
    }
  },

  // ---- Add Leave ----
  add() {
    const empId      = document.getElementById('leaveEmp')?.value;
    const from       = document.getElementById('leaveFrom')?.value;
    const to         = document.getElementById('leaveTo')?.value;
    const type       = document.getElementById('leaveType')?.value;
    const status     = document.getElementById('leaveStatus')?.value;
    const reason     = document.getElementById('leaveReason')?.value.trim();
    const approvedBy = document.getElementById('leaveApprovedBy')?.value.trim();
    const emp        = DB.employees.find(e => e.id === empId);

    if (!emp)  { Toast.error('Employee select karo!'); return; }
    if (!from) { Toast.error('From date select karo!'); return; }
    if (!to)   { Toast.error('To date select karo!');   return; }
    if (new Date(to) < new Date(from)) {
      Toast.error('Date galat!', 'To date, From date se pehle nahi ho sakti');
      return;
    }

    const days = Utils.daysBetween(from, to);
    DB.leaves.push({
      id:          Date.now(),
      empId,
      empName:     emp.name,
      dept:        emp.dept || '',
      from, to, days, type, status, reason, approvedBy,
      addedOn:     Utils.today()
    });

    DB.save();
    this.update();

    Utils.clearFields(['leaveReason']);
    document.getElementById('leaveStatus').value = 'Approved';

    Toast.success(`Leave Recorded!`, `${emp.name} — ${days} days`);
  },

  // ---- Delete ----
  delete(id) {
    DB._data.leaves = DB.leaves.filter(l => l.id !== id);
    DB.save();
    this.update();
    Toast.warning('Leave deleted', '');
  },

  // ---- Update Status ----
  updateStatus(id, newStatus) {
    const leave = DB.leaves.find(l => l.id === id);
    if (leave) {
      leave.status = newStatus;
      DB.save();
      this.update();
      Toast.success('Status updated!', newStatus);
    }
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody = document.getElementById('leaveTableBody');
    if (!tbody) return;

    const approved = DB.leaves.filter(l => l.status === 'Approved').length;
    const pending  = DB.leaves.filter(l => l.status === 'Pending').length;
    const rejected = DB.leaves.filter(l => l.status === 'Rejected').length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('lv-approved', approved);
    set('lv-pending',  pending);
    set('lv-rejected', rejected);

    if (!DB.leaves.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">📭 Koi leave record nahi</td>
        </tr>`;
      return;
    }

    const stBadge = {
      'Approved': 'badge-success',
      'Pending':  'badge-warning',
      'Rejected': 'badge-danger'
    };

    tbody.innerHTML = [...DB.leaves].reverse().map(l => `
      <tr>
        <td>
          <div class="text-bold">${l.empName}</div>
          <div class="text-xs text-muted">${l.dept || ''}</div>
        </td>
        <td class="text-sm">${l.type}</td>
        <td class="text-sm">${l.from}</td>
        <td class="text-sm">${l.to}</td>
        <td class="text-bold text-warning">${l.days}</td>
        <td>
          <span class="badge ${stBadge[l.status] || 'badge-primary'}">
            ${l.status}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:4px;">
            ${l.status === 'Pending' ? `
              <button class="btn btn-sm btn-success"
                      onclick="Leave.updateStatus(${l.id},'Approved')"
                      title="Approve">✅</button>
              <button class="btn btn-sm btn-danger"
                      onclick="Leave.updateStatus(${l.id},'Rejected')"
                      title="Reject">❌</button>
            ` : ''}
            <button class="btn btn-sm btn-danger"
                    onclick="Leave.delete(${l.id})"
                    title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.leaves.length) { Toast.error('Koi data nahi!'); return; }
    const ws = XLSX.utils.json_to_sheet(DB.leaves.map(l => ({
      'Employee':    l.empName,
      'Department':  l.dept || '',
      'Leave Type':  l.type,
      'From':        l.from,
      'To':          l.to,
      'Days':        l.days,
      'Status':      l.status,
      'Reason':      l.reason || '',
      'Approved By': l.approvedBy || '',
      'Added On':    l.addedOn || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leaves');
    XLSX.writeFile(wb, 'Leaves_PanchhiFashion.xlsx');
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.leaves.length) { Toast.error('Koi data nahi!'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    Reports._header(doc, 'Leave Report');

    doc.autoTable({
      startY: 42,
      head: [['Employee','Type','From','To','Days','Status','Reason']],
      body: DB.leaves.map(l => [
        l.empName, l.type, l.from, l.to,
        l.days, l.status, l.reason || '—'
      ]),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [247, 151, 30], textColor: 30 }
    });

    Reports._footer(doc);
    doc.save('Leaves_PanchhiFashion.pdf');
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['leaveEmp']);
    this.calcDays();
    this._renderTable();
  }
};
