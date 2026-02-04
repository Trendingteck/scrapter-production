// vite.config.mts
import { defineConfig, loadEnv } from "file:///C:/Users/user/Desktop/production/scrapter/node_modules/.pnpm/vite@6.4.1_@types+node@22.19.8_jiti@1.21.7_lightningcss@1.30.2_terser@5.46.0_tsx@4.21.0_yaml@2.8.2/node_modules/vite/dist/node/index.js";
import { resolve as resolve2, join } from "path";
import libAssetsPlugin from "file:///C:/Users/user/Desktop/production/scrapter/node_modules/.pnpm/@laynezh+vite-plugin-lib-assets@0.6.1_vite@5.4.21_@types+node@22.19.8_lightningcss@1.30.2_terser@5.46.0_/node_modules/@laynezh/vite-plugin-lib-assets/dist/index.js";
import fs2 from "fs";

// utils/plugins/make-manifest-plugin.ts
import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import process2 from "node:process";
import { colorLog, ManifestParser } from "file:///C:/Users/user/Desktop/production/scrapter/packages/dev-utils/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\user\\Desktop\\production\\scrapter\\apps\\extension\\utils\\plugins";
var rootDir = resolve(__vite_injected_original_dirname, "..", "..");
var refreshFile = resolve(__vite_injected_original_dirname, "..", "refresh.js");
var manifestFile = resolve(rootDir, "manifest.js");
var getManifestWithCacheBurst = () => {
  const withCacheBurst = (path) => `${path}?${Date.now().toString()}`;
  if (process2.platform === "win32") {
    return import(withCacheBurst(pathToFileURL(manifestFile).href));
  }
  return import(withCacheBurst(manifestFile));
};
function makeManifestPlugin(config) {
  function makeManifest(manifest, to) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const manifestPath = resolve(to, "manifest.json");
    const isFirefox = process2.env.__FIREFOX__ === "true";
    const isDev2 = process2.env.__DEV__ === "true";
    if (isDev2) {
      addRefreshContentScript(manifest);
    }
    fs.writeFileSync(manifestPath, ManifestParser.convertManifestToString(manifest, isFirefox ? "firefox" : "chrome"));
    if (isDev2) {
      fs.copyFileSync(refreshFile, resolve(to, "refresh.js"));
    }
    colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
  }
  return {
    name: "make-manifest",
    buildStart() {
      this.addWatchFile(manifestFile);
    },
    async writeBundle() {
      const outDir2 = config.outDir;
      const manifest = await getManifestWithCacheBurst();
      makeManifest(manifest.default, outDir2);
    }
  };
}
function addRefreshContentScript(manifest) {
  manifest.content_scripts = manifest.content_scripts || [];
  manifest.content_scripts.push({
    matches: ["http://*/*", "https://*/*", "<all_urls>"],
    js: ["refresh.js"]
    // for public's HMR(refresh) support
  });
}

