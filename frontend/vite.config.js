import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
export default defineConfig(({mode}) => ({
  plugins:[react()],
  root:fileURLToPath(new URL(".",import.meta.url)),
  base:mode === "production" ? "/static/" : "/",
  build:{outDir:fileURLToPath(new URL("../backend/frontend_dist",import.meta.url)),emptyOutDir:true},
  server:{port:5173,proxy:{"/api":"http://127.0.0.1:8000"}},
}))
