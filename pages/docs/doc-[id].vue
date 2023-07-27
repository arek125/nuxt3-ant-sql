<script setup lang="ts">
const route = useRoute()

const docData = ref()
const flows_ = ref()
const formDocumentRef = ref()
const mounted = ref(false)
//const fileList = ref([])

onMounted(async ()=>{
  const docData_:any = await $fetch('/api/docs/'+route.params.id)
  docData.value = docData_
  mounted.value = true
  //fileList.value = docData_.documentFiles.map(x=>{return {status: 'success', uid: x.id, name: x.name, url: '/api/docsfile/'+x.path}})
})
function ocrSet(val){
    let property = val.label.toLowerCase()
    console.log(val)
    if(formDocumentRef.value.doc[property] !== undefined)
      formDocumentRef.value.doc[property] = val.text
}
// const setFiles = (files)=>{
//     fileList.value = files
// }

</script>

<template>
<div>
    <a-row v-if="docData" :gutter="16">
        <a-col :span="18" class="gutter-row">
            <a-row :gutter="[8,8]">
                <a-col :span="24" v-if="route.query.taskId" class="gutter-row">
                    <a-affix>
                        <FormTask @completed="flows_.getFlowInstances()"/>
                    </a-affix>
                </a-col>
                <a-col :span="24" class="gutter-row">
                    <FormDocument ref="formDocumentRef" :docData="docData" :key="docData.id" @startFlow="flows_.startFlow(docData.id)"/>
                </a-col>
            </a-row>
        </a-col>
        <a-col :span="6" ><FormDocumentFlows ref="flows_" :docId="docData.id" @saveDoc="formDocumentRef.saveDocument(true)"/></a-col>
        <a-col :span="18"><FormOcr :areas-values="[{ value:'Title'},{ value:'Description'}]" @ocr-set="ocrSet"/></a-col>
    </a-row>
    <a-result v-else-if="mounted" status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
        <template #extra>
            <a-button type="primary" @click="navigateTo('/')">Back Home</a-button>
        </template>
  </a-result>
</div>
</template>