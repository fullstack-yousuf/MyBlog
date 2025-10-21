"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContex";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { hasUnread } = useUnread();
  console.log("unread", hasUnread);

  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Highlight active link
  // const linkClass = (path: string) =>
  //   `relative block py-2 px-3 rounded-sm md:p-0 transition-colors duration-200 ${
  //     pathname === path
  //       ? "text-blue-700 bg-blue-100 md:bg-transparent dark:text-blue-400 font-semibold"
  //       : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-400"
  //   }`;
  const linkClass = (path: string) =>
    `relative block py-2 px-3 rounded-sm md:p-0 transition-colors duration-200 ${
      pathname === path
        ? "text-blue-700 bg-blue-100 md:bg-transparent dark:text-blue-400 font-semibold"
        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-400"
    }`;
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link
          href={user ? "/posts" : "/"}
          className="flex items-center space-x-3"
        >
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            MyBlog
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation links */}
        <div
          className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul
            className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg 
                         bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent 
                         dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700"
          >
            {/* Show only when NOT logged in */}
            {!user && (
              <>
                <li>
                  <Link href="/" className={linkClass("/")}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className={linkClass("/signup")}>
                    Signup
                  </Link>
                </li>
                <li>
                  <Link href="/login" className={linkClass("/login")}>
                    Login
                  </Link>
                </li>
              </>
            )}

            {/* Show only when logged in */}
            {user && (
              <>
                <li>
                  <Link href="/chat" className={linkClass("/chat")}>
                    Chat
                    {hasUnread && (
                      <span className="absolute top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-md animate-ping" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className={linkClass("/posts")}>
                    Feeds
                  </Link>
                </li>
                <li>
                  <Link href="/posts/my" className={linkClass("/posts/my")}>
                    My Feed
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="block py-2 px-3 text-red-600 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:p-0 dark:text-red-400 dark:hover:text-red-300 transition"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
