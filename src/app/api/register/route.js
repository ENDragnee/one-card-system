import { generateBarcode } from "@/lib/barcodeGenerator";
import db from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { universities } from "../../../types/list-of-uni";

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

const validateBase64Photo = (photo) => {
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif);base64,/;
  return base64Regex.test(photo);
};

const findValue = (university) => {
  const uni = universities.find((uni) => uni.name === university);
  return uni ? uni.max : 0;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, phoneNumber, university, responsibility, photo, honor, gender } = body;

    // const MAXVALUE = findValue(university);

    if (!fullName || !phoneNumber || !photo || !university || !gender) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (!validateBase64Photo(photo)) {
      return new Response(
        JSON.stringify({ error: "Invalid photo format. Must be base64 encoded." }),
        { status: 400 }
      );
    }

    const [universityRows] = await db.execute(
      `SELECT id FROM university WHERE name = ?`,
      [university]
    );
    const [maxUser] = await db.execute(
      `SELECT maxUser FROM university WHERE name = ?`,
      [university]
    );
    const MAXVALUE = maxUser[0].maxUser;

    if (universityRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "University not found" }),
        { status: 404 }
      );
    }

    const universityId = universityRows[0].id;

    // Check the number of participants from this university
    const [participantCount] = await db.execute(
      `SELECT COUNT(*) as count FROM participant WHERE university = ?`,
      [universityId]
    );

    if (participantCount[0].count >= MAXVALUE) {
      return new Response(
        JSON.stringify({ 
          error: "Registration limit reached for this university",
          current_count: participantCount[0].count,
          limit: MAXVALUE
        }),
        { status: 400 }
      );
    }

    const barcode_id = generateBarcode();
    const unique_id = uuidv4();

    const uploadDir = path.join(process.cwd(), "/public/uploads", university);
    await fs.mkdir(uploadDir, { recursive: true });

    const photoBuffer = Buffer.from(photo.split(",")[1], "base64");
    const idCardFilename = `${unique_id}.png`;
    const photoPath = path.join(uploadDir, idCardFilename);
    await fs.writeFile(photoPath, photoBuffer);

    const [result] = await db.execute(
      `INSERT INTO participant 
       (name, phone_number, university, responsibility, photo, barcode_id, honor, gender)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        phoneNumber,
        universityId,
        responsibility || null,
        `/uploads/${university}/${idCardFilename}`,
        barcode_id,
        honor || null,
        gender,
      ]
    );

    return new Response(
      JSON.stringify({
        message: "Participant registered successfully",
        participant: {
          id: result.insertId,
          name: fullName,
          phone_number: phoneNumber,
          university: universityId,
          responsibility,
          photo: `/uploads/${university}/${idCardFilename}`,
          barcode_id,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}