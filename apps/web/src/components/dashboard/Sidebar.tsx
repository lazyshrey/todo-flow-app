"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderOpen,
  Tag,
  Settings,
  Menu
} from "lucide-react";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { TodoItem } from "./types";
import { useTheme } from "@/lib/useTheme";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeView: "tasks" | "settings" | "create_task";
  setActiveView: (view: "tasks" | "settings" | "create_task") => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  groups: string[];
  customGroups: string[];
  setCustomGroups: (groups: string[]) => void;
  todos: TodoItem[];
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeView,
  setActiveView,
  selectedGroup,
  setSelectedGroup,
  groups,
  customGroups,
  setCustomGroups,
  todos
}: SidebarProps) {
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/logo_dark.png" : "/logo_light.png";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (action: () => void) => {
    action();
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-15"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <motion.div
        animate={{ width: isCollapsed ? (isMobile ? 0 : 72) : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`h-screen bg-zinc-900/15 backdrop-blur-2xl flex flex-col justify-between shrink-0 z-20 select-none ${
          isMobile ? "absolute top-0 left-0" : "relative"
        } ${
          isCollapsed && isMobile
            ? "p-0 border-none pointer-events-none"
            : "p-4 border-r border-white/5 pointer-events-auto"
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute h-8 w-8 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer z-30 shadow-md transition-all pointer-events-auto ${
            isCollapsed && isMobile ? "left-4 top-4" : "-right-4 top-8"
          }`}
        >
          {isCollapsed && isMobile ? (
            <Menu className="h-4 w-4" />
          ) : isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Sidebar Inner Content Wrapper */}
        <div
          className={`flex flex-col justify-between flex-1 transition-all duration-300 ${
            isCollapsed && isMobile ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ width: isCollapsed && !isMobile ? 40 : 228 }}
        >
          <div className="space-y-6 overflow-hidden flex flex-col flex-1">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 px-2 shrink-0">
              <img src={logoSrc} alt="Todo Flow Logo" className="h-7 w-7 object-contain" />
              {(!isCollapsed || isMobile) && (
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Todo Flow
                </span>
              )}
            </div>

            {/* Primary Create Task Button */}
            <div className="shrink-0 px-1">
              {isCollapsed ? (
                <button
                  onClick={() => handleItemClick(() => setActiveView("create_task"))}
                  className="mx-auto h-10 w-10 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg shadow-white/10 hover:shadow-white/20 transition-all cursor-pointer active:scale-95"
                  title="Create Task"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  onClick={() => handleItemClick(() => setActiveView("create_task"))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black shadow-lg shadow-white/10 hover:shadow-white/25 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Create Task</span>
                </button>
              )}
            </div>

            {/* Categories Block */}
            <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
              {(!isCollapsed || isMobile) && (
                <h3 className="px-3 text-3xs font-extrabold text-zinc-500 uppercase tracking-widest shrink-0">
                  Categories
                </h3>
              )}
              
              {/* Scrollable category list */}
              <div className="flex-1 overflow-y-auto pr-1.5 space-y-1 scrollbar-thin relative">
                {/* All Tasks Pinned to Top */}
                <button
                  onClick={() => {
                    handleItemClick(() => {
                      setActiveView("tasks");
                      setSelectedGroup("All");
                    });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    activeView === "tasks" && selectedGroup === "All"
                      ? "bg-white/10 text-white border border-white/10"
                      : "bg-transparent text-zinc-450 border border-transparent hover:text-zinc-250"
                  }`}
                  title="All Tasks"
                >
                  <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
                  {(!isCollapsed || isMobile) && <span className="truncate flex-1 text-left">All Tasks</span>}
                  {(!isCollapsed || isMobile) && (
                    <span className="text-3xs bg-white/5 px-2 py-0.5 rounded-md text-zinc-400 border border-white/5 font-bold">
                      {todos.length}
                    </span>
                  )}
                </button>

                {groups.map((group) => {
                  const groupCount = todos.filter((t) => (t.groupName || "Inbox") === group).length;
                  const isSelected = activeView === "tasks" && selectedGroup === group;
                  return (
                    <button
                      key={group}
                      onClick={() => {
                        handleItemClick(() => {
                          setActiveView("tasks");
                          setSelectedGroup(group);
                        });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/10 text-white border border-white/10"
                          : "bg-transparent text-zinc-450 border border-transparent hover:text-zinc-200"
                      }`}
                      title={group}
                    >
                      <Tag className="h-4 w-4 shrink-0 text-zinc-555" />
                      {(!isCollapsed || isMobile) && <span className="truncate flex-1 text-left">{group}</span>}
                      {(!isCollapsed || isMobile) && (
                        <span className="text-3xs bg-white/5 px-2 py-0.5 rounded-md text-zinc-400 border border-white/5 font-bold">
                          {groupCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Add Custom Category */}
              {(!isCollapsed || isMobile) && (
                <div className="px-2 pt-2 border-t border-white/5 shrink-0">
                  <input
                    type="text"
                    placeholder="+ Add category..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !groups.some(g => g.toLowerCase() === val.toLowerCase())) {
                          setCustomGroups([...customGroups, val]);
                          (e.target as HTMLInputElement).value = "";
                          setSelectedGroup(val);
                          if (isMobile) {
                            setIsCollapsed(true);
                          }
                        }
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-550 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="space-y-4 pt-4 border-t border-white/5 shrink-0 select-none">
            <button
              onClick={() => handleItemClick(() => setActiveView("settings"))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeView === "settings"
                  ? "bg-white/10 text-white border border-white/10"
                  : "bg-transparent text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4 shrink-0 text-zinc-450" />
              {(!isCollapsed || isMobile) && <span className="flex-1 text-left">Settings</span>}
            </button>

            {/* User profile / sign out */}
            <div className="flex items-center gap-3 px-1.5 py-1">
              <UserButton afterSignOutUrl="/" />
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-200 truncate select-text">Profile</p>
                  <div className="text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-455 transition-colors font-medium">
                    <SignOutButton>
                      <span>Sign Out</span>
                    </SignOutButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
