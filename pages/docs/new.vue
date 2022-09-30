<script setup lang="ts">
const authState = useAuthState();
const router = useRouter()
if (!authState.value.loggedIn) {
  router.push('/login');
}
//todo role admin
</script>

<template>
  <a-row>
    <a-col :span="18"><FormDocument/></a-col>
    <a-col :span="6" ><FormDocumentFlows/></a-col>
  </a-row>
</template>