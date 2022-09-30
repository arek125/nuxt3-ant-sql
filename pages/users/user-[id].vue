<script setup lang="ts">
const authState = useAuthState();
const router = useRouter();
const route = useRoute()
if (!authState.value.loggedIn) {
  router.push('/login');
}

const userData = ref(null)

onMounted(async ()=>{
  const userData_:any = await $fetch('/api/users/'+route.params.id, { headers: authState.getAuthHeader() })
  userData_.roles = userData_.roles.map(x=>x.id)
  userData.value = userData_
})

</script>

<template>
    <a-row>
        <a-col :span="24"><FormUser v-if="userData" :userData="userData" :key="userData.id"/></a-col>
    </a-row>
</template>