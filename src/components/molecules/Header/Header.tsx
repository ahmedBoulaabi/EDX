"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./sub-components/Navigation";
import UserDropdown from "./sub-components/UserDropdown";

const Header = () => {
  return (
    <header className="w-full h-[130px] z-[20] flex justify-between items-center p-12 absolute left-0 top-0">
      {/* PLATFORM LOGO */}
      <Link href="/">
        <Image
          src={"/images/edx_logo.png"}
          alt="EDX Logo"
          height={68 * 0.9}
          width={100 * 0.9}
        />
      </Link>

      <div className="flex gap-8 items-center">
        {/* NAVIGATION MENU */}
        <Navbar />

        {/* User Dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
