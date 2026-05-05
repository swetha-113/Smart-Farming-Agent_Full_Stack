/**
 * In-Memory Store — fallback when MongoDB is unavailable
 * Data is lost when server restarts.
 */

const users   = [];
const history = [];
let userIdCounter    = 1;
let historyIdCounter = 1;

const findUserByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase());

const findUserById = (id) =>
  users.find((u) => u.id === id);

const createUser = (data) => {
  const user = { ...data, id: String(userIdCounter++), role: 'farmer', createdAt: new Date() };
  users.push(user);
  return user;
};

const addHistory = (entry) => {
  const record = { ...entry, id: String(historyIdCounter++), createdAt: new Date() };
  history.unshift(record);
  return record;
};

const getHistoryByUser = (userId, type, limit = 20, page = 1) => {
  let filtered = history.filter((h) => !userId || h.userId === userId);
  if (type) filtered = filtered.filter((h) => h.type === type);
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);
  return { records: paged, total };
};

const deleteHistoryById = (id) => {
  const idx = history.findIndex((h) => h.id === id);
  if (idx === -1) return false;
  history.splice(idx, 1);
  return true;
};

const clearHistoryByUser = (userId) => {
  const before = history.length;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].userId === userId) history.splice(i, 1);
  }
  return before - history.length;
};

module.exports = {
  findUserByEmail, findUserById, createUser,
  addHistory, getHistoryByUser, deleteHistoryById, clearHistoryByUser,
};
