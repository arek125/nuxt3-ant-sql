export const useDocStore = defineStore('doc', () => {
    const fileList:any = ref([])
    const filesToRemove:any = ref([])
    const ocrFiles:any = ref([])

    const setFileLists = (documentFiles) => {
        fileList.value = documentFiles.filter(x=>!x.ocr).map(x=>{return {status: 'success', uid: x.id, name: x.name, url: '/api/docsfile/'+x.path}})
        ocrFiles.value = documentFiles.filter(x=>x.ocr).map(x=>{return {status: 'success', uid: x.id, name: x.name, url: '/api/docsfile/'+x.path}})
    }

    const newFiles = computed(() => {
        const newFiles = fileList.value.filter(x=>x.status == 'done').map(x=>{return {ocr: false, ...x.response}})
        return newFiles.concat(ocrFiles.value.filter(x=>x.status == 'done').map(x=>{return {ocr: true, ...x.response}}))
    })

    const handleRemoveFile = (file) => {
        if(file.status == 'success')filesToRemove.value.push(file.uid)
        return true
    }

  
    return { fileList, filesToRemove, ocrFiles, setFileLists, handleRemoveFile, newFiles }
})