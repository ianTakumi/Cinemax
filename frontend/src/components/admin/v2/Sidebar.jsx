import React, { useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import TheatersIcon from "@mui/icons-material/Theaters";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Link } from "react-router-dom";

const Sidebar = ({ isMinimized }) => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState("dashboard");
  const [expanded, setExpanded] = useState({
    foods: false,
    users: false,
  });

  const handleItemClick = (item) => {
    setSelected(item);
  };

  const toggleExpansion = (item) => {
    setExpanded((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  return (
    <aside
      className={`  text-white overflow-hidden  ${
        isMinimized ? "w-20" : "w-80"
      }`}
      style={{ backgroundColor: "#181824" }}
    >
      <div className="p-4 text-xl font-bold font-serif">Cinemax</div>
      <ul className="mt-5 text-xs">
        <h1
          className={`text-gray-400 font-sans px-8 pt-1 ${
            isMinimized ? "hidden" : "block"
          } `}
        >
          Main
        </h1>
        {/* Sidebar Items */}
        <Link to="/admin">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("dashboard")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("dashboard")}
            style={{
              backgroundColor:
                hovered === "dashboard" || selected === "dashboard"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "dashboard" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <DashboardIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "dashboard" || selected === "dashboard"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Dashboard
            </span>
          </li>
        </Link>
        <Link to="/admin/task">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("task")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("task")}
            style={{
              backgroundColor:
                hovered === "task" || selected === "task"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "task" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <AssignmentIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "task" || selected === "task"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Task
            </span>
          </li>
        </Link>
        <Link to="/admin/users">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("users")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("users")}
            style={{
              backgroundColor:
                hovered === "users" || selected === "users"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "users" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <GroupIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "users" || selected === "users"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Users
            </span>
          </li>
        </Link>
        <h1
          className={`text-gray-400 font-sans px-8 pt-1 ${
            isMinimized ? "hidden" : "block"
          } `}
        >
          Services
        </h1>
        <li
          className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
          onMouseOver={() => setHovered("foods")}
          onMouseOut={() => setHovered(null)}
          onClick={() => handleItemClick("foods")}
        >
          {selected === "foods" && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
          )}
          <div
            className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
            style={{ backgroundColor: "#2B3138" }}
          >
            <FastfoodIcon
              style={{ color: "#33C92D", fontSize: "1.7rem", lineHeight: "1" }}
              className="p-1"
            />
          </div>
          <span
            className={`transition-all ease-in-out duration-500 ${
              isMinimized ? "hidden" : "block"
            }`}
            style={{
              fontSize: "16px",
              color:
                hovered === "foods" || selected === "foods"
                  ? "white"
                  : "#9ca3af",
            }}
          >
            Foods
          </span>
          <div
            className={`ml-auto cursor-pointer ${
              isMinimized ? "hidden" : "block"
            }`}
            onClick={() => toggleExpansion("foods")}
          >
            {expanded.foods ? (
              <KeyboardArrowDownIcon style={{ color: "#33C92D" }} />
            ) : (
              <KeyboardArrowLeftIcon style={{ color: "#33C92D" }} />
            )}
          </div>
        </li>
        {expanded.foods && (
          <ul className="mt-2 text-gray-400 text-xs">
            <Link to="food/food-list">
              <li className="py-2 px-8 cursor-pointer hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                <KeyboardArrowRightIcon className="mr-5 ml-2" />
                Food List
              </li>
            </Link>

            <Link to="food/category">
              <li className="py-2 px-8 cursor-pointer hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                <KeyboardArrowRightIcon className="mr-5 ml-2" />
                Category
              </li>
            </Link>
          </ul>
        )}
        <li
          className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
          onMouseOver={() => setHovered("other")}
          onMouseOut={() => setHovered(null)}
          onClick={() => handleItemClick("other")}
        >
          {selected === "other" && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
          )}
          <div
            className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
            style={{ backgroundColor: "#2B3138" }}
          >
            <TheatersIcon
              style={{ color: "#33C92D", fontSize: "1.7rem", lineHeight: "1" }}
              className="p-1"
            />
          </div>
          <span
            className={`transition-all ease-in-out duration-500 ${
              isMinimized ? "hidden" : "block"
            }`}
            style={{
              fontSize: "16px",
              color:
                hovered === "other" || selected === "other"
                  ? "white"
                  : "#9ca3af",
            }}
          >
            Movies
          </span>
          <div
            className={`ml-auto cursor-pointer ${
              isMinimized ? "hidden" : "block"
            }`}
            onClick={() => toggleExpansion("other")}
          >
            {expanded.other ? (
              <KeyboardArrowDownIcon style={{ color: "#33C92D" }} />
            ) : (
              <KeyboardArrowLeftIcon style={{ color: "#33C92D" }} />
            )}
          </div>
        </li>
        {expanded.other && (
          <ul className="mt-2 text-gray-400 text-xs">
            <Link to="movie/movie-list">
              <li className="py-2 px-8 cursor-pointer hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                <KeyboardArrowRightIcon className="mr-5 ml-2" />
                Movie List
              </li>
            </Link>

            <Link to="movie/genre">
              <li className="py-2 px-8 cursor-pointer hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                <KeyboardArrowRightIcon className="mr-5 ml-2" />
                Genres
              </li>
            </Link>
          </ul>
        )}
        <h1
          className={`text-gray-400 font-sans px-8 pt-1 ${
            isMinimized ? "hidden" : "block"
          } `}
        >
          User
        </h1>
        {/* User Profile */}
        <Link to="admin/user-profile">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("profile")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("profile")}
            style={{
              backgroundColor:
                hovered === "profile" || selected === "profile"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "profile" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <PersonIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "profile" || selected === "profile"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Profile
            </span>
          </li>
        </Link>

        {/* Email */}
        <Link to="admin/emails">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("email")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("email")}
            style={{
              backgroundColor:
                hovered === "email" || selected === "email"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "email" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <EmailIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "email" || selected === "email"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Email
            </span>
          </li>
        </Link>

        {/* Message */}
        <Link to="admin/messages">
          <li
            className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
            onMouseOver={() => setHovered("message")}
            onMouseOut={() => setHovered(null)}
            onClick={() => handleItemClick("message")}
            style={{
              backgroundColor:
                hovered === "message" || selected === "message"
                  ? "#161621"
                  : "transparent",
            }}
          >
            {selected === "message" && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
            )}
            <div
              className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: "#2B3138" }}
            >
              <MessageIcon
                style={{
                  color: "#33C92D",
                  fontSize: "1.7rem",
                  lineHeight: "1",
                }}
                className="p-1"
              />
            </div>
            <span
              className={`transition-all ease-in-out duration-500 ${
                isMinimized ? "hidden" : "block"
              }`}
              style={{
                fontSize: "16px",
                color:
                  hovered === "message" || selected === "message"
                    ? "white"
                    : "#9ca3af",
              }}
            >
              Message
            </span>
          </li>
        </Link>

        {/* Logout */}
        <li
          className="mt-3 py-2 px-8 text-gray-400 cursor-pointer flex items-center w-full transition-colors duration-300 ease-in-out relative"
          onMouseOver={() => setHovered("logout")}
          onMouseOut={() => setHovered(null)}
          onClick={() => handleItemClick("logout")}
          style={{
            backgroundColor:
              hovered === "logout" || selected === "logout"
                ? "#161621"
                : "transparent",
          }}
        >
          {selected === "logout" && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500" />
          )}
          <div
            className="mr-5 rounded-md transition-colors duration-300 ease-in-out"
            style={{ backgroundColor: "#2B3138" }}
          >
            <LogoutIcon
              style={{
                color: "#33C92D",
                fontSize: "1.7rem",
                lineHeight: "1",
              }}
              className="p-1"
            />
          </div>
          <span
            className={`transition-all ease-in-out duration-500 ${
              isMinimized ? "hidden" : "block"
            }`}
            style={{
              fontSize: "16px",
              color:
                hovered === "logout" || selected === "logout"
                  ? "white"
                  : "#9ca3af",
            }}
          >
            Logout
          </span>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
