import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteSitemap from "vite-plugin-sitemap";
import compression from "vite-plugin-compression";
import fs from 'fs';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: ['@babel/plugin-syntax-dynamic-import'],
      },
    }),
    {
      name: 'ensure-robots-txt',
      buildStart: () => {
        // Ensure public directory exists
        const publicDir = path.resolve(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        // Create robots.txt if it doesn't exist
        const robotsPath = path.resolve(publicDir, 'robots.txt');
        if (!fs.existsSync(robotsPath)) {
          const robotsContent = `User-agent: *
Disallow: /admin/
Disallow: /backend/
Disallow: /private/
Disallow: /config/
Disallow: /scripts/
Allow: /

Sitemap: https://rekker.co.ke/sitemap.xml`;
          
          fs.writeFileSync(robotsPath, robotsContent);
          console.log('✅ robots.txt created in public folder');
        }
      }
    },
    {
      name: 'copy-robots-txt',
      closeBundle: () => {
        const robotsSrc = path.resolve(__dirname, 'public', 'robots.txt');
        const robotsDest = path.resolve(__dirname, 'dist', 'robots.txt');
        
        try {
          if (fs.existsSync(robotsSrc)) {
            // Ensure dist directory exists
            const distDir = path.resolve(__dirname, 'dist');
            if (!fs.existsSync(distDir)) {
              fs.mkdirSync(distDir, { recursive: true });
            }
            
            fs.copyFileSync(robotsSrc, robotsDest);
            console.log('✅ robots.txt copied to dist folder');
          }
        } catch (error) {
          console.error('❌ Error copying robots.txt:', error);
        }
      }
    },
    viteSitemap({
      hostname: "https://rekker.co.ke",
      generateRobotsTxt: false,
      outDir: "dist",
      urls: [
        "/",                          
        "/shop/home",                 
        "/shop/about",                
        "/shop/services",             
        "/shop/distributors",         
        "/shop/contact",              
        "/shop/brands",               
        "/shop/brands/saffron",       
        "/shop/brands/cornells",      
        "/shop/listing",              
        "/shop/checkout",             
        "/shop/account",              
        "/shop/search",               
        "/shop/paypal-return",        
        "/shop/payment-success",      
      ],
      exclude: [
        "/auth/*",                    
        "/admin/*",                   
        "/unauth-page",               
      ],
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date().toISOString(),
      dynamicRoutes: [],
    }),
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'redux': [
            '@reduxjs/toolkit',
            'react-redux',
          ],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            'lucide-react',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    sourcemap: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
  optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'react-router-dom',
    '@reduxjs/toolkit',
    'react-redux',
    'firebase/app',
    'firebase/auth',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-switch',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-scroll-area',
  ],
  exclude: ['@vite/client'],
},
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});