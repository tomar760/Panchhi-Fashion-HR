/* ================================================
   INVENTORY.JS — Inventory / Stock Module
   ================================================ */

const Inventory = {

  html() {
    return `
    <div class="section" id="section-inventory">
      <div class="page-header">
        <div>
          <div class="page-heading">📦 Inventory / Stock</div>
          <div class="page-heading-sub">Store ka stock track karo</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-success btn-sm"
                  onclick="Inventory.exportExcel()">📊 Excel</button>
          <button class="btn btn-danger btn-sm"
                  onclick="Inventory.exportPDF()">📄 PDF</button>
        </div>
      </div>

      <div class="grid-2">

        <!-- ADD STOCK -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">➕</div>
            Stock Add / Update Karo
          </div>

          <div class="form-group">
            <label class="form-label">Item Name *</label>
            <input type="text" class="form-control" id="inv-name"
                   placeholder="Item ka naam">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" id="inv-cat">
                <option>Fabric / Kapda</option>
                <option>Thread / Dhaga</option>
                <option>Button / Accessories</option>
                <option>Packaging</option>
                <option>Machine Parts</option>
                <option>Stationery</option>
                <option>Chemicals</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-control" id="inv-unit">
                <option>Pieces</option>
                <option>Meters</option>
                <option>Kg</option>
                <option>Liters</option>
                <option>Rolls</option>
                <option>Boxes</option>
                <option>Bundles</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Opening Stock *</label>
              <input type="number" class="form-control" id="inv-stock"
                     placeholder="Current amount" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Min Stock Alert Level</label>
              <input type="number" class="form-control" id="inv-min"
                     placeholder="Low stock alert" min="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Rate per Unit (Rs.)</label>
              <input type="number" class="form-control" id="inv-rate"
                     placeholder="Price per unit" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Location / Rack</label>
              <input type="text" class="form-control" id="inv-location"
                     placeholder="Rack A / Shelf 2">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Supplier / Vendor</label>
            <input type="text" class="form-control" id="inv-vendor"
                   placeholder="Kahan se aata hai">
          </div>

          <button class="btn btn-primary btn-block"
                  onclick="Inventory.add()">
            📦 Stock Save Karo
          </button>

          <hr class="divider">

          <!-- Quick Stock Update -->
          <div class="card-title"
               style="border:none;padding:0;margin-bottom:12px;font-size:13px;">
            <div class="card-icon">🔄</div>
            Quick Stock Update
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Item Select</label>
              <select class="form-control" id="inv-updateItem">
                <option value="">-- Select --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-control" id="inv-updateType">
                <option value="add">➕ Add Stock</option>
                <option value="remove">➖ Remove Stock</option>
                <option value="set">📌 Set Stock</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity</label>
              <input type="number" class="form-control" id="inv-updateQty"
                     placeholder="Amount" min="0">
            </div>
            <div style="display:flex;align-items:flex-end;">
              <button class="btn btn-warning btn-block"
                      onclick="Inventory.quickUpdate()">
                🔄 Update
              </button>
            </div>
          </div>
        </div>

        <!-- STOCK TABLE -->
        <div class="card">
          <div class="card-title">
            <div class="card-icon">📊</div>
            Current Inventory
            <div class="card-actions">
              <span class="badge badge-warning" id="lowStockCount">0 Low</span>
            </div>
          </div>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="inv-search"
                   placeholder="Item dhundo..."
                   oninput="Inventory._renderTable()">
          </div>

          <div class="table-wrap" style="max-height:500px;overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody id="invTableBody">
                <tr class="empty-row">
                  <td colspan="8">📭 Koi inventory nahi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Value -->
          <hr class="divider">
          <div class="salary-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <div class="salary-box">
              <div class="s-amt text-primary" id="inv-totalItems">0</div>
              <div class="s-lbl">Total Items</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-gold" id="inv-totalValue">Rs. 0</div>
              <div class="s-lbl">Total Value</div>
            </div>
            <div class="salary-box">
              <div class="s-amt text-danger" id="inv-lowItems">0</div>
              <div class="s-lbl">Low Stock</div>
            </div>
          </div>
        </div>

      </div><!-- /grid-2 -->
    </div>
    `;
  },

  // ---- Add ----
  add() {
    const name     = document.getElementById('inv-name')?.value.trim();
    const cat      = document.getElementById('inv-cat')?.value;
    const unit     = document.getElementById('inv-unit')?.value;
    const stock    = parseFloat(document.getElementById('inv-stock')?.value) || 0;
    const minStock = parseFloat(document.getElementById('inv-min')?.value)   || 0;
    const rate     = parseFloat(document.getElementById('inv-rate')?.value)  || 0;
    const location = document.getElementById('inv-location')?.value.trim();
    const vendor   = document.getElementById('inv-vendor')?.value.trim();

    if (!name) { Toast.error('Item name missing!'); return; }

    // Check duplicate
    const dup = DB.inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (dup) {
      if (!Utils.confirm(`"${name}" already hai. Update karein?`)) return;
      dup.stock    = stock;
      dup.minStock = minStock;
      dup.rate     = rate;
      dup.location = location;
      dup.vendor   = vendor;
      DB.save();
      this.update();
      Toast.success('Stock Updated!', name);
      return;
    }

    DB.inventory.push({
      id:       Utils.nextId('INV', DB.inventory),
      name, category: cat, unit, stock, minStock, rate, location, vendor,
      addedOn:  Utils.today()
    });

    DB.save();
    this.update();
    Utils.clearFields(['inv-name','inv-stock','inv-min','inv-rate','inv-location','inv-vendor']);
    Toast.success('Stock Added!', `${name} — ${stock} ${unit}`);
  },

  // ---- Quick Update ----
  quickUpdate() {
    const id   = document.getElementById('inv-updateItem')?.value;
    const type = document.getElementById('inv-updateType')?.value;
    const qty  = parseFloat(document.getElementById('inv-updateQty')?.value) || 0;

    if (!id)  { Toast.error('Item select karo!');    return; }
    if (!qty) { Toast.error('Quantity enter karo!'); return; }

    const item = DB.inventory.find(i => i.id === id);
    if (!item) return;

    if (type === 'add')    item.stock += qty;
    if (type === 'remove') item.stock = Math.max(0, item.stock - qty);
    if (type === 'set')    item.stock = qty;

    DB.save();
    this.update();

    // Low stock alert
    if (item.minStock > 0 && item.stock <= item.minStock) {
      Toast.warning(`Low Stock Alert!`, `${item.name}: ${item.stock} ${item.unit} baki hai`);
    } else {
      Toast.success('Stock Updated!', `${item.name}: ${item.stock} ${item.unit}`);
    }
  },

  // ---- Delete ----
  delete(id) {
    if (!Utils.confirm('Item delete karna chahte ho?')) return;
    DB._data.inventory = DB.inventory.filter(i => i.id !== id);
    DB.save();
    this.update();
    Toast.warning('Item deleted', '');
  },

  // ---- Render Table ----
  _renderTable() {
    const tbody = document.getElementById('invTableBody');
    if (!tbody) return;

    const q = (document.getElementById('inv-search')?.value || '').toLowerCase();
    let list = [...DB.inventory];
    if (q) {
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
      );
    }

    const lowItems   = DB.inventory.filter(i => i.minStock > 0 && i.stock <= i.minStock).length;
    const totalVal   = DB.inventory.reduce((s, i) => s + (i.stock * i.rate), 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('inv-totalItems', DB.inventory.length);
    set('inv-totalValue', Utils.money(Math.round(totalVal)));
    set('inv-lowItems',   lowItems);
    set('lowStockCount',  lowItems + ' Low');

    // Update quick-update dropdown
    const updateEl = document.getElementById('inv-updateItem');
    if (updateEl) {
      updateEl.innerHTML =
        '<option value="">-- Select --</option>' +
        DB.inventory.map(i =>
          `<option value="${i.id}">${i.name} (${i.stock} ${i.unit})</option>`
        ).join('');
    }

    if (!list.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">📭 Koi inventory nahi</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list.map(inv => {
      const isLow = inv.minStock > 0 && inv.stock <= inv.minStock;
      return `
        <tr>
          <td>
            <div class="text-bold">${inv.name}</div>
            <div class="text-xs text-muted">${inv.location || ''}</div>
          </td>
          <td class="text-sm">${inv.category || '—'}</td>
          <td>
            <span class="text-bold"
                  style="color:${isLow ? 'var(--danger)' : 'var(--success)'};">
              ${inv.stock}
            </span>
          </td>
          <td class="text-sm">${inv.unit}</td>
          <td class="text-sm">${Utils.money(inv.rate)}</td>
          <td class="text-gold text-sm">
            ${Utils.money(Math.round(inv.stock * inv.rate))}
          </td>
          <td>
            ${isLow
              ? '<span class="badge badge-danger">⚠️ Low Stock</span>'
              : '<span class="badge badge-success">✅ OK</span>'
            }
          </td>
          <td>
            <button class="btn btn-sm btn-danger"
                    onclick="Inventory.delete('${inv.id}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---- Export Excel ----
  exportExcel() {
    if (!DB.inventory.length) { Toast.error('Koi data nahi!'); return; }
    const ws = XLSX.utils.json_to_sheet(DB.inventory.map(i => ({
      'ID':          i.id,
      'Item':        i.name,
      'Category':    i.category || '',
      'Stock':       i.stock,
      'Unit':        i.unit,
      'Min Stock':   i.minStock || 0,
      'Rate (Rs.)':  i.rate || 0,
      'Value (Rs.)': Math.round(i.stock * (i.rate || 0)),
      'Location':    i.location || '',
      'Vendor':      i.vendor || '',
      'Status':      (i.minStock > 0 && i.stock <= i.minStock) ? 'Low Stock' : 'OK'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'Inventory_PanchhiFashion.xlsx');
    Toast.success('Excel Downloaded!', '');
  },

  // ---- Export PDF ----
  exportPDF() {
    if (!DB.inventory.length) { Toast.error('Koi data nahi!'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    Reports._header(doc, 'Inventory / Stock Report');

    doc.autoTable({
      startY: 42,
      head: [['Item','Category','Stock','Unit','Rate','Value','Status']],
      body: DB.inventory.map(i => [
        i.name, i.category || '—', i.stock, i.unit,
        Utils.money(i.rate),
        Utils.money(Math.round(i.stock * (i.rate || 0))),
        (i.minStock > 0 && i.stock <= i.minStock) ? 'LOW STOCK!' : 'OK'
      ]),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [108, 99, 255], textColor: 255 },
      didParseCell(data) {
        if (data.column.index === 6 && data.section === 'body') {
          if (data.cell.raw === 'LOW STOCK!') {
            data.cell.styles.textColor = [220, 50, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    Reports._footer(doc);
    doc.save('Inventory_PanchhiFashion.pdf');
    Toast.success('PDF Downloaded!', '');
  },

  // ---- Master Update ----
  update() {
    this._renderTable();
  }
};
