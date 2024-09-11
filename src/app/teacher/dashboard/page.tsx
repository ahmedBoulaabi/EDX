import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  GraduationCap,
  PersonStanding,
  ScrollText,
  Trash,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddStudentModal from "@/components/molecules/Teacher/AddStudentModal";
import AddStudentsFromCSVModal from "@/components/molecules/Teacher/AddStudentsFromCSVModal";
import StudentList from "@/components/molecules/Teacher/StudentList";
import EnrollmentList from "@/components/molecules/Teacher/EnrollmentList";
import StatsCards from "@/components/molecules/Teacher/StatsCards";

function TeacherDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col pt-24">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Enrollment Requests</CardTitle>
              <CardDescription>The most Enrollment Requests.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <EnrollmentList />
          </CardContent>
        </Card>
        {/* List of students */}
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
              <CardTitle>Students</CardTitle>
              <CardDescription>
                A list of your students by alphabetical order.
              </CardDescription>
            </div>
            <div className="flex items-center">
              <AddStudentsFromCSVModal />
              <AddStudentModal />
            </div>
          </CardHeader>
          <CardContent>
            <StudentList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default TeacherDashboard;
