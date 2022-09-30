<!-- <script lang="ts">
import { Menu, Layout, LayoutSider, MenuItem, LayoutContent } from 'ant-design-vue';

  export default {
    components: {
      ALayout: Layout,
      AMenu: Menu,
      ALayoutSider: LayoutSider,
      AMenuItem: MenuItem,
      ALayoutContent: LayoutContent,
    },
  };
</script> -->

<script lang="ts" setup>

const collapsed = ref<boolean>(false)

const authState = useAuthState();
const router = useRouter();
const route = useRoute()
const selectedKeys = ref<string[]>([route.name.toString()])
const openKeys = ref<string[]>(['main'])
function logOut()
{
  authState.reset();
  router.push('/login');
}



</script>

<template>
  <a-layout style="min-height: 100vh" hasSider>
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
      <a-image :preview="false"
        src="/PetrosoftLogo.png"
        :style="{padding: '10px'}"
      />
      <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline">
        <div v-if="authState.loggedIn" key="main">
          <!-- <template #title>Main</template> -->
          <a-menu-item key="index" @click="navigateTo('/')">
              <mdi-home class="anticon"/>
              <span>Home</span>
          </a-menu-item>
          <a-menu-item key="users-list" @click="navigateTo('/users/list')">
              <mdi-account-group class="anticon"/>
              <span>Users list</span>
          </a-menu-item>
        </div>
        <a-divider v-if="authState.loggedIn"/>
        <a-menu-item v-if="!authState.loggedIn" key="login" @click="navigateTo('/login')">
          <mdi-lock-open class="anticon"/>
          <span>Login</span>
        </a-menu-item>
        <div v-else key="logged">
          <!-- <template #title>User</template> -->
          <a-menu-item :key="'/users/user-'+authState.user.id" @click="navigateTo('/users/user-'+authState.user.id)">
            <mdi-account-outline class="anticon"/>
            <span>{{authState.user.name}}</span>
          </a-menu-item>
          <a-menu-item key="logout" @click="logOut">
            <mdi-exit-run class="anticon"/>
            <span>Logout</span>
          </a-menu-item>
        </div>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <!-- <a-layout-header style="background: #fff; padding: 0" /> -->
      <a-layout-content style="margin: 0 16px">
        <!-- <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>User</a-breadcrumb-item>
          <a-breadcrumb-item>Bill</a-breadcrumb-item>
        </a-breadcrumb> -->
        <Alert></Alert>
        <NuxtPage/>
        <!-- <a-card title="Login">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </a-card> -->
      </a-layout-content>
      <!-- <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer> -->
    </a-layout>
  </a-layout>
</template>
