/* ================================================
   REMINDERS.JS — Reminders & Alerts Module
   ================================================ */

const Reminders = {

  html() {
    return `
    <div class="section" id="section-reminders">
      <div class="page-header">
        <div>
          <div class="page-heading">🔔 Reminders & Alerts</div>
          <div class="page-heading-sub">Kuch bhoolna nahi — yahan set karo</div>
        </div>
      </div>

      <div class="grid-2">

        <!-- ADD REMINDER -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">➕</div>
            Naya Reminder Set Karo
          </div>

          <div class="form-group">
            <label class="form-label">Title *</label>
            <input type="text" class="form-control" id="remTitle"
                   placeholder="Kya karna hai?">
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" class="form-control" id="remDesc"
                   placeholder="Details...">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date & Time *</label>
              <input type="datetime-local" class="form-control"
                     id="remDateTime">
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-control" id="remPriority">
                <option value="High">🔴 High</option>
                <option value="Medium" selected>🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-control" id="remType">
                <option value="salary">💰 Salary</option>
                <option value="store">🏪 Store / PO / PR</option>
                <option value="attendance">📋 Attendance</option>
                <option value="meeting">🤝 Meeting</option>
                <option value="document">📄 Document</option>
                <option value="leave">🏖️ Leave</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Repeat</label>
              <select class="form-control" id="remRepeat">
                <option value="once">Ek baar</option>
                <option value="daily">Roz</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <button class="btn btn-primary btn-block"
                  onclick="Reminders.add()">
            🔔 Reminder Save Karo
          </button>
        </div>

        <!-- REMINDER LIST -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📋</div>
            Active Reminders
            <div class="card-actions">
              <div class="filter-tabs" style="margin:0;">
                <button class="filter-tab active"
                        onclick="Reminders.filter('active',this)">
                  Active
                </button>
                <button class="filter-tab"
                        onclick="Reminders.filter('done',this)">
                  Done
                </button>
                <button class="filter-tab"
                        onclick="Reminders.filter('all',this)">
                  All
                </button>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="salary-grid mb-15"
               style="grid-template-columns:repeat(3,1fr);">
            <div class="salary-box">
              <div class="s-amt text-danger" id="rem-high">0</div>
              <div class="s-lbl">High Priority</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-warning" id="rem-today">0</div>
              <div class="s-lbl">Aaj Ke</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-success" id="rem-done">0</div>
              <div class="s-lbl">Completed</div>
            </div>
          </div>

          <div id="reminderList"
               style="max-height:420px;overflow-y:auto;">
            <p class="text-muted text-center" style="padding:30px;">
              Koi reminder set nahi hai
            </p>
          </div>
        </div>

      </div><!-- /grid-2 -->
    </div>
    `;
  },

  _currentFilter: 'active',

  // ---- Add Reminder ----
  add() {
    const title    = document.getElementById('remTitle')?.value.trim();
    const desc     = document.getElementById('remDesc')?.value.trim();
    const datetime = document.getElementById('remDateTime')?.value;
    const priority = document.getElementById('remPriority')?.value;
    const type     = document.getElementById('remType')?.value;
    const repeat   = document.getElementById('remRepeat')?.value;

    if (!title)    { Toast.error('Title missing!', 'Kya karna hai likhna zaruri hai'); return; }
    if (!datetime) { Toast.error('Date/Time missing!');                                 return; }

    DB.reminders.push({
      id:        Date.now(),
      title, desc, datetime,
      priority, type, repeat,
      done:      false,
      createdOn: Utils.today()
    });

    DB.save();
    this.update();
    App.updateBadges();

    Utils.clearFields(['remTitle', 'remDesc']);

    Toast.success('Reminder Set!', title);
  },

  // ---- Mark Done ----
  markDone(id) {
    const r = DB.reminders.find(r => r.id === id);
    if (r) {
      r.done = true;
      DB.save();
      this.update();
      App.updateBadges();
      Toast.success('Done!', r.title);
    }
  },

  // ---- Delete ----
  delete(id) {
    DB._data.reminders = DB.reminders.filter(r => r.id !== id);
    DB.save();
    this.update();
    App.updateBadges();
    Toast.warning('Reminder deleted', '');
  },

  // ---- Filter ----
  filter(type, btn) {
    this._currentFilter = type;
    document.querySelectorAll('#section-reminders .filter-tab').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    this._renderList();
  },

  // ---- Render List ----
  _renderList() {
    const listEl = document.getElementById('reminderList');
    if (!listEl) return;

    const today = Utils.today();

    // Stats
    const high    = DB.reminders.filter(r => !r.done && r.priority === 'High').length;
    const todayR  = DB.reminders.filter(r => !r.done && r.datetime?.startsWith(today)).length;
    const doneR   = DB.reminders.filter(r => r.done).length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('rem-high',  high);
    set('rem-today', todayR);
    set('rem-done',  doneR);

    // Filter list
    let list = [...DB.reminders];
    if (this._currentFilter === 'active') list = list.filter(r => !r.done);
    if (this._currentFilter === 'done')   list = list.filter(r => r.done);

    // Sort: active first, then by datetime
    list.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (!list.length) {
      listEl.innerHTML = `
        <p class="text-muted text-center" style="padding:30px;">
          ✅ Koi ${this._currentFilter === 'active' ? 'active' : ''} reminder nahi!
        </p>`;
      return;
    }

    const prColors = {
      High:   'var(--danger)',
      Medium: 'var(--warning)',
      Low:    'var(--success)'
    };

    const typeEmoji = {
      salary:     '💰',
      store:      '🏪',
      attendance: '📋',
      meeting:    '🤝',
      document:   '📄',
      leave:      '🏖️',
      other:      '📌'
    };

    listEl.innerHTML = list.map(r => {
      const isOverdue = !r.done && new Date(r.datetime) < new Date();
      const rTimeStr  = new Date(r.datetime).toLocaleString('en-IN', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      return `
        <div class="reminder-item ${isOverdue ? 'urgent' : r.done ? '' : ''}"
             style="border-left-color:${r.done ? 'var(--text-muted)' : prColors[r.priority] || 'var(--primary)'};
                    ${r.done ? 'opacity:0.5;' : ''}">
          <div class="rem-title">
            ${typeEmoji[r.type] || '📌'} ${r.title}
            ${isOverdue ? '<span class="badge badge-danger" style="margin-left:6px;">OVERDUE</span>' : ''}
            ${r.done    ? '<span class="badge badge-success" style="margin-left:6px;">Done</span>'  : ''}
          </div>
          <div class="rem-meta">
            📅 ${rTimeStr} &nbsp;|&nbsp;
            🔄 ${r.repeat} &nbsp;|&nbsp;
            <span style="color:${prColors[r.priority]};">
              ${r.priority} Priority
            </span>
          </div>
          ${r.desc ? `<div class="text-sm text-muted" style="margin-bottom:8px;">${r.desc}</div>` : ''}
          ${!r.done ? `
            <div class="rem-actions">
              <button class="btn btn-sm btn-success"
                      onclick="Reminders.markDone(${r.id})">
                ✅ Done
              </button>
              <button class="btn btn-sm btn-danger"
                      onclick="Reminders.delete(${r.id})">
                🗑️ Delete
              </button>
            </div>
          ` : `
            <div class="rem-actions">
              <button class="btn btn-sm btn-ghost"
                      onclick="Reminders.delete(${r.id})">
                🗑️ Delete
              </button>
            </div>
          `}
        </div>
      `;
    }).join('');
  },

  // ---- Master Update ----
  update() {
    this._renderList();
    App.updateBadges();
  }
};
