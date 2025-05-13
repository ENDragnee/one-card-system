// lib/data.ts
import { Student } from "@/types";

export const initialStudents: Student[] = [
  { id: "S001", firstName: "Abebe", lastName: "Bekele", email: "abebe@example.com", phone: "0911223344", year: 1, department: "Software Engineering", gender: "Male", pictureUrl: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "S002", firstName: "Chaltu", lastName: "Gemechu", email: "chaltu@example.com", phone: "0922334455", year: 2, department: "Mechanical Engineering", gender: "Female", pictureUrl: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "S003", firstName: "Kebede", lastName: "Alemu", email: "kebede@example.com", phone: "0933445566", year: 1, department: "Software Engineering", gender: "Male", pictureUrl: "https://randomuser.me/api/portraits/men/3.jpg" },
  // ... (add more students)
];

export const departments = [
    "Software Engineering",
    "Mechanical Engineering",
    "Applied Science",
    "Law",
    "Accounting",
    "Finance",
    "Business Administration"
]