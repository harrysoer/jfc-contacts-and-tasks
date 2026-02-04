"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const DEFAULT_CLASSNAME = 'flex items-center gap-2 px-3 py-2'

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/contacts") {
      return pathname.startsWith("/contacts");
    }
    return pathname === href;
  };

  const linkClass = (href: string) =>
    `${DEFAULT_CLASSNAME} ${
      isActive(href)
        ? "bg-gray-200 font-medium"
        : "hover:bg-gray-100"
    }`;

  return (
    <nav className="flex flex-col gap-1">
      <Link href="/tasks" className={linkClass("/tasks")}>
        <ClipboardDocumentListIcon className="w-5 h-5" />
        <span>Tasks</span>
      </Link>
      <div>
        <Link href="/contacts" className={DEFAULT_CLASSNAME}>
          <UserGroupIcon className="w-5 h-5" />
          <span>Contacts</span>
        </Link>
        <div className="ml-7 flex flex-col gap-1">
          <Link href="/contacts/people" className={linkClass("/contacts/people")}>
            <UserIcon className="w-5 h-5" />
            <span>People</span>
          </Link>
          <Link href="/contacts/businesses" className={linkClass("/contacts/businesses")}>
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>Businesses</span>
          </Link>
        </div>
      </div>
      <Link href="/tags" className={linkClass("/tags")}>
        <TagIcon className="w-5 h-5" />
        <span>Tags</span>
      </Link>
      <Link href="/categories" className={linkClass("/categories")}>
        <Squares2X2Icon className="w-5 h-5" />
        <span>Categories</span>
      </Link>
    </nav>
  );
}
