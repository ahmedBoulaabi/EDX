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
import { teachers, users } from "@/lib/supabase/schema";
import { revalidatePath } from "next/cache";
import { GraduationCap, PersonStanding, ScrollText, Users } from "lucide-react";
import {
  getEnrolledStudentsCount,
  getTotalCoursesCount,
  getTotalEnrollmentRequestsCount,
} from "@/lib/supabase/users/queries";

const StatsCards = () => {
  const [enrolledStudents, setEnrolledStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [enrollmentRequests, setEnrollmentRequests] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [enrolledStudentsCount, coursesCount, enrollmentRequestsCount] =
          await Promise.all([
            getEnrolledStudentsCount(),
            getTotalCoursesCount(),
            getTotalEnrollmentRequestsCount(),
          ]);

        setEnrolledStudents(enrolledStudentsCount);
        setTotalCourses(coursesCount);
        setEnrollmentRequests(enrollmentRequestsCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrolledStudents}</div>
          <p className="text-xs text-muted-foreground">
            Number of enrolled Students
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            Teachers, Students, Accounts
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Enrollment Requests
          </CardTitle>
          <ScrollText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrollmentRequests}</div>
          <p className="text-xs text-muted-foreground">
            Number of Requests awaiting your decision.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
