// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })


// ไฟล์ vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ใช้ alias เพื่อทำให้การอ้างอิง path สั้นลง
      '@lib': '/src/lib',  // ตัวอย่าง alias สำหรับโฟลเดอร์ lib
    },
  },
});
