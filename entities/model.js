const storageKeyFor = (name) => `sms:${name}`;

function readAll(name) {
  try {
    const raw = localStorage.getItem(storageKeyFor(name));
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

function writeAll(name, items) {
  localStorage.setItem(storageKeyFor(name), JSON.stringify(items));
  try {
    window.dispatchEvent(new CustomEvent('sms:entity-changed', { detail: { name } }));
  } catch (_e) {
    // ignore if not in browser
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortItems(items, order) {
  if (!order) return items;
  const desc = order.startsWith('-');
  const key = desc ? order.slice(1) : order;
  return [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

export function makeEntity(name) {
  return {
    async list(order) {
      return sortItems(readAll(name), order);
    },
    async create(data) {
      const now = new Date().toISOString();
      const record = { id: generateId(), created_date: now, ...data };
      const items = readAll(name);
      items.unshift(record);
      writeAll(name, items);
      return record;
    },
    async update(id, data) {
      const items = readAll(name);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error(`${name} ${id} not found`);
      const updated = { ...items[idx], ...data, updated_date: new Date().toISOString() };
      items[idx] = updated;
      writeAll(name, items);
      return updated;
    },
    async delete(id) {
      const items = readAll(name);
      const next = items.filter((i) => i.id !== id);
      writeAll(name, next);
      return { id };
    },
    // Convenience getter
    async get(id) {
      return readAll(name).find((i) => i.id === id) || null;
    },
    // Filter items by criteria
    async filter(criteria, order) {
      const items = readAll(name);
      let filtered = items;
      
      if (criteria && typeof criteria === 'object') {
        filtered = items.filter(item => {
          return Object.keys(criteria).every(key => {
            const value = criteria[key];
            if (value === null || value === undefined) {
              return item[key] === null || item[key] === undefined;
            }
            return item[key] === value;
          });
        });
      }
      
      return sortItems(filtered, order);
    },
    // Bulk create records
    async bulkCreate(records) {
      const now = new Date().toISOString();
      const items = readAll(name);
      const newRecords = records.map(data => ({
        id: generateId(),
        created_date: now,
        ...data
      }));
      items.unshift(...newRecords);
      writeAll(name, items);
      return newRecords;
    }
  };
}


