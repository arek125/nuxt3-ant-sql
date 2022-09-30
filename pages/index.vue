<script setup lang="ts">
const authState = useAuthState();
const router = useRouter();

if (!authState.value.loggedIn) {
  router.push('/login');
}
</script>

<template>
<div>
    <a-row>
      <a-col :span="12">
        <ListDocuments/>
      </a-col>
      <a-col :span="12">
        <ListTasks/>
      </a-col>
    </a-row>
</div>
</template>