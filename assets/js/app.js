/* ============================================================
   HOUSE OF PANCHHI HR SOFTWARE v2.0
   app.js — Common Utilities + GSheet API + Auth System
   CORS FIX: text/plain content type for GAS compatibility
============================================================ */

const GSheet = {
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyV7WwE4twxT_YfmZFzydR4xFepGCXaDUGxtPLcTpdXxcdHWfmZPtMS52wJW8DlUmNZnA/exec',

  /* ── POST — text/plain avoids CORS preflight ── */
  async send(action, data) {
    this._showStatus('loading', '⏳ Saving...');
    try {
      const res = await fetch(this.WEB_APP_URL, {
        method   : 'POST',
        headers  : { 'Content-Type': 'text/plain;charset=utf-8' },
        body     : JSON.stringify({ action, data: data || {} }),
        redirect : 'follow',
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); }
      catch(e) { json = { success: false, error: 'Parse error: ' + text.slice(0,100) }; }

      if (json.success) this._showStatus('success', '✓ Saved');
      else this._showStatus('error', '✗ ' + (json.error || 'Save failed'));
      return json;
    } catch (err) {
      this._showStatus('error', '✗ Network error');
      console.error('[GSheet.send] Error:', err);
      return { success: false, error: err.message };
    }
  },

  /* ── POST batch: large arrays in chunks ── */
  async sendBatch(action, dataArr, chunkSize = 50) {
    if (!Array.isArray(dataArr) || !dataArr.length) return { success: true, count: 0 };
    let done = 0;
    for (let i = 0; i < dataArr.length; i += chunkSize) {
      const chunk = dataArr.slice(i, i + chunkSize);
      const r     = await this.send(action, chunk);
      if (!r.success) return r;
      done += chunk.length;
      this._showStatus('loading', `⏳ Syncing... ${done}/${dataArr.length}`);
      if (i + chunkSize < dataArr.length) await _sleep(600);
    }
    this._showStatus('success', `✓ All ${done} records synced`);
    return { success: true, count: done };
  },

  /* ── GET — read data from Sheets ── */
  async read(sheet, filter = '') {
    try {
      let url = this.WEB_APP_URL + '?sheet=' + encodeURIComponent(sheet);
      if (filter) url += '&filter=' + encodeURIComponent(filter);
      const res  = await fetch(url, { redirect: 'follow' });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); }
      catch(e) { return []; }
      if (!json.success) console.error('[GSheet.read]', sheet, json.error);
      return json.data || [];
    } catch (err) {
      console.error('[GSheet.read] Error:', err);
      return [];
    }
  },

  /* ── Upload file to Google Drive ── */
  async uploadFile(file, subFolder = 'Store Attachments') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = await this.send('Store_Upload', {
          base64    : e.target.result,
          fileName  : file.name,
          mimeType  : file.type || 'application/octet-stream',
          subFolder : subFolder,
        });
        resolve(result);
      };
      reader.onerror = () => resolve({ success: false, error: 'File read failed' });
      reader.readAsDataURL(file);
    });
  },

  /* ── Status indicator ── */
  _showStatus(type, msg) {
    ['sheetStatus', 'sheetStatus2'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      el.className   = 'sheet-status ' + type;
      if (type === 'success') {
        setTimeout(() => { el.textContent = ''; el.className = 'sheet-status'; }, 3500);
      }
    });
  },
};

