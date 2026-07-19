/**
 * jsonModel — factory that creates a JSON-backed data model.
 * Used as fallback when MongoDB is not available.
 * Fix #14: uses atomic write pattern (write to .tmp then rename)
 * so a crash mid-write never corrupts the data file.
 */
import fs   from 'fs';
import path from 'path';

function atomicWrite(filePath, data) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

export function jsonModel(filePath) {
  const dir = path.dirname(filePath);

  function ensureDir() {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  function readAll() {
    try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : []; }
    catch { return []; }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  return {
    getAll(filter = null) {
      const data = readAll();
      return filter ? data.filter(filter) : data;
    },
    getById(id) {
      return readAll().find(r => r.id === id || r._id === id) || null;
    },
    create(data) {
      ensureDir();
      const list = readAll();
      const doc  = { id: newId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      list.unshift(doc);
      atomicWrite(filePath, list);
      return doc;
    },
    update(id, data) {
      const list = readAll();
      const idx  = list.findIndex(r => r.id === id || r._id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      atomicWrite(filePath, list);
      return list[idx];
    },
    delete(id) {
      const list     = readAll();
      const filtered = list.filter(r => r.id !== id && r._id !== id);
      if (filtered.length === list.length) return false;
      atomicWrite(filePath, filtered);
      return true;
    },
    replaceAll(data) {
      ensureDir();
      atomicWrite(filePath, data);
    },
  };
}
