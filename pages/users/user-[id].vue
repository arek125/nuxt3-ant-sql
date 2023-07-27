<script setup lang="ts">
const route = useRoute()

const userData:any = ref(null)

onMounted(async ()=>{
  const userData_:any = await $fetch('/api/users/'+route.params.id)
  userData_.roles = userData_.roles.map((x:any)=>x.id)
  userData.value = userData_
})

</script>

<template>
    <a-row>
        <a-col :span="24"><FormUser v-if="userData" :userData="userData" :key="userData.id"/></a-col>
    </a-row>
</template>