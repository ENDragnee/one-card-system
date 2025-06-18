// types/index.ts
export interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  barcode_id: string;
  email: string;
  phone?: string;
  year: number;
  batch: string;
  department: string;
  gender: string;
  photo?: string;
}

export const departments = [
  "Bachelor of Science Degree in Archtecture",
  "Bachelor od Science Degree in Civil Engineering",
  "Bachelor of Science Degree in Mining Engineering",
  "Bachelor of Science Degree in Chemical Engineering",
  "Bachelor of Science Degree in Environmental Engineering",
  "Bachelor of Science Degree in Electrical and Computer Engineering",
  "Bachelor of Science Degree in Electromechanical Engineering",
  "Bachelor of Science Degree in Mechanical Engineering",
  "Bachelor of Science Degree in Software Engineering",
  "Bachelor of Science Degree in Food Sciences and Applied Nutrition",
  "Bachelor of Science Degree in Geology",
  "Bachelor of Science Degree in Biotechnology",
  "Bachelor of Science Degree in Industrial Chemistry"
] as const;

export type Department = typeof departments[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = typeof GENDERS[number];

export const YEARS = [1, 2, 3, 4, 5] as const; // 5 for 5th year+
export type Year = typeof YEARS[number];
export const yearMap: Record<number, string> = {
  4: "4th Year",
  5: "5th Year",
  6: "6th+ Year",
};
export type YearLabel = typeof yearMap[keyof typeof yearMap];

export interface StudentIdData {
  id: string; // Student's unique database ID (can be number too, but string is safer for URLs)
  name: string; // Full name: "ABEBECH KEBEBEW"
  username: string; // ID Number for the card: "A2STU/ID/0012345"
  department: string | null; // "Software Engineering"
  photo: string | null; // URL to the photo
  academicYear: string; // Formatted academic year string: "3rd Year / 2023-2024"
  barcodeValue: string; // Value for the barcode, usually the username/student ID
}