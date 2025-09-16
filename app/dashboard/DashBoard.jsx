"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FaBars, FaMoon, FaBell, FaShoppingCart,
  FaUsers, FaBox, FaHome,
  FaUser
} from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import Image from "next/image";


export default function DashBoard({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const statsChartRef = useRef(null);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isMobile, setIsMobile] = useState(isTabletOrMobile);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");


  useEffect(() => {
    setIsMobile(isTabletOrMobile);
    if (isTabletOrMobile) setOpenDropdown(null);
  }, [isTabletOrMobile]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
 
 const img = [
  { userIcon: "/assets/img/user.png" },
  { logo: "/assets/logo/Image-removebg-preview.png" },
  { fullLogo: "/assets/logo/Image-removebg-preview.png" }
 ]; 
 const [profileType, setProfileType] = useState(img.userIcon);

  const menuItems = [
    { label: "Dashboard", icon: <FaHome />, path: "/dashboard/overview" },
    {
      label: "Product Management",
      icon: <FaBox />,
      submenu: [
        { label: "Add Product", path: "/dashboard/Productmanagement/add-products" },
        { label: "Add Category", path: "/dashboard/Productmanagement/add-category" },
   
        { label: "All Products", path: "/dashboard/Productmanagement/all-products" },
      ],
    },
    {
      label: "User Management",
      icon: <FaUsers />,
      submenu: [
        { label: "All Users", path: "/dashboard/Usermanagement/all-users" },
        { label: "Add User", path: "/dashboard/Usermanagement/add-user" },
    
      ],
    },
    {
      label: "Orders",
      icon: <FaShoppingCart />,
      submenu: [
        { label: "All Orders", path: "/dashboard/Ordermanagement/all-orders" },
   
      ],
    }, 
      {
          icon: <FaUser />,
          label: "Profile" , path:"/dashboard/Profile",
         
        }, 
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      const userId = localStorage.getItem("userId");
      const name = localStorage.getItem("adminName");
      if (name) setUserName(name);

      if (token && userId) {
        setIsLoggedIn(true);
        const profilePic = localStorage.getItem("adminProfilePic");
        if (profilePic) {
          setProfileType(profilePic);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogin = () => {
    router.push("/signin");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("adminName");
    }
    setIsLoggedIn(false);
    router.push("/signin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 ease-in-out bg-white h-full flex flex-col border-r border-gray-200
          ${isCollapsed ? "w-0 sm:w-[70px]" : "w-full sm:w-[300px] p-4"}
          sm:relative fixed top-0 left-0 z-50
          overflow-hidden shadow-lg
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-3 right-3 sm:hidden text-gray-600 hover:text-red-500 text-xl font-bold p-1"
        >
          <IoClose />
        </button>

        {/* Logo Section */}
        <div className="flex gap-2 items-center justify-center  py-2">
         <Image
          src={isCollapsed ?  img[2].fullLogo  : img[1].logo}  
          alt="Shree Balaji Jewelers"
          width={isCollapsed ? 60 : 60}
          height={10}
        />
          {!isCollapsed && (
            <span className="text-lg font-serif text-gray-800 w-full ">
              Shree Balaji Jewelers
            </span>
          )}
        </div>

        {/* Navigation Menu */}
        <ul className="flex flex-col gap-1 px-1 mt-2">
      <ul className="flex flex-col gap-1 px-1 mt-2">
  {menuItems.map((item, index) => (
    <li key={index} className="flex flex-col">
      {item.submenu ? (
        <div
          className={`
            flex items-center ${isCollapsed ? "justify-center" : "justify-start"} 
            gap-3 h-12 rounded-lg transition-all duration-300 px-3
            hover:bg-blue-50 hover:text-blue-600 text-gray-600
            cursor-pointer text-lg
          `}
          onClick={() =>
            setOpenDropdown(openDropdown === index ? null : index)
          }
        >
          <span className="text-lg">{item.icon}</span>
          {!isCollapsed && <span>{item.label}</span>}
        </div>
      ) : (
   
        <Link
          href={item.path}
          className={`
            flex items-center ${isCollapsed ? "justify-center" : "justify-start"} 
            gap-3 h-12 rounded-lg transition-all duration-300 px-3
            hover:bg-blue-50 hover:text-blue-600 text-gray-600
            cursor-pointer font-medium
          `}
        >
          <span className="text-lg">{item.icon}</span>
          {!isCollapsed && <span>{item.label}</span>}
        </Link>
      )}

      {/* Submenu items */}
      {item.submenu && openDropdown === index && !isCollapsed && (
        <ul className="flex flex-col pl-12 mt-1 gap-1">
          {item.submenu.map((subItem, subIndex) => (
            <li
              key={subIndex}
              className="text-gray-500 hover:text-blue-600 cursor-pointer h-10 flex items-center text-sm"
            >
              <Link href={subItem.path}>{subItem.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  ))}
</ul>

        </ul>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "sm:w-[70px]" : "sm:w-[250px]"
        } min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow-sm h-16 border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaBars className="w-5 h-5" />
          </button>

          <div className="flex gap-3 items-center">
            {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <FaMoon className="w-4 h-4" />
            </button>

            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <FaBell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button> */}

            {/* Profile Section */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <Image
              className="h-10 w-10 rounded-full border-2 border-gray-300 object-cover"
              src={profileType ? profileType : img[0].userIcon}  
              alt="Profile"
              width={40}
              height={40}
            /> 

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-gray-800">{userName}</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="ml-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
