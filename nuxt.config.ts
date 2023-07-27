import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import os from 'os'

const isDev = process.env.NODE_ENV === 'development'
const slash = os.type() == 'Windows_NT'?'\\':'/'
console.log(process.env.ENV)
export default defineNuxtConfig({
  modules: ['@sidebase/nuxt-auth','@pinia/nuxt'],
  auth: {
    isEnabled: true,
    enableGlobalAppMiddleware: false,
  },
  pinia: {
    autoImports: [
      'defineStore', // import { defineStore } from 'pinia'
    ]
  },
  runtimeConfig:{
    HOST: isDev?'http://localhost:3000':'http://nuxt.mdi9.tk',
    JWT_SECRET:"R^dRxVd7tpX4wFMtMTwk746VemAt*vMKheAsJC@4w4uvtfyGy^Z$uG%7S6eKMNY",
    DB_URI: "mssql://#######",
    MAIL_BOX:{
      host: 'smtp.office365.com',
      port : 587,
      user: '########',
      pass: '######!'
    },
    DOCS_FILES_DIR: os.homedir()+slash+'nuxtDocsFiles'+slash,
  },
  vite: {
    define: {
      "process.env.TESS_ENV": process.env.ENV,
    },
    plugins: [
      Components({
        // add option {resolveIcons: true} as parameter for resolving problem with icons
        resolvers: [
            AntDesignVueResolver({resolveIcons: false, importStyle: 'less'}),
            IconsResolver({prefix: false,enabledCollections: ['mdi']})
        ],
      }),
      Icons({autoInstall: true})
    ],
    ssr: {
      noExternal: ['moment', 'compute-scroll-into-view', 'ant-design-vue'],
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'primary-color': '#004e90',
            'link-color': '#004e90',
            'border-radius-base': '10px',
          },
          javascriptEnabled: true
        }
      }
    },
  },
  nitro: {
    plugins: [
        "~/server/dbInit.ts",
        //"~/server/dbCreation.ts"
    ],
    preset: 'node-server'
		// externals: {
		// 	inline: ["lodash-es", "dayjs"],
		// },
  },
  //experimental: { viteNode: true },
  // alias: {
  //   'dayjs': 'dayjs/esm/'
  // },
	build: {
		transpile: isDev?[]:[
      "lodash-es",
      "@babel/runtime"
    ],
	},
  // vue: {
  //   config: {
  //     css: {
  //       loaderOptions: {
  //         less: {
  //           lessOptions: {
  //             modifyVars: {
  //               'primary-color': '#004e90',
  //               'link-color': '#004e90',
  //               'border-radius-base': '10px',
  //             },
  //             javascriptEnabled: true,
  //           },
  //         },
  //       },
  //     },
  //   }
  // },
  // build:{
  //   loaders: {
  //     less: {
  //         lessOptions: {
  //           modifyVars: {
  //             'primary-color': '#004e90',
  //             'link-color': '#004e90',
  //             'border-radius-base': '10px',
  //           },
  //           javascriptEnabled: true,
  //         },
  //     },
  // },
  // }
})
