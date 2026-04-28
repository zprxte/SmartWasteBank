import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { SubmitWaste } from "./components/SubmitWaste";
import { Rewards } from "./components/Rewards";
import { Profile } from "./components/Profile";
import { Leaderboard } from "./components/Leaderboard";
import { Login } from "./components/Login";
import { Register } from "./components/Register";

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
]);