// vite.config.mts
import { watchPublicPlugin, watchRebuildPlugin } from "file:///C:/Users/user/Desktop/production/scrapter/packages/hmr/dist/index.js";
import { watchOption } from "file:///C:/Users/user/Desktop/production/scrapter/packages/vite-config/index.mjs";
var __vite_injected_original_dirname2 = "C:\\Users\\user\\Desktop\\production\\scrapter\\apps\\extension";
var rootDir2 = resolve2(__vite_injected_original_dirname2);
var srcDir = resolve2(rootDir2, "src");
var outDir = resolve2(rootDir2, "../../dist");
var shimPath = resolve2(__vite_injected_original_dirname2, "utils/node-shims.ts");
var publicDir = resolve2(rootDir2, "public");
var localesSourceDir = resolve2(rootDir2, "../packages/i18n/locales");
var isDev = process.env.__DEV__ === "true";
var isProduction = !isDev;
function copyRecursiveSync(src, dest) {
  if (!fs2.existsSync(src)) return;
  const stats = fs2.statSync(src);
  if (stats.isDirectory()) {
    if (!fs2.existsSync(dest)) fs2.mkdirSync(dest, { recursive: true });
    fs2.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    fs2.copyFileSync(src, dest);
  }
}
var vite_config_default = defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, resolve2(rootDir2, ".."), "VITE_");
  const allEnv = loadEnv(mode, resolve2(rootDir2, "../.."), "");
  return {
    publicDir,
    resolve: {
      alias: [
        { find: "@src", replacement: srcDir },
        { find: "@root", replacement: rootDir2 },
        { find: "@assets", replacement: resolve2(srcDir, "assets") },
        // === Polyfills ===
        { find: "node-shim", replacement: shimPath },
        // Crypto (FIX for get-uri)
        { find: "node:crypto", replacement: shimPath },
        { find: "crypto", replacement: shimPath },
        // FS Promises (FIX for [vite:load-fallback] error)
        // We point these directly to the file to prevent directory lookups
        { find: "node:fs/promises", replacement: shimPath },
        { find: "fs/promises", replacement: shimPath },
        // Other Modules
        { find: "node:fs", replacement: shimPath },
        { find: "fs", replacement: shimPath },
        { find: "node:url", replacement: shimPath },
        { find: "url", replacement: shimPath },
        { find: "node:http", replacement: shimPath },
        { find: "http", replacement: shimPath },
        { find: "node:https", replacement: shimPath },
        { find: "https", replacement: shimPath },
        { find: "node:stream", replacement: shimPath },
        { find: "stream", replacement: shimPath },
        { find: "node:zlib", replacement: shimPath },
        { find: "zlib", replacement: shimPath },
        { find: "node:path", replacement: shimPath },
        { find: "path", replacement: shimPath },
        { find: "node:os", replacement: shimPath },
        { find: "os", replacement: shimPath },
        { find: "node:child_process", replacement: shimPath },
        { find: "child_process", replacement: shimPath },
        { find: "node:readline", replacement: shimPath },
        { find: "node:events", replacement: shimPath },
        { find: "events", replacement: shimPath },
        { find: "node:assert", replacement: shimPath },
        { find: "assert", replacement: shimPath },
        { find: "node:util", replacement: shimPath },
        { find: "util", replacement: shimPath },
        { find: "node:buffer", replacement: shimPath },
        { find: "buffer", replacement: shimPath },
        { find: "node:process", replacement: shimPath },
        { find: "process", replacement: shimPath },
        { find: "node:tty", replacement: shimPath },
        { find: "tty", replacement: shimPath },
        { find: "node:net", replacement: shimPath },
        { find: "net", replacement: shimPath },
        { find: "node:tls", replacement: shimPath },
        { find: "tls", replacement: shimPath },
        { find: "node:vm", replacement: shimPath },
        { find: "vm", replacement: shimPath },
        { find: "node:dgram", replacement: shimPath },
        { find: "dgram", replacement: shimPath }
      ]
    },
    plugins: [
      libAssetsPlugin({
        outputPath: "assets"
      }),
      watchPublicPlugin(),
      makeManifestPlugin({ outDir }),
      isDev && watchRebuildPlugin({ reload: true, id: "chrome-extension-hmr" }),
      {
        name: "copy-locales",
        writeBundle() {
          const dest = resolve2(outDir, "_locales");
          if (fs2.existsSync(localesSourceDir)) {
            copyRecursiveSync(localesSourceDir, dest);
          }
        }
      }
    ],
    build: {
      lib: {
        entry: resolve2(srcDir, "background/index.ts"),
        name: "background",
        fileName: "background",
        formats: ["iife"]
      },
      outDir,
      copyPublicDir: true,
      emptyOutDir: false,
      sourcemap: isDev,
      minify: isProduction,
      reportCompressedSize: isProduction,
      watch: isDev ? watchOption : null,
      rollupOptions: {
        output: {
          entryFileNames: "background.iife.js",
          extend: true
        },
        external: ["chrome"]
      }
    },
    define: {
      "import.meta.env.VITE_POSTHOG_API_KEY": JSON.stringify(viteEnv.VITE_POSTHOG_API_KEY || process.env.VITE_POSTHOG_API_KEY || ""),
      // Inject API keys for the extension initialization
      "process.env.GEMINI_API_KEY": JSON.stringify(allEnv.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ""),
      "process.env.OPENAI_API_KEY": JSON.stringify(allEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInV0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdC1wbHVnaW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxccHJvZHVjdGlvblxcXFxzY3JhcHRlclxcXFxhcHBzXFxcXGV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXHByb2R1Y3Rpb25cXFxcc2NyYXB0ZXJcXFxcYXBwc1xcXFxleHRlbnNpb25cXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy91c2VyL0Rlc2t0b3AvcHJvZHVjdGlvbi9zY3JhcHRlci9hcHBzL2V4dGVuc2lvbi92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUsIGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCBsaWJBc3NldHNQbHVnaW4gZnJvbSAnQGxheW5lemgvdml0ZS1wbHVnaW4tbGliLWFzc2V0cyc7XG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5qcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG1ha2VNYW5pZmVzdFBsdWdpbiBmcm9tICcuL3V0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdC1wbHVnaW4nO1xuaW1wb3J0IHsgd2F0Y2hQdWJsaWNQbHVnaW4sIHdhdGNoUmVidWlsZFBsdWdpbiB9IGZyb20gJ0BleHRlbnNpb24vaG1yJztcbmltcG9ydCB7IHdhdGNoT3B0aW9uIH0gZnJvbSAnQGV4dGVuc2lvbi92aXRlLWNvbmZpZyc7XG5cbmNvbnN0IHJvb3REaXIgPSByZXNvbHZlKF9fZGlybmFtZSk7XG5jb25zdCBzcmNEaXIgPSByZXNvbHZlKHJvb3REaXIsICdzcmMnKTtcbmNvbnN0IG91dERpciA9IHJlc29sdmUocm9vdERpciwgJy4uLy4uL2Rpc3QnKTtcbmNvbnN0IHNoaW1QYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICd1dGlscy9ub2RlLXNoaW1zLnRzJyk7XG5jb25zdCBwdWJsaWNEaXIgPSByZXNvbHZlKHJvb3REaXIsICdwdWJsaWMnKTtcbmNvbnN0IGxvY2FsZXNTb3VyY2VEaXIgPSByZXNvbHZlKHJvb3REaXIsICcuLi9wYWNrYWdlcy9pMThuL2xvY2FsZXMnKTtcblxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5fX0RFVl9fID09PSAndHJ1ZSc7XG5jb25zdCBpc1Byb2R1Y3Rpb24gPSAhaXNEZXY7XG5cbmZ1bmN0aW9uIGNvcHlSZWN1cnNpdmVTeW5jKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpIHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc3JjKSkgcmV0dXJuO1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoc3JjKTtcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGVzdCkpIGZzLm1rZGlyU3luYyhkZXN0LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgZnMucmVhZGRpclN5bmMoc3JjKS5mb3JFYWNoKChjaGlsZEl0ZW1OYW1lKSA9PiB7XG4gICAgICAgICAgICBjb3B5UmVjdXJzaXZlU3luYyhqb2luKHNyYywgY2hpbGRJdGVtTmFtZSksIGpvaW4oZGVzdCwgY2hpbGRJdGVtTmFtZSkpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoc3JjLCBkZXN0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgICAvLyBMb2FkIEFMTCBlbnYgdmFyaWFibGVzIChub3QganVzdCBWSVRFXyBwcmVmaXhlZCkgZnJvbSBib3RoIHRoZSBleHRlbnNpb24gYW5kIG1vbm9yZXBvIHJvb3RcbiAgICBjb25zdCB2aXRlRW52ID0gbG9hZEVudihtb2RlLCByZXNvbHZlKHJvb3REaXIsICcuLicpLCAnVklURV8nKTtcbiAgICBjb25zdCBhbGxFbnYgPSBsb2FkRW52KG1vZGUsIHJlc29sdmUocm9vdERpciwgJy4uLy4uJyksICcnKTsgLy8gTG9hZCBmcm9tIG1vbm9yZXBvIHJvb3RcblxuICAgIHJldHVybiB7XG4gICAgICAgIHB1YmxpY0RpcjogcHVibGljRGlyLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczogW1xuICAgICAgICAgICAgICAgIHsgZmluZDogJ0BzcmMnLCByZXBsYWNlbWVudDogc3JjRGlyIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnQHJvb3QnLCByZXBsYWNlbWVudDogcm9vdERpciB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ0Bhc3NldHMnLCByZXBsYWNlbWVudDogcmVzb2x2ZShzcmNEaXIsICdhc3NldHMnKSB9LFxuXG4gICAgICAgICAgICAgICAgLy8gPT09IFBvbHlmaWxscyA9PT1cbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlLXNoaW0nLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcblxuICAgICAgICAgICAgICAgIC8vIENyeXB0byAoRklYIGZvciBnZXQtdXJpKVxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6Y3J5cHRvJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnY3J5cHRvJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG5cbiAgICAgICAgICAgICAgICAvLyBGUyBQcm9taXNlcyAoRklYIGZvciBbdml0ZTpsb2FkLWZhbGxiYWNrXSBlcnJvcilcbiAgICAgICAgICAgICAgICAvLyBXZSBwb2ludCB0aGVzZSBkaXJlY3RseSB0byB0aGUgZmlsZSB0byBwcmV2ZW50IGRpcmVjdG9yeSBsb29rdXBzXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpmcy9wcm9taXNlcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2ZzL3Byb21pc2VzJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG5cbiAgICAgICAgICAgICAgICAvLyBPdGhlciBNb2R1bGVzXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpmcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2ZzJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTp1cmwnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICd1cmwnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOmh0dHAnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdodHRwJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpodHRwcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2h0dHBzJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpzdHJlYW0nLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdzdHJlYW0nLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOnpsaWInLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICd6bGliJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpwYXRoJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAncGF0aCcsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6b3MnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdvcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6Y2hpbGRfcHJvY2VzcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2NoaWxkX3Byb2Nlc3MnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOnJlYWRsaW5lJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTpldmVudHMnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdldmVudHMnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOmFzc2VydCcsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2Fzc2VydCcsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6dXRpbCcsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ3V0aWwnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOmJ1ZmZlcicsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ2J1ZmZlcicsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6cHJvY2VzcycsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ3Byb2Nlc3MnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOnR0eScsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ3R0eScsIHJlcGxhY2VtZW50OiBzaGltUGF0aCB9LFxuICAgICAgICAgICAgICAgIHsgZmluZDogJ25vZGU6bmV0JywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbmV0JywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnbm9kZTp0bHMnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICd0bHMnLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOnZtJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAndm0nLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgICAgICB7IGZpbmQ6ICdub2RlOmRncmFtJywgcmVwbGFjZW1lbnQ6IHNoaW1QYXRoIH0sXG4gICAgICAgICAgICAgICAgeyBmaW5kOiAnZGdyYW0nLCByZXBsYWNlbWVudDogc2hpbVBhdGggfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIGxpYkFzc2V0c1BsdWdpbih7XG4gICAgICAgICAgICAgICAgb3V0cHV0UGF0aDogJ2Fzc2V0cycsXG4gICAgICAgICAgICB9KSBhcyBhbnksXG4gICAgICAgICAgICB3YXRjaFB1YmxpY1BsdWdpbigpLFxuICAgICAgICAgICAgbWFrZU1hbmlmZXN0UGx1Z2luKHsgb3V0RGlyIH0pLFxuICAgICAgICAgICAgaXNEZXYgJiYgd2F0Y2hSZWJ1aWxkUGx1Z2luKHsgcmVsb2FkOiB0cnVlLCBpZDogJ2Nocm9tZS1leHRlbnNpb24taG1yJyB9KSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29weS1sb2NhbGVzJyxcbiAgICAgICAgICAgICAgICB3cml0ZUJ1bmRsZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IHJlc29sdmUob3V0RGlyLCAnX2xvY2FsZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobG9jYWxlc1NvdXJjZURpcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlSZWN1cnNpdmVTeW5jKGxvY2FsZXNTb3VyY2VEaXIsIGRlc3QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIGxpYjoge1xuICAgICAgICAgICAgICAgIGVudHJ5OiByZXNvbHZlKHNyY0RpciwgJ2JhY2tncm91bmQvaW5kZXgudHMnKSxcbiAgICAgICAgICAgICAgICBuYW1lOiAnYmFja2dyb3VuZCcsXG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6ICdiYWNrZ3JvdW5kJyxcbiAgICAgICAgICAgICAgICBmb3JtYXRzOiBbJ2lpZmUnXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvdXREaXI6IG91dERpcixcbiAgICAgICAgICAgIGNvcHlQdWJsaWNEaXI6IHRydWUsXG4gICAgICAgICAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgICAgICAgICBzb3VyY2VtYXA6IGlzRGV2LFxuICAgICAgICAgICAgbWluaWZ5OiBpc1Byb2R1Y3Rpb24sXG4gICAgICAgICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogaXNQcm9kdWN0aW9uLFxuICAgICAgICAgICAgd2F0Y2g6IGlzRGV2ID8gd2F0Y2hPcHRpb24gOiBudWxsLFxuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2JhY2tncm91bmQuaWlmZS5qcycsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2Nocm9tZSddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfUE9TVEhPR19BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkodml0ZUVudi5WSVRFX1BPU1RIT0dfQVBJX0tFWSB8fCBwcm9jZXNzLmVudi5WSVRFX1BPU1RIT0dfQVBJX0tFWSB8fCAnJyksXG4gICAgICAgICAgICAvLyBJbmplY3QgQVBJIGtleXMgZm9yIHRoZSBleHRlbnNpb24gaW5pdGlhbGl6YXRpb25cbiAgICAgICAgICAgICdwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGFsbEVudi5HRU1JTklfQVBJX0tFWSB8fCBwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSB8fCAnJyksXG4gICAgICAgICAgICAncHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVknOiBKU09OLnN0cmluZ2lmeShhbGxFbnYuT1BFTkFJX0FQSV9LRVkgfHwgcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVkgfHwgJycpLFxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXHByb2R1Y3Rpb25cXFxcc2NyYXB0ZXJcXFxcYXBwc1xcXFxleHRlbnNpb25cXFxcdXRpbHNcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXHByb2R1Y3Rpb25cXFxcc2NyYXB0ZXJcXFxcYXBwc1xcXFxleHRlbnNpb25cXFxcdXRpbHNcXFxccGx1Z2luc1xcXFxtYWtlLW1hbmlmZXN0LXBsdWdpbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL3Byb2R1Y3Rpb24vc2NyYXB0ZXIvYXBwcy9leHRlbnNpb24vdXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LXBsdWdpbi50c1wiO2ltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgeyBjb2xvckxvZywgTWFuaWZlc3RQYXJzZXIgfSBmcm9tICdAZXh0ZW5zaW9uL2Rldi11dGlscyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBNYW5pZmVzdCB9IGZyb20gJ0BleHRlbnNpb24vZGV2LXV0aWxzL2Rpc3QvbGliL21hbmlmZXN0LXBhcnNlci90eXBlJztcblxuY29uc3Qgcm9vdERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nKTtcbmNvbnN0IHJlZnJlc2hGaWxlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICdyZWZyZXNoLmpzJyk7XG5jb25zdCBtYW5pZmVzdEZpbGUgPSByZXNvbHZlKHJvb3REaXIsICdtYW5pZmVzdC5qcycpO1xuXG5jb25zdCBnZXRNYW5pZmVzdFdpdGhDYWNoZUJ1cnN0ID0gKCk6IFByb21pc2U8eyBkZWZhdWx0OiBjaHJvbWUucnVudGltZS5NYW5pZmVzdFYzIH0+ID0+IHtcbiAgY29uc3Qgd2l0aENhY2hlQnVyc3QgPSAocGF0aDogc3RyaW5nKSA9PiBgJHtwYXRofT8ke0RhdGUubm93KCkudG9TdHJpbmcoKX1gO1xuICAvKipcbiAgICogSW4gV2luZG93cywgaW1wb3J0KCkgZG9lc24ndCB3b3JrIHdpdGhvdXQgZmlsZTovLyBwcm90b2NvbC5cbiAgICogU28sIHdlIG5lZWQgdG8gY29udmVydCBwYXRoIHRvIGZpbGU6Ly8gcHJvdG9jb2wuICh1cmwucGF0aFRvRmlsZVVSTClcbiAgICovXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgcmV0dXJuIGltcG9ydCh3aXRoQ2FjaGVCdXJzdChwYXRoVG9GaWxlVVJMKG1hbmlmZXN0RmlsZSkuaHJlZikpO1xuICB9XG5cbiAgcmV0dXJuIGltcG9ydCh3aXRoQ2FjaGVCdXJzdChtYW5pZmVzdEZpbGUpKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1ha2VNYW5pZmVzdFBsdWdpbihjb25maWc6IHsgb3V0RGlyOiBzdHJpbmcgfSk6IFBsdWdpbk9wdGlvbiB7XG4gIGZ1bmN0aW9uIG1ha2VNYW5pZmVzdChtYW5pZmVzdDogY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMywgdG86IHN0cmluZykge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh0bykpIHtcbiAgICAgIGZzLm1rZGlyU3luYyh0byk7XG4gICAgfVxuICAgIGNvbnN0IG1hbmlmZXN0UGF0aCA9IHJlc29sdmUodG8sICdtYW5pZmVzdC5qc29uJyk7XG5cbiAgICBjb25zdCBpc0ZpcmVmb3ggPSBwcm9jZXNzLmVudi5fX0ZJUkVGT1hfXyA9PT0gJ3RydWUnO1xuICAgIGNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnYuX19ERVZfXyA9PT0gJ3RydWUnO1xuXG4gICAgaWYgKGlzRGV2KSB7XG4gICAgICBhZGRSZWZyZXNoQ29udGVudFNjcmlwdChtYW5pZmVzdCk7XG4gICAgfVxuXG4gICAgZnMud3JpdGVGaWxlU3luYyhtYW5pZmVzdFBhdGgsIE1hbmlmZXN0UGFyc2VyLmNvbnZlcnRNYW5pZmVzdFRvU3RyaW5nKG1hbmlmZXN0LCBpc0ZpcmVmb3ggPyAnZmlyZWZveCcgOiAnY2hyb21lJykpO1xuICAgIGlmIChpc0Rldikge1xuICAgICAgZnMuY29weUZpbGVTeW5jKHJlZnJlc2hGaWxlLCByZXNvbHZlKHRvLCAncmVmcmVzaC5qcycpKTtcbiAgICB9XG5cbiAgICBjb2xvckxvZyhgTWFuaWZlc3QgZmlsZSBjb3B5IGNvbXBsZXRlOiAke21hbmlmZXN0UGF0aH1gLCAnc3VjY2VzcycpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnbWFrZS1tYW5pZmVzdCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIHRoaXMuYWRkV2F0Y2hGaWxlKG1hbmlmZXN0RmlsZSk7XG4gICAgfSxcbiAgICBhc3luYyB3cml0ZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnN0IG91dERpciA9IGNvbmZpZy5vdXREaXI7XG4gICAgICBjb25zdCBtYW5pZmVzdCA9IGF3YWl0IGdldE1hbmlmZXN0V2l0aENhY2hlQnVyc3QoKTtcbiAgICAgIG1ha2VNYW5pZmVzdChtYW5pZmVzdC5kZWZhdWx0LCBvdXREaXIpO1xuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFJlZnJlc2hDb250ZW50U2NyaXB0KG1hbmlmZXN0OiBNYW5pZmVzdCkge1xuICBtYW5pZmVzdC5jb250ZW50X3NjcmlwdHMgPSBtYW5pZmVzdC5jb250ZW50X3NjcmlwdHMgfHwgW107XG4gIG1hbmlmZXN0LmNvbnRlbnRfc2NyaXB0cy5wdXNoKHtcbiAgICBtYXRjaGVzOiBbJ2h0dHA6Ly8qLyonLCAnaHR0cHM6Ly8qLyonLCAnPGFsbF91cmxzPiddLFxuICAgIGpzOiBbJ3JlZnJlc2guanMnXSwgLy8gZm9yIHB1YmxpYydzIEhNUihyZWZyZXNoKSBzdXBwb3J0XG4gIH0pO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VyxTQUFTLGNBQWMsZUFBZTtBQUNsWixTQUFTLFdBQUFBLFVBQVMsWUFBWTtBQUM5QixPQUFPLHFCQUFxQjtBQUU1QixPQUFPQyxTQUFROzs7QUNKMlosT0FBTyxRQUFRO0FBQ3piLFNBQVMsZUFBZTtBQUN4QixTQUFTLHFCQUFxQjtBQUM5QixPQUFPQyxjQUFhO0FBQ3BCLFNBQVMsVUFBVSxzQkFBc0I7QUFKekMsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTSxVQUFVLFFBQVEsa0NBQVcsTUFBTSxJQUFJO0FBQzdDLElBQU0sY0FBYyxRQUFRLGtDQUFXLE1BQU0sWUFBWTtBQUN6RCxJQUFNLGVBQWUsUUFBUSxTQUFTLGFBQWE7QUFFbkQsSUFBTSw0QkFBNEIsTUFBdUQ7QUFDdkYsUUFBTSxpQkFBaUIsQ0FBQyxTQUFpQixHQUFHLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxTQUFTLENBQUM7QUFLekUsTUFBSUMsU0FBUSxhQUFhLFNBQVM7QUFDaEMsV0FBTyxPQUFPLGVBQWUsY0FBYyxZQUFZLEVBQUUsSUFBSTtBQUFBLEVBQy9EO0FBRUEsU0FBTyxPQUFPLGVBQWUsWUFBWTtBQUMzQztBQUVlLFNBQVIsbUJBQW9DLFFBQTBDO0FBQ25GLFdBQVMsYUFBYSxVQUFxQyxJQUFZO0FBQ3JFLFFBQUksQ0FBQyxHQUFHLFdBQVcsRUFBRSxHQUFHO0FBQ3RCLFNBQUcsVUFBVSxFQUFFO0FBQUEsSUFDakI7QUFDQSxVQUFNLGVBQWUsUUFBUSxJQUFJLGVBQWU7QUFFaEQsVUFBTSxZQUFZQSxTQUFRLElBQUksZ0JBQWdCO0FBQzlDLFVBQU1DLFNBQVFELFNBQVEsSUFBSSxZQUFZO0FBRXRDLFFBQUlDLFFBQU87QUFDVCw4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RixTQUFRLFFBQVEscUJBQXFCO0FBQUEsUUFDNUMsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsU0FBUyxDQUFDLE1BQU07QUFBQSxNQUNwQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLGVBQWU7QUFBQSxNQUNmLGFBQWE7QUFBQSxNQUNiLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLHNCQUFzQjtBQUFBLE1BQ3RCLE9BQU8sUUFBUSxjQUFjO0FBQUEsTUFDN0IsZUFBZTtBQUFBLFFBQ1gsUUFBUTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsVUFDaEIsUUFBUTtBQUFBLFFBQ1o7QUFBQSxRQUNBLFVBQVUsQ0FBQyxRQUFRO0FBQUEsTUFDdkI7QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDSix3Q0FBd0MsS0FBSyxVQUFVLFFBQVEsd0JBQXdCLFFBQVEsSUFBSSx3QkFBd0IsRUFBRTtBQUFBO0FBQUEsTUFFN0gsOEJBQThCLEtBQUssVUFBVSxPQUFPLGtCQUFrQixRQUFRLElBQUksa0JBQWtCLEVBQUU7QUFBQSxNQUN0Ryw4QkFBOEIsS0FBSyxVQUFVLE9BQU8sa0JBQWtCLFFBQVEsSUFBSSxrQkFBa0IsRUFBRTtBQUFBLElBQzFHO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbInJlc29sdmUiLCAiZnMiLCAicHJvY2VzcyIsICJwcm9jZXNzIiwgImlzRGV2IiwgIm91dERpciIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJyb290RGlyIiwgInJlc29sdmUiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAiZnMiXQp9Cg==
