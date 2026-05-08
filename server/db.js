import fs from 'fs/promises';
import path from 'path';
import * as mariadb from 'mariadb';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: 5,
  multipleStatements: true,
  bigIntAsNumber: true
};

const databaseName = process.env.DB_NAME || 'stickermania';

const pool = mariadb.createPool({
  ...connectionConfig,
  database: databaseName
});

export async function query(sql, params = []) {
  let connection;

  try {
    connection = await pool.getConnection();
    return await connection.query(sql, params);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function runInTransaction(callback) {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function ensureSchema() {
  const adminPool = mariadb.createPool(connectionConfig);
  const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  try {
    let connection;

    try {
      connection = await adminPool.getConnection();
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    } finally {
      if (connection) {
        connection.release();
      }
    }

    for (const statement of statements) {
      try {
        await query(statement);
      } catch (err) {
        // 1060 = duplicate column name — column already exists, safe to skip
        if (err.errno !== 1060) throw err;
      }
    }
  } finally {
    await adminPool.end();
  }
}

export default pool;
