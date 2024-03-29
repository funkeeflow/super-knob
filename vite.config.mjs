import dts from 'vite-plugin-dts';
import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';

const middleware = () => {
  return {
    name: "serve-demo",
    configureServer(server) {
      server.middlewares.use(
        (req, res, next) => {
          console.log(req.url);
          if (req.url === "/") {
            req.url = '/demo/index.html';
          }
          next();
        }
      )
    }
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      build: {
        outDir: 'dist',
        lib: {
          name: 'super-knob',
          entry: './src/index.ts',
          formats: ['es', "cjs"],
        },
        minify: false,
      },
      define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
      },
      plugins: [dts({
        insertTypesEntry: true,
        outputDir: 'dist',
        staticImport: true,
        exclude: ['**/node_modules/**']})]
    }
  }

  if (mode === 'production') {
    return {
      root: 'docs',
      publicDir: 'docs/public',
      build: {
        target: 'esnext',
      },
      define: {
        API_BASE_URL: "'https://next.praepapp.com'",
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
      },
    }
  }

  if (mode === 'development') {
    return {
      plugins: [middleware()],
      root: 'docs',
      publicDir: 'docs/public',
      resolve: {
        alias: { '/src': resolve(process.cwd(), 'src') }
      },
      server: {
        port: 4000,
        host: true
      },
      define: {
        API_BASE_URL: "'http://localhost:3000'",
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
      },
    }
  }

  return {}
});