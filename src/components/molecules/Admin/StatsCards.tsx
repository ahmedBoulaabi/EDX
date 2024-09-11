"use client";

import { Trash, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { getAllTeachers } from "@/lib/supabase/teachers/mutations";
import { deleteUserByIdFromBoth } from "@/lib/supabase/users/mutations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModifyTeacherModal from "./ModifyTeacherModal";
import { teachers, users } from "@/lib/supabase/schema";
import { revalidatePath } from "next/cache";
import { GraduationCap, PersonStanding, ScrollText, Users } from "lucide-react";
import {
  getTotalCapacity,
  getTotalStudentsCount,
  getTotalTeachersCount,
  getTotalUsersCount,
} from "@/lib/supabase/users/queries";

const StatsCards = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersCount, studentsCount, teachersCount, capacity] =
          await Promise.all([
            getTotalUsersCount(),
            getTotalStudentsCount(),
            getTotalTeachersCount(),
            getTotalCapacity(),
          ]);
        //  console.log(usersCount);

        setTotalUsers(usersCount);
        setTotalStudents(studentsCount);
        setTotalTeachers(teachersCount);
        setTotalCapacity(capacity);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Teachers, Students, Accounts
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            Number of enrolled Students
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          <ScrollText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTeachers}</div>
          <p className="text-xs text-muted-foreground">Number of Teachers</p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          <PersonStanding className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCapacity}</div>
          <p className="text-xs text-muted-foreground">
            Total number of students that can join the university
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
