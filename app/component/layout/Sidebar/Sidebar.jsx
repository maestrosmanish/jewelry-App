// components/Sidebar.jsx
"use client";

import { useState, useEffect, Profiler } from "react";
import Link from "next/link";
import { FaTachometerAlt, FaRobot, FaShoppingCart, FaCalendarAlt, FaUser } from "react-icons/fa";

const Sidebar = ({ logo, logoIcon }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/dashboard/overview" },
    {
      icon: <FaRobot />,
      label: "AI Assistant",
      submenu: [
        { label: "Chat", path: "/dashboard/chat" },
        { label: "Generate Images", path: "/dashboard/images" },
        { label: "Code", path: "/dashboard/code" },
      ],
    },
    {
      icon: <FaShoppingCart />,
      label: "E-commerce",
      submenu: [
        { label: "Orders", path: "/dashboard/orders-table" },
        { label: "Products", path: "/dashboard/all-products" },
        { label: "Customers", path: "/dashboard/customers" },
      ],
    },
    { icon: <FaCalendarAlt />, label: "Calendar", path: "/dashboard/calendar" },
    {
      icon: <FaUser />,
      label: "User Profile",
      submenu: [
        { label: "Settings", path: "/dashboard/settings" },
        { label: "Logout", path: "/logout" },
      ],
    }, 
    
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-white z-40 h-full flex flex-col sideBar ${
        isCollapsed ? "w-[60px]" : isMobile ? "w-full p-5" : "w-[300px] p-5"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-2 pt-4 sideBarhead">
        <img src={isMobile ? logoIcon : logo} alt="logo" className="w-auto h-8 mr-2" />
      </div>

      {/* Collapse Button */}
      {!isMobile && (
        <button
          className="mt-4 mb-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      )}

      {/* Menu Items */}
      <ul className="flex flex-col gap-1 mt-5">
        {menuItems.map((item, index) => (
          <li key={index} className="flex flex-col">
            <div
              className={`flex justify-center sm:justify-start items-center gap-2 h-12 rounded-lg transition-all duration-300 cursor-pointer ${
                isCollapsed ? "p-2" : "p-3"
              } ${index === 0 ? "bg-[#ECF3FF] text-[#465FFF]" : "hover:bg-[#ECF3FF] hover:text-[#465FFF] text-gray-500"}`}
              onClick={() => item.submenu && toggleDropdown(index)}
            >
              <Link href={item.path || "#"} className="flex items-center gap-2 w-full">
                {item.icon}
                <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"} sm:block`}>
                  {item.label}
                </span>
              </Link>

              {item.submenu && !isCollapsed && (
                <span className={`ml-auto transition-transform duration-300 ${openDropdown === index ? "rotate-90" : "rotate-0"}`}>▶</span>
              )}
            </div>

            {/* Submenu with smooth transition */}
            {item.submenu && (
              <ul
                className={`flex flex-col pl-10 mt-1 gap-1 overflow-hidden transition-[max-height] duration-300 ${
                  openDropdown === index && !isCollapsed ? "max-h-60" : "max-h-0"
                }`}
              >
                {item.submenu.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <Link href={subItem.path}>
                      <a className="text-gray-500 hover:text-[#465FFF] cursor-pointer h-10 flex items-center">
                        {subItem.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
