<script lang="ts" setup>
import type { TableProps } from 'ant-design-vue'
const authState = useAuthState()

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
const currentPage = ref(1)
const pageSize = ref(3)
const docCount = ref(1)
const pagination = computed(() => ({
    total: docCount.value,
    current: currentPage.value,
    pageSize: pageSize.value,
}));

// const { data: docs }: { data: any } = await useAsyncData( 'docs',
//   async () => $fetch('/api/docs?page='+currentPage.value+"&pageSize="+pageSize.value, { headers: authState.getAuthHeader() }),
// )

const tasks = ref([])
const loading = ref(true)

async function getTasks(page,size,sortField='id',sortOrder='ASC',filters?){
    loading.value = true
    const filters_ = {}
    for (const key in filters){
        // let col = columns.value.find(x=>x.key == key || x.dataIndex == key)
        // let filterType = col.joined?'filterExt_':'filter_'
        if(filters[key])filters_['filter_'+key] = filters[key]
    }
    if(filters_) docCount.value = await countTasks(filters_)
    tasks.value = await $fetch('/api/tasks', { headers: authState.getAuthHeader(), params: { 
            page: page-1, 
            pageSize: size,
            sortField,
            sortOrder,
            ...filters_
        } 
    })
    loading.value = false
    return tasks.value
}
async function countTasks(filters_= {}){
    docCount.value = await $fetch('/api/tasks?count=1', { headers: authState.getAuthHeader(),params: { 
            ...filters_
        }})
    return docCount.value
}

const handleTableChange: TableProps['onChange'] = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
) => {
    console.log(filters)
    getTasks(pag.current,pag.pageSize,sorter.field,sorter.order,filters)
};

onMounted(async ()=>{
    await countTasks()
    getTasks(currentPage.value,pageSize.value)
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