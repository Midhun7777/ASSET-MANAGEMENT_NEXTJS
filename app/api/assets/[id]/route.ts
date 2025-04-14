import { NextResponse } from 'next/server';
import getDB from '../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    const asset = await db.get('SELECT * FROM assets WHERE assetId = ?', params.id);
    
    if (!asset) {
      return NextResponse.json(
        { success: false, message: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    const body = await request.json();
    const {
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
    if (!assetName || !assetType || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Additional validation for employee type assets
    if (assetType.toLowerCase() === 'employee') {
      if (!employeeName || !employeeId || !section || !employeeLevel) {
        return NextResponse.json(
          { success: false, message: 'Missing required employee fields' },
          { status: 400 }
        );
      }
    }

    // Check if asset exists
    const existingAsset = await db.get('SELECT assetId FROM assets WHERE assetId = ?', params.id);
    if (!existingAsset) {
      return NextResponse.json(
        { success: false, message: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update asset
    await db.run(`
      UPDATE assets SET
        assetName = ?,
        assetType = ?,
        assignedTo = ?,
        status = ?,
        location = ?,
        purchaseDate = ?,
        lastMaintenance = ?,
        nextMaintenance = ?,
        condition = ?,
        notes = ?,
        employeeName = ?,
        employeeId = ?,
        section = ?,
        employeeLevel = ?,
        idDocument = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE assetId = ?
    `,
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
    idDocument,
    params.id
    );

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully'
    });

  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    
    // Check if asset exists
    const existingAsset = await db.get('SELECT assetId FROM assets WHERE assetId = ?', params.id);
    if (!existingAsset) {
      return NextResponse.json(
        { success: false, message: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete asset
    await db.run('DELETE FROM assets WHERE assetId = ?', params.id);

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