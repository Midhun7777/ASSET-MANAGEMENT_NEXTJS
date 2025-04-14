import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDB from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email, role, adminKey } = body;

    // Validate required fields
    if (!username || !password || !email || !role || !adminKey) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify admin key
    const validAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'admin-key-2024';
    if (adminKey !== validAdminKey) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin key' },
        { status: 401 }
      );
    }

    const db = await getDB();

    // Check if username already exists
    const existingUsername = await db.get('SELECT username FROM admins WHERE username = ?', username);
    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.get('SELECT email FROM admins WHERE email = ?', email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate admin ID
    const adminId = 'ADM' + Date.now().toString();

    // Create admin
    await db.run(
      'INSERT INTO admins (adminId, username, password, email, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, username, hashedPassword, email, role]
    );

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: { adminId, username, email, role }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create admin' },
      { status: 500 }
    );
  }
} 