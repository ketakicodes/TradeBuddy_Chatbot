"use client"

import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="h-screen bg-[#1E1E1E]">
      <AppSidebar />
      <div className="pl-[3.05rem] transition-all duration-200 h-full">
        <ChatInterface />
      </div>
    </main>
  )
}