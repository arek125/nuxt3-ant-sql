<script lang="ts" setup>
import type { FormInstance,UploadChangeParam } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { useDocStore } from '@/stores/doc'
const store = useDocStore()
const alert = useAlert();
const props = defineProps({
  docData: {
    type: [Object],
    default: {id: null, title: '', status: 'New', flowId: null, send: true, description: '',documentFiles: [] }
  }
})

const doc = reactive(props.docData)

//const fileList = ref(props.docData.documentFiles.map(x=>{return {status: 'success', uid: x.id, name: x.name, url: '/api/docsfile/'+x.path}}));
//const filesToRemove:any = ref([])
store.setFileLists(props.docData.documentFiles)
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

const emit = defineEmits(['startFlow','fileChange','docSave'])


async function saveDocument(startFlow){
    try{
        //const files = store.fileList.filter(x=>x.status == 'done').map(x=>x.response)

        if(!doc.id){//newuser
            let response:any = await $fetch('/api/docs', {
                method: 'POST',
                //headers: authState.getAuthHeader(),
                body: { ...doc, files: store.newFiles },
            })
            emit('docSave',response.id)
            if(startFlow === true)emit('startFlow',response.id)
            else navigateTo('/docs/doc-'+response.id)
        }else{
            let response:any = await $fetch('/api/docs/'+doc.id, {
                method: 'POST',
                //headers: authState.getAuthHeader(),
                body: { ...doc, newFiles: store.newFiles, removeFiles: store.filesToRemove},
            })
            store.filesToRemove = []
            emit('docSave',response.id)
            if(startFlow === true)emit('startFlow',response.id)
            alert.set('success','Doc updated')
        }
    }catch(e){
        alert.set('error',e)
        console.error(e);
    }

}

const handleChange = (info: UploadChangeParam) => {
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        console.log(`${info.file.name} file uploaded successfully.`);
        //emit('fileChange',fileList.value.map(x=>x.response))
      } else if (status === 'error') {
        console.log(`${info.file.name} file upload failed.`);
      }
};

// const handleDrop = (e: DragEvent) => {
//     console.log(e);
// }
// const handleRemoveFile = (file) => {
//     console.log(file)
//     if(file.status == 'success')filesToRemove.value.push(file.uid)
//     return true
// }
//const authHeader = ref(authState.getAuthHeader())

async function removeDoc(){
    try {
        await $fetch('/api/docs/'+doc.id, {
            method: 'DELETE',
            //headers: authState.getAuthHeader(),
        })
        alert.set('success','Doc removed')
        navigateTo('/')
    } catch (e) {
        alert.set('error',e)
        console.error(e)
    }
}

defineExpose({saveDocument, doc})

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
            <a-col :span="8">
                <a-form-item label="Description">
                    <a-textarea v-model:value="doc.description" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-row :gutter="24">
            <a-col :span="8">
                <a-upload-dragger
                    v-model:fileList="store.fileList"
                    name="file"
                    :multiple="true"
                    action="/api/upload"
                    @remove="store.handleRemoveFile"
                    @change="handleChange"
                >
                    <p class="ant-upload-drag-icon">
                        <mdi-file-upload />
                    </p>
                    <p class="ant-upload-text">Click or drag file to this area to upload</p>
                    <p class="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                    </p>
                </a-upload-dragger>
            </a-col>
        </a-row>
        <a-row justify="end" :gutter="16">
            <a-col class="gutter-row" v-if="doc.id">
                <a-button type="primary" danger @click="removeDoc">Remove</a-button>
            </a-col>
            <a-col class="gutter-row">
                <a-button type="primary" html-type="submit">Save</a-button>
            </a-col>
        </a-row>
    </a-form>
</a-card>
</div>
</template>