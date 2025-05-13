// types/index.ts
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  year: number;
  department: string;
  gender: string;
  pictureUrl?: string;
}

export const departments = [
  "Software Engineering", "Mechanical Engineering", "Applied Science",
  "Law", "Accounting", "Finance", "Business Administration"
] as const;

export type Department = typeof departments[number];

export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;
export type Gender = typeof GENDERS[number];

export const YEARS = [1, 2, 3, 4, 5] as const; // 5 for 5th year+
export type Year = typeof YEARS[number];

export const initialStudents: Student[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    year: 1,
    department: "Engineering",
    gender: "Female",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    year: 2,
    department: "Arts",
    gender: "Male"
  },
];