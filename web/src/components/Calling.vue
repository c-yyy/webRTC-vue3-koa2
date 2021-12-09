<template>
  <div class="main">
    <header>
      <img class="logo" :src='logo' />
    </header>
    <div v-if="isLawyer">
      <img src="../assets/logo.png" class="img-1" @dblclick="clearLawyerList">
      <p style="font-weight:600;">律师 #{{ lawyerId }}&nbsp;&nbsp;<Tag type="success" size="large">在线</Tag>
      </p>
    </div>
    <div v-else>
      <img src="../assets/call-green.png" class="img-1" @dblclick="clearLawyerList">
      <p>正在接通律师，请稍等...</p>
      <!-- <div class="animate wave">
        <div class="w1"></div>
        <div class="w2"></div>
        <div class="w3"></div>
        <div class="w4"></div>
      </div> -->
      <img src="../assets/btn1.png" @click.stop="hangup">
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Tag } from 'vant';
import router from '@/router'
import { useStore } from 'vuex';
export default defineComponent({
  name: 'Calling',
  components: {
    Tag
  },
  setup (props, context) {
    const isLawyer = window.location.href.includes('lawyer')
    const lawyerId = window.location.href.split('?lawyer=')[1]
    const store = useStore()
    let logo = store.state.device.config && store.state.device.config.xiaodu_ico || ''
    const clearLawyerList = () => {
      console.log('clearLawyerList')
      context.emit('update:clearLawyerList')
    }

    const hangup = function () {
      router.replace('/')
    }

    return {
      router,
      isLawyer,
      clearLawyerList,
      lawyerId,
      logo,
      hangup
    }
  }
})
</script>

<style scoped>
.main {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background-image: url("https://qiniu.laway.cn/yn/2021/08/31/47cbc36a0a3a11ec9d36b4055d0b07be.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.main div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
p {
  margin: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* @-webkit-keyframes opac{
  from {
    opacity: 1;
    width:0;
    height:0;
    top:50%;
    left:50%;
  }
  to {
    opacity : 0;
    width:100%;
    height:100%;
    top:0;
    left:0;
  }
}
.animate .w2{
  -webkit-animation-delay:1s;
}
.animate .w3{
  -webkit-animation-delay:2s;
}
.animate .w4{
  -webkit-animation-delay:3s;
}
.img-1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11;
}
.wave{
  width: 200px;
  height: 200px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.wave *{
  border: 50px solid #2db935;
  position:absolute;
  border-radius:50%;
  -webkit-animation:opac 4s infinite;
} */
</style>
