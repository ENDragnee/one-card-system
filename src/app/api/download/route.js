// app/api/participants/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const university = searchParams.get('university');

  try {
    const [rows] = await db.execute(
      `SELECT p.*, u.name as university_name 
       FROM participant p 
       JOIN university u ON p.university = u.id 
       WHERE p.university = ?`,
      [university]
    );

    const formattedData = rows.map(row => ({
      photoUrl: row.photo,
      fullName: row.name,
      university: row.university_name,
      role: row.responsibility,
      idNumber: university,
      phone: row.phone_number,
      barcodeValue: row.barcode_id,
      honor: row.honor,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
