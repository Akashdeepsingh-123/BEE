import { makeEntity } from './model';

const localFaculty = makeEntity('Faculty');
const API_BASE = '/api/faculty';

async function request(path = '', options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || 'Request failed');
    error.status = res.status;
    throw error;
  }

  return res.json();
}

function sortByCreatedDate(items, order) {
  if (!order || order !== '-created_date') return items;
  return [...items].sort(
    (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0),
  );
}

export const Faculty = {
  async list(order) {
    try {
      const data = await request();
      return sortByCreatedDate(data, order);
    } catch (error) {
      console.error('Falling back to local Faculty.list()', error);
      return localFaculty.list(order);
    }
  },
  async get(id) {
    try {
      return await request(`/${id}`);
    } catch (error) {
      console.error('Falling back to local Faculty.get()', error);
      return localFaculty.get(id);
    }
  },
  async create(data) {
    try {
      return await request('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Falling back to local Faculty.create()', error);
      return localFaculty.create(data);
    }
  },
  async update(id, data) {
    // API does not define update; fall back to local model.
    return localFaculty.update(id, data);
  },
  async delete(id) {
    // API does not define delete; fall back to local model.
    return localFaculty.delete(id);
  },
};

