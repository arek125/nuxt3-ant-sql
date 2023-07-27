<script lang="ts" setup>
import { fabric } from 'fabric';
import { createWorker } from 'tesseract.js';
import type { UploadChangeParam } from 'ant-design-vue';
import { useDocStore } from '@/stores/doc'
const store = useDocStore()
//import useClipboard from 'vue-clipboard3'
//import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
const pdfjsLib = await import('pdfjs-dist/build/pdf');
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
//const { toClipboard } = useClipboard()
const can = ref()
let canvas
const props = defineProps({
    areasValues: {type: Array, required: true}
})
const loading = ref(false)
//const worker = reactive()
// const worker = reactive( await createWorker({
//     logger: m => console.log(m),
// }));
onMounted(async ()=>{
  canvas = new fabric.Canvas(can.value);
  if(store.ocrFiles.length && store.ocrFiles[0].status == 'success'){
        const response = await fetch(store.ocrFiles[0].url)
        const data = await response.blob()
        const file = new File([data], store.ocrFiles[0].name, {
            type: data.type
        })
        if(file.type == "application/pdf")handlePdfPick(file)
        else handleFilePick(file)
    }
})
const addAreaVisible = ref(false)
const addSchemaVisible = ref(false)
const addAreaValue = ref('')
const aresValues = ref(props.areasValues)
const addSchemaName = ref('')
const selectedSchema = ref(null)
const selectedAreas:any = ref([])
// const filesForSelect = computed(()=>{
//     if(props.filesList)
//         return props.filesList.map((x:any)=>{return{ label: x.name, value: x.url }})
//     else return []
// })
//const mainFile = ref()
//const mainPdf = ref()
//const areas:any = ref([])
const ocrValues:any = ref([])
function selectArea(val){
    addArea(val)
}
function addArea(label, left = 100, top = 50, width = 200, height = 30) {
    //console.log(label,left,top,width,height)
    let rect = new LabeledRect({
      left,
      top,
      fill: 'rgba(255, 0, 0, 0)',
      //opacity: 0,
      width,
      height,
      objectCaching: false,
      stroke: 'red',
      strokeWidth: 1,
      label: label
    });
    //areas.value.push(rect)
    canvas.add(rect)
    canvas.setActiveObject(rect);
}
function removeArea(label){
    let rect = canvas.getObjects().find(x=>x.label==label)
    if(rect)canvas.remove(rect);
}
function handleChangeFile(url){
    fabric.Image.fromURL(url, function(img) {
         // add background image
         canvas.setBackgroundImage(img, ()=>{
           canvas.renderAll.bind(canvas)
           canvas.setWidth(img.width)
           canvas.setHeight(img.height)
         },          {
            //scaleX: canvas.width / img.width,
            //scaleY: canvas.height / img.height
         })
      })
}
function handleFilePick(file){
    //let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function(f) {
        //let data = f.target.result;
        if(f.target)handleChangeFile(f.target.result)
    };
    reader.readAsDataURL(file);
}
async function handlePdfPick(file){
    canvas.requestRenderAll();
    //const scale = 1.5;
    (await printPDF(file,[1]))
        .map(async c => {
            // canvas.add(new fabric.Image(await c, {
            //     scaleX: scale,
            //     scaleY: scale,
            // }));
            const img = new fabric.Image(await c)
            canvas.setBackgroundImage(img, ()=>{
                canvas.renderAll.bind(canvas)
                canvas.setWidth(img.width)
                canvas.setHeight(img.height)
            })
        });
}

let LabeledRect = fabric.util.createClass(fabric.Rect, {
    type: 'rect',
    initialize: function(options){
        options = options || {};
        this.callSuper('initialize', options);
        this.set('label', options.label || '');
    },
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },
    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.font = '12px Helvetica';
        ctx.fillStyle = 'red';
        ctx.fillText(this.label,  -this.width/2, -this.height);
        // ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
    }
});

const ocr = async ()=>{
    //await worker.load();
    loading.value = true
    const worker = await createWorker()
    await worker.loadLanguage('pol');
    await worker.initialize('pol');
    ocrValues.value = []
    for(let rect of canvas.getObjects()){
        //console.log(rect.getBoundingRect(false,true))
        const { data: { text } } = await worker.recognize(canvas.toDataURL(), { rectangle: rect.getBoundingRect(false,true) });
        ocrValues.value.push({label: rect.label, text})
        emit('ocrSet',{label: rect.label, text})
    }
    await worker.terminate();
    loading.value = false
}
function readBlob(blob) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('load', () => resolve(reader.result));
          reader.addEventListener('error', reject)
          reader.readAsDataURL(blob);
      })
  }

async function printPDF(pdfData, pages) {
    const Base64Prefix = "data:application/pdf;base64,";
    pdfData = pdfData instanceof Blob ? await readBlob(pdfData) : pdfData;
    const data = atob(pdfData.startsWith(Base64Prefix) ? pdfData.substring(Base64Prefix.length) : pdfData);
    // Using DocumentInitParameters object to load binary data.
    const loadingTask = pdfjsLib.getDocument({ data });
    return loadingTask.promise
        .then((pdf) => {
            const numPages = pdf.numPages;
            return new Array(numPages).fill(0)
                .map((__, i) => {
                    const pageNumber = i + 1;
                    if (pages && pages.indexOf(pageNumber) == -1) {
                        return;
                    }
                    return pdf.getPage(pageNumber)
                        .then((page) => {
                            //  retina scaling
                            const viewport = page.getViewport({ scale: 1.5 });
                            // Prepare canvas using PDF page dimensions
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height
                            canvas.width = viewport.width;
                            // Render PDF page into canvas context
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            const renderTask = page.render(renderContext);
                            return renderTask.promise.then(() => canvas);
                        });
                });
        });
}
const ocrSchemas = ref([])
const fetchSchamas = async (value)=>{
    if(value)
        ocrSchemas.value = await $fetch('/api/ocrSchemas?name='+value)
    else ocrSchemas.value = await $fetch('/api/ocrSchemas')
}
onMounted(()=>{
    fetchSchamas(null)
})
const selectSchema = (value)=>{
    let selectedOcrSchemaFull:any = ocrSchemas.value.find((x:any)=>x.id == value)
    selectedAreas.value = []
    for(let rect of canvas.getObjects())canvas.remove(rect);
    if (selectedOcrSchemaFull)
        for(const area of selectedOcrSchemaFull.ocrAreas){
            addArea(area.label,area.left,area.top,area.width,area.height)
            selectedAreas.value.push({value: area.label})
            if(!aresValues.value.find((x:any)=>x.value == area.label))aresValues.value.push({value: area.label})
        }
    addSchemaName.value = selectedOcrSchemaFull.name
    ocr()
}
const saveSchema = async ()=>{
    let schema:any = { name : addSchemaName.value, areas: [] }
    for(let rect of canvas.getObjects()){
        console.log(rect.getBoundingRect(false,true))
        schema.areas.push({
            label: rect.label,
            ...rect.getBoundingRect(false,true)
        })
    }
    if(selectedSchema.value)
        await $fetch('/api/ocrSchemas/'+selectedSchema.value, {
                method: 'POST',
                body: { ...schema },
            })
    else
        await $fetch('/api/ocrSchemas', {
            method: 'POST',
            body: { ...schema },
        })
    addSchemaVisible.value = false
    addSchemaName.value = ''
}
const removeSchema = async ()=>{
    if(selectedSchema.value)
        await $fetch('/api/ocrSchemas/'+selectedSchema.value, {
                method: 'DELETE',
        })
        fetchSchamas(null)
}
async function cpToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    };
}
const handleFileChange = (info: UploadChangeParam) => {
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
       if(info.file.type == "application/pdf")handlePdfPick(info.file.originFileObj)
       else handleFilePick(info.file.originFileObj)
      } else if (status === 'error') {
        console.log(`${info.file.name} file upload failed.`);
      }
};
// watch(store.ocrFiles,async (val:any)=>{
//     console.log(val)
//     if(val.length && val[0].status == 'success'){
//         const response = await fetch(val[0].url)
//         const data = await response.blob()
//         const file = new File([data], val[0].namne, {
//             type: data.type
//         })
//         if(file.type == "application/pdf")handlePdfPick(file)
//         else handleFilePick(file)
//     }
// })


const emit = defineEmits(['ocrSet'])
</script>

<template>
    <div>
        <a-card title="Ocr ops" >
        <a-row :gutter="16" v-if="ocrValues.length">
            <a-col :gutter="16" v-for="ocrVal of ocrValues" style="margin-bottom: 10px;">
                <a-tag @click="cpToClipboard(ocrVal.text)" style="cursor: pointer;">
                    {{ ocrVal.label }} || {{ ocrVal.text }}
                </a-tag>
            </a-col>
        </a-row>
        <a-divider v-if="ocrValues.length"/>
        <a-spin tip="Loading..." :spinning="loading">
            <a-row :gutter="16">
                <a-col v-if="store.ocrFiles.length">
                    <!-- <a-button @click="Add">Add a rectangle</a-button> -->
                        <a-input-group compact>
                            <a-select
                            v-model:value="selectedAreas"
                            :options="aresValues"
                            mode="multiple"
                            @select="selectArea"
                            style="width: 300px"
                            @deselect="removeArea"
                            placeholder="Select fields"
                            :showSearch="false"
                        ></a-select>
                        <a-popover v-model:visible="addAreaVisible" trigger="click">
                            <template #content>
                                <a-input v-model:value="addAreaValue" placeholder="Add area [enter]" @keypress.enter="aresValues.push({value: addAreaValue});addAreaVisible = false; addAreaValue = ''" />
                            </template>
                            <a-button>
                                    <template #icon><mdi-plus /></template>
                            </a-button>
                        </a-popover>
                    </a-input-group>
                </a-col>
                <!-- <a-select
                    placeholder="Select a file for bg"
                    :options="filesForSelect"
                    @change="handleChangeFile"
                ></a-select> -->
                <!-- <a-col>
                    <a-input v-model:value="mainFile" type="file" accept="image/*" @change="handleFilePick" >
                        <template #prefix>
                            <mdi-image />
                        </template>
                    </a-input>
                </a-col>
                <a-col>
                    <a-input v-model:value="mainPdf" type="file" accept="application/pdf" @change="handlePdfPick" >
                        <template #prefix>
                            <mdi-file-pdf-box />
                        </template>
                    </a-input>
                </a-col> -->
                <a-col>
                    <a-upload
                    v-model:file-list="store.ocrFiles"
                    action="/api/upload"
                    @change="handleFileChange"
                    @remove="store.handleRemoveFile"
                    accept="image/*, application/pdf"
                >
                    <a-button>
                    Upload image or pdf
                    </a-button>
                </a-upload>
                </a-col>
                <a-col>
                    <a-button v-if="selectedAreas.length" @click="ocr">Scan selected areas</a-button>
                </a-col>
                <a-col>
                    <a-input-group compact>
                        <a-select
                            :options="ocrSchemas.map((x:any)=>{return {label: x.name, value: x.id}})"
                            v-model:value="selectedSchema"
                            @select="selectSchema"
                            style="width: 300px"
                            placeholder="Load schema"
                            showSearch
                            :filter-option="false"
                            @search="fetchSchamas"
                            allowClear
                        ></a-select>
                        <a-popover v-if="selectedAreas.length" v-model:visible="addSchemaVisible" trigger="click">
                            <template #content>
                                <a-input v-model:value="addSchemaName" placeholder="Create new schema [enter]" @keypress.enter="saveSchema"/>
                            </template>
                            <a-button>
                                    <template #icon><mdi-content-save /></template>{{selectedSchema ?'Update schema':'Save schema'}}
                            </a-button>
                        </a-popover>
                        <a-button v-if="selectedSchema" @click="removeSchema"><template #icon><mdi-delete /></template></a-button>
                    </a-input-group>
                </a-col>
            </a-row>
        </a-spin>
        <a-row v-show="store.ocrFiles.length">
            <a-col>
                <canvas ref="can" width="600" height="800" style="border:1px solid #ccc"></canvas>
            </a-col>
        </a-row>
        </a-card>
    </div>
</template>