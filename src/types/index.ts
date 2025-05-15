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
  "Freshman",
  "Management",
  "Economics",
  "Accounting",
  "Animal Science",
  "Horticulture",
  "Natural Resource Management",
  "Plant Science",
  "Clinical Nursing",
  "Veterinary Medicine",
  "Computer Science",
  "Chemical Engineering",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Geology/Earth Science",
  "English Language and Literature",
  "Ethiopian Language and Literature (Amharic)",
  "Sociology",
  "History and Heritage Management",
  "Geography and Environmental Studies",
  "Anthropology"
] as const;

export type Department = typeof departments[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = typeof GENDERS[number];

export const YEARS = [1, 2, 3, 4, 5] as const; // 5 for 5th year+
export type Year = typeof YEARS[number];
export const yearMap: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
  5: "5th+ Year",
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