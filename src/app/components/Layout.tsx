import { Outlet, NavLink, useNavigate } from "react-router";
import { Home, Upload, Gift, User, Trophy, Leaf } from "lucide-react";
import { useEffect } from "react";

export function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl text-foreground">Smart Waste Bank</h1>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/submit"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                Submit Waste
              </NavLink>
              <NavLink
                to="/rewards"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                Rewards
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                Leaderboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                Profile
              </NavLink>
              <button
                onClick={() => {
                  sessionStorage.removeItem("isAuthenticated");
                  navigate("/login");
                }}
                className="ml-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </NavLink>
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Submit</span>
          </NavLink>
          <NavLink
            to="/rewards"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Gift className="w-5 h-5" />
            <span className="text-xs">Rewards</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Ranks</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}