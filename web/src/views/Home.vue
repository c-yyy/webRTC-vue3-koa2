<template>
  <div class="main">
    <article>
      <Button type="primary" @click="pushWebRTCPage">用户端</Button>
      &nbsp;&nbsp;
      <Button type="danger" @click="pushWebRTCPageTest">律师测试端</Button>
    </article>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Button } from 'vant';
import router from '@/router'

export default defineComponent({
  components: {
    Button
  },
  setup () {
    const pushWebRTCPage = () => {
      router.push('/webRTC')
    }

    const pushWebRTCPageTest = () => {
      router.push('/webRTC?lawyer=test')
    }

    return {
      pushWebRTCPage,
      pushWebRTCPageTest
    }
  }
})
</script>

<style scoped>
.main {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
article {
  display: flex;
  justify-content: center;
  align-items: center;
}
section {
  height: 424px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: space-between;
}
</style>