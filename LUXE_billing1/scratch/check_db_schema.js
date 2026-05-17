import Database from 'better-sqlite3';
const db = new Database('sqlite.db');
const info = db.pragma('table_info(products)');
console.log(JSON.stringify(info, null, 2));
db.close();
