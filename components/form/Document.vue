<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';

const authState = useAuthState()
//const { setAlert } = useAlert()
const alert = useAlert();
const props = defineProps({
  docData: {
    type: [Object],
    default: {id: null, title: '', status: 'New', flowId: null, send: true }
  }
})

const doc = reactive(props.docData)

const formRef = ref<FormInstance>();

const rules: Record<string, Rule[]> = {
    title: [{ required: true, message: 'Please input doc title !'}],
    //flowId: [{ required: true, message: 'Please pick doc flow !'}],
};

//const flows = await $fetch('/api/flows', { headers: authState.getAuthHeader() })

// const { data: flows } = await useAsyncData(
//   'flows',
//   async () => $fetch('/api/flows', { headers: authState.getAuthHeader() }),
//   {
//     transform: (flows) => (flows.map(flow =>({label: flow.name, value: flow.id})))
//   }
// );


function saveDocument(){
    if(!doc.id){//newuser
        $fetch('/api/docs', {
            method: 'POST',
            headers: authState.getAuthHeader(),
            body: { ...doc },
        })
        .then((response: any) => {
            navigateTo('/docs/doc-'+response.id)
        })
        .catch((e) => {
            alert.set('error',e)
            console.error(e);
        });
    }else{
        $fetch('/api/docs/'+doc.id, {
            method: 'POST',
            headers: authState.getAuthHeader(),
            body: { ...doc },
        })
        .then((response: any) => {
            alert.set('success','Doc updated')
        })
        .catch((e) => {
            alert.set('error',e)
            console.error(e);
        });
    }
}


</script>

<template>
<div>
<a-card :title="doc.id?'Document: '+doc.id:'New Document'">
    <a-form
        ref="formRef"
        :model="doc"
        :rules="rules"
        @finish="saveDocument"
    >
        <a-row :gutter="24">
            <a-col :span="8">
                <a-form-item label="Title" name="title">
                    <a-input v-model:value="doc.title" />
                </a-form-item>
            </a-col>
            <!-- <a-col :span="8">
                <a-form-item label="Flow" name="flowId" >
                    <a-select v-model:value="doc.flowId" :options="flows"></a-select>
                </a-form-item>
            </a-col> -->
        </a-row>
        <a-row justify="end">
            <!-- <a-col :span="4" class="gutter-row" v-if="!doc.id || !doc.send">
                <a-switch v-model:checked="doc.send" checked-children="Send" un-checked-children="Save only" />
            </a-col> -->
            <a-col :span="4" class="gutter-row">
                <a-button type="primary" html-type="submit">Save</a-button>
            </a-col>
        </a-row>
    </a-form>
</a-card>
</div>
</template>