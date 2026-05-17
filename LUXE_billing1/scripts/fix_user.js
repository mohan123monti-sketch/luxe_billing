import Database from 'better-sqlite3';
const db = new Database('sqlite.db');
db.exec("UPDATE users SET id = 'admin-uuid'");
db.close();
console.log('Updated user ID to admin-uuid');
