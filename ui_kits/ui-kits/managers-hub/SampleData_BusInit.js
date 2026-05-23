// ─── BUS AUTO-LOAD — runs after SharedDataBus.js and SampleData.js ───────
// If EK_BUS has saved data, it overrides SNAP in EK_DATA immediately.
// Also registers a live listener so any future push auto-updates EK_DATA.SNAP.

(function() {
  function applyDays(days) {
    if (!days || !days.length) return;
    var todayLagos = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })).getDate();
    if (window.EK_DATA) {
      window.EK_DATA.SNAP = { days: days, activeDay: todayLagos };
      window.EK_DATA.REAL_TOTALS = (function() {
        var all = days.flatMap(function(d) { return d.tickets || []; });
        return {
          total:      all.length,
          resolved:   all.filter(function(t) { return t.status === 'resolved';   }).length,
          progress:   all.filter(function(t) { return t.status === 'progress';   }).length,
          unresolved: all.filter(function(t) { return t.status === 'unresolved'; }).length,
          days: days.length,
        };
      })();
    }
    console.log('[EK_BUS] Data applied — ' + days.length + ' days');
  }

  // ── Load on startup ──
  if (window.EK_BUS) {
    var stored = window.EK_BUS.load();
    if (stored && stored.days && stored.days.length) {
      applyDays(stored.days);
    }

    // ── Live listener — auto-update when any tab pushes new data ──
    window.EK_BUS.onChange(function(days) {
      applyDays(days);
      // Dispatch a custom event so React components can re-render if needed
      window.dispatchEvent(new CustomEvent('EK_DATA_REFRESHED', { detail: { days: days } }));
    });
  }
})();
