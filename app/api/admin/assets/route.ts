import { NextResponse } from 'next/server';
import getDB from '../../../lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const assets = await db.all(`
      SELECT 
        a.*,
        d.departmentName,
        d.sectionName,
        d.employeeLevel,
        CASE 
          WHEN a.idDocument IS NOT NULL AND a.idDocument != '' 
          THEN a.idDocument 
          ELSE NULL 
        END as certificate
      FROM assets a
      LEFT JOIN departments d ON a.assignedTo = d.departmentId
      ORDER BY a.createdAt DESC
    `);

    // Transform the data to ensure URLs are properly formatted
    const transformedAssets = assets.map(asset => {
      if (asset.idDocument) {
        // Keep the URL as a relative path
        asset.idDocument = asset.idDocument.replace(/^https?:\/\/[^/]+/, '');
      }
      return asset;
    });
    
    console.log('Sending assets:', transformedAssets);
    return NextResponse.json(transformedAssets);
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
    } = body;

    // Validate required fields
    if (!assetId || !assetName || !assetType || !status) {
      console.log('Missing required fields:', { assetId, assetName, assetType, status });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize asset type to lowercase for consistent comparison
    const normalizedAssetType = assetType.toLowerCase();
    console.log('Normalized asset type:', normalizedAssetType);

    // Additional validation for employee type assets
    if (normalizedAssetType === 'employee') {
      console.log('Validating employee fields:', { employeeName, employeeId, section, employeeLevel });
      if (!employeeName || !employeeId || !section || !employeeLevel) {
        console.log('Missing required employee fields:', { employeeName, employeeId, section, employeeLevel });
        return NextResponse.json(
          { success: false, message: 'Missing required employee fields' },
          { status: 400 }
        );
      }
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

    // Check if assigned department exists
    if (assignedTo) {
      const department = await db.get('SELECT departmentId FROM departments WHERE departmentId = ?', assignedTo);
      if (!department) {
        console.log('Assigned department not found:', assignedTo);
        return NextResponse.json(
          { success: false, message: 'Assigned department not found' },
          { status: 400 }
        );
      }
    }

    try {
      await db.run(`
        INSERT INTO assets (
          assetId, assetName, assetType, assignedTo,
          status, location, purchaseDate, lastMaintenance,
          nextMaintenance, condition, notes,
          employeeName, employeeId, section, employeeLevel, idDocument
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
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
      );
      console.log('Asset created successfully:', assetId);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error while creating asset: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Asset created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create asset: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Check if asset exists
    const existingAsset = await db.get('SELECT assetId FROM assets WHERE assetId = ?', assetId);
    if (!existingAsset) {
      return NextResponse.json(
        { success: false, message: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete the asset
    await db.run('DELETE FROM assets WHERE assetId = ?', assetId);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}