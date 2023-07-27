<script setup lang="ts">
//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
const route = useRoute()

const flows:any = ref(null)
const selectedFlow:any = ref(null)
const selectedRowKeys = ref<string[]>([]);

const columns = ref([
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
        ])
const rowSelection = ref({
    checkStrictly: false,
    preserveSelectedRowKeys: true,
    type: "radio",
    onChange: (changableRowKeys: string[]) => {
        console.log(`selectedRowKeys: ${changableRowKeys}`);
        selectedRowKeys.value = changableRowKeys;
    },
    selectedRowKeys: selectedRowKeys,
    onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
      //selectedRowKeys.value = selectedRows
      navigateTo('/flows/'+record.id,{replace: true})
    },
});
onMounted(async ()=>{//route.params.id
    flows.value = await $fetch('/api/flows')
    flows.value = flows.value.map(x=>{x.key = x.id;return x})
    if(route.params.id && flows.value){
      selectedFlow.value = flows.value.find(x=>x.id == route.params.id)
      selectedRowKeys.value = [parseInt(route.params.id)]
    }
})
const adminMode = ref(authState.value.user.roles.includes('Admin'))
</script>
  
<template>
  <a-row>
    <a-col :span="4">
      <a-card title="Flow list">
          <template #extra v-if="adminMode">
              <a-button type="primary" @click="navigateTo('/flows')">
                  <template #icon><mdi-plus /></template>
              </a-button>
          </template>
          <a-table :dataSource="flows" :columns="columns" :row-selection="rowSelection" />
      </a-card>
    </a-col>
    <a-col :span="20">
      <FormFlow :key="selectedFlow?selectedFlow.id:0" :flowData="selectedFlow?selectedFlow:undefined" :allFlows="flows"></FormFlow>
    </a-col>
  </a-row>
  </template>