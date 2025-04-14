import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDepartment, findDepartmentById, findDepartmentByEmail } from '../../../models/Department';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      departmentId,
      departmentName,
      email,
      password,
      sectionName,
      employeeLevel
    } = body;

    // Validate required fields
    if (!departmentId || !departmentName || !email || !password || !sectionName || !employeeLevel) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if department ID already exists
    const existingDepartment = await findDepartmentById(departmentId);
    if (existingDepartment) {
      return NextResponse.json(
        { success: false, message: 'Department ID already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await findDepartmentByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new department
    const department = await createDepartment({
      departmentId,
      departmentName,
      email,
      password,
      sectionName,
      employeeLevel
    });

    // Remove password from response
    const { password: _, ...departmentWithoutPassword } = department;

    return NextResponse.json({
      success: true,
      message: 'Department registered successfully!',
      data: departmentWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create department' },
      { status: 500 }
    );
  }
}