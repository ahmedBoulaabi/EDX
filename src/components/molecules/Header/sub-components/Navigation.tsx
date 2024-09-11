"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import Loader from "@/components/atoms/Loader";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React from "react";

type NavType = Array<{
  title: string;
  link: string;
  description: string;
  submenu?: NavType;
}>;

// The Different Nav Links
const NON_AUTH_NAV_LINKS: NavType = [
  { title: "Home", link: "/", description: "The homepage" },
  {
    title: "Login",
    link: "/login",
    description: "Authenticate and identify yourself",
  },
  {
    title: "Sign Up",
    link: "/signup",
    description: "Create an account to enroll into this establishment",
  },
];

const ADMIN_NAV: NavType = [
  { title: "Home", link: "/", description: "The homepage" },
  {
    title: "Dashboard",
    link: "/admin/dashboard",
    description: "Stay up to date with the establishment",
  },
  {
    title: "Teachers",
    link: "/admin/teachers",
    description: "Manage the teachers",
  },
  {
    title: "Students",
    link: "/admin/students",
    description: "Manage the students",
  },
  {
    title: "Other",
    link: "/admin/general",
    description: "Manage many aspects such as programs and such",
    submenu: [
      {
        title: "General",
        link: "/admin/general",
        description: "Manage the establishment",
      },
      {
        title: "Classrooms",
        link: "/admin/classrooms",
        description: "Manage the Classrooms",
      },
      {
        title: "Room Planner",
        link: "/planner",
        description: "Room Planning",
      },
    ],
  },
];

const TEACHER_NAV: NavType = [
  { title: "Home", link: "/", description: "The homepage" },
  {
    title: "Dashboard",
    link: "/teacher/dashboard",
    description: "Stay up-to-date with everything.",
  },
  {
    title: "Enrollments",
    link: "/teacher/enrollments",
    description: "Manage the enrollments",
  },
  {
    title: "Schedule",
    link: "/timeline",
    description: "Manage your schedule",
  },
  {
    title: "Other",
    link: "/teacher/timeline",
    description: "Manage many aspects such as courses and such",
    submenu: [
      {
        title: "Courses",
        link: "/courses",
        description: "Manage your courses and students",
      },
      {
        title: "Github repositories",
        link: "/teacher/github-repositories",
        description: "Manage your repositories",
      },
    ],
  },
];

const STUDENT_NAV: NavType = [
  { title: "Home", link: "/", description: "The homepage" },
  {
    title: "Dashboard",
    link: "/student/dashboard",
    description: "Stay up-to-date with everything",
  },
  {
    title: "Classes",
    link: "/student/classrooms",
    description: "Check your classes",
  },
];

export const roleNavMap = {
  admin: ADMIN_NAV,
  teacher: TEACHER_NAV,
  student: STUDENT_NAV,
  anon: NON_AUTH_NAV_LINKS,
};

const Navbar = () => {
  let pathname = usePathname().toLowerCase();
  // get session user and role
  const { user, role, loading } = useSupabaseUser();

  const items = user ? roleNavMap[role ?? "student"] : roleNavMap["anon"];

  return (
    <>
      {!loading ? (
        <>
          {/* NAV ON BIG SCREENS */}
          <NavigationMenu className="hidden md:flex bg-brand-gray-dark rounded-lg border-[1.2px] border-[#313131] gap-2 p-1">
            <NavigationMenuList>
              {items.map((item, index) => (
                <NavigationMenuItem key={index}>
                  <Link href={item.link}>
                    <NavigationMenuLink asChild>
                      <>
                        <NavigationMenuTrigger
                          className={clsx(
                            "py-3 px-6 text-sm rounded-lg hover:opacity-50 duration-300 hover:scale-[0.95]",
                            item?.submenu && "chevrons",
                            pathname == item.link.toLowerCase() &&
                              "bg-brand-gray-light text-brand-yellow "
                          )}
                        >
                          {item.title}
                        </NavigationMenuTrigger>
                        {item.submenu && (
                          <NavigationMenuContent>
                            <ul className="grid w-[400px]  gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-brand-gray-dark">
                              {item.submenu.map((submenuItem) => (
                                <ListItem
                                  key={submenuItem.title}
                                  title={submenuItem.title}
                                  href={submenuItem.link}
                                  className="border-brand-gray-light border-[1px]"
                                >
                                  {submenuItem.description}
                                </ListItem>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        )}
                      </>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          {/* NAV ON SMALL SCREENS */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="shrink-0 md:hidden bg-brand-gray-dark border-brand-gray-light border-2 w-fit h-fit p-[10px]"
              >
                <Menu className="h-6 w-6" color="white" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <span className="sr-only">Acme Inc</span>
                </Link>

                {items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className={clsx(
                      "hover:text-foreground",
                      pathname != item.link.toLowerCase() &&
                        "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className="invert-[1]">
          <Loader />
        </div>
      )}
    </>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <Link
        ref={ref}
        href={props.href ?? "#"}
        {...props}
        className={clsx(
          "block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        <NavigationMenuLink asChild>
          <>
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </>
        </NavigationMenuLink>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
