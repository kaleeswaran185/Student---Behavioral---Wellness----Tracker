import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  const hasExternalApiBase = Boolean(env.VITE_API_BASE_URL)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: hasExternalApiBase
      ? undefined
      : {
          proxy: {
            "/api": {
              target: env.VITE_API_PROXY_TARGET || "http://localhost:5000",
              changeOrigin: true,
            },
          },
        },
  }
})
