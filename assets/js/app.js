/* ================================================
   APP.JS — Main Init, Navigation, Sidebar
   ================================================ */

const NAV_ITEMS = [
  { section: true, label: 'Main' },
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard',        badge: null },

  { section: true, label: 'HR Module' },
  { id: 'employees',  icon: '👥', label: 'Employees',         badge: 'empBadge',   badgeClass: '' },
  { id: 'attendance', icon: '📋', label: 'Attendance',        badge: null },
  { id: 'salary',     icon: '💰', label: 'Salary',            badge: null },
  { id: 'leave',      icon: '🏖️', label: 'Leave Management',  badge: null },

  { section: true, label: 'Store Module' },
  { id: 'store',      icon: '🏪', label: 'Store Entries',     badge: 'storeBadge', badgeClass: 'badge-orange' },
  { id: 'inventory',  icon: '📦', label: 'Inventory',         badge: null },

  { section: true, label: 'Gate & Security' },
  { id: 'gatepass',   icon: '🚪', label: 'Gate Pass',         badge: null },

  { section: true, label: 'Management' },
  { id: 'reminders',  icon: '🔔', label: 'Reminders',         badge: 'remBadge',   badgeClass: 'badge-red' },
  { id: 'reports',    icon: '📊', label: 'Reports & Export',  badge: null }
];

const PAGE_META = {
  dashboard:  { title: '🏠 Dashboard',          sub: 'Company ki puri overview ek nazar mein' },
  employees:  { title: '👥 Employee Management', sub: 'Staff ki puri info manage karo' },
  attendance: { title: '📋 Attendance',          sub: 'Roz ki attendance mark karo' },
  salary:     { title: '💰 Salary Management',   sub: 'Calculate aur record rakho' },
  leave:      { title: '🏖️ Leave Management',    sub: 'Leave applications manage karo' },
  store:      { title: '🏪 Store Management',    sub: 'Kon kya lekar gaya — sab record karo' },
  inventory:  { title: '📦 Inventory / Stock',   sub: 'Store ka stock track karo' },
  gatepass:   { title: '🚪 Gate Pass',           sub: 'Employee entry / exit record karo' },
  reminders:  { title: '🔔 Reminders & Alerts',  sub: 'Kuch bhoolna nahi — yahan set karo' },
  reports:    { title: '📊 Reports & Export',    sub: 'PDF aur Excel mein download karo' }
};

/* ================================================
   BUILD SIDEBAR
   ================================================ */
function buildSidebar() {
  const nav  = document.getElementById('sidebarNav');
  let   html = '';

  NAV_ITEMS.forEach(function(item) {
    if (item.section) {
      if (item.label) {
        html += '<div class="nav-section-label">' + item.label + '</div>';
      }
      return;
    }

    var badgeHTML = item.badge
      ? '<span class="nav-badge ' + (item.badgeClass || '') + ' hide" id="' + item.badge + '">0</span>'
      : '';

    html += '<button class="nav-btn" id="nav-' + item.id + '" onclick="App.navigate(\'' + item.id + '\', this)">'
          + '<span class="nav-icon">' + item.icon + '</span>'
          + '<span class="nav-label">' + item.label + '</span>'
          + badgeHTML
          + '</button>';
  });

  nav.innerHTML = html;
}

/* ================================================
   BUILD SECTIONS
   ================================================ */
function buildSections() {
  var content = document.getElementById('appContent');
  var loading = document.getElementById('loadingScreen');
  if (loading) loading.remove();

  var html = '';

  if (typeof Dashboard  !== 'undefined') html += Dashboard.html();
  if (typeof Employees  !== 'undefined') html += Employees.html();
  if (typeof Attendance !== 'undefined') html += Attendance.html();
  if (typeof Salary     !== 'undefined') html += Salary.html();
  if (typeof Leave      !== 'undefined') html += Leave.html();
  if (typeof Store      !== 'undefined') html += Store.html();
  if (typeof Inventory  !== 'undefined') html += Inventory.html();
  if (typeof GatePass   !== 'undefined') html += GatePass.html();
  if (typeof Reminders  !== 'undefined') html += Reminders.html();
  if (typeof Reports    !== 'undefined') html += Reports.html();

  content.innerHTML = html;
}

/* ================================================
   APP OBJECT
   ================================================ */
