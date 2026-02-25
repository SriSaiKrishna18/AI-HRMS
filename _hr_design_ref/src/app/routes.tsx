import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { Employees } from "./components/pages/Employees";
import { Attendance } from "./components/pages/Attendance";
import { Leave } from "./components/pages/Leave";
import { Payroll } from "./components/pages/Payroll";
import { Performance } from "./components/pages/Performance";
import { Recruitment } from "./components/pages/Recruitment";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "attendance", Component: Attendance },
      { path: "leave", Component: Leave },
      { path: "payroll", Component: Payroll },
      { path: "performance", Component: Performance },
      { path: "recruitment", Component: Recruitment },
    ],
  },
]);
