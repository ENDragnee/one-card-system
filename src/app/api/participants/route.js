"use strict";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from '@/lib/db';

export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get participants for the logged-in university
    const [participants] = await db.query(
      `SELECT p.*, u.name as university_name 
       FROM participant p 
       LEFT JOIN university u ON p.university = u.id 
       WHERE p.university = ?`,
      [session.user.id] // Using the university ID from the session
    );
    

    return NextResponse.json(participants);

  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Retrieve photo path before deletion
    const [participant] = await db.query('SELECT photo FROM participant WHERE id = ?', [id]);

    if (!participant || participant.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const photoPath = participant[0].photo;

    // Delete the participant
    const [result] = await db.query('DELETE FROM participant WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Remove the image file if it exists
    if (photoPath) {
      const fs = require('fs');
      const path = require('path');
      const fullPhotoPath = path.join(process.cwd(), 'public', photoPath);

      fs.unlink(fullPhotoPath, (err) => {
        if (err) {
          console.error(`Error deleting photo: ${fullPhotoPath}`, err);
        } else {
          console.log(`Photo deleted: ${fullPhotoPath}`);
        }
      });
    }

    return NextResponse.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  }
}