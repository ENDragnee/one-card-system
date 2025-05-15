// types/index.ts
export interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  barcodeId: string;
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
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Economics",
  "Law",
  "Medicine",
  "Nursing",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Psychology",
  "Sociology",
  "Architecture",
  "Fine Arts",
  "Other", // Good to have an "Other" option
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