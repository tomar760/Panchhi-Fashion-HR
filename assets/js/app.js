/* ================================================
   APP.JS — Main Init, Navigation, Sidebar
   ================================================ */

const NAV_ITEMS = [
  { section: true, label: 'Main' },
  {
    id: 'dashboard', icon: '🏠',
    label: 'Dashboard', badge: null
  },

  { section: true, label: 'HR Module' },
  {
    id: 'employees', icon: '👥',
    label: 'Employees',
    badge: 'empBadge', badgeClass: ''
  },
  {
    id: 'attendance', icon: '📋',
    label: 'Attendance', badge: null
  },
  {
    id: 'salary', icon: '💰',
    label: 'Salary', badge: null
  },
  {
    id: 'leave', icon: '🏖️',
    label: 'Leave Management', badge: null
  },

  { section: true, label: 'Store Module' },
  {
    id: 'store', icon: '🏪',
    label: 'Store Entries',
    badge: 'storeBadge', badgeClass: 'badge-orange'
  },
  {
    id: 'inventory', icon: '📦',
    label: 'Inventory', badge: null
  },

  { section: true, label: 'Gate & Security' },
  {
    id: 'gatepass', icon: '🚪',
    label: 'Gate Pass', badge: null
  },

  { section: true, label: 'Management' },
  {
    id: 'reminders', icon: '🔔',
    label: 'Reminders',
    badge: 'remBadge', badgeClass: 'badge-red'
  },
  {
    id: 'reports', icon: '📊',
    label: 'Reports & Export', badge: null
  }
];

const PAGE_META = {
  dashboard:  {
    title: '🏠 Dashboard',
    sub:   'Company ki puri overview ek nazar mein'
  },
  employees:  {
    title: '👥 Employee Management',
    sub:   'Staff ki puri info manage karo'
  },
  attendance: {
    title: '📋 Attendance',
    sub:   'Roz ki attendance mark karo'
  },
  salary:     {
    title: '💰 Salary Management',
    sub:   'Calculate aur record rakho'
  },
  leave:      {
    title: '🏖️ Leave Management',
    sub:   'Leave applications manage karo'
  },
  store:      {
    title: '🏪 Store Management',
    sub:   'Kon kya lekar gaya — sab record karo'
  },
  inventory:  {
    title: '📦 Inventory / Stock',
    sub:   'Store ka stock track karo'
  },
  gatepass:   {
    title: '🚪 Gate Pass',
    sub:   'Employee entry / exit record karo'
  },
  reminders:  {
    title: '🔔 Reminders & Alerts',
    sub:   'Kuch bhoolna nahi — yahan set karo'
  },
  reports:    {
    title: '📊 Reports & Export',
    sub:   'PDF aur Excel mein download karo'
  }
};

/* ---- Build Sidebar ---- */
function buildSidebar() {
  const nav  = document.getElementById('sidebarNav');
  let   html = '';

  NAV_ITEMS.forEach(item => {
    if (item.section) {
      if (item.label) {
        html += `
          <div class="nav-section-label">${item.label}</div>`;
      }
      return;
    }

    const badgeHTML = item.badge
      ? `<span class="nav-badge ${item.badgeClass || ''} hide"
               id="${item.badge}">0</span>`
      : '';

    html += `
      <button class="nav-btn" id="nav-${item.id}"
              onclick="App.navigate('${item.id}', this)">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${badgeHTML}
      </button>`;
  });

  nav.innerHTML = html;
}

/* ---- Build Page Sections ---- */
function buildSections() {
  const content = document.getElementById('appContent');

  const loading = document.getElementById('loadingScreen');
  if (loading) loading.remove();

  const sections = {
    dashboard:  typeof Dashboard  !== 'undefined' ? Dashboard.html()  : '',
    employees:  typeof Employees  !== 'undefined' ? Employees.html()  : '',
    attendance: typeof Attendance !== 'undefined' ? Attendance.html() : '',
    salary:     typeof Salary     !== 'undefined' ? Salary.html()     : '',
    leave:      typeof Leave      !== 'undefined' ? Leave.html()      : '',
    store:      typeof Store      !== 'undefined' ? Store.html()      : '',
    inventory:  typeof Inventory  !== 'undefined' ? Inventory.html()  : '',
    gatepass:   typeof GatePass   !== 'undefined' ? GatePass.html()   : '',
    reminders:  typeof Reminders  !== 'undefined' ? Reminders.html()  : '',
    reports:    typeof Reports    !== 'undefined' ? Reports.html()    : ''
  };

  content.innerHTML = Object.values(sections).join('');
}

