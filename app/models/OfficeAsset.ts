import { RowDataPacket } from 'mysql2';
import db from '../lib/db';

export interface OfficeAsset extends RowDataPacket {
  assetId: string;
  assetName: string;
  assetType: string;
  assignedTo: string | null;
  status: string;
  location: string | null;
  purchaseDate: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  condition: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createOfficeAsset(data: Omit<OfficeAsset, 'createdAt' | 'updatedAt'>): Promise<OfficeAsset | null> {
  const stmt = db.prepare(`
    INSERT INTO assets (
      assetId, assetName, assetType, assignedTo,
      status, location, purchaseDate, lastMaintenance,
      nextMaintenance, condition, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    data.notes
  );

  return findOfficeAssetById(data.assetId);
}

export async function findOfficeAssetById(assetId: string): Promise<OfficeAsset | null> {
  const stmt = db.prepare('SELECT * FROM assets WHERE assetId = ?');
  return stmt.get(assetId) as OfficeAsset | null;
}

export async function findOfficeAssetsByDepartment(departmentId: string): Promise<OfficeAsset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE assignedTo = ? ORDER BY createdAt DESC');
  return stmt.all(departmentId) as OfficeAsset[];
}

export async function updateOfficeAsset(
  assetId: string,
  data: Partial<Omit<OfficeAsset, 'assetId' | 'createdAt' | 'updatedAt'>>
): Promise<OfficeAsset | null> {
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
  return findOfficeAssetById(assetId);
}

export async function deleteOfficeAsset(assetId: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM assets WHERE assetId = ?');
  const result = stmt.run(assetId);
  return result.changes > 0;
}

export async function getAllOfficeAssets(): Promise<OfficeAsset[]> {
  const stmt = db.prepare('SELECT * FROM assets ORDER BY createdAt DESC');
  return stmt.all() as OfficeAsset[];
}

const officeAssetModel = {
  createOfficeAsset,
  findOfficeAssetById,
  findOfficeAssetsByDepartment,
  updateOfficeAsset,
  deleteOfficeAsset,
  getAllOfficeAssets
};

export default officeAssetModel;