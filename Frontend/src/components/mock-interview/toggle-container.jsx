import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger } from
"@/components/mock-interview/ui/sheet";
import { Menu } from "lucide-react";
import { NavigationRoutes } from "./navigation-routes";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/utils";

export const ToggleContainer = () => {
  const { user } = useSelector((state) => state.auth); const userId = user?._id;
  return (
    <Sheet>
      <SheetTrigger className="block md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle />
        </SheetHeader>

        <nav className="gap-6 flex flex-col items-start">
          <NavigationRoutes isMobile />
          {userId &&
          <NavLink
            to={"/mock-interview"}
            className={({ isActive }) =>
            cn(
              "text-base text-neutral-600 ",
              isActive && "text-neutral-900 font-semibold"
            )
            }>
            
              Take An Interview
            </NavLink>
          }
        </nav>
      </SheetContent>
    </Sheet>);

};


