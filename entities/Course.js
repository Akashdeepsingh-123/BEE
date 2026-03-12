import { makeEntity } from './model';

const localCourse = makeEntity('Course');
const API_BASE = '/api/courses';

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

export const Course = {
  async list(order) {
    try {
      const data = await request();
      return sortByCreatedDate(data, order);
    } catch (error) {
      console.error('Falling back to local Course.list()', error);
      return localCourse.list(order);
    }
  },
  async get(id) {
    try {
      return await request(`/${id}`);
    } catch (error) {
      console.error('Falling back to local Course.get()', error);
      return localCourse.get(id);
    }
  },
  async create(data) {
    try {
      return await request('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Falling back to local Course.create()', error);
      return localCourse.create(data);
    }
  },
  async update(id, data) {
    // API does not define update; fall back to local model.
    return localCourse.update(id, data);
  },
  async delete(id) {
    // API does not define delete; fall back to local model.
    return localCourse.delete(id);
  },
};

