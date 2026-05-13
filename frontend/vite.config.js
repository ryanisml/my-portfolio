import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || 'localhost')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)

  const hmrHost = env.VITE_HMR_HOST || allowedHosts.find((host) => host !== 'localhost') || 'localhost'
  const hmrProtocol = env.VITE_HMR_PROTOCOL || 'ws'
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || (hmrProtocol === 'wss' ? 443 : 5173))

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts,
      hmr: {
        host: hmrHost,
        protocol: hmrProtocol,
        clientPort: hmrClientPort,
      },
    },
  }
})
