const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  students: [],
  companies: [],
  internships: [],
  applications: [],
  _counters: { students: 0, companies: 0, internships: 0, applications: 0 }
};

class JsonDB {
  constructor() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    }
    this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!this.data._counters) {
      this.data._counters = { students: 0, companies: 0, internships: 0, applications: 0 };
    }
    for (const table of ['students', 'companies', 'internships', 'applications']) {
      if (!this.data[table]) this.data[table] = [];
      const maxId = this.data[table].reduce((max, r) => Math.max(max, r.id || 0), 0);
      if (this.data._counters[table] < maxId) this.data._counters[table] = maxId;
    }
  }

  _save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
  }

  _nextId(table) {
    this.data._counters[table]++;
    return this.data._counters[table];
  }

  findOne(table, predicate) {
    return this.data[table].find(predicate) || null;
  }

  findAll(table, predicate) {
    if (!predicate) return [...this.data[table]];
    return this.data[table].filter(predicate);
  }

  insert(table, record) {
    const id = this._nextId(table);
    const row = { id, ...record };
    this.data[table].push(row);
    this._save();
    return row;
  }

  update(table, id, updates) {
    const idx = this.data[table].findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data[table][idx] = { ...this.data[table][idx], ...updates };
    this._save();
    return this.data[table][idx];
  }

  delete(table, predicate) {
    const before = this.data[table].length;
    this.data[table] = this.data[table].filter(r => !predicate(r));
    this._save();
    return before - this.data[table].length;
  }
}

module.exports = new JsonDB();