var App = {

  currentSection: 'dashboard',

  navigate: function(id, btnEl) {
    var sections = document.querySelectorAll('.section');
    sections.forEach(function(s) {
      s.classList.remove('active');
    });

    var navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(function(b) {
      b.classList.remove('active');
    });

    var sec = document.getElementById('section-' + id);
    if (sec) sec.classList.add('active');

    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      var navBtn = document.getElementById('nav-' + id);
      if (navBtn) navBtn.classList.add('active');
    }

    var meta = PAGE_META[id];
    if (meta) {
      var titleEl    = document.getElementById('pageTitle');
      var subtitleEl = document.getElementById('pageSubtitle');
      if (titleEl)    titleEl.textContent    = meta.title;
      if (subtitleEl) subtitleEl.textContent = meta.sub;
    }

    this.currentSection = id;
    this.refreshSection(id);

    if (window.innerWidth <= 768) {
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.add('collapsed');
    }
  },

  refreshSection: function(id) {
    var map = {
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

    var mod = map[id];
    if (mod && typeof mod.update === 'function') {
      mod.update();
    }
  },

  updateBadges: function() {
    var empEl = document.getElementById('empBadge');
    if (empEl) {
      var ec = DB.employees.length;
      empEl.textContent = ec;
      empEl.classList.toggle('hide', ec === 0);
    }

    var storeEl = document.getElementById('storeBadge');
    if (storeEl) {
      var sc = DB.storeEntries.filter(function(e) {
        return !e.isComplete;
      }).length;
      storeEl.textContent = sc;
      storeEl.classList.toggle('hide', sc === 0);
    }

    var remEl = document.getElementById('remBadge');
    if (remEl) {
      var rc = DB.reminders.filter(function(r) {
        return !r.done;
      }).length;
      remEl.textContent = rc;
      remEl.classList.toggle('hide', rc === 0);
    }
  },

  updateNotifBanner: function() {
    var pending = DB.storeEntries.filter(function(e) {
      return !e.isComplete;
    }).length;

    var activeRem = DB.reminders.filter(function(r) {
      return !r.done;
    }).length;

    var today    = Utils.today();

    var todayRem = DB.reminders.filter(function(r) {
      return !r.done && r.datetime && r.datetime.startsWith(today);
    }).length;

    var outside = DB.gatePasses.filter(function(p) {
      return p.date === today && !p.isReturned;
    }).length;

    var msg = 'Panchhi Fashion HR Tool Ready ✅ &nbsp;|&nbsp; '
            + '👥 ' + DB.employees.length + ' Employees &nbsp;|&nbsp; ';

    if (pending) {
      msg += '<strong>⚠️ ' + pending + ' Store entries incomplete</strong> &nbsp;|&nbsp; ';
    }
    if (outside) {
      msg += '<strong>🚪 ' + outside + ' employee(s) bahar hain</strong> &nbsp;|&nbsp; ';
    }
    if (todayRem) {
      msg += '<strong>🔔 ' + todayRem + ' Reminder(s) aaj ke!</strong> &nbsp;|&nbsp; ';
    }

    msg += '👑 Designed by Aditya';

    var el = document.getElementById('notifText');
    if (el) el.innerHTML = msg;
  },

  startClock: function() {
    function update() {
      var now  = new Date();
      var time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      var date = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short'
      });
      var el = document.getElementById('liveTime');
      if (el) el.textContent = date + ' ' + time;
    }
    update();
    setInterval(update, 1000);
  },

  startReminderCheck: function() {
    setInterval(function() {
      var now = new Date();

      DB.reminders.filter(function(r) {
        return !r.done;
      }).forEach(function(r) {
        var rTime = new Date(r.datetime);
        var diff  = now - rTime;

        if (diff >= 0 && diff <= 60000) {
          Toast.warning('🔔 REMINDER!', r.title);

          if (r.isRecurring && r.linkedStoreId) {
            var entry = DB.storeEntries.find(function(e) {
              return e.id === r.linkedStoreId;
            });

            if (entry && !entry.isComplete) {
              var nextTime = new Date(Date.now() + 3 * 3600000);
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

            r.done = true;
            DB.save();
          }
        }
      });
    }, 30000);
  },

  startAutoSave: function() {
    setInterval(function() {
      DB.save();

      if (typeof GatePass !== 'undefined') {
        GatePass._autoSyncPending();
      }

      if (typeof Store !== 'undefined') {
        Store._autoSyncPending();
      }

      var chip = document.getElementById('autoSaveChip');
      if (chip) {
        chip.style.background = 'rgba(67,233,123,0.3)';
        chip.textContent      = '💾 Saved!';
        setTimeout(function() {
          chip.style.background = 'rgba(67,233,123,0.15)';
          chip.textContent      = '💾 Auto Save: ON';
        }, 1500);
      }
    }, 30000);
  },

  initMobileMenu: function() {
    var toggle  = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');

    if (toggle) {
      toggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
      });
    }

    document.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;
      if (!sidebar.contains(e.target) &&
          toggle && !toggle.contains(e.target)) {
        sidebar.classList.add('collapsed');
      }
    });
  },

  setDefaultDates: function() {
    var today     = Utils.today();
    var thisMonth = Utils.thisMonth();

    function setVal(id, val) {
      var el = document.getElementById(id);
      if (el && !el.value) el.value = val;
    }

    setVal('attDate',        today);
    setVal('storeDate',      today);
    setVal('leaveFrom',      today);
    setVal('leaveTo',        today);
    setVal('gpDate',         today);
    setVal('salMonth',       thisMonth);
    setVal('repAttMonth',    thisMonth);
    setVal('repSalMonth',    thisMonth);
    setVal('repStoreMonth',  thisMonth);

    var remDef = new Date(Date.now() + 2 * 3600000);
    setVal('remDateTime', remDef.toISOString().slice(0, 16));
  },

  init: function() {
    DB.load();
    buildSidebar();
    buildSections();
    this.startClock();
    this.startReminderCheck();
    this.startAutoSave();
    this.initMobileMenu();
    this.setDefaultDates();
    this.navigate('dashboard');

    setTimeout(function() {
      Toast.success(
        'Panchhi Fashion Ready! 🦅',
        'HR & Store Tool loaded — Aditya ✅'
      );
    }, 800);
  }

};

/* ================================================
   START
   ================================================ */
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
