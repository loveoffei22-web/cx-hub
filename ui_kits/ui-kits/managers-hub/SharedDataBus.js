// ─── EKEDP Shared Data Bus ────────────────────────────────────────────────
// One source of truth across ALL hubs (Manager / Agent / GM).
// Works via localStorage (persists) + BroadcastChannel (live cross-tab push).
//
// Usage:
//   EK_BUS.save(days)          → saves + broadcasts to every open tab
//   EK_BUS.load()              → returns current days array or null
//   EK_BUS.onChange(callback)  → fires whenever any tab saves new data
//   EK_BUS.clear()             → wipes shared data

(function() {
  var STORAGE_KEY = 'ekedp_cx_live_v1';
  var CHANNEL_NAME = 'ekedp_cx_bus';
  var channel = null;
  var listeners = [];

  // ── Init BroadcastChannel (cross-tab live push) ──
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = function(e) {
      if (e.data && e.data.type === 'EK_DATA_UPDATE') {
        listeners.forEach(function(cb) {
          try { cb(e.data.days, e.data.meta); } catch(err) {}
        });
      }
    };
  } catch(err) {
    console.warn('BroadcastChannel not available — tab-sync disabled.');
  }

  // ── Also listen for localStorage changes (different browser tabs) ──
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        var parsed = JSON.parse(e.newValue);
        if (parsed && parsed.days) {
          listeners.forEach(function(cb) {
            try { cb(parsed.days, parsed.meta || {}); } catch(err) {}
          });
        }
      } catch(err) {}
    }
  });

  window.EK_BUS = {

    // ── Save days array → localStorage + broadcast ──
    save: function(days, meta) {
      if (!days || !days.length) return false;
      var payload = {
        days: days,
        meta: Object.assign({ savedAt: new Date().toISOString(), source: 'manual' }, meta || {}),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch(e) {
        console.error('EK_BUS: localStorage write failed', e);
        return false;
      }
      // Broadcast to other open tabs
      if (channel) {
        try {
          channel.postMessage({ type: 'EK_DATA_UPDATE', days: days, meta: payload.meta });
        } catch(e) {}
      }
      // Fire local listeners too
      listeners.forEach(function(cb) {
        try { cb(days, payload.meta); } catch(err) {}
      });
      return true;
    },

    // ── Load current data ──
    load: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        return parsed && parsed.days ? parsed : null;
      } catch(e) { return null; }
    },

    // ── Register a listener — fires on any update from any tab ──
    onChange: function(callback) {
      listeners.push(callback);
      return function() { // returns unsubscribe fn
        listeners = listeners.filter(function(c) { return c !== callback; });
      };
    },

    // ── Get meta info (who saved, when, source) ──
    getMeta: function() {
      var d = this.load();
      return d ? (d.meta || {}) : null;
    },

    // ── Clear shared data ──
    clear: function() {
      localStorage.removeItem(STORAGE_KEY);
      if (channel) {
        try { channel.postMessage({ type: 'EK_DATA_UPDATE', days: [], meta: { cleared: true } }); } catch(e) {}
      }
    },

    // ── How many days loaded ──
    summary: function() {
      var d = this.load();
      if (!d || !d.days || !d.days.length) return 'No data loaded';
      var total = d.days.reduce(function(n, day) { return n + (day.tickets||[]).length; }, 0);
      return d.days.length + ' days · ' + total + ' tickets · saved ' + (d.meta && d.meta.savedAt ? new Date(d.meta.savedAt).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'}) : '?');
    },
  };

  console.log('[EK_BUS] Shared data bus ready. ' + window.EK_BUS.summary());
})();
