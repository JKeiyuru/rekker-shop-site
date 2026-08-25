import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteSitemap from "vite-plugin-sitemap";
import compression from "vite-plugin-compression";
import fs from 'fs';

const SITE_URL = "https://shop.rekker.co.ke";

// Real, live product routes for the sitemap — fetched from the API at build
// time. The static `urls` list below only knows about pages that exist in
// the router; it has no idea what products are actually in the database, so
// without this every product page would be invisible to the sitemap (and,
// while Google can still discover them by crawling links from listing
// pages, a sitemap entry is what tells Google these pages exist and should
// be prioritized). This runs once per deploy, so a brand-new product won't
// appear in the sitemap until the next build/redeploy — normal crawling of
// the listing pages still finds it in the meantime.
async function fetchProductRoutes(apiBaseUrl) {
  if (!apiBaseUrl) return [];
  try {
    const res = await fetch(`${apiBaseUrl}/api/shop/products/get`);
    const json = await res.json();
    const products = json?.data || [];
    return products.map((p) => ({
      loc: `/product/${p._id}`,
      lastmod: p.updatedAt || new Date().toISOString(),
      changefreq: "weekly",
      priority: 0.9,
    }));
  } catch (err) {
    console.warn("⚠️  Could not fetch products for sitemap (non-fatal):", err.message);
    return [];
  }
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const productRoutes = await fetchProductRoutes(env.VITE_API_BASE_URL);

  return {
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

        // Always (re)write robots.txt at build time so the Sitemap line
        // never drifts from the actual shop domain again.
        const robotsPath = path.resolve(publicDir, 'robots.txt');
        const robotsContent = `User-agent: *
Disallow: /admin/
Disallow: /auth/
Disallow: /account/
Disallow: /checkout/
Disallow: /payment-success/
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

        fs.writeFileSync(robotsPath, robotsContent);
        console.log('✅ robots.txt written for', SITE_URL);
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
      hostname: SITE_URL,
      generateRobotsTxt: false,
      outDir: "dist",
      // IMPORTANT: this plugin discovers routes by scanning dist/ for real
      // .html files — for a client-rendered SPA there's only ever one
      // (index.html, for "/"), so every other page HAS to be listed
      // explicitly via dynamicRoutes. There used to be a separate `urls`
      // option here, but this plugin version doesn't read it at all — it
      // was silently doing nothing, which is the actual reason the sitemap
      // only ever contained "/".
      exclude: [
        "/auth/*",
        "/admin/*",
        "/account*",
        "/checkout*",
        "/payment-success*",
        "/unauth-page",
      ],
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date().toISOString(),
      dynamicRoutes: [
        "/about",
        "/services",
        "/distributors",
        "/contact",
        "/brands",
        "/brands/saffron",
        "/brands/cornells",
        "/brands/bio-saff",
        "/products",
        "/search",
        ...productRoutes.map((r) => r.loc),
      ],
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
  };
});