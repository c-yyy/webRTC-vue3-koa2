<template>
  <div class="main" @click="router.push('/home')">
    <img src="../assets/phone.png" >
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import router from '@/router'

export default defineComponent({
  name: 'PhoneIcon',
  setup: () => {
    return {
      router
    }
  }
})
</script>

<style scoped>
.main {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F56C6C;
}
img {
  width: 60%;
  height: 60%;
}
</style>
