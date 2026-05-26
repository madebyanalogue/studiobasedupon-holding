// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/sanity',
    '@nuxt/image',
  ],
  sanity: {
    projectId: 'b6xol4su',
    dataset: 'production',
    useCdn: true,
    apiVersion: '2024-03-19',
    visualEditing: {
      studioUrl: false,
      enabled: false,
    },
  },
  runtimeConfig: {
    public: {
      sanity: {
        projectId: 'b6xol4su',
        dataset: 'production',
      },
    },
  },
  image: {
    sanity: {
      projectId: 'b6xol4su',
      dataset: 'production',
    },
    quality: 80,
    format: ['webp', 'jpg'],
    // Enable image caching
    domains: ['cdn.sanity.io'],
    // Add cache headers for images
    // Breakpoints used by Nuxt Image to generate widths.
    // Increase the largest size so hero images on desktop can get a sharper,
    // higher‑resolution source than 1536px.
    screens: {
      lg: 1200,
      xl: 2560,
      xxl: 3200,
    },
  },
  css: [
    '~/assets/styles/colours.css',
    '~/assets/styles/main.css',
    '~/assets/styles/padding.css',
    '~/assets/styles/typography.css',
    '~/assets/styles/click-zoom.css',
  ],
  experimental: {
    inlineSSRStyles: false,
  },
  app: {
    head: {
      title: 'Based Upon',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      style: [
        {
          children: `
            html:not(.css-loaded) body { 
              visibility: hidden !important; 
              opacity: 0 !important;
            } 
            html.css-loaded body { 
              visibility: visible !important; 
              opacity: 1 !important;
              transition: opacity 0.2s ease-in;
            }
          `,
          key: 'prevent-fouc'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
          defer: true,
        },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
  build: {
    transpile: ['@nuxtjs/sanity'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['@sanity/visual-editing', '@sanity/ui', 'react-compiler-runtime', 'react', 'react-dom'],
    },
    ssr: {
      noExternal: [],
      external: ['@sanity/visual-editing'],
    },
    resolve: {
      alias: {
        'react-compiler-runtime': join(__dirname, 'node_modules/react-compiler-runtime/dist/index.js'),
        '@sanity/visual-editing': join(__dirname, 'stubs/sanity-visual-editing-stub.js'),
      },
    },
    plugins: [
      {
        name: 'stub-react-compiler-nested',
        resolveId(id) {
          if (id.includes('react-compiler-runtime')) {
            return join(__dirname, 'node_modules/react-compiler-runtime/dist/index.js')
          }
          if (id.includes('@sanity/visual-editing') && !id.includes('stub')) {
            return join(__dirname, 'stubs/sanity-visual-editing-stub.js')
          }
        },
      },
    ],
  },
})

