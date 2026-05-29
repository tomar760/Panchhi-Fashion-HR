/* ================================================
   DB.JS — Data Store + LocalStorage
   ================================================ */

const DB = {
  _data: {
    employees:    [],
    attendance:   [],
    salaries:     [],
    leaves:       [],
    storeEntries: [],
    inventory:    [],
    reminders:    [],
    gatePasses:   []
  },

  KEY: 'pf_db_v3',

  load() {
    try {
      const saved = localStorage.getItem(this.KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(this._data).forEach(k => {
          if (parsed[k]) this._data[k] = parsed[k];
        });
      }
    } catch (e) {
      console.warn('DB load error — fresh start', e);
    }
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('DB save error', e);
    }
  },

  // Getters
  get employees()    { return this._data.employees;    },
  get attendance()   { return this._data.attendance;   },
  get salaries()     { return this._data.salaries;     },
  get leaves()       { return this._data.leaves;       },
  get storeEntries() { return this._data.storeEntries; },
  get inventory()    { return this._data.inventory;    },
  get reminders()    { return this._data.reminders;    },
  get gatePasses()   { return this._data.gatePasses;   },

  // Helpers
  nextId(prefix, list) {
    const num = String(list.length + 1).padStart(3, '0');
    return `${prefix}${num}`;
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  thisMonth() {
    return new Date().toISOString().slice(0, 7);
  },

  clearAll() {
    Object.keys(this._data).forEach(k => {
      this._data[k] = [];
    });
    this.save();
  }
};