/* ---- App Object ---- */
const App = {
  currentSection: 'dashboard',

  navigate(id, btnEl) {
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
    });

    const sec = document.getElementById('section-' + id);
    if (sec) sec.classList.add('active');

    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const navBtn = document.getElementById('nav-' + id);
      if (navBtn) navBtn.classList.add('active');
    }

    const meta = PAGE_META[id];
    if (meta) {
      document.getElementById('pageTitle').textContent    = meta.title;
      document.getElementById('pageSubtitle').textContent = meta.sub;
    }

    this.currentSection = id;
    this.refreshSection(id);

    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.add('collapsed');
    }
  },

  refreshSection(id) {
    const modules = {
      dashboard:  typeof Dashboard  !== 'undefined' ? Dashboard  : null,
      employees:  typeof Employees  !== 'undefined' ? Employees  : null,
      attendance: typeof Attendance !== 'undefined' ? Attendance : null,
      salary:     typeof Salary     !== 'undefined' ? Salary     : null,
      leave:      typeof Leave      !== 'undefined' ? Leave      : null,
      store:      typeof Store      !== 'undefined' ? Store      : null,
      inventory:  typeof Inventory  !== 'undefined' ? Inventory  : null,
      gatepass:   typeof GatePass   !== 'undefined' ? GatePass   : null,
      reminders:  typeof Reminders  !== 'undefined' ? Reminders  : null,
      reports:    typeof Reports    !== 'undefined' ? Reports    : null
    };

    const mod = modules[id];
    if (mod && typeof mod.update === 'function') {
      mod.update();
    }
  },

  updateBadges() {
    const badges = [
      {
        id:  'empBadge',
        val: DB.employees.length,
        show: DB.employees.length > 0
      },
      {
        id:  'storeBadge',
        val: DB.storeEntries.filter(e => !e.isComplete).length,
        show: DB.storeEntries.filter(e => !e.isComplete).length > 0
      },
      {
        id:  'remBadge',
        val: DB.reminders.filter(r => !r.done).length,
        show: DB.reminders.filter(r => !r.done).length > 0
      }
    ];

    badges.forEach(b => {
      const el = document.getElementById(b.id);
      if (!el) return;
      el.textContent = b.val;
      el.classList.toggle('hide', !b.show);
    });
  },

  updateNotifBanner() {
    const pending   = DB.storeEntries.filter(e => !e.isComplete).length;
    const activeRem = DB.reminders.filter(r => !r.done).length;
    const today     = Utils.today();
    const todayRem  = DB.reminders.filter(
      r => !r.done && r.datetime?.startsWith(today)
    ).length;

    const outside = DB.gatePasses.filter(
      p => p.date === today && !p.isReturned
    ).length;

    let msg = `Panchhi Fashion HR Tool Ready ✅ &nbsp;|&nbsp; 
               👥 ${DB.employees.length} Employees &nbsp;|&nbsp; `;

    if (pending) {
      msg += `<strong>⚠️ ${pending} Store entries incomplete</strong>
              &nbsp;|&nbsp; `;
    }
    if (outside) {
      msg += `<strong>🚪 ${outside} employee(s) bahar hain</strong>
              &nbsp;|&nbsp; `;
    }
    if (todayRem) {
      msg += `<strong>🔔 ${todayRem} Reminder(s) aaj ke!</strong>
              &nbsp;|&nbsp; `;
    }

    msg += `👑 Designed by Aditya`;
    document.getElementById('notifText').innerHTML = msg;
  },

  startClock() {
    const update = () => {
      const now  = new Date();
      const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      const date = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short'
      });
      const el = document.getElementById('liveTime');
      if (el) el.textContent = `${date} ${time}`;
    };
    update();
    setInterval(update, 1000);
  },

  startReminderCheck() {
    const check = () => {
      const now = new Date();

      DB.reminders
        .filter(r => !r.done)
        .forEach(r => {
          const rTime = new Date(r.datetime);
          const diff  = now - rTime;

          // Alert if within last 1 minute
          if (diff >= 0 && diff <= 60000) {
            Toast.warning('🔔 REMINDER!', r.title);

            // Agar store reminder hai aur isRecurring hai
            // toh 3 ghante baad naya reminder banao
            if (r.isRecurring && r.linkedStoreId) {
              const entry = DB.storeEntries.find(
                e => e.id === r.linkedStoreId
              );
              // Sirf tab naya reminder banao jab abhi bhi incomplete ho
              if (entry && !entry.isComplete) {
                const nextTime = new Date(
                  Date.now() + 3 * 3600000
                );
                DB.reminders.push({
                  id:            Date.now(),
                  title:         r.title,
                  desc:          r.desc,
                  datetime:      nextTime.toISOString().slice(0, 16),
                  type:          'store',
                  priority:      'High',
                  repeat:        'once',
                  done:          false,
                  linkedStoreId: r.linkedStoreId,
                  isRecurring:   true
                });
                DB.save();
              }
              // Purana reminder done mark karo
              r.done = true;
              DB.save();
            }
          }
        });
    };

    // Har 30 second check karo
    setInterval(check, 30000);
  },

  initMobileMenu() {
    const toggle  = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    document.addEventListener('click', e => {
      if (window.innerWidth > 768) return;
      if (!sidebar.contains(e.target) &&
          toggle && !toggle.contains(e.target)) {
        sidebar.classList.add('collapsed');
      }
    });
  },

  // ---- AUTO SAVE (har 30 sec) ----
  startAutoSave() {
    setInterval(() => {
      DB.save();

      // Gate Pass unsynced entries sync karo
      if (typeof GatePass !== 'undefined') {
        GatePass._autoSyncPending();
      }

      // Auto save indicator flash
      const chip = document.getElementById('autoSaveChip');
      if (chip) {
        chip.style.background = 'rgba(67,233,123,0.3)';
        chip.textContent      = '💾 Saved!';
        setTimeout(() => {
          chip.style.background = 'rgba(67,233,123,0.15)';
          chip.textContent      = '💾 Auto Save: ON';
        }, 1500);
      }
    }, 30000);
  },

  init() {
    DB.load();
    buildSidebar();
    buildSections();
    this.startClock();
    this.startReminderCheck();
    this.startAutoSave();
    this.initMobileMenu();

    // Default dates set karo
    const today     = Utils.today();
    const thisMonth = Utils.thisMonth();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('attDate',       today);
    setVal('storeDate',     today);
    
