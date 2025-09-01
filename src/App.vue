<template>
 <div class="">
  <router-view>
  </router-view>
  <ModalRoot />
  <Toast />
 </div>
</template>
<script lang="ts" setup>
import ModalRoot from './components/ModalRoot.vue'
import Toast from './components/Toast.vue'
</script>

