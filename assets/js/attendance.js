/* ================================================
   ATTENDANCE.JS — Attendance Module
   ================================================ */

const Attendance = {

  html() {
    return `
    <div class="section" id="section-attendance">
      <div class="page-header">
        <div>
          <div class="page-heading">📋 Attendance Management</div>
          <div class="page-heading-sub">Roz ki attendance mark karo</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-success btn-sm" onclick="Attendance.exportExcel()">
            📊 Excel
          </button>
          <button class="btn btn-danger btn-sm" onclick="Attendance.exportPDF()">
            📄 PDF
          </button>
        </div>
      </div>

      <div class="grid-2">

        <!-- MARK ATTENDANCE -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📅</div>
            Attendance Mark Karo
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" id="attDate">
            </div>
            <div class="form-group">
              <label class="form-label">Employee *</label>
              <select class="form-control" id="attEmp">
                <option value="">-- Select karo --</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">In-Time (Optional)</label>
            <input type="time" class="form-control" id="attInTime">
          </div>

          <label class="form-label">Status Select Karo</label>
          <div class="att-grid">
            <button class="att-btn att-present"
                    onclick="Attendance.mark('Present')">
              ✅ Present
            </button>
            <button class="att-btn att-absent"
                    onclick="Attendance.mark('Absent')">
              ❌ Absent
            </button>
            <button class="att-btn att-leave"
                    onclick="Attendance.mark('Leave')">
              🏖️ Leave
            </button>
            <button class="att-btn att-half"
                    onclick="Attendance.mark('Half Day')">
              🌗 Half Day
            </button>
          </div>

          <div class="form-group mt-15">
            <label class="form-label">Note (Optional)</label>
            <input type="text" class="form-control" id="attNote"
                   placeholder="Koi note ho toh...">
          </div>

          <!-- Bulk Mark -->
          <hr class="divider">
          <div class="card-title" style="border:none;padding:0;margin-bottom:12px;">
            <div class="card-icon">⚡</div>
            Bulk Mark (Sab ko ek saath)
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-success btn-sm"
                    onclick="Attendance.markAll('Present')">
              ✅ Sab Present
            </button>
            <button class="btn btn-danger btn-sm"
                    onclick="Attendance.markAll('Absent')">
              ❌ Sab Absent
            </button>
          </div>
        </div>

        <!-- TODAY SUMMARY -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📊</div>
            Aaj ki Summary
          </div>

          <div class="salary-grid" style="grid-template-columns:1fr 1fr;">
            <div class="salary-box">
              <div class="s-amt text-success" id="att-present">0</div>
              <div class="s-lbl">Present</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-danger" id="att-absent">0</div>
              <div class="s-lbl">Absent</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-warning" id="att-leave">0</div>
              <div class="s-lbl">Leave</div>
            </div>
            <div class="salary-box">
              <div class="s-amt" style="color:var(--info);" id="att-half">0</div>
              <div class="s-lbl">Half Day</div>
            </div>
          </div>

          <div class="progress-bar mt-15">
            <div class="progress-fill" id="att-progressBar"
                 style="width:0%;background:linear-gradient(90deg,var(--success),var(--info))">
            </div>
          </div>
          <div class="text-xs text-muted mt-10" id="att-rate">
            Attendance Rate: 0%
          </div>

          <hr class="divider">

          <div id="todayAttList"
               style="max-height:250px;overflow-y:auto;">
            <p class="text-muted text-center" style="padding:20px;">
              Aaj ki attendance nahi di gayi
            </p>
          </div>
        </div>

      </div><!-- /grid-2 -->

      <!-- RECORDS TABLE -->
      <div class="card mt-20">
        <div class="card-title">
          <div class="card-icon">📋</div>
          Attendance Records
          <div class="card-actions">
            <!-- Month filter -->
            <input type="month" class="form-control"
                   id="attFilterMonth" style="width:160px;padding:5px 10px;font-size:12px;"
                   oninput="Attendance.update()">
            <!-- Employee filter -->
            <select class="form-control"
                    id="attFilterEmp" style="width:160px;padding:5px 10px;font-size:12px;"
                    onchange="Attendance.update()">
              <option value="">All Employees</option>
            </select>
          </div>
        </div>

        <div class="table-wrap" style="max-height:380px;overflow-y:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>In-Time</th>
                <th>Note</th>
                <th>Del</th>
              </tr>
            </thead>
            <tbody id="attTableBody">
              <tr class="empty-row">
                <td colspan="7">📭 Koi record nahi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /section -->
    `;
  },

  // ---- Mark Attendance ----
  mark(status) {
    const empId  = document.getElementById('attEmp').value;
    const date   = document.getElementById('attDate').value;
    const note   = document.getElementById('attNote').value.trim();
    const inTime = document.getElementById('attInTime').value;

    if (!empId) { Toast.error('Employee select karo!'); return; }
    if (!date)  { Toast.error('Date select karo!');     return; }

    const emp = DB.employees.find(e => e.id === empId);
    if (!emp) return;

    // Check existing — update karo
    const existing = DB.attendance.find(
      a => a.empId === empId && a.date === date
    );

    if (existing) {
      existing.status = status;
      existing.note   = note;
      existing.inTime = inTime;
    } else {
      DB.attendance.push({
        id:      Date.now(),
        empId,
        empName: emp.name,
        dept:    emp.dept || '',
        date,
        status,
        note,
        inTime,
        markedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true
        })
      });
    }

    DB.save();
    this.update();

    const types = {
      'Present':  'success',
      'Absent':   'error',
      'Leave':    'warning',
      'Half Day': 'info'
    };
    Toast[types[status] || 'info'](`${emp.name}`, `${status} mark ho gaya`);
  },

  // ---- Mark All ----
  markAll(status) {
    const date = document.getElementById('attDate').value;
    if (!date) { Toast.error('Date select karo!'); return; }
    if (!DB.employees.length) { Toast.error('Koi employee nahi!'); return; }

    if (!Utils.confirm(`Sab ${DB.employees.length} employees ko ${status} mark karein?`)) return;

    DB.employees.forEach(emp => {
      const existing = DB.attendance.find(
        a => a.empId === emp.id && a.date === date
      );
      if (existing) {
        existing.status = status;
      } else {
        DB.attendance.push({
          id:      Date.now() + Math.random(),
          empId:   emp.id,
          empName: emp.name,
          dept:    emp.dept || '',
          date, status,
          note: 'Bulk marked',
          inTime:   '',
          markedAt: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
          })
        });
      }
    });

    DB.save();
    this.update();
    Toast.success(`Sab ${status} mark!`, `${DB.employees.length} employees`);
  },

  // ---- Delete ----
  delete(id) {
    DB._data.attendance = DB.attendance.filter(a => a.id !== id);
    DB.save();
    this.update();
    Toast.warning('Record deleted', '');
  },

  // ---- Today Summary ----
  _updateTodaySummary() {
    const today    = Utils.today();
    const todayAtt = DB.attendance.filter(a => a.date === today);

    const p  = todayAtt.filter(a => a.status === 'Present').length;
    const ab = todayAtt.filter(a => a.status === 'Absent').length;
    const l  = todayAtt.filter(a => a.status === 'Leave').length;
    const h  = todayAtt.filter(a => a.status === 'Half Day').length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('att-present', p);
    set('att-absent',  ab);
    set('att-leave',   l);
    set('att-half',    h);

    const total = DB.employees.length;
    const rate  = total ? Math.round(p / total * 100) : 0;

    const bar = document.getElementById('att-progressBar');
    if (bar) bar.style.width = rate + '%';

    const rateEl = document.getElementById('att-rate');
    if (rateEl) rateEl.textContent = `Attendance Rate: ${rate}% (${p}/${total})`;

    // Today list
    const listEl = document.getElementById('todayAttList');
    if (!listEl) return;

    if (!todayAtt.length) {
      listEl.innerHTML = `
        <p class="text-muted text-center" style="padding:20px;">
          Aaj ki attendance nahi di gayi
        </p>`;
      return;
    }

    const icons  = { Present:'✅', Absent:'❌', Leave:'🏖️', 'Half Day':'🌗' };
    const colors = {
      Present: 'var(--success)',
      Absent:  'var(--danger)',
      Leave:   'var(--warning)',
      'Half Day': 'var(--info)'
    };

    listEl.innerHTML = todayAtt.map(a => `
      <div style="display:flex;align-items:center;gap:10px;
                  padding:9px 0;border-bottom:1px solid var(--card-border);">
        <span style="font-size:18px;">${icons[a.status] || '•'}</span>
        <div style="flex:1;">
          <div class="text-bold" style="font-size:13px;">${a.empName}</div>
          <div class="text-xs text-muted">${a.dept || ''} ${a.inTime ? '| ' + a.inTime : ''}</div>
        </div>
        <span style="color:${colors[a.status]};font-size:12px;font-weight:600;">
          ${a.status}
        </span>
      </div>
    `).join('');
  },

  // ---- Render Records Table ----
  _renderTable() {
    const tbody     = document.getElementById('attTableBody');
    const filterEmp = document.getElementById('attFilterEmp');
    if (!tbody) return;

    const monthFilter = (document.getElementById('attFilterMonth')?.value) || '';
    const empFilter   = filterEmp?.value || '';

    // Update filter emp dropdown
    if (filterEmp) {
      const currentVal = filterEmp.value;
      filterEmp.innerHTML =
        '<option value="">All Employees</option>' +
        DB.employees.map(e =>
          `<option value="${e.id}" ${e.id === currentVal ? 'selected' : ''}>${e.name}</option>`
        ).join('');
    }

    let list = [...DB.attendance].reverse();

    if (monthFilter) {
      list = list.filter(a => a.date.startsWith(monthFilter));
    }
    if (empFilter) {
      list = list.filter(a => a.empId === empFilter);
    }

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">📭 Koi record nahi</td>
        </tr>`;
      return;
    }

    const statusBadge = {
      'Present':  'badge-success',
      'Absent':   'badge-danger',
      'Leave':    'badge-warning',
      'Half Day': 'badge-info'
    };

    tbody.innerHTML = list.map(a => `
      <tr>
        <td style="font-size:12px;">${a.date}</td>
        <td><div class="text-bold">${a.empName}</div></td>
        <td class="text-muted text-sm">${a.dept || '—'}</td>
        <td>
          <span class="badge ${statusBadge[a.status] || 'badge-primary'}">
            ${a.status}
          </span>
        </td>
        <td class="text-sm text-muted">${a.inTime || '—'}</td>
        <td class="text-sm text-muted">${a.note || '—'}</td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="Attendance.delete(${a.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.attendance.length) {
      Toast.error('Koi data nahi!');
      return;
    }
    const month = document.getElementById('attFilterMonth')?.value || '';
    const list  = month
      ? DB.attendance.filter(a => a.date.startsWith(month))
      : DB.attendance;

    const ws = XLSX.utils.json_to_sheet(list.map(a => ({
      'Date':       a.date,
      'Employee':   a.empName,
      'Department': a.dept || '',
      'Status':     a.status,
      'In-Time':    a.inTime || '',
      'Note':       a.note || '',
      'Marked At':  a.markedAt || ''
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${month || 'All'}_PanchhhiFashion.xlsx`);
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.attendance.length) {
      Toast.error('Koi data nahi!');
      return;
    }
    const month = document.getElementById('attFilterMonth')?.value || '';
    const list  = month
      ? DB.attendance.filter(a => a.date.startsWith(month))
      : DB.attendance;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    Reports._header(doc, `Attendance Report ${month ? '— ' + month : ''}`);

    doc.autoTable({
      startY: 42,
      head: [['Date','Employee','Dept','Status','In-Time','Note']],
      body: list.map(a => [
        a.date, a.empName, a.dept || '—',
        a.status, a.inTime || '—', a.note || '—'
      ]),
      styles:      { fontSize: 9, cellPadding: 3 },
      headStyles:  { fillColor: [67, 233, 123], textColor: 30 },
      alternateRowStyles: { fillColor: [245, 255, 245] }
    });

    Reports._footer(doc);
    doc.save(`Attendance_${month || 'All'}_PanchhiFashion.pdf`);
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    Utils.populateEmpDropdowns(['attEmp']);
    this._updateTodaySummary();
    this._renderTable();
  }
};
