import bcrypt from 'bcryptjs';
import getDB from '../lib/db';

export interface Department {
  departmentId: string;
  departmentName: string;
  email: string;
  password: string;
  sectionName: string;
  employeeLevel: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createDepartment(department: Department): Promise<Department> {
  const db = await getDB();
  const hashedPassword = await bcrypt.hash(department.password, 10);
  
  await db.run(
    'INSERT INTO departments (departmentId, departmentName, email, password, sectionName, employeeLevel) VALUES (?, ?, ?, ?, ?, ?)',
    [
      department.departmentId,
      department.departmentName,
      department.email,
      hashedPassword,
      department.sectionName,
      department.employeeLevel
    ]
  );

  return { ...department, password: hashedPassword };
}

export async function findDepartmentById(departmentId: string): Promise<Department | null> {
  const db = await getDB();
  return await db.get('SELECT * FROM departments WHERE departmentId = ?', departmentId);
}

export async function findDepartmentByEmail(email: string): Promise<Department | null> {
  const db = await getDB();
  return await db.get('SELECT * FROM departments WHERE email = ?', email);
}

export async function updateDepartment(departmentId: string, updates: Partial<Department>): Promise<Department | null> {
  const db = await getDB();
  const department = await findDepartmentById(departmentId);
  
  if (!department) return null;

  const updatedDepartment = { ...department, ...updates };
  
  if (updates.password) {
    updatedDepartment.password = await bcrypt.hash(updates.password, 10);
  }

  await db.run(
    'UPDATE departments SET departmentName = ?, email = ?, password = ?, sectionName = ?, employeeLevel = ? WHERE departmentId = ?',
    [
      updatedDepartment.departmentName,
      updatedDepartment.email,
      updatedDepartment.password,
      updatedDepartment.sectionName,
      updatedDepartment.employeeLevel,
      departmentId
    ]
  );

  return updatedDepartment;
}

export async function deleteDepartment(departmentId: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.run('DELETE FROM departments WHERE departmentId = ?', departmentId);
  return result.changes > 0;
}

export async function getAllDepartments(): Promise<Department[]> {
  const db = await getDB();
  return await db.all('SELECT * FROM departments ORDER BY createdAt DESC');
}