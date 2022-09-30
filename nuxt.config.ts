import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineNuxtConfig({
  //modules: ['./modules/antdv'],
  //css: ['ant-design-vue/dist/antd.css'],
  vite: {
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
        "~/server/dbInit.ts"
    ],
		// externals: {
		// 	inline: ["lodash-es", "dayjs"],
		// },
  },
  //experimental: { viteNode: true },
  // alias: {
  //   'dayjs': 'dayjs/esm/'
  // },
	// build: {
	// 	transpile: ["lodash-es","@babel/runtime","argon2"],
	// },
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
