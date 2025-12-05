import React from "react";

interface User {
  name: string;
  role: "admin" | "user";
  email: string;
}

interface HeaderProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 font-sans">
      <div className="container mx-auto px-5 flex justify-between items-center max-w-[1200px]">
        {/* Logo Section */}
        <div
          className="font-serif text-2xl font-bold text-gray-800 tracking-wide cursor-pointer"
          onClick={() => onNavigate("home")}
          role="button"
          tabIndex={0}
        >
          <img
            src="../../public/T_M Logo.png"
            alt="Themes & Motifs"
            className="h-9"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/150x50?text=Themes+Motifs";
            }}
          />
        </div>

        {/* Navigation Links - Hidden on mobile (md breakpoint) to match original CSS */}
        <nav className="hidden md:flex gap-5 items-center">
          {/* Admin Link */}
          {currentUser?.role === "admin" && (
            <button
              className="text-sm font-semibold text-gray-600 hover:text-brand-brown transition-colors"
              onClick={() => onNavigate("admin")}
            >
              Admin Dashboard
            </button>
          )}

          {/* Auth Section */}
          <div id="auth-section">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-gray-800">
                  Hi, {currentUser.name}
                </span>
                <button
                  className="px-5 py-2 border border-brand-brown text-brand-brown rounded hover:bg-brand-brown hover:text-white transition-colors duration-300 bg-transparent text-sm font-semibold"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="px-5 py-2 border border-brand-brown text-brand-brown rounded hover:bg-brand-brown hover:text-white transition-colors duration-300 bg-transparent text-sm font-semibold"
                onClick={() => onNavigate("login")}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
