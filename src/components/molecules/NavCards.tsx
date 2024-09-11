"use client";
import { Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { roleNavMap } from "./Header/sub-components/Navigation";

const NavCards = () => {
  let pathname = usePathname().toLowerCase();
  // get session user and role
  const { user, role, loading } = useSupabaseUser();

  let items = user ? roleNavMap[role ?? "student"] : roleNavMap["anon"];
  items = items.filter((a) => a.link != "/");

  return (
    <div className="flex items-center gap-4 relative">
      <p className=" mb-4 opacity-50 text-sm absolute -top-10">
        Quick Navigation
      </p>
      {items.map((item, index) => (
        <Card
          key={index}
          x-chunk="dashboard-01-chunk-0"
          className="p-4 min-w-[250px] hover:cursor-pointer hover:scale-95 hover:opacity-80 duration-200"
          onClick={() => {
            window.location.href = item.link;
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-25">
            <CardTitle className="text-sm font-medium ">{item.link}</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.title}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NavCards;
