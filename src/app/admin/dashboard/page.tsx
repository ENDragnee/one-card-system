// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  isLoading?: boolean;
}

function AnalyticsCard({ title, value, description, isLoading }: AnalyticsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-2/3" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          {description && <Skeleton className="h-3 w-full" />}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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

interface DataListCardProps {
  title: string;
  items: DataListItem[];
  isLoading?: boolean;
}

function DataListCard({ title, items, isLoading }: DataListCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-1/3" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="flex justify-between text-sm">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </li>
          ))}
        </CardContent>
      </Card>
    );
  }
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

interface DashboardData {
  totalStudents: number;
  totalDepartments: number;
  averageYearLevel: string;
  studentsByDept: DataListItem[];
  studentsByYear: DataListItem[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/dashboard/analytics");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" showSearch={false} /> {/* Disabled search for now, can be re-enabled */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <AnalyticsCard
          title="Total Students"
          value={data?.totalStudents ?? "-"}
          isLoading={isLoading}
        />
        <AnalyticsCard
          title="Departments"
          value={data?.totalDepartments ?? "-"}
          isLoading={isLoading}
        />
        <AnalyticsCard
          title="Average Year Level"
          value={data?.averageYearLevel ?? "-"}
          isLoading={isLoading}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <DataListCard
          title="Students per Department"
          items={data?.studentsByDept ?? []}
          isLoading={isLoading}
        />
        <DataListCard
          title="Students per Year"
          items={data?.studentsByYear ?? []}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}