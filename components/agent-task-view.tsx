"use client"
import Plan from "@/components/ui/agent-plan"
import { motion, AnimatePresence } from "framer-motion"

interface AgentTaskViewProps {
  isVisible: boolean
  onClose?: () => void
}

export default function AgentTaskView({ isVisible, onClose }: AgentTaskViewProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[80vh] rounded-lg bg-[#121212] shadow-xl overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white">AI Agent Working</h2>
              </div>
              {onClose && (
                <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-[calc(80vh-56px)]">
              <Plan />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
