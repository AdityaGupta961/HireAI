import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-apple-black to-apple-gray-dark bg-opacity-95 backdrop-blur-xl z-50">
      
      {/* Animated pulsating wave rings */}
      <div className="relative w-40 h-40">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-apple-blue/40"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={{
              scale: [1, 1.6],
              opacity: [1 - i * 0.3, 0],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 2,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-apple-blue to-purple-500 opacity-60 blur-md animate-pulse" />
      </div>

      {/* "Loading..." Text with Siri-like pulse */}
      <motion.div
        className="mt-12 text-white text-4xl font-semibold tracking-wide select-none bg-gradient-to-r from-apple-blue to-purple-500 bg-clip-text text-transparent drop-shadow-lg"
        animate={{
          opacity: [0.7, 1, 0.7],
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 2.5,
          ease: "easeInOut",
        }}
        aria-live="polite"
        aria-busy="true"
      >
        Loading...
      </motion.div>
    </div>
  );
}
