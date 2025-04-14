import { RowDataPacket } from 'mysql2';
import db from '../lib/db';

export interface Asset extends RowDataPacket {
  assetId: string;
  assetName: string;
  assetType: string;
  assignedTo: string | null;
  status: string;
  // Employee specific fields
  employeeName?: string;
  employeeId?: string;
  section?: string;
  employeeLevel?: string;
  idDocument?: string;
  // Common fields
  location: string | null;
  purchaseDate: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  condition: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

zexport async function createAsset(data: Omit<Asset, 'createdAt' | 'updatedAt'>): Promise<Asset | null> {
  const stmt = db.prepare(`
    INSERT INTO assets (
      assetId, assetName, assetType, assignedTo,
      status, location, purchaseDate, lastMaintenance,
      nextMaintenance, condition, notes,
      employeeName, employeeId, section, employeeLevel, idDocument
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.assetId,
    data.assetName,
    data.assetType,
    data.assignedTo,
    data.status,
    data.location,
    data.purchaseDate,
    data.lastMaintenance,
    data.nextMaintenance,
    data.condition,
    data.notes,
    data.employeeName,
    data.employeeId,
    data.section,
    data.employeeLevel,
    data.idDocument
  );

  return findAssetById(data.assetId);
}

export async function findAssetById(assetId: string): Promise<Asset | null> {
  const stmt = db.prepare('SELECT * FROM assets WHERE assetId = ?');
  return stmt.get(assetId) as Asset | null;
}

export async function findAssetsByDepartment(departmentId: string): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE assignedTo = ? ORDER BY createdAt DESC');
  return stmt.all(departmentId) as Asset[];
}

export async function updateAsset(
  assetId: string,
  data: Partial<Omit<Asset, 'assetId' | 'createdAt' | 'updatedAt'>>
): Promise<Asset | null> {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = [...fields.map(field => data[field as keyof typeof data]), assetId];

  const stmt = db.prepare(`
    UPDATE assets 
    SET ${setClause}
    WHERE assetId = ?
  `);

  stmt.run(...values);
  return findAssetById(assetId);
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM assets WHERE assetId = ?');
  const result = stmt.run(assetId);
  return result.changes > 0;
}

export async function getAllAssets(): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets ORDER BY createdAt DESC');
  return stmt.all() as Asset[];
}

export async function getAvailableAssets(): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE status = ? ORDER BY createdAt DESC');
  return stmt.all('Available') as Asset[];
}

export async function getAssetsByStatus(status: Asset['status']): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE status = ? ORDER BY createdAt DESC');
  return stmt.all(status) as Asset[];
}

export async function getAssetsByCondition(condition: Asset['condition']): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE condition = ? ORDER BY createdAt DESC');
  return stmt.all(condition) as Asset[];
}

export async function getAssetsNeedingMaintenance(): Promise<Asset[]> {
  const stmt = db.prepare(`
    SELECT * FROM assets 
    WHERE nextMaintenance <= date('now', '+30 days')
    AND status != 'Retired'
    ORDER BY nextMaintenance ASC
  `);
  return stmt.all() as Asset[];
}

const assetModel = {
  createAsset,
  findAssetById,
  findAssetsByDepartment,
  updateAsset,
  deleteAsset,
  getAllAssets
};

export default assetModel; 