/* ══════════════════════════════════════
   AUTH SYSTEM
══════════════════════════════════════ */
const Auth = {
  _KEY : 'phr_session',

  async login(username, password) {
    const result = await GSheet.send('Auth_Login', { username, password });
    if (result.success && result.user) {
      sessionStorage.setItem(this._KEY, JSON.stringify(result.user));
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || 'Login failed' };
  },

  logout() {
    sessionStorage.removeItem(this._KEY);
    window.location.href = 'index.html';
  },

  getUser() {
    try {
      const raw = sessionStorage.getItem(this._KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  hasRole(requiredRole) {
    const user = this.getUser();
    if (!user) return false;
    const levels = { SUPER_ADMIN: 4, DIRECTOR: 3, HR_EXEC: 2, STORE_MGR: 1 };
    return (levels[user.role] || 0) >= (levels[requiredRole] || 0);
  },

  require() {
    if (!this.getUser()) { window.location.href = 'index.html'; return false; }
    return true;
  },

  requireRole(role) {
    if (!this.require()) return false;
    if (!this.hasRole(role)) {
      showToast('error', 'Access Denied', 'You do not have permission for this action');
      return false;
    }
    return true;
  },

  isReadOnly() {
    const user = this.getUser();
    return user?.role === 'DIRECTOR';
  },
};

/* ══════════════════════════════════════
   LEGACY Store (deprecated)
══════════════════════════════════════ */
const Store = {
  get(key)        { try { return JSON.parse(localStorage.getItem('phr_' + key)) || []; } catch { return []; } },
  set(key, data)  { try { localStorage.setItem('phr_' + key, JSON.stringify(data)); return true; } catch { return false; } },
  push(key, item) { const a = this.get(key); a.push(item); return this.set(key, a); },
  delete(key, id) { return this.set(key, this.get(key).filter(i => i.id !== id)); },
  update(key, id, updates) {
    const a = this.get(key);
    const i = a.findIndex(x => x.id === id);
    if (i > -1) { a[i] = { ...a[i], ...updates }; this.set(key, a); }
  },
};

/* ══════════════════════════════════════
   CLOCK & GREETING
══════════════════════════════════════ */
function updateClock() {
  const now     = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const el      = document.getElementById('liveClock');
  if (el) el.textContent = timeStr;
  const h        = now.getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : h < 21 ? 'Good Evening' : 'Good Night';
  const user     = Auth.getUser();
  const name     = user?.name || 'Admin';
  const gEl = document.getElementById('greetingText');
  const dEl = document.getElementById('greetingDate');
  if (gEl) gEl.textContent = `${greeting}, ${name}! 👋`;
  if (dEl) dEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/* ══════════════════════════════════════
   SIDEBAR & NAVIGATION
══════════════════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}
function toggleSubNav(el) {
  const sub    = el.nextElementSibling;
  const isOpen = sub?.classList.contains('open');
  document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.nav-link.has-sub').forEach(l => l.classList.remove('open'));
  if (!isOpen && sub) { sub.classList.add('open'); el.classList.add('open'); }
}
function loadProfileInSidebar() {
  const user = Auth.getUser();
  if (!user) return;
  const av = document.getElementById('sidebarAvatar');
  const nm = document.getElementById('sidebarName');
  const rl = document.getElementById('sidebarRole');
  if (av) av.textContent = initials(user.name);
  if (nm) nm.textContent = user.name;
  if (rl) rl.textContent = getRoleLabel(user.role);
  const ha = document.getElementById('headerAvatar');
  if (ha) ha.textContent = initials(user.name);
}
function getRoleLabel(role) {
  return { SUPER_ADMIN:'Super Admin', DIRECTOR:'Director', HR_EXEC:'HR Executive', STORE_MGR:'Store Manager' }[role] || role;
}

/* ══════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════ */
const TOAST_ICONS = { success:'fas fa-check-circle', error:'fas fa-times-circle', warning:'fas fa-exclamation-triangle', info:'fas fa-info-circle' };
function showToast(type='info', title='', message='', duration=3800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast   = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon"><i class="${TOAST_ICONS[type]||'fas fa-bell'}"></i></div><div class="toast-body"><h4>${title}</h4>${message?`<p>${message}</p>`:''}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity='0'; toast.style.transform='translateX(110px)'; toast.style.transition='all .3s ease';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
function showModal(id) { const m=document.getElementById('modal-'+id); if(m){m.classList.add('show');m.scrollTop=0;} }
function closeModal(id) { document.getElementById('modal-'+id)?.classList.remove('show'); }
document.addEventListener('click', e => { if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('show'); });
document.addEventListener('keydown', e => { if(e.key==='Escape') document.querySelectorAll('.modal-overlay.show').forEach(m=>m.classList.remove('show')); });
function showMaintenance(title, desc) {
  const t=document.getElementById('maintenanceTitle');const d=document.getElementById('maintenanceDesc');const m=document.getElementById('maintenanceModal');
  if(t)t.textContent=title;if(d)d.textContent=desc||'This module is being developed. Coming soon!';if(m)m.classList.add('show');
}

/* ══════════════════════════════════════
   BUTTON LOADING STATE
══════════════════════════════════════ */
function btnLoading(btn, text='Processing...') {
  const orig = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner spin"></i>&nbsp;${text}`;
  btn.disabled  = true;
  return function done(successText='Done') {
    setTimeout(() => {
      btn.innerHTML = `<i class="fas fa-check"></i>&nbsp;${successText}`;
      btn.style.background = 'linear-gradient(135deg,#059669,#34d399)';
      setTimeout(() => { btn.innerHTML=orig; btn.disabled=false; btn.style.background=''; }, 1000);
    }, 1400);
  };
}

/* ══════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════ */
function skeletonRows(tbody, cols=5, rows=5) {
  if(!tbody) return;
  tbody.innerHTML = Array.from({length:rows}, ()=>
    `<tr>${Array.from({length:cols}, ()=>
      `<td><div class="skeleton" style="height:14px;border-radius:6px"></div></td>`
    ).join('')}</tr>`
  ).join('');
}

/* ══════════════════════════════════════
   DATE & TIME HELPERS
══════════════════════════════════════ */
function todayStr() { return new Date().toISOString().split('T')[0]; }
function nowTimeStr() { const n=new Date(); return n.toTimeString().slice(0,5); }
function formatDate(dateStr) {
  if(!dateStr) return '—';
  try { const d=new Date(dateStr); if(isNaN(d)) return dateStr; return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return dateStr; }
}
function formatTime(timeStr) {
  if(!timeStr) return '—';
  const [h,m]=timeStr.split(':').map(Number);if(isNaN(h)) return timeStr;
  const ampm=h>=12?'PM':'AM';return`${h%12||12}:${String(m).padStart(2,'0')} ${ampm}`;
}
function timeDiffMinutes(t1, t2) {
  if(!t1||!t2) return 0;
  const [h1,m1]=t1.split(':').map(Number);const [h2,m2]=t2.split(':').map(Number);
  return (h2*60+m2)-(h1*60+m1);
}
function minutesToHHMM(minutes) {
  if(!minutes||minutes<=0) return '0 min';
  const h=Math.floor(Math.abs(minutes)/60);const m=Math.abs(minutes)%60;
  if(h===0) return`${m} min`;if(m===0) return`${h} hr`;return`${h} hr ${m} min`;
}
function formatINR(amount) {
  if(amount===null||amount===undefined||amount==='') return '—';
  return '₹'+Number(amount).toLocaleString('en-IN');
}

/* ══════════════════════════════════════
   AVATAR HELPERS
══════════════════════════════════════ */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#9d174d,#ec4899)','linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#1d4ed8,#60a5fa)','linear-gradient(135deg,#b45309,#fbbf24)',
  'linear-gradient(135deg,#7e22ce,#a855f7)','linear-gradient(135deg,#0e7490,#22d3ee)',
  'linear-gradient(135deg,#be123c,#fb7185)','linear-gradient(135deg,#166534,#4ade80)',
];
function avatarColor(name='') { let h=0;for(const c of name)h=c.charCodeAt(0)+((h<<5)-h);return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; }
function initials(name='') { const p=name.trim().split(/\s+/).filter(Boolean);if(!p.length)return'?';if(p.length===1)return p[0].slice(0,2).toUpperCase();return(p[0][0]+p[p.length-1][0]).toUpperCase(); }

/* ══════════════════════════════════════
   CSV DOWNLOAD
══════════════════════════════════════ */
function downloadCSV(filename, rows, headers) {
  const csv=[headers.join(','),...rows.map(r=>headers.map(h=>`"${(r[h]??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
  showToast('success','Downloaded',filename);
}

/* ══════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════ */
function confirmAction(message, onConfirm, type='danger') {
  const modal=document.getElementById('modal-confirm');
  if(!modal){if(confirm(message))onConfirm();return;}
  const icons={danger:'fas fa-trash-alt',warning:'fas fa-exclamation-triangle',info:'fas fa-question-circle'};
  const iconEl=modal.querySelector('.modal-confirm-icon');
  const iconI=modal.querySelector('.modal-confirm-icon i');
  const msgEl=modal.querySelector('#confirmMsg, .modal-confirm p');
  const okBtn=modal.querySelector('.btn-confirm-ok');
  if(iconEl)iconEl.className=`modal-confirm-icon ${type}`;
  if(iconI)iconI.className=icons[type]||icons.danger;
  if(msgEl)msgEl.textContent=message;
  if(okBtn)okBtn.onclick=()=>{closeModal('confirm');onConfirm();};
  showModal('confirm');
}

/* ══════════════════════════════════════
   OFFLINE DETECTION
══════════════════════════════════════ */
function _initOfflineDetector() {
  const banner=()=>{let b=document.getElementById('offlineBanner');if(!b){b=document.createElement('div');b.id='offlineBanner';b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:#f59e0b;color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:700;display:none';b.innerHTML='⚠️ You are offline — changes will not sync until reconnected';document.body.prepend(b);}return b;};
  window.addEventListener('offline',()=>{banner().style.display='block';});
  window.addEventListener('online',()=>{banner().style.display='none';showToast('success','Back Online','Connection restored');});
}
function genId(prefix='') { return prefix+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase(); }

/* ══════════════════════════════════════
   DEPARTMENT & DESIGNATION MASTER
══════════════════════════════════════ */
const DEPARTMENTS = ['ACCOUNTS','ADMIN','DESIGN','DISPATCH','EMBROIDERY','ERP','HR','MENDING','ONLINE','PRODUCTION','PURCHASE','QC','SALES','STITCHING','STORE','VALUE ADDITION'];
const DESIGNATIONS = {
  'ACCOUNTS':['SR. ACCOUNTANT','JR. ACCOUNTANT','ACCOUNTS EXECUTIVE'],
  'ADMIN':['HR MANAGER','HR EXECUTIVE','ERP EXECUTIVE','SECURITY','HOUSE KEEPER'],
  'DESIGN':['DESIGN HEAD','FASHION DESIGNER','SR. COM. DESIGNER','JR. COM. DESIGNER','SKETCHER','MOCKING EXECUTIVE'],
  'DISPATCH':['SUPERVISOR','PACKER','HELPER','DRIVER','BILLING EXECUTIVE'],
  'EMBROIDERY':['SUPERVISOR','OPERATOR','PATTA STITCHING','HELPER'],
  'ERP':['ERP EXECUTIVE','ERP MANAGER'],
  'HR':['HR MANAGER','HR EXECUTIVE','RECRUITER'],
  'MENDING':['SUPERVISOR','CHECKER','ALTER EXECUTIVE','MENDOR','FOLDING CHECKER'],
  'ONLINE':['ONLINE HOD','GRAPHICS DESIGNER','SOCIAL MEDIA EXECUTIVE','D2C EXECUTIVE','ECOMMERCE EXECUTIVE','VIDEO EDITOR'],
  'PRODUCTION':['PRODUCTION EXECUTIVE','PRODUCTION MANAGER','STITCHING MASTER'],
  'PURCHASE':['HOD','PURCHASE EXECUTIVE','FABRIC CHECKER'],
  'QC':['SUPERVISOR','CHECKER','HELPER'],
  'SALES':['SALES MANAGER','SALES COORDINATOR','SALES EXECUTIVE','SHOP ASSISTANT','COLLECTION EXECUTIVE'],
  'STITCHING':['SUPERVISOR','SR. MASTER','STITCHING EXECUTIVE','HELPER'],
  'STORE':['STORE MANAGER','STORE KEEPER','HELPER'],
  'VALUE ADDITION':['HOD','HELPER','ALTER EXECUTIVE','FOLDING HELPER'],
};
const BONUS_DEPARTMENTS = ['STITCHING','EMBROIDERY'];
function populateDeptDropdown(selectId, includeAll=false) {
  const sel=document.getElementById(selectId);if(!sel)return;
  const first=includeAll?'<option value="">All Departments</option>':'<option value="">Select Department...</option>';
  sel.innerHTML=first+DEPARTMENTS.map(d=>`<option value="${d}">${d}</option>`).join('');
}
function populateDesigDropdown(dept, selectId) {
  const sel=document.getElementById(selectId);if(!sel)return;
  const list=DESIGNATIONS[dept]||[];
  sel.innerHTML='<option value="">Select Designation...</option>'+list.map(d=>`<option value="${d}">${d}</option>`).join('');
}
function getShiftLabel(shiftStr) {
  if(!shiftStr)return'—';const parts=shiftStr.split('-');if(parts.length!==2)return shiftStr;
  return`${formatTime(parts[0].trim())} – ${formatTime(parts[1].trim())}`;
}
const DEPT_CODE_MAP = {ac:'ACCOUNTS',adm:'ADMIN',des:'DESIGN',dsp:'DISPATCH',emb:'EMBROIDERY',hr:'HR',mnd:'MENDING',on:'ONLINE',pp:'PRODUCTION',pur:'PURCHASE',qc:'QC',sal:'SALES',stc:'STITCHING',str:'STORE',va:'VALUE ADDITION',erp:'ERP'};
function getDeptFromECode(ecode) {
  if(!ecode)return'—';const parts=ecode.split('/');
  return parts.length>=2?(DEPT_CODE_MAP[parts[1].toLowerCase()]||parts[1].toUpperCase()):'—';
}

/* ══════════════════════════════════════
   STYLES INJECTION
══════════════════════════════════════ */
(function injectStyles() {
  if(document.getElementById('_appStyles'))return;
  const s=document.createElement('style');s.id='_appStyles';
  s.textContent=`.sheet-status{font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:6px;transition:all .3s;}.sheet-status.success{background:#d1fae5;color:#065f46;}.sheet-status.loading{background:#dbeafe;color:#1e40af;}.sheet-status.error{background:#fee2e2;color:#b91c1c;}.sheet-status.warning{background:#fef3c7;color:#92400e;}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin .9s linear infinite;display:inline-block;}.skeleton{background:linear-gradient(90deg,#f4f4f5 25%,#e4e4e7 50%,#f4f4f5 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px;}`;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════
   APP INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  _initOfflineDetector();
  updateClock();
  setInterval(updateClock, 1000);
  const today=todayStr();
  document.querySelectorAll('input.today-date[type="date"]').forEach(el=>{el.value=today;});
  loadProfileInSidebar();
  document.getElementById('maintenanceModal')?.addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
});

function _sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }
console.log('%c🦋 House of Panchhi HR v2.0 loaded','color:#be185d;font-weight:800;font-size:14px;');
