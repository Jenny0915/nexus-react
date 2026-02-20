import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,           // Permite usar 'describe', 'test', 'expect' sin importarlos en cada archivo
    environment: 'jsdom',    // Simula el DOM del navegador en la terminal
    setupFiles: './vitest.setup.js', // Carga las extensiones de jest-dom
    include: ['src/**/*.{test,spec}.{js,jsx}'], // Busca los tests dentro de src
  },
})