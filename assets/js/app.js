/* ================================================
   APP.JS — Main Init, Navigation, Time, Sidebar
   ================================================ */

/* ---- Sidebar Config ---- */
const NAV_ITEMS = [
  { section: 'main', label: null },
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard',       badge: null },

  { section: 'hr', label: 'HR Module' },
  { id: 'employees',  icon: '👥', label: 'Employees',        badge: 'empBadge',   badgeClass: '' },
  { id: 'attendance', icon: '📋', label: 'Attendance',       badge: null },
  { id: 'salary',     icon: '💰', label: 'Salary',           badge: null },
  { id: 'leave',      icon: '🏖️', label: 'Leave Management', badge: null },

  { section: 'store', label: 'Store Module' },
  { id: 'store',      icon: '🏪', label: 'Store Entries',    badge: 'storeBadge', badgeClass: 'badge-orange' },
  { id: 'inventory',  icon: '📦', label: 'Inventory',        badge: null },

  { section: 'mgmt', label: 'Management' },
  { id: 'reminders',  icon: '🔔', label: 'Reminders',        badge: 'remBadge',   badgeClass: 'badge-red' },
  { id: 'reports',    icon: '📊', label: 'Reports & Export', badge: null }
];

const PAGE_META = {
  dashboard:  { title: 'Dashboard',         sub: 'Company ki overview ek nazar mein' },
  employees:  { title: 'Employee Management', sub: 'Staff ki puri info manage karo' },
  attendance: { title: 'Attendance',         sub: 'Roz ki attendance mark karo' },
  salary:     { title: 'Salary Management',  sub: 'Calculate aur record rakho' },
  leave:      { title: 'Leave Management',   sub: 'Leave applications manage karo' },
  store:      { title: 'Store Management',   sub: 'Kon kya lekar gaya — sab record karo' },
  inventory:  { title: 'Inventory / Stock',  sub: 'Store ka stock track karo' },
  reminders:  { title: 'Reminders & Alerts', sub: 'Kuch bhoolna nahi — yahan set karo' },
  reports:    { title: 'Reports & Export',   sub: 'PDF aur Excel mein download karo' }
};

/* ---- Build Sidebar ---- */
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  let html = '';

  NAV_ITEMS.forEach(item => {
    if (!item.id) {
      // Section label
      if (item.label) {
        html += `<div class="nav-section-label">${item.label}</div>`;
      }
      return;
    }

    const badgeHTML = item.badge
      ? `<span class="nav-badge ${item.badgeClass || ''} hide" id="${item.badge}">0</span>`
      : '';

    html += `
      <button class="nav-btn" id="nav-${item.id}"
              onclick="App.navigate('${item.id}', this)">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${badgeHTML}
      </button>
    `;
  });

  nav.innerHTML = html;
}

/* ---- Build Page Sections ---- */
function buildSections() {
  const content = document.getElementById('appContent');

  // Remove loading screen
  const loading = document.getElementById('loadingScreen');
  if (loading) loading.remove();

  // Each module builds its own HTML
  const sections = {
    dashboard:  typeof Dashboard  !== 'undefined' ? Dashboard.html()  : '<div class="section" id="section-dashboard"><p>Loading...</p></div>',
    employees:  typeof Employees  !== 'undefined' ? Employees.html()  : '',
    attendance: typeof Attendance !== 'undefined' ? Attendance.html() : '',
    salary:     typeof Salary     !== 'undefined' ? Salary.html()     : '',
    leave:      typeof Leave      !== 'undefined' ? Leave.html()      : '',
    store:      typeof Store      !== 'undefined' ? Store.html()      : '',
    inventory:  typeof Inventory  !== 'undefined' ? Inventory.html()  : '',
    reminders:  typeof Reminders  !== 'undefined' ? Reminders.html()  : '',
    reports:    typeof Reports    !== 'undefined' ? Reports.html()    : ''
  };

  content.innerHTML = Object.values(sections).join('');
}

