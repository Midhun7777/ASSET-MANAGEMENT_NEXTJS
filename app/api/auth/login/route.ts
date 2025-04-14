import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findDepartmentById } from '../../../models/Department';

export async function POST(request: Request) {
  try {
    const { departmentId, password } = await request.json();

    // Validate required fields
    if (!departmentId || !password) {
      return NextResponse.json(
        { message: 'Department ID and password are required' },
        { status: 400 }
      );
    }

    // Find department by ID
    const department = await findDepartmentById(departmentId);
    if (!department) {
      return NextResponse.json(
        { message: 'Invalid department ID or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, department.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid department ID or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...departmentWithoutPassword } = department;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: departmentWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}