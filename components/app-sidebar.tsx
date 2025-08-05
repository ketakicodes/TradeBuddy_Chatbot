"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {
  ChevronsUpDown,
  Code,
  FileText,
  History,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Music,
  Plus,
  Settings,
  UserCircle,
  Video,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
}

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
}

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
}

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
}

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
}

// Mock data for project and chat history
const projectHistory = [
  { id: 1, name: "Landing Page", date: "2 hours ago" },
  { id: 2, name: "Dashboard UI", date: "Yesterday" },
  { id: 3, name: "Authentication Flow", date: "3 days ago" },
  { id: 4, name: "Settings Panel", date: "1 week ago" },
]

const chatHistory = [
  { id: 1, name: "AI Chat Interface", date: "Just now" },
  { id: 2, name: "Canvas Implementation", date: "1 hour ago" },
  { id: 3, name: "Responsive Design", date: "Yesterday" },
]

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const pathname = usePathname()

  return (
    <motion.div
      className={cn("sidebar fixed left-0 z-40 h-full shrink-0 border-r")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button variant="ghost" size="sm" className="flex w-fit items-center gap-2 px-2">
                      <Avatar className="rounded size-4">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-fit items-center gap-2">
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">TradeBuddy</p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild className="flex items-center gap-2">
                      <Link href="/settings">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-2">
                      <Link href="/new-project">
                        <Plus className="h-4 w-4" /> New Project
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Project History Section */}
                    <div className="mt-2 mb-1 px-2">
                      <motion.div variants={variants} className="flex items-center">
                        {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground">PROJECT HISTORY</p>}
                      </motion.div>
                    </div>

                    {projectHistory.map((project) => (
                      <Link
                        key={project.id}
                        href={`/project/${project.id}`}
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes(`/project/${project.id}`) && "bg-muted text-blue-600",
                        )}
                      >
                        <History className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <div className="ml-2 flex flex-col">
                              <p className="text-sm font-medium">{project.name}</p>
                              <p className="text-xs text-muted-foreground">{project.date}</p>
                            </div>
                          )}
                        </motion.li>
                      </Link>
                    ))}

                    <Separator className="my-2" />

                    {/* Chat History Section */}
                    <div className="mt-2 mb-1 px-2">
                      <motion.div variants={variants} className="flex items-center">
                        {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground">CHAT HISTORY</p>}
                      </motion.div>
                    </div>

                    {chatHistory.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes(`/chat/${chat.id}`) && "bg-muted text-blue-600",
                        )}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <div className="ml-2 flex flex-col">
                              <p className="text-sm font-medium">{chat.name}</p>
                              <p className="text-xs text-muted-foreground">{chat.date}</p>
                            </div>
                          )}
                        </motion.li>
                      </Link>
                    ))}

                    <Separator className="my-2" />

                    {/* Canvas Tabs */}
                    <div className="mt-2 mb-1 px-2">
                      <motion.div variants={variants} className="flex items-center">
                        {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground">CANVAS</p>}
                      </motion.div>
                    </div>

                    <Link
                      href="/canvas/preview"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/preview") && "bg-muted text-blue-600",
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Preview</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/canvas/code"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/code") && "bg-muted text-blue-600",
                      )}
                    >
                      <Code className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Code</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/canvas/images"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/images") && "bg-muted text-blue-600",
                      )}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Images</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/canvas/video"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/video") && "bg-muted text-blue-600",
                      )}
                    >
                      <Video className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Video</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/canvas/audio"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/audio") && "bg-muted text-blue-600",
                      )}
                    >
                      <Music className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Audio</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/canvas/docs"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/canvas/docs") && "bg-muted text-blue-600",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Docs</p>}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col p-2">
                <Link
                  href="/settings"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && <p className="ml-2 text-sm font-medium">Settings</p>}
                  </motion.li>
                </Link>

                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <motion.li variants={variants} className="flex w-full items-center gap-2">
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">User</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">User</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">user@example.com</span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="flex items-center gap-2">
                        <Link href="/profile">
                          <UserCircle className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  )
}
