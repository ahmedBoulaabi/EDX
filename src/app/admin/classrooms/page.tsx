import AddBuildingModal from "@/components/molecules/Admin/AddBuildingModal";
import AddClassroomModal from "@/components/molecules/Admin/AddClassroomModal";
import BuildingsTable from "@/components/molecules/Admin/BuildingsTable";
import ClassroomsTable from "@/components/molecules/Admin/ClassroomsTable";
import RoomPlansTable from "@/components/molecules/Admin/RoomPlansTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

const AdminClassrooms = () => {
  return (
    <div className="px-[2.5%] py-32">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="col-span-4 lg:col-span-3 h-fit space-y-4">
          {/* Classrooms */}
          <Card
            className="col-span-4 lg:col-span-3 h-fit"
            x-chunk="dashboard-01-chunk-1"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Classrooms</CardTitle>
                <CardDescription>Manage Classrooms Here</CardDescription>
              </div>
              <AddClassroomModal />
            </CardHeader>
            <CardContent>
              {/* Table */}
              <ClassroomsTable />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 lg:col-span-1 h-fit space-y-4">
          {/* Buildings */}
          <Card
            className="col-span-4 lg:col-span-1 h-fit"
            x-chunk="dashboard-01-chunk-1"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Buildings</CardTitle>
                <CardDescription>Manage Buildings Here</CardDescription>
              </div>
              <AddBuildingModal />
            </CardHeader>
            <CardContent>
              {/* Table */}
              <BuildingsTable />
            </CardContent>
          </Card>
          {/* Room Plans */}
          <Card
            className="col-span-4 lg:col-span-1 h-fit"
            x-chunk="dashboard-01-chunk-1"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Room Plans</CardTitle>
                <CardDescription>Manage Room Plans Here</CardDescription>
              </div>
              <Button size="sm" className="ml-auto gap-1 hover:cursor-pointer">
                <div className="flex items-center">
                  Add Plan
                  <Plus className="h-4 w-4" />
                </div>
              </Button>
            </CardHeader>
            <CardContent>
              {/* Table */}
              <RoomPlansTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminClassrooms;
