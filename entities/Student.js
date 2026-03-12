import { makeEntity } from './model';

const localStudent = makeEntity('Student');
const API_BASE = '/api/students';

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

export const Student = {
  async list(order) {
    try {
      const data = await request();
      return sortByCreatedDate(data, order);
    } catch (error) {
      console.error('Falling back to local Student.list()', error);
      return localStudent.list(order);
    }
  },
  async get(id) {
    try {
      return await request(`/${id}`);
    } catch (error) {
      console.error('Falling back to local Student.get()', error);
      return localStudent.get(id);
    }
  },
  async create(data) {
    try {
      return await request('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Falling back to local Student.create()', error);
      return localStudent.create(data);
    }
  },
  async update(id, data) {
    try {
      return await request(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Falling back to local Student.update()', error);
      return localStudent.update(id, data);
    }
  },
  async delete(id) {
    try {
      return await request(`/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Falling back to local Student.delete()', error);
      return localStudent.delete(id);
    }
  },
};

