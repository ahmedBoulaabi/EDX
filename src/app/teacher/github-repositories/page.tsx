import {
  GraduationCap,
  PersonStanding,
  ScrollText,
  Users,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import RepositoriesList from "@/components/molecules/Teacher/RepositoriesList";

function GithubRepositories() {
  return (
    <div className="flex min-h-screen w-full flex-col pt-24">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3200</div>
                <p className="text-xs text-muted-foreground">Student Dashboard</p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2350</div>
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
                <div className="text-2xl font-bold">80</div>
                <p className="text-xs text-muted-foreground">
                  Number of Teachers
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Capacity
                </CardTitle>
                <PersonStanding className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4145</div>
                <p className="text-xs text-muted-foreground">
                  Total number of students that can join the university
                </p>
              </CardContent>
            </Card>
          </div> */}
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Repositories</CardTitle>
              {/* <CardDescription>The most Enrollment Requests.</CardDescription> */}
            </div>
            {/* <Button asChild size="sm" className="ml-auto gap-1"> */}
            {/* <Link href="/student/enrollment-form">
                  <Plus className="h-4 w-4" />
                  Send new request
                </Link>
              </Button> */}
            {/* <SendEnrollmentRequest /> */}
          </CardHeader>
          <CardContent>
            <RepositoriesList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default GithubRepositories;
