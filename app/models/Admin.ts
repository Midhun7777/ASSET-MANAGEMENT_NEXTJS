import { RowDataPacket } from 'mysql2';
import getDB from '../lib/db';
import bcrypt from 'bcryptjs';

export interface Admin extends RowDataPacket {
  adminId: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createAdmin(data: Omit<Admin, 'createdAt' | 'updatedAt'>): Promise<Admin | null> {
  const db = await getDB();
  await db.run(
    'INSERT INTO admins (adminId, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [data.adminId, data.username, data.email, data.password, data.role]
  );
  return findAdminById(data.adminId);
}

export async function findAdminById(adminId: string): Promise<Admin | null> {
  const db = await getDB();
  const admin = await db.get('SELECT * FROM admins WHERE adminId = ?', adminId);
  return admin || null;
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const db = await getDB();
  const admin = await db.get('SELECT * FROM admins WHERE email = ?', email);
  return admin || null;
}

export async function findAdminByUsername(username: string): Promise<Admin | null> {
  const db = await getDB();
  const admin = await db.get('SELECT * FROM admins WHERE username = ?', username);
  return admin || null;
}

export async function updateAdmin(
  adminId: string,
  data: Partial<Omit<Admin, 'adminId' | 'createdAt' | 'updatedAt'>>
): Promise<Admin | null> {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = [...fields.map(field => data[field as keyof typeof data]), adminId];

  const db = await getDB();
  await db.run(`UPDATE admins SET ${setClause} WHERE adminId = ?`, values);
  return findAdminById(adminId);
}

export async function deleteAdmin(adminId: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.run('DELETE FROM admins WHERE adminId = ?', adminId);
  return (result?.changes ?? 0) > 0;
}

export async function getAllAdmins(): Promise<Admin[]> {
  const db = await getDB();
  const admins = await db.all('SELECT * FROM admins ORDER BY createdAt DESC');
  return admins || [];
}

export async function getAdminsByRole(role: Admin['role']): Promise<Admin[]> {
  const db = await getDB();
  const admins = await db.all('SELECT * FROM admins WHERE role = ? ORDER BY createdAt DESC', role);
  return admins || [];
}

const adminModel = {
  createAdmin,
  findAdminById,
  findAdminByEmail,
  findAdminByUsername,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  getAdminsByRole
};

export default adminModel;