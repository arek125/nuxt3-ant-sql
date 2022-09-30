<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';


const authState = useAuthState()
const alert = useAlert();
const props = defineProps({
  docId: {
    type: Number,
    default: null
  }
})

const flows = reactive({flowId: null})
const flowStages = ref([])
const flowInstances = ref([])
const flowActiveInstances = computed(() =>{
    return flowInstances.value.filter(x=>x.status == 'In progress')
})

const formRef = ref<FormInstance>()

const rules: Record<string, Rule[]> = {
    flowId: [{ required: true, message: 'Please pick doc flow !'}],
};


const { data: flowsOpt } = await useAsyncData(
  'flows',
  async () => $fetch('/api/flows', { headers: authState.getAuthHeader() }),
  {
    transform: (flows) => (flows.map(flow =>({label: flow.name, value: flow.id})))
  }
);

async function startFlow(docId){

    await $fetch('/api/flows/instances/'+docId, {
        method: 'POST',
        headers: authState.getAuthHeader(),
        body: { flowId: flows.flowId },
    })
    flowInstances.value = await $fetch('/api/flows/instances/'+docId, { headers: authState.getAuthHeader() })
}

async function getFlowStages(){
    if(flows.flowId){
        flowStages.value = await $fetch('/api/flows/stages/'+flows.flowId, { headers: authState.getAuthHeader() })
    }
}

async function getFlowInstances(){
     flowInstances.value = await $fetch('/api/flows/instances/'+props.docId, { headers: authState.getAuthHeader() })
}

onMounted(()=>{
  if(props.docId)
    getFlowInstances()
})

defineExpose({
    getFlowInstances
})

</script>

<template>
<div>
<a-card title="Start flow" v-if="!flowActiveInstances.length">
    <a-form
        ref="formRef"
        :model="flows"
        :rules="rules"
        @finish="startFlow(props.docId)"
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
                <p>
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
        <a-typography-title :level="5">{{instance.flow.name}} - {{instance.createdAt}}</a-typography-title>
        <a-divider />
        <a-tooltip placement="left" v-for="task in instance.tasks">
            <template #title>
                <p>ID: {{task.id}}, Created: {{task.createdAt}}</p>
                <p>Status: {{task.status}}</p>
            </template>
            <a-timeline-item>
                <template #dot>
                    <mdi-alert-circle-outline v-if="!task.outcomeId" style="font-size: 24px; color: darkorange;"/>
                    <mdi-check-circle-outline v-else-if="task.outcomeId == 1" style="font-size: 16px; color: green;"/>
                    <mdi-close-circle-outline v-else style="font-size: 16px; color: red;"/>
                </template>
                <p>{{task.title}}</p>
                <p>
                    <a-tag v-for="user in task.users">
                            <template #icon> <mdi-account-alert/></template>
                        {{user.name }}
                    </a-tag>
                </p>
            </a-timeline-item>
        </a-tooltip>
        <a-timeline-item v-if="instance.tasks.length < instance.flow.stages.length" v-for="stage in instance.flow.stages.filter((x,i)=>i>=instance.tasks.length)">
            <p>{{stage.name}}</p>
            <p>
                <a-tag v-for="user in stage.users">
                        <template #icon> <mdi-account-alert/></template>
                    {{user.name }}
                </a-tag>
            </p>
        </a-timeline-item>
    </a-timeline>
</a-card>
</div>
</template>