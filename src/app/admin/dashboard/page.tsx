import { GraduationCap, PersonStanding, ScrollText, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddTeacherModal from "@/components/molecules/Admin/AddTeacherModal";
import React, { useEffect, useState } from "react";
import TeacherList from "@/components/molecules/Admin/TeachersList";
import {
  getTotalStudentsCount,
  getTotalTeachersCount,
  getTotalUsersCount,
} from "@/lib/supabase/users/queries";
import StatsCards from "@/components/molecules/Admin/StatsCards";

function AdminDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col pt-24">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />

        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Teachers</CardTitle>
              <CardDescription>List of all teachers</CardDescription>
            </div>
            <AddTeacherModal />
          </CardHeader>
          <CardContent>
            <TeacherList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;
