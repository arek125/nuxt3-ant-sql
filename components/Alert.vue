<script lang="ts" setup>
const alert = useAlert()

</script>

<template>
  <a-affix v-if="alert.show">
    <a-alert :message="alert.text" :type="alert.type" show-icon closable :after-close="alert.reset"/>
  </a-affix>
</template>