/* ---- App Object ---- */
const App = {
  currentSection: 'dashboard',

  navigate(id, btnEl) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('active');
    });

    // Remove active from all nav btns
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
    });

    // Show target section
    const sec = document.getElementById('section-' + id);
    if (sec) sec.classList.add('active');

    // Activate nav btn
    if (btnEl) btnEl.classList.add('active');
    else {
      const navBtn = document.getElementById('nav-' + id);
      if (navBtn) navBtn.classList.add('active');
    }

    // Update page title
    const meta = PAGE_META[id];
    if (meta) {
      document.getElementById('pageTitle').textContent    = meta.title;
      document.getElementById('pageSubtitle').textContent = meta.sub;
    }

    this.currentSection = id;

    // Run section-specific update
    this.refreshSection(id);

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.add('collapsed');
    }
  },

  refreshSection(id) {
    switch(id) {
      case 'dashboard':
        if (typeof Dashboard  !== 'undefined') Dashboard.update();
        break;
      case 'employees':
        if (typeof Employees  !== 'undefined') Employees.update();
        break;
      case 'attendance':
        if (typeof Attendance !== 'undefined') Attendance.update();
        break;
      case 'salary':
        if (typeof Salary     !== 'undefined') Salary.update();
        break;
      case 'leave':
        if (typeof Leave      !== 'undefined') Leave.update();
        break;
      case 'store':
        if (typeof Store      !== 'undefined') Store.update();
        break;
      case 'inventory':
        if (typeof Inventory  !== 'undefined') Inventory.update();
        break;
      case 'reminders':
        if (typeof Reminders  !== 'undefined') Reminders.update();
        break;
      case 'reports':
        if (typeof Reports    !== 'undefined') Reports.update();
        break;
    }
  },

  // Update all badges
  updateBadges() {
    const empBadge   = document.getElementById('empBadge');
    const storeBadge = document.getElementById('storeBadge');
    const remBadge   = document.getElementById('remBadge');

    if (empBadge) {
      const c = DB.employees.length;
      empBadge.textContent = c;
      empBadge.classList.toggle('hide', c === 0);
    }

    if (storeBadge) {
      const c = DB.storeEntries.filter(e => !e.isComplete).length;
      storeBadge.textContent = c;
      storeBadge.classList.toggle('hide', c === 0);
    }

    if (remBadge) {
      const c = DB.reminders.filter(r => !r.done).length;
      remBadge.textContent = c;
      remBadge.classList.toggle('hide', c === 0);
    }
  },

  // Update notif banner
  updateNotifBanner() {
    const pending = DB.storeEntries.filter(e => !e.isComplete).length;
    const activeRem = DB.reminders.filter(r => !r.done).length;
    const today = Utils.today();
    const todayRem = DB.reminders.filter(r => !r.done && r.datetime?.startsWith(today)).length;

    let msg = `Panchhi Fashion HR Tool Ready ✅ &nbsp;|&nbsp; 👥 ${DB.employees.length} Employees &nbsp;|&nbsp; `;
    if (pending)   msg += `<strong>⚠️ ${pending} Store entries incomplete (PO/PR missing)</strong> &nbsp;|&nbsp; `;
    if (todayRem)  msg += `<strong>🔔 ${todayRem} Reminder(s) aaj ke hain!</strong> &nbsp;|&nbsp; `;
    msg += `👑 Designed by Aditya`;

    document.getElementById('notifText').innerHTML = msg;
  },

  // Live time
  startClock() {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      const date = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short'
      });
      document.getElementById('liveTime').textContent = `${date} ${time}`;
    };
    update();
    setInterval(update, 1000);
  },

  // Check reminders every 30s
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
            Toast.warning(`🔔 REMINDER!`, r.title);
          }
        });
    };
    setInterval(check, 30000);
  },

  // Mobile sidebar toggle
  initMobileMenu() {
    const toggle  = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.add('collapsed');
      }
    });
  },

  // INIT
  init() {
    DB.load();
    buildSidebar();
    buildSections();
    this.startClock();
    this.startReminderCheck();
    this.initMobileMenu();

    // Set default date/month inputs
    const today     = Utils.today();
    const thisMonth = Utils.thisMonth();
    const setVal    = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('attDate',      today);
    setVal('storeDate',    today);
    setVal('leaveFrom',    today);
    setVal('leaveTo',      today);
    setVal('salMonth',     thisMonth);
    setVal('repAttMonth',  thisMonth);
    setVal('repSalMonth',  thisMonth);
    setVal('repStoreMonth',thisMonth);

    // Reminder default = 2 hours from now
    const remDef = new Date(Date.now() + 2 * 3600000);
    setVal('remDateTime', remDef.toISOString().slice(0, 16));

    // Navigate to dashboard
    this.navigate('dashboard');

    // Welcome toast
    setTimeout(() => {
      Toast.success(
        'Panchhi Fashion Ready!',
        'HR & Store Tool loaded — Aditya ki taraf se ✅'
      );
    }, 700);
  }
};

/* ---- Start App ---- */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
