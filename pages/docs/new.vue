<script setup lang="ts">
const formDocumentRef = ref()
const flows = ref()

function startFlow(docId){
  flows.value.startFlow(docId,true)
}
function ocrSet(val){
    let property = val.label.toLowerCase()
    console.log(val)
    if(formDocumentRef.value.doc[property] !== undefined)
      formDocumentRef.value.doc[property] = val.text
}

</script>

<template>
  <a-row>
    <a-col :span="18"><FormDocument ref="formDocumentRef" @startFlow="startFlow"/></a-col>
    <a-col :span="6" ><FormDocumentFlows ref="flows" @saveDoc="formDocumentRef.saveDocument(true)"/></a-col>
    <a-col :span="18"><FormOcr :areas-values="[{ value:'Title'},{ value:'Description'}]" @ocr-set="ocrSet" /></a-col>
  </a-row>
</template>