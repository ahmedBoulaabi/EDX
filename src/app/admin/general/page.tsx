import AddCourseModal from "@/components/molecules/Admin/AddCourseModal";
import AddProgramModal from "@/components/molecules/Admin/AddProgramModal";
import AddSchoolYearModal from "@/components/molecules/Admin/AddSchoolYear";
import AddStudentTypeModal from "@/components/molecules/Admin/AddStudentType";
import CourseTable from "@/components/molecules/Admin/CoursesTable";
import ProgramsTable from "@/components/molecules/Admin/ProgramsTable";
import SchoolYearTable from "@/components/molecules/Admin/SchoolYearTable";
import StudentTypesTable from "@/components/molecules/Admin/StudentTypesTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const General = () => {
  return (
    <div className="px-[2.5%] py-32">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="col-span-4 lg:col-span-2 h-fit space-y-4">
          {/* Programs */}
          <Card
            className="col-span-4 lg:col-span-2 h-fit"
            x-chunk="dashboard-01-chunk-1"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Programs</CardTitle>
                <CardDescription>Manage Programs Here</CardDescription>
              </div>
              <AddProgramModal />
            </CardHeader>
            <CardContent>
              {/* Table */}
              <ProgramsTable />
            </CardContent>
          </Card>

          {/* Courses */}
          <Card
            className="col-span-4 lg:col-span-2 h-fit"
            x-chunk="dashboard-01-chunk-1"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Courses</CardTitle>
                <CardDescription>Manage Courses Here</CardDescription>
              </div>

              <AddCourseModal />
            </CardHeader>

            <CardContent>
              {/* Table */}
              <CourseTable />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-4 lg:col-span-2 h-fit space-y-4">
          {/* Student Types */}
          <Card
            x-chunk="dashboard-01-chunk-4"
            className="col-span-4 lg:col-span-2 h-fit"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Student Types</CardTitle>
                <CardDescription>Manage StudentTypes Here</CardDescription>
              </div>
              <AddStudentTypeModal />
            </CardHeader>
            <CardContent>
              <StudentTypesTable />
            </CardContent>
          </Card>

          {/* School Year */}
          <Card
            x-chunk="dashboard-01-chunk-4"
            className="col-span-4 lg:col-span-2 h-fit"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>School Years</CardTitle>
                <CardDescription>Manage School Years Here</CardDescription>
              </div>
              <AddSchoolYearModal />
            </CardHeader>
            <CardContent>
              <SchoolYearTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default General;
