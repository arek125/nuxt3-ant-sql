<script setup lang="ts">
const authState = useAuthState();
const router = useRouter();
const route = useRoute()
if (!authState.value.loggedIn) {
  router.push('/login');
}

const docData = ref(null)
const flows = ref()

onMounted(async ()=>{
  const docData_:any = await $fetch('/api/docs/'+route.params.id, { headers: authState.getAuthHeader() })
  docData.value = docData_
})

</script>

<template>
<div>
    <a-row v-if="docData" :gutter="16">
        <a-col :span="18" class="gutter-row">
            <a-row :gutter="[8,8]">
                <a-col :span="24" v-if="route.query.taskId" class="gutter-row">
                    <a-affix>
                        <FormTask @completed="flows.getFlowInstances()"/>
                    </a-affix>
                </a-col>
                <a-col :span="24" class="gutter-row">
                    <FormDocument :docData="docData" :key="docData.id"/>
                </a-col>
            </a-row>
        </a-col>
        <a-col :span="6" ><FormDocumentFlows ref="flows" :docId="docData.id"/></a-col>
    </a-row>
</div>
</template>