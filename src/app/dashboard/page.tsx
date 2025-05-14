// app/dashboard/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { initialStudents, departments as departmentList } from "@/lib/data"; // Use your actual data source
import { Student } from "@/types";
import { Sidebar } from "@/components/layout/sidebar";


interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

function AnalyticsCard({ title, value, description }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {/* Optional: Icon here */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DataListItem {
  label: string;
  value: number | string;
}

function DataListCard({ title, items }: { title: string, items: DataListItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.label} className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No data available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  // In a real app, students data would come from a context, Zustand, or API fetch
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const totalStudents = students.length;
  const totalDepartments = departmentList.length;
  const averageYearLevel = useMemo(() => {
    if (students.length === 0) return "-";
    const sum = students.reduce((acc, s) => acc + s.year, 0);
    return (sum / students.length).toFixed(1);
  }, [students]);

  const studentsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    departmentList.forEach(dept => counts[dept] = 0);
    students.forEach(student => {
      if (counts.hasOwnProperty(student.department)) {
        counts[student.department]++;
      }
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [students]);

  const studentsByYear = useMemo(() => {
    const yearMap: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year', 5: '5th+ Year' };
    const counts: Record<string, number> = {};
    Object.values(yearMap).forEach(label => counts[label] = 0);

    students.forEach(student => {
      const yearLabel = yearMap[student.year as keyof typeof yearMap] || `${student.year}th Year`;
       if (counts.hasOwnProperty(yearLabel)) {
        counts[yearLabel]++;
      } else {
        counts[yearLabel] = 1; // Should not happen if yearMap is comprehensive
      }
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [students]);


  return (
    <>
      <PageHeader title="Dashboard" showSearch={true}/>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <AnalyticsCard title="Total Students" value={totalStudents} />
        <AnalyticsCard title="Departments" value={totalDepartments} />
        <AnalyticsCard title="Average Year Level" value={averageYearLevel} />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <DataListCard title="Students per Department" items={studentsByDept} />
        <DataListCard title="Students per Year" items={studentsByYear} />
      </div>
    </>
  );
}