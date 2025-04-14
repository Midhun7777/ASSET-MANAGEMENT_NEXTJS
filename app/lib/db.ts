import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

let db: Database | null = null;

async function initializeDB() {
  if (db) return db;

  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      departmentId TEXT PRIMARY KEY,
      departmentName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      sectionName TEXT NOT NULL,
      employeeLevel TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      assetId TEXT PRIMARY KEY,
      assetName TEXT NOT NULL,
      assetType TEXT NOT NULL,
      assignedTo TEXT,
      status TEXT NOT NULL,
      location TEXT,
      purchaseDate TEXT,
      lastMaintenance TEXT,
      nextMaintenance TEXT,
      condition TEXT,
      notes TEXT,
      employeeName TEXT,
      employeeId TEXT,
      section TEXT,
      employeeLevel TEXT,
      idDocument TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES departments(departmentId)
    );

    CREATE TABLE IF NOT EXISTS admins (
      adminId TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create triggers for updating timestamps
    CREATE TRIGGER IF NOT EXISTS update_departments_timestamp 
    AFTER UPDATE ON departments
    BEGIN
      UPDATE departments SET updatedAt = CURRENT_TIMESTAMP WHERE departmentId = NEW.departmentId;
    END;

    CREATE TRIGGER IF NOT EXISTS update_assets_timestamp 
    AFTER UPDATE ON assets
    BEGIN
      UPDATE assets SET updatedAt = CURRENT_TIMESTAMP WHERE assetId = NEW.assetId;
    END;

    CREATE TRIGGER IF NOT EXISTS update_admins_timestamp 
    AFTER UPDATE ON admins
    BEGIN
      UPDATE admins SET updatedAt = CURRENT_TIMESTAMP WHERE adminId = NEW.adminId;
    END;
  `);

  return db;
}

export default async function getDB() {
  if (!db) {
    db = await initializeDB();
  }
  return db;
}

// Initialize the database when this module is imported
initializeDB().catch(console.error);