// Shared export helpers used by every report HTML.
// SheetJS for .xlsx, plus a "copy as email HTML" helper.

(function() {
  // ─── SheetJS loader ─────────────────────────────────────────
  let xlsxReady = null;
  function ensureXLSX() {
    if (window.XLSX) return Promise.resolve();
    if (xlsxReady) return xlsxReady;
    xlsxReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = () => res();
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return xlsxReady;
  }

  /**
   * Build and download an .xlsx from a list of sheets.
   * sheets: [{ name, aoa, colWidths?, headerRows? }]
   *   aoa = array of arrays (rows, cells). First N rows can be header rows.
   *   colWidths = optional [{wch:n}, …] (character widths)
   *   headerRows = how many top rows to bold (default 1)
   */
  async function downloadXlsx(filename, sheets) {
    await ensureXLSX();
    const wb = window.XLSX.utils.book_new();
    sheets.forEach(({name, aoa, colWidths, headerRows = 1, merges}) => {
      const ws = window.XLSX.utils.aoa_to_sheet(aoa);
      if (colWidths) ws['!cols'] = colWidths;
      if (merges) ws['!merges'] = merges;
      // Bold the header rows (basic — full styling needs xlsx-js-style)
      for (let r = 0; r < headerRows; r++) {
        const row = aoa[r] || [];
        for (let c = 0; c < row.length; c++) {
          const addr = window.XLSX.utils.encode_cell({r, c});
          if (!ws[addr]) continue;
          ws[addr].s = { font: { bold: true }, alignment: { horizontal: 'center' } };
        }
      }
      window.XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    });
    window.XLSX.writeFile(wb, filename);
  }

  /**
   * Copy the rendered document as email-ready HTML.
   * Returns a Promise<true|false>.
   * Strips the toolbar, keeps the .doc element.
   */
  async function copyAsEmailHTML(rootSelector = '.doc') {
    const node = document.querySelector(rootSelector);
    if (!node) return false;
    // Inline styles by serialising computed styles for everything visible.
    // Simpler approach: wrap in a basic HTML envelope with the @import of fonts.
    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Sora', 'Helvetica Neue', Arial, sans-serif; }
  ${[...document.styleSheets].map(s => {
    try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch (e) { return ''; }
  }).join('\n')}
</style></head><body>${node.outerHTML}</body></html>`;
    try {
      const blob = new Blob([html], {type: 'text/html'});
      const item = new ClipboardItem({'text/html': blob, 'text/plain': new Blob([node.innerText], {type:'text/plain'})});
      await navigator.clipboard.write([item]);
      return true;
    } catch (e) {
      console.warn('Clipboard API failed, falling back to download', e);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], {type:'text/html'}));
      a.download = 'report.html';
      a.click();
      return false;
    }
  }

  /** Toast at bottom-right. */
  function toast(msg, type = 'ok') {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:9999;
      background:${type==='ok'?'#16A34A':type==='warn'?'#D97706':'#DC2626'};
      color:#fff; padding:12px 18px; border-radius:10px;
      font:700 12px 'Sora',sans-serif; box-shadow:0 8px 32px rgba(0,0,0,.3);
      transition: opacity .3s;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2800);
  }

  window.EK_EXPORT = { ensureXLSX, downloadXlsx, copyAsEmailHTML, toast };
})();
