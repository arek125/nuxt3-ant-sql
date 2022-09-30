<script lang="ts" setup>
const authState = useAuthState()
const { data: users }: { data: any } = await useAsyncData( 'users',
  async () => $fetch('/api/users', { headers: authState.getAuthHeader() }),
)

        const columns = ref([
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
          },
          // {
          //   title: 'Role',
          //   dataIndex: 'role',
          //   key: 'role',
          // },
          {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
          },
          {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
          },
        ])

const customRow = (user) => {
 return {
  onClick: (event) => {navigateTo('/users/user-'+user.id)}
 };
}

const adminMode = ref(authState.value.user.roles.includes('Admin'))

</script>


<template>
<div>
    <a-card title="Users list">
        <template #extra v-if="adminMode">
            <a-button type="primary" @click="navigateTo('/users/new')">
                <template #icon><mdi-account-plus /></template>
            </a-button>
        </template>
        <a-table :dataSource="users" :columns="columns" :customRow="customRow">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'active'">
                    <mdi-checkbox-blank-circle v-if="record.active"/>
                    <mdi-checkbox-blank-circle-outline v-else/>
                </template>
                <template v-else-if="column.key === 'roles'">
                  <a-tag
                    v-for="role in record.roles"
                    :key="role.name"
                  >
                    {{ role.name.toUpperCase() }}
                  </a-tag>
                </template>
            </template>
        </a-table>
    </a-card>
</div>
</template>