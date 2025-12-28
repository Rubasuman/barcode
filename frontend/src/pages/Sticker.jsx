import { useState, useMemo } from 'react';
import Barcode from 'react-barcode';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Detect API URL: use env var or fallback based on environment
const getApiUrl = () => {
  // If running on Netlify, VITE_API_URL will be set in build env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Development: use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  // Production fallback: assume backend is on same domain or use window.location
  return `${window.location.origin}/api`;
};

const API_BASE_URL = getApiUrl();

function Sticker() {
  const [form, setForm] = useState({
    title: 'Product Name',
    sku: 'SKU-001',
    price: '9.99',
    barcode: '123456789012',
    format: 'CODE128',
    includePrice: true,
    includeSku: true,
    copies: 1,
    labelWidthMm: 50,
    labelHeightMm: 30,
    marginMm: 3,
    textSize: 12,
  });

  // Excel import state
  const [source, setSource] = useState('manual'); // manual | excel
  const [excelRows, setExcelRows] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [map, setMap] = useState({ title: '', sku: '', price: '', barcode: '' });
  const [hasGenerated, setHasGenerated] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setHasGenerated(false);
  };

  const onNumberChange = (name, value) => {
    const num = Math.max(0, Number(value || 0));
    setForm((prev) => ({ ...prev, [name]: num }));
    setHasGenerated(false);
  };

  const labels = useMemo(() => Array.from({ length: Math.max(1, form.copies) }), [form.copies]);

  const printLabels = () => {
    const labelGrid = document.querySelector('.label-grid');
    if (!labelGrid) {
      alert('No labels to print');
      return;
    }
    
    const printWindow = window.open('', 'barcode-print', 'width=900,height=700');
    
    // Fallback if popup is blocked
    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      alert('Print popup was blocked. Using browser print instead. Press Ctrl+P to customize.');
      setTimeout(() => window.print(), 100);
      return;
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Print Barcode Stickers</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body { background: #fff; font-family: Arial, sans-serif; }
          .label-grid {
            display: flex;
            flex-wrap: wrap;
            gap: ${form.marginMm}mm;
            padding: ${form.marginMm}mm;
          }
          .label {
            width: ${form.labelWidthMm}mm;
            height: ${form.labelHeightMm}mm;
            background: #fff;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-inside: avoid;
            flex-shrink: 0;
          }
          .label-inner {
            width: 92%;
            text-align: center;
            font-size: ${form.textSize}px;
            line-height: 1.2;
          }
          .label-title { font-weight: 700; margin-bottom: 3px; }
          .label-sub { font-weight: 600; margin-top: 3px; font-size: 0.9em; }
          .label-barcode { margin: 6px 0; }
          svg { width: 100%; height: auto; }
          @media print {
            body { margin: 0; padding: 0; }
            .label-grid { gap: 0; padding: 0; margin: 0; }
            .label { border-color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="label-grid">
          ${Array.from(labelGrid.querySelectorAll('.label')).map(label => label.outerHTML).join('')}
        </div>
        <script>
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
          }, 1200);
        </script>
      </body>
      </html>
    `;
    
    try {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    } catch (e) {
      console.error('Print window error:', e);
      alert('Error opening print window. Falling back to browser print.');
      window.print();
    }
  };

  const captureAndUploadLabels = async () => {
    const grid = document.querySelector('.label-grid');
    const labelEls = Array.from(grid?.querySelectorAll('.label') || []);
    if (!grid || labelEls.length === 0) {
      alert('No labels to capture');
      return [];
    }

    // Build sequence mapping for excel mode to know label metadata per element
    const excelSequence = source === 'excel' && excelLabels.length > 0
      ? excelLabels.flatMap((item) => Array.from({ length: Math.max(1, form.copies) }, () => item))
      : [];

    const results = [];
    // Excel mode: store each product (unique barcode) once; Manual: store once with quantity=copies
    if (source === 'excel') {
      const processed = new Set();
      for (let i = 0; i < labelEls.length; i++) {
        const item = excelSequence[i];
        if (!item) continue;
        const b = item.barcode;
        if (!b || processed.has(b)) continue; // skip duplicates (copies)

        // Capture first occurrence of this product's label only
        const canvas = await html2canvas(labelEls[i], { scale: 2, backgroundColor: '#fff' });
        const blob = await new Promise((resolve) => canvas.toBlob((bb) => resolve(bb), 'image/png'));
        if (!blob) continue;

        const meta = {
          title: map.title ? item.title : '',
          sku: map.sku ? item.sku : '',
          price: map.price ? item.price : '',
          barcode: item.barcode,
          format: form.format,
          source: 'excel',
          quantity: Math.max(1, Number(form.copies) || 1),
        };

        const fd = new FormData();
        fd.append('file', blob, `sticker_${meta.barcode}.png`);
        Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v ?? '')));

        try {
          const resp = await fetch(`${API_BASE_URL}/stickers/upload-image`, { method: 'POST', body: fd });
          const data = await resp.json();
          if (!resp.ok) {
            console.error('Upload failed', data);
            alert(`Image upload failed for ${meta.barcode}: ${data.error || 'Unknown error'}`);
          } else {
            results.push(data.image_url);
            processed.add(b);
          }
        } catch (e) {
          console.error(e);
          alert(`Network error during upload for ${meta.barcode}: ${e.message}`);
        }
      }
    } else {
      // Manual: capture a single label and record quantity=copies
      const first = labelEls[0];
      if (first) {
        const canvas = await html2canvas(first, { scale: 2, backgroundColor: '#fff' });
        const blob = await new Promise((resolve) => canvas.toBlob((bb) => resolve(bb), 'image/png'));
        if (blob) {
          const meta = {
            title: form.title,
            sku: form.includeSku ? form.sku : '',
            price: form.includePrice ? form.price : '',
            barcode: form.barcode,
            format: form.format,
            source: 'manual',
            quantity: Math.max(1, Number(form.copies) || 1),
          };
          const fd = new FormData();
          fd.append('file', blob, `sticker_${meta.barcode}.png`);
          Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v ?? '')));
          try {
            const resp = await fetch(`${API_BASE_URL}/stickers/upload-image`, { method: 'POST', body: fd });
            const data = await resp.json();
            if (!resp.ok) {
              console.error('Upload failed', data);
              alert(`Image upload failed: ${data.error || 'Unknown error'}`);
            } else {
              results.push(data.image_url);
            }
          } catch (e) {
            console.error(e);
            alert(`Network error during upload: ${e.message}`);
          }
        }
      }
    }
    return results;
  };

  const saveStickerToDatabase = async (barcodeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stickers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barcodeData),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`Error saving: ${result.error}`);
        return false;
      }
      alert('Sticker saved successfully!');
      return true;
    } catch (err) {
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  const handleSaveAndPrint = async () => {
    if (!hasGenerated) {
      alert('Please click Generate Stickers first.');
      return;
    }
    // First capture and upload images for all labels
    const uploaded = await captureAndUploadLabels();
    if (uploaded.length === 0) {
      // If uploads failed entirely, don't print
      return;
    }
    // Optionally also save metadata in bulk with image URLs (already saved during upload)
    printLabels();
  };

  const detectHeader = (headers, candidates) => {
    const lower = headers.map(h => String(h).toLowerCase());
    for (const c of candidates) {
      const idx = lower.indexOf(c.toLowerCase());
      if (idx !== -1) return headers[idx];
    }
    return '';
  };

  const handleExcel = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const headers = rows.length ? Object.keys(rows[0]) : [];
      setExcelRows(rows);
      setExcelHeaders(headers);
      setSource('excel');
      setHasGenerated(false);

      // Heuristic mapping
      setMap({
        title: detectHeader(headers, ['title', 'name', 'product']),
        sku: detectHeader(headers, ['sku', 'code', 'itemcode']),
        price: detectHeader(headers, ['price', 'mrp', 'cost']),
        barcode: detectHeader(headers, ['barcode', 'ean', 'code128']),
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const excelLabels = useMemo(() => {
    if (source !== 'excel' || excelRows.length === 0) return [];
    return excelRows.map((r) => ({
      title: map.title ? r[map.title] : '',
      sku: map.sku ? r[map.sku] : '',
      price: map.price ? r[map.price] : '',
      barcode: map.barcode ? String(r[map.barcode] || '') : '',
    })).filter(x => x.barcode);
  }, [source, excelRows, map]);

  return (
    <div className="page">
      <h2>Barcode Sticker Generator</h2>
      

      <div className="section-stack">
        {/* Data source panel */}
        <div className="panel">
          <div className="form-group">
            <label>Data Source</label>
            <div className="chip-row">
              <label><input type="radio" name="source" checked={source==='manual'} onChange={() => { setSource('manual'); setHasGenerated(false); }} /> Manual</label>
              <label><input type="radio" name="source" checked={source==='excel'} onChange={() => { setSource('excel'); setHasGenerated(false); }} /> Excel</label>
            </div>
          </div>

          {source === 'excel' ? (
            <>
              <div className="form-group">
                <label>Upload Excel (.xlsx/.xls/.csv)</label>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleExcel(e.target.files && e.target.files[0])} />
              </div>

              {excelHeaders.length > 0 && (
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label>Title Column</label>
                    <select value={map.title} onChange={(e) => { setMap(m => ({ ...m, title: e.target.value })); setHasGenerated(false); }}>
                      <option value="">-- none --</option>
                      {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>SKU Column</label>
                    <select value={map.sku} onChange={(e) => { setMap(m => ({ ...m, sku: e.target.value })); setHasGenerated(false); }}>
                      <option value="">-- none --</option>
                      {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Price Column</label>
                    <select value={map.price} onChange={(e) => { setMap(m => ({ ...m, price: e.target.value })); setHasGenerated(false); }}>
                      <option value="">-- none --</option>
                      {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Barcode Column</label>
                    <select value={map.barcode} onChange={(e) => { setMap(m => ({ ...m, barcode: e.target.value })); setHasGenerated(false); }}>
                      <option value="">-- required --</option>
                      {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label>Copies per row</label>
                  <input type="number" value={form.copies} onChange={(e) => onNumberChange('copies', e.target.value)} />
                </div>
                <div>
                  <label>Text Size (px)</label>
                  <input type="number" value={form.textSize} onChange={(e) => onNumberChange('textSize', e.target.value)} />
                </div>
                <div>
                  <label>Label Width (mm)</label>
                  <input type="number" value={form.labelWidthMm} onChange={(e) => onNumberChange('labelWidthMm', e.target.value)} />
                </div>
                <div>
                  <label>Label Height (mm)</label>
                  <input type="number" value={form.labelHeightMm} onChange={(e) => onNumberChange('labelHeightMm', e.target.value)} />
                </div>
                <div>
                  <label>Margin (mm)</label>
                  <input type="number" value={form.marginMm} onChange={(e) => onNumberChange('marginMm', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setHasGenerated(true)} disabled={!map.barcode}>Generate Stickers</button>
                <button className="btn btn-primary" type="button" onClick={handleSaveAndPrint} disabled={!hasGenerated || !map.barcode}>Save & Print Stickers</button>
              </div>
            </>
          ) : (
          <>
          <div className="form-group">
            <label>Product Title</label>
            <input name="title" value={form.title} onChange={onChange} />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input name="sku" value={form.sku} onChange={onChange} />
              <label style={{ margin: 0, fontSize: '0.9rem' }}>
                <input type="checkbox" name="includeSku" checked={form.includeSku} onChange={onChange} /> Include
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Price</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input name="price" value={form.price} onChange={onChange} />
              <label style={{ margin: 0, fontSize: '0.9rem' }}>
                <input type="checkbox" name="includePrice" checked={form.includePrice} onChange={onChange} /> Include
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Barcode Value</label>
            <input name="barcode" value={form.barcode} onChange={onChange} />
            <small style={{ color: '#666' }}>Use numeric for EAN-13; any ASCII for Code128.</small>
          </div>

          <div className="form-group">
            <label>Barcode Format</label>
            <select name="format" value={form.format} onChange={onChange}>
              <option value="CODE128">Code 128</option>
              <option value="EAN13">EAN-13</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label>Copies</label>
              <input type="number" value={form.copies} onChange={(e) => onNumberChange('copies', e.target.value)} />
            </div>
            <div>
              <label>Text Size (px)</label>
              <input type="number" value={form.textSize} onChange={(e) => onNumberChange('textSize', e.target.value)} />
            </div>
            <div>
              <label>Label Width (mm)</label>
              <input type="number" value={form.labelWidthMm} onChange={(e) => onNumberChange('labelWidthMm', e.target.value)} />
            </div>
            <div>
              <label>Label Height (mm)</label>
              <input type="number" value={form.labelHeightMm} onChange={(e) => onNumberChange('labelHeightMm', e.target.value)} />
            </div>
            <div>
              <label>Margin (mm)</label>
              <input type="number" value={form.marginMm} onChange={(e) => onNumberChange('marginMm', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setHasGenerated(true)}>Generate Stickers</button>
            <button className="btn btn-primary" type="button" onClick={handleSaveAndPrint} disabled={!hasGenerated}>Save & Print Stickers</button>
          </div>
          </>
          )}
        </div>

        {/* Preview panel */}
        <div className="panel">
          <h3>Preview</h3>
          {hasGenerated ? (
          <div
            className="label-grid"
            style={{
              '--label-w': `${form.labelWidthMm}mm`,
              '--label-h': `${form.labelHeightMm}mm`,
              '--label-m': `${form.marginMm}mm`,
            }}
          >
            {source === 'excel' && excelLabels.length > 0 ? (
              excelLabels.flatMap((item, idx) => Array.from({ length: Math.max(1, form.copies) }).map((_, copyIdx) => (
                <div key={`${idx}-${copyIdx}`} className="label">
                  <div className="label-inner" style={{ fontSize: `${form.textSize}px` }}>
                    {map.title && <div className="label-title">{item.title}</div>}
                    {map.sku && item.sku && <div className="label-sub">{item.sku}</div>}
                    <div className="label-barcode">
                      <Barcode
                        value={item.barcode}
                        format={form.format}
                        width={2}
                        height={40}
                        displayValue={false}
                        fontSize={form.textSize - 2}
                      />
                    </div>
                    {map.price && item.price && <div className="label-sub">₹{item.price}</div>}
                  </div>
                </div>
              )))
            ) : (
              labels.map((_, i) => (
                <div key={i} className="label">
                  <div className="label-inner" style={{ fontSize: `${form.textSize}px` }}>
                    <div className="label-title">{form.title}</div>
                    {form.includeSku && <div className="label-sub">{form.sku}</div>}
                    <div className="label-barcode">
                      <Barcode
                        value={form.barcode}
                        format={form.format}
                        width={2}
                        height={40}
                        displayValue={false}
                        fontSize={form.textSize - 2}
                      />
                    </div>
                    {form.includePrice && <div className="label-sub">₹{form.price}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
          ) : (
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Click "Generate Stickers" to see the preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sticker;
