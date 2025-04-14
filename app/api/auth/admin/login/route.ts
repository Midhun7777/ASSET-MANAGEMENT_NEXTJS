import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDB from '../../../../lib/db';

// This should match the key in your .env file
const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', username);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      success: true,
      data: adminWithoutPassword
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 