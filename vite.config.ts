import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Fully static build — no SSR — so community mirrors can self-host the
// explorer against the public API (see README design decisions).
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
