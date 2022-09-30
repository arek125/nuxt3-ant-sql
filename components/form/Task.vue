<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
const route = useRoute()
const alert = useAlert();
const authState = useAuthState()
// const props = defineProps({
//   taskData: {
//     type: [Object],
//     default: {id: null, title: '', status: 'New', outcomeId: null }
//   }
// })
const emit = defineEmits(['completed'])

const task = ref({id: null, title: '', status: 'New', outcomeId: null, comment:null })
const taskActions = ref([])
const taskActionsColumns = [
    {
        title: 'User',
        dataIndex: ['user','name'],
    },
    {
        title: 'When',
        dataIndex: 'createdAt',
    },
    {
        title: 'Outcome',
        dataIndex: ['outcome','name'],
    },
    {
        title: 'Comment',
        dataIndex: 'comment',
    }
]

const formRef = ref<FormInstance>();

const rules: Record<string, Rule[]> = {
    outcomeId: [{ required: true, message: 'Please choose outcome !'}],
    //flowId: [{ required: true, message: 'Please pick doc flow !'}],
};

//const flows = await $fetch('/api/flows', { headers: authState.getAuthHeader() })

const { data: outcomes } = await useAsyncData(
  'outcomes',
  async () => $fetch('/api/outcomes', { headers: authState.getAuthHeader() }),
  {
    transform: (outcomes:any) => (outcomes.map(x =>({label: x.name, value: x.id})))
  }
);

onMounted(async ()=>{
  task.value = await $fetch('/api/tasks/'+route.query.taskId, { headers: authState.getAuthHeader() })
  if(task.value.status != 'New')taskActions.value = await $fetch('/api/tasks/actions/'+route.query.taskId, { headers: authState.getAuthHeader() })
})


function saveTask(){
    $fetch('/api/tasks/'+task.value.id, {
        method: 'POST',
        headers: authState.getAuthHeader(),
        body: { ...task.value },
    })
    .then(async (response: any) => {
        alert.set('success','Task updated !')
        task.value = response
        emit('completed')
        taskActions.value = await $fetch('/api/tasks/actions/'+route.query.taskId, { headers: authState.getAuthHeader() })
    })
    .catch((e) => {
        alert.set('error',e)
        console.error(e);
    });
}

</script>


<template>
<div>
<a-card style="padding-bottom: 0px;">
    <a-form
        ref="formRef"
        :model="task"
        :rules="rules"
        @finish="saveTask"
    >
        <a-row :gutter="16" type="flex" justify="center" align="top">
            <a-col :span="1">
                <mdi-alert-circle-outline v-if="!task.outcomeId" style="font-size: 24px; color: darkorange;"/>
                <mdi-check-circle-outline v-else-if="task.outcomeId == 1" style="font-size: 16px; color: green;"/>
                <mdi-close-circle-outline v-else style="font-size: 16px; color: red;"/>
            </a-col>
            <a-col :span="5">
                <a-typography-title :level="5">Task: {{task.title}}</a-typography-title>
            </a-col>
            <a-col :span="8">
                <a-form-item label="Outcome" name="outcomeId">
                    <a-radio-group v-model:value="task.outcomeId" :disabled="task.status == 'Completed'" size="large">
                        <a-radio v-for="outcome in outcomes" :value="outcome.value">{{outcome.label}}</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-col>
            <a-col :span="8" v-if="task.status != 'Completed'">
                <a-form-item label="Comment" name="comment">
                    <a-textarea
                    v-model:value="task.comment"
                    :auto-size="{ minRows: 1, maxRows: 3 }"
                    />
                </a-form-item>
            </a-col>
            <a-col :span="2" class="gutter-row" v-if="task.status != 'Completed'">
                <a-button type="primary" html-type="submit">Submit</a-button>
            </a-col>
        </a-row>
    </a-form>
    <a-table v-if="taskActions.length" :dataSource="taskActions" :columns="taskActionsColumns" :pagination="false"/>
</a-card>
</div>
</template>