import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Restrict file system access to project root and node_modules
      allow: [
        // Allow access to project root (current working directory)
        process.cwd(),
        // Allow access to node_modules
        process.cwd() + "/node_modules",
      ],
      // Deny access to sensitive directories
      deny: [
        // Deny access to parent directories
        "..",
        // Deny access to system directories
        "/etc",
        "/usr",
        "/var",
        "/tmp",
        "/home",
      ],
    },
  },
});
