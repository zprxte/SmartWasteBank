import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { SubmitWaste } from "./components/SubmitWaste";
import { Rewards } from "./components/Rewards";
import { Profile } from "./components/Profile";
import { Leaderboard } from "./components/Leaderboard";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminUsers } from "./components/AdminUsers";
import { AdminSubmissions } from "./components/AdminSubmissions";
import { AdminRewards } from "./components/AdminRewards";
import { AdminAnalytics } from "./components/AdminAnalytics";
import { AdminSettings } from "./components/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "submit", Component: SubmitWaste },
      { path: "rewards", Component: Rewards },
      { path: "profile", Component: Profile },
      { path: "leaderboard", Component: Leaderboard },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "submissions", Component: AdminSubmissions },
      { path: "rewards", Component: AdminRewards },
      { path: "analytics", Component: AdminAnalytics },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);
