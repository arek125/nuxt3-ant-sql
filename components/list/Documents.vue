<script lang="ts" setup>
import type { TableProps } from 'ant-design-vue'
import * as qs from 'qs'
//const authState = useAuthState()

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
          }
        ])

const customRow = (user) => {
 return {
  onClick: (event) => {navigateTo('/docs/doc-'+user.id)}
 };
}

function statusColor(status){
    if(status == 'New' || 'In progress') return 'orange'
    else if (status == 'Approved') return 'green'
    else if (status == 'Rejected') return 'red'
    else return 'default'
}

//const adminMode = ref(authState.value.user.roles.includes('Admin'))
// const currentPage = ref(1)
// const pageSize = ref(3)
// const docCount = ref(1)
// const pagination = computed(() => ({
//     total: docCount.value,
//     current: currentPage.value,
//     pageSize: pageSize.value,
// }));
let pagination = reactive({
    total: 1,
    current: 1,
    pageSize: 10,
})

// const { data: docs }: { data: any } = await useAsyncData( 'docs',
//   async () => $fetch('/api/docs?page='+currentPage.value+"&pageSize="+pageSize.value, { headers: authState.getAuthHeader() }),
// )

const docs = ref([])
const loading = ref(true)

async function getDocs(page,size,sortField='id',sortOrder='ASC',filters?){
    loading.value = true
    let filters__ = {}
    for (let key in filters)
      if(filters[key]){
        let val = filters[key]
        if(key.includes('.'))key = '$'+key+'$'
        if(!filters__[key])filters__[key]={}
        filters__[key].$iLike = '%'+val+'%'
      }
    
    const filterString = qs.stringify(filters__, { delimiter: ';' });
    console.log(filterString)
    pagination.total = await countDocs(filterString)
    docs.value = await $fetch('/api/docs', { params: { 
            page: page-1, 
            pageSize: size,
            sortField,
            sortOrder,
            filters: filterString
        } 
    })
    loading.value = false
    return docs.value
}
async function countDocs(filterString){
        pagination.total = await $fetch('/api/docs?count=1', {params: { 
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
    getDocs(pag.current,pag.pageSize,sorter.field,sorter.order,filters)
};

onMounted(async ()=>{
    //await countDocs()
    //getDocs(currentPage.value,pageSize.value)
    getDocs(pagination.current,pagination.pageSize)
})
// const state = reactive({
//     searchText: '',
//     searchedColumn: '',
// });

// const searchInput = ref();

// const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     state.searchText = selectedKeys[0];
//     state.searchedColumn = dataIndex;
// };

// const handleReset = clearFilters => {
//     clearFilters({ confirm: true });
//     state.searchText = '';
// };

</script>


<template>
<div>
    <a-card title="Documents list">
        <template #extra>
            <a-button type="primary" @click="navigateTo('/docs/new')">
                <template #icon><mdi-file-document-plus-outline /></template>
            </a-button>
        </template>
        <a-table :dataSource="docs" 
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