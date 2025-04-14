import { NextResponse } from 'next/server';
import getDB from '../../lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const assets = await db.all(`
      SELECT 
        *,
        CASE 
          WHEN idDocument IS NOT NULL AND idDocument != '' 
          THEN idDocument 
          ELSE NULL 
        END as certificate
      FROM assets 
      ORDER BY createdAt DESC
    `);
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received asset data:', body);
    
    const {
      assetId,
      assetName,
      assetType,
      assignedTo = null,
      status,
      location = null,
      purchaseDate = null,
      lastMaintenance = null,
      nextMaintenance = null,
      condition = null,
      notes = null,
      employeeName = null,
      employeeId = null,
      section = null,
      employeeLevel = null,
      idDocument = null
    } = body;

    // Validate required fields
    if (!assetId || !assetName || !assetType || !status) {
      console.log('Missing required fields:', { assetId, assetName, assetType, status });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Additional validation for employee type assets
    if (assetType.toLowerCase() === 'employee') {
      if (!employeeName || !employeeId || !section || !employeeLevel) {
        console.log('Missing required employee fields:', { employeeName, employeeId, section, employeeLevel });
        return NextResponse.json(
          { success: false, message: 'Missing required employee fields' },
          { status: 400 }
        );
      }
    }

    // Validate certificate/ID document
    if (!idDocument) {
      return NextResponse.json(
        { success: false, message: 'Please upload a certificate or ID document' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Check if asset ID already exists
    const existingAsset = await db.get('SELECT assetId FROM assets WHERE assetId = ?', assetId);
    if (existingAsset) {
      console.log('Asset ID already exists:', assetId);
      return NextResponse.json(
        { success: false, message: 'Asset ID already exists' },
        { status: 400 }
      );
    }

    // Insert new asset
    try {
      const result = await db.run(`
        INSERT INTO assets (
          assetId, assetName, assetType, assignedTo,
          status, location, purchaseDate, lastMaintenance,
          nextMaintenance, condition, notes,
          employeeName, employeeId, section, employeeLevel, idDocument,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        assetId,
        assetName,
        assetType,
        assignedTo,
        status,
        location,
        purchaseDate,
        lastMaintenance,
        nextMaintenance,
        condition,
        notes,
        employeeName,
        employeeId,
        section,
        employeeLevel,
        idDocument
      ]);
      
      console.log('Asset created successfully:', assetId);

      // Fetch the created asset to return it
      const createdAsset = await db.get(`
        SELECT 
          *,
          idDocument as certificate
        FROM assets 
        WHERE assetId = ?
      `, [assetId]);

      return NextResponse.json({
        success: true,
        message: 'Asset created successfully',
        asset: createdAsset
      }, { status: 201 });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error while creating asset: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create asset: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}