<script lang="ts" setup>
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
const { usersState, fetchUser, add: initUsers } = useUsers()
const alert = useAlert();
//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
const props = defineProps({
//   docData: {
//     type: [Object],
//     default: {id: null, userId: '', deputyId: '', from: '', to: ''  }
//   },
  eventId: Number
})
type RangeValue = [Dayjs, Dayjs];

let absenceDoc:any = reactive({id: null, userId: '', deputyId: '', from: '', to: ''  })
const adminMode = ref(authState.value.user.roles.includes('Admin'))
const from_to = ref<RangeValue>()

onMounted(async ()=>{
    if(!props.eventId){
        initUsers([authState.value.user])
        absenceDoc.userId = parseInt(authState.value.user.id)
    }
    else{
        let event:any = await $fetch('/api/absences/'+props.eventId)
        if(event){
            from_to.value = [
                dayjs.utc(event.from).local(),
                dayjs.utc(event.to).local()
            ]
            initUsers([event.user,event.deputy])
            absenceDoc.id = event.id
            absenceDoc.userId = event.userId
            absenceDoc.deputyId = event.deputyId
        }
  }
})

watch(from_to,val=>{
    console.log(val)
    if(val && val.length > 1){
        absenceDoc.from = val[0].utc().toISOString()
        absenceDoc.to = val[1].utc().toISOString()
    }
})

const emit = defineEmits(['change'])
async function saveDocument(){
    try{
        if(!absenceDoc.id){//new
            let response:any = await $fetch('/api/absences', {
                method: 'POST',
                //headers: authState.getAuthHeader(),
                body: { ...absenceDoc },
            })
            navigateTo('/absences/'+response.id)
        }else{
            let response:any = await $fetch('/api/absences/'+absenceDoc.id, {
                method: 'POST',
                //headers: authState.getAuthHeader(),
                body: { ...absenceDoc},
            })
            alert.set('success','Doc updated')
        }
        emit('change')
    }catch(e){
        alert.set('error',e)
        console.error(e);
    }
}
async function removeDocument(){
    try{
        if(absenceDoc.id){//new
            let response:any = await $fetch('/api/absences/'+absenceDoc.id, {
                method: 'DELETE',
                //headers: authState.getAuthHeader(),
            })
            navigateTo('/absences/')
        }
        emit('change')
    }catch(e){
        alert.set('error',e)
        console.error(e);
    }
}

</script>

<template>
    <a-form layout="inline" :model="absenceDoc" @finish="saveDocument">
        <a-form-item label="User" :rules="[{ required: true, message: 'select something' }]">
            <a-select
                v-model:value="absenceDoc.userId"
                show-search
                placeholder="Select user"
                :filter-option="false"
                :not-found-content="usersState.fetching ? undefined : null"
                :options="usersState.data"
                @search="fetchUser"
                :disabled="!adminMode"
                style="min-width: 200px;"
            >
                <template v-if="usersState.fetching" #notFoundContent>
                    <a-spin size="small" />
                </template>
            </a-select>
        </a-form-item>
        <a-form-item label="Deputy" :rules="[{ required: true, message: 'select something' }]">
            <a-select
                v-model:value="absenceDoc.deputyId"
                show-search
                placeholder="Select deputy"
                :filter-option="false"
                :not-found-content="usersState.fetching ? undefined : null"
                :options="usersState.data"
                @search="fetchUser"
                style="min-width: 200px;"
            >
                <template v-if="usersState.fetching" #notFoundContent>
                    <a-spin size="small" />
                </template>
            </a-select>
        </a-form-item>
        <a-form-item label="Range" :rules="[{ required: true, message: 'select something' }]">
            <a-range-picker v-model:value="from_to" />
        </a-form-item>
        <a-form-item>
            <a-button type="primary" html-type="submit">{{ props.eventId ? 'Update': 'Add' }}</a-button>
        </a-form-item>
        <a-form-item v-if="props.eventId">
            <a-button type="primary" danger @click="removeDocument">Remove</a-button>
        </a-form-item>
    </a-form>
  </template>