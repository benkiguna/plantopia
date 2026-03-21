// Re-export client utilities (safe for browser)
export { createBrowserClient, getCurrentUserId } from "./client";

// Note: Server utilities should be imported directly from "./server"
// to avoid bundling server-only code in client components
