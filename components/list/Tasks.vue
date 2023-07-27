<script lang="ts" setup>
import type { TableProps } from 'ant-design-vue'
import * as qs from 'qs'
//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
        const columns = ref([
          {
            title: 'Title',
            dataIndex: 'title',
            sorter: true,
            customFilterDropdown: true,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            customFilterDropdown: true,
          },
          {
            title: 'Document',
            dataIndex: ['flowInstance','document','title'],
            key: 'flowInstance.document.title',
            sorter: true,
            customFilterDropdown: true,
          },
          {
            title: 'Users',
            dataIndex: 'users',
            sorter: true,
            key: 'users.name',
            customFilterDropdown: true,
          },
          {
            title: 'Outcome',
            dataIndex: ['outcome','name'],
            key: 'outcome.name',
            sorter: true,
            customFilterDropdown: true,
          },
        ])

const activeTab = ref('myTasks')
const tabFilter = computed(() => {
  if(activeTab.value == 'myTasks')
  return{'$users.id$': authState.value.user?.id}
  else return {}
})
const customRow = (task) => {
 return {
  onClick: (event) => {navigateTo('/docs/doc-'+task.flowInstance.documentId+"?taskId="+task.id)}
 };
}

function statusColor(status){
    if(status == 'New' || 'In progress') return 'orange'
    else if (status == 'Completed') return 'green'
    else if (status == 'Errored') return 'red'
    else return 'default'
}

//const adminMode = ref(authState.value.user.roles.includes('Admin'))
let pagination = reactive({
    total: 1,
    current: 1,
    pageSize: 10,
})

// const { data: docs }: { data: any } = await useAsyncData( 'docs',
//   async () => $fetch('/api/docs?page='+currentPage.value+"&pageSize="+pageSize.value, { headers: authState.getAuthHeader() }),
// )

const tasks = ref([])
const loading = ref(true)

async function getTasks(page,size,sortField='id',sortOrder='ASC',filters?){
    loading.value = true
    let filters__ = {
        ...{status: {
        $ne: 'Pending'
      }},
      ...tabFilter.value
    }
    for (let key in filters)
      if(filters[key]){
        let val = filters[key]
        if(key.includes('.'))key = '$'+key+'$'
        if(!filters__[key])filters__[key]={}
        filters__[key].$iLike = '%'+val+'%'
      }
    
    const filterString = qs.stringify(filters__, { delimiter: ';' });
    console.log(filterString)
    pagination.total = await countTasks(filterString)
    tasks.value = await $fetch('/api/tasks', { params: { 
            page: page-1, 
            pageSize: size,
            sortField,
            sortOrder,
            filters: filterString
            //...filters_
        } 
    })
    loading.value = false
    return tasks.value
}
function tabChange(){
  pagination.current = 1
  if(activeTab.value == "allTasks")pagination.pageSize = 50
  else pagination.pageSize = 10
  getTasks(pagination.current,pagination.pageSize)
}

async function countTasks(filterString){
        pagination.total =  await $fetch('/api/tasks?count=1', { params: { 
          filters: filterString
        }})
    return pagination.total
}
const handleTableChange: TableProps['onChange'] = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    getTasks(pag.current,pag.pageSize,sorter.field,sorter.order,filters)
};

onMounted(async ()=>{
    getTasks(pagination.current,pagination.pageSize)
})

</script>


<template>
<div>
    <a-card title="Task list">
        <!-- <template #extra>
            <a-button type="primary" @click="navigateTo('/docs/new')">
                <template #icon><mdi-file-document-plus-outline /></template>
            </a-button>
        </template> -->
        <a-tabs v-model:activeKey="activeTab" @change="tabChange">
          <a-tab-pane key="myTasks">
            <template #tab>
              <span>
                <mdi-alert />
                My active tasks
              </span>
            </template>
          </a-tab-pane>
          <a-tab-pane key="allTasks">
            <template #tab>
              <span>
                <mdi-view-list />
                All tasks
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>
        <a-table :dataSource="tasks" 
        :columns="columns" 
        :customRow="customRow"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'status'">
                  <a-tag :color="statusColor(record.status)">
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-else-if="column.dataIndex === 'users'">
                  <a-tag v-for="user in record.users">
                    <template #icon>
                      <mdi-account class="anticon"/>
                    </template>
                    {{user.name}}
                  </a-tag>
                </template>
            </template>
    <template
      #customFilterDropdown="{ setSelectedKeys, filterValue, confirm, clearFilters, column }"
    >
      <div style="padding: 8px">
        <!-- <a-input
          :placeholder="`Search ${column.dataIndex}`"
          :value="filterValue"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="e => setSelectedKeys(e.target.value ? e.target.value : null)"
          @pressEnter="confirm"
          allowClear
        />
        <a-button
          type="primary"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="confirm"
        >
          <template #icon><mdi-magnify class="anticon"/></template>
          Search
        </a-button> -->
        <a-input-search
            :value="filterValue"
            :placeholder="`Search ${column.title}`"
            style="width: 200px"
            @change="e => {setSelectedKeys(e.target.value ? e.target.value : null); if(!e.target.value)clearFilters({ confirm: true })}"
            @pressEnter="confirm"
            @search="confirm"
            allowClear
        />
        
      </div>
    </template>
        </a-table>
    </a-card>
</div>
</template>