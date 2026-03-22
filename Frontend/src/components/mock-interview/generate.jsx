import { Outlet } from "react-router-dom";

export const Generate = () => {
  return (
    <div className="w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};