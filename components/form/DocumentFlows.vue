<script lang="ts" setup >
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
const route = useRoute()

//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
const adminMode = ref(authState.value.user.roles.includes('Admin'))
const { usersState, fetchUser, add: initUsers } = useUsers()
const alert = useAlert();
const props = defineProps({
  docId: {
    type: Number,
    default: null
  }
})

const flows = reactive({flowId: null})
const flowStages:any = ref([])
const flowInstances:any = ref([])
const flowActiveInstances = computed(() =>{
    return flowInstances.value.filter(x=>x.status == 'In progress')
})
const loading = ref(false)
const formRef = ref<FormInstance>()

const rules: Record<string, Rule[]> = {
    flowId: [{ required: true, message: 'Please pick doc flow !'}],
};

//async function startFlow(docId,newMode){
const startFlow = async (docId,newMode) =>{
    loading.value = true
    await $fetch('/api/flows/instances/'+docId, {
        method: 'POST',
        body: { flowId: flows.flowId, flowStages: flowStages.value },
    })
    flowInstances.value = await $fetch('/api/flows/instances/'+docId)
    if(newMode)navigateTo('/docs/doc-'+docId)
    loading.value = false
}

async function getFlowStages(){
    loading.value = true
    if(flows.flowId){
        flowStages.value = await $fetch('/api/flows/stages/'+flows.flowId)
        for(let stage of flowStages.value){
            stage.usersId = stage.users.map(x=>x.id)
            initUsers(stage.users)
        }
    }
    loading.value = false
}

const getFlowInstances = async () =>{
    loading.value = true
    flowInstances.value = await $fetch('/api/flows/instances/'+props.docId)
    loading.value = false
}
const setTaskUsers = async (task)=>{
    loading.value = true
    try{
        await $fetch('/api/tasks/users/'+task.id, {
            method: 'POST',
            body: { task },
        })
        getFlowInstances()
    }catch(err){
        console.log(err)
        alert.set('error',err)
    }

}
const cancelFlow = async (id)=>{
    loading.value = true
    try{
        await $fetch('/api/flows/instance/'+id, {
            method: 'DELETE',
        })
        getFlowInstances()
    }catch(err){
        console.log(err)
        alert.set('error',err)
    }
}
onMounted(()=>{
  if(props.docId)
    getFlowInstances()
})

defineExpose({
    getFlowInstances,
    startFlow
})

// const getStage = (index,instance) => {
//     return instance.flow.stages.find(x=>x.index == index)
// }

const { data: flowsOpt } = await useAsyncData(
  'flows',
  async () => $fetch('/api/flows?active=1'),
  {
    transform: (flows) => (flows.map(flow =>({label: flow.name, value: flow.id}))),
  }
);

</script>

<template>
<div>
<a-card title="Start flow" v-if="!flowActiveInstances.length">
    <a-form
        ref="formRef"
        :model="flows"
        :rules="rules"
        @finish="startFlow(props.docId,false)"
    >
        <a-row :gutter="24">
            <a-col :span="24">
                <a-form-item label="Flow" name="flowId" >
                    <a-select v-model:value="flows.flowId" :options="flowsOpt" @change="getFlowStages"></a-select>
                </a-form-item>
            </a-col>
        </a-row>
        <a-row :gutter="24">
        <a-timeline>
            <a-timeline-item v-for="stage in flowStages">
                <p>{{stage.name}}</p>
                <p v-if="stage.assignType == 'PreSelect'">
                    <a-form-item :name="'users'+stage.index" :rules="[{ required: stage.assignBeforeIndex == 0, message: 'Pick users !' }]" >
                        <a-select
                            v-model:value="stage.usersId"
                            mode="multiple"
                            placeholder="Select users"
                            :filter-option="false"
                            :not-found-content="usersState.fetching ? undefined : null"
                            :options="usersState.data"
                            @search="fetchUser"
                            style="min-width: 300px"
                        >
                            <template v-if="usersState.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                </p>
                <p v-else>
                    <a-tag v-for="user in stage.users">
                         <template #icon> <mdi-account-alert/></template>
                        {{user.name }}
                    </a-tag>
                </p>
            </a-timeline-item>
        </a-timeline>
        </a-row>
        <a-row justify="end">

            <a-col :span="6" class="gutter-row">
                <a-button type="primary" html-type="submit">Start</a-button>
            </a-col>
            <a-col :span="6" class="gutter-row">
                <a-button type="primary" @click="$emit('saveDoc')" >Save & Start</a-button>
            </a-col>
        </a-row>
    </a-form>
</a-card>
<a-card title="Flows instances" v-if="flowInstances.length">
    <a-timeline v-for="instance in flowInstances">
        <a-typography-title :level="5">{{instance.flow.name}} | {{instance.status}} | {{new Date(instance.createdAt).toLocaleString()}}
            <a-popconfirm
                title="Are you sure cancel this instance ?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="cancelFlow(instance.id)"
                v-if="instance.status == 'In progress' && (adminMode || authState.user.id == instance.user.id)"
            >
            <mdi-cancel style="cursor: pointer; color: red;"/>
            </a-popconfirm>
        </a-typography-title>
        <a-divider />
        <a-tooltip placement="left" v-for="(task) in instance.tasks">
            <template #title>
                <p>ID: {{task.id}}, Created: {{new Date(task.createdAt).toLocaleString()}}</p>
                <p>Status: {{task.status}}</p>
            </template>
            <a-timeline-item>
                <template #dot v-if="task.status != 'Pending'">
                    <mdi-alert-circle-outline v-if="!task.outcomeId" style="font-size: 24px; color: darkorange;"/>
                    <mdi-check-circle-outline v-else-if="task.outcomeId == 1" style="font-size: 16px; color: green;"/>
                    <mdi-close-circle-outline v-else style="font-size: 16px; color: red;"/>
                </template>
                <p>
                    <a-typography-text :underline="task.id == route.query.taskId">{{task.title}}</a-typography-text>
                    <a-divider type="vertical" />
                    <mdi-numeric-1-box v-if="task.type == 'OneAction'"/>
                    <mdi-percent-box v-else-if="task.type == 'PercentAction'"/>
                </p>
                <p>
                    <a-tag v-for="action in task.taskActions">
                            <template #icon v-if="action.outcomeId == 1"> <mdi-account-check style="color: green;"/></template>
                            <template #icon v-else-if="action.outcomeId == 2"> <mdi-account-cancel style="color: red;"/></template>
                        {{action.user.name }}
                    </a-tag>
                    <a-tag v-for="user in task.users.filter(x=>!task.taskActions.find(y=>y.user.id == x.id))">
                            <template #icon> <mdi-account-alert/></template>
                        {{user.name }}
                    </a-tag>
                </p>
                <p v-if="(task.assignType == 'PreSelect' && instance.currentIndex < task.assignBeforeIndex) || (adminMode && task.status != 'Completed')">
                    <a-space>
                        <a-select
                                v-model:value="task.usersId"
                                mode="multiple"
                                placeholder="Select users"
                                :filter-option="false"
                                :not-found-content="usersState.fetching ? undefined : null"
                                :options="usersState.data"
                                @search="fetchUser"
                                style="min-width: 300px"
                            >
                                <template v-if="usersState.fetching" #notFoundContent>
                                    <a-spin size="small" />
                                </template>
                                
                        </a-select>
                        <a-button type="primary" @click="setTaskUsers(task)">
                            <template #icon><mdi-send /></template>
                        </a-button>
                    </a-space>
                </p>
            </a-timeline-item>
        </a-tooltip>
        <!-- <a-timeline-item v-if="instance.tasks.length < instance.flow.stages.length" v-for="stage in instance.flow.stages.filter((x,i)=>i>=instance.tasks.length)">
            <p>
                {{stage.name}}
                <a-divider type="vertical" />
                <mdi-numeric-1-box v-if="stage.type == 'OneAction'"/>
                <mdi-percent-box v-else-if="stage.type == 'PercentAction'"/>
            </p>
            <p>
                <a-tag v-for="user in stage.users">
                        <template #icon> <mdi-account-alert/></template>
                    {{user.name }}
                </a-tag>
            </p>
        </a-timeline-item> -->
    </a-timeline>
</a-card>
</div>
</template>