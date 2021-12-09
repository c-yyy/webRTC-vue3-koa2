<template>
  <div class="video-page">
    <video class="localVideo" autoplay ref="localVideo" muted />
    <video class="remoteVideo" autoplay ref="remoteVideo" />
    <audio src="https://qiniu.terminal.laway.cn/wait.mp3" loop ref="waitAudio" />
    <audio src="https://qiniu.terminal.laway.cn/video-call-audio.mp3" loop ref="videoAudio" />

    <section class="phone-section">
      <PhoneIcon @update:closeVideo="closeVideo"/>
      <span>{{ callTime }}</span>
    </section>

    <section class="ping-fps" @click="showLog = !showLog">
      <span v-show="FPS !== undefined">fps {{ FPS }}</span>
      <p v-show="showLog" style="width:30vw">{{ Logs }}</p>
    </section>
    <Calling v-if="callTime === '00:00:00'" @update:clearLawyerList="clearLawyerList" />
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, onUnmounted } from 'vue'
import PhoneIcon from '@/components/PhoneIcon.vue'
import Calling from '@/components/Calling.vue'
import { Dialog } from 'vant'
import { nanoid } from'nanoid'
import router from '@/router'
import { webRTC_mediaStreamQuery, webRTC_configuration, socket_config } from '@/config/webRTC'

export default defineComponent({
  components: {
    PhoneIcon,
    Calling
  },
  setup () {
    let localVideo = ref(null)
    let remoteVideo = ref(null)
    let waitAudio = ref(null)
    let videoAudio = ref(null)
    let showLog = ref(false)
    let Logs = ref('log')
    // let RTT = ref('')
    let FPS = ref('')
    let curLawyer = null
    let lawyerIdx = 0
    let Timer = null
    let callTime = ref('00:00:00')
    // 视频唯一 key，用于标识视频流，做视频咨询记录用
    let videoKey = nanoid()
    const isLawyer = window.location.href.includes('lawyer')
    const lawyerId = window.location.href.split('?lawyer=')[1]
    // eslint-disable-next-line no-unused-vars
    let localMediaStream, remoteMediaStream = null
    const connection = new RTCPeerConnection(webRTC_configuration)
    // eslint-disable-next-line no-undef
    const socket = io(socket_config.url, socket_config.config)

    const closeVideo = () => {
      localMediaStream && localMediaStream.getTracks().map(track => track.stop())
      localMediaStream = null
      remoteMediaStream = null
      clearInterval(Timer)
      connection.close()
      socket.emit('leave', lawyerId || curLawyer && curLawyer.uuid || '')
      socket.close()
    }

    const clearLawyerList = () => {
      socket.emit('clearLawyerList')
    }

    socket.on('reset', () => {
      if (isLawyer) {
        window.location.reload()
      }
    })

    const formateTime = (time) => {
      if (time < 60) {
        return `00:00:${time < 10 ? '0' + time : time}`;
      } else if (time > 60 && time < 3600) {
        const min = parseInt(time / 60);
        const sed = time % 60;
        return `00:${min < 10 ? '0' + min : min}:${sed < 10 ? '0' + sed : sed}`;
      } else if (time > 3600) {
        const h = parseInt(time / 3600);
        const min = parseInt((time % 3600) / 60);
        const sed = (time % 3600) % 60;
        return `${h < 10 ? '0' + h : h}:${min < 10 ? '0' + min : min}:${
          sed < 10 ? '0' + sed : sed
        }`;
      }
    }

    const startTiming = () => {
      let time = 0;

      Timer = setInterval(async () => {
        time += 1;
        callTime.value = formateTime(time);
        const stats = await connection.getStats(null)
        stats.forEach(report => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            Logs.value = report
            // if (report.totalRoundTripTime && report.responsesReceived) {
            //   RTT.value = parseInt((report.totalRoundTripTime / report.responsesReceived) * 1000)
            // }
            FPS.value = report.framesPerSecond
          }
        })
      }, 1e3);
    }

    const lawyerSearch = () => {
      socket.emit('wantLawyerList')
      socket.on('lawyerList', async data => {
        if (!data.length && remoteMediaStream === null) {
          !isLawyer &&Dialog.alert({
            title: '通话中断',
            message: '所有律师占线中～',
          }).then(() => {
            // on close
            if (isLawyer) {
              window.location.reload()
            } else {
              router.replace('/')
            }
          });
          return
        }
        
        // 轮询拨打律师
        if (lawyerIdx <= data.length - 1 && remoteMediaStream === null) {
          curLawyer = {
            nickname: data[lawyerIdx].lawyer,
            uuid: data[lawyerIdx].uuid
          }
          console.log('可以拨打', curLawyer)
          // 加入房间
          socket.emit('join', data[lawyerIdx].uuid)
          socket.emit('message', data[lawyerIdx].uuid, {
            type: 'call',
            from: 'xiaodu',
            lawyer: data[lawyerIdx].lawyer,
            to: data[lawyerIdx].uuid
          })
        }
      })
    }

    const getLocalVideo = async () => {
      try {
        document.querySelector('.localVideo').setAttribute('autoplay', '');
        document.querySelector('.localVideo').setAttribute('muted', '');
        document.querySelector('.localVideo').setAttribute('playsinline', '');
        document.querySelector('.remoteVideo').setAttribute('autoplay', '');
        document.querySelector('.remoteVideo').setAttribute('muted', '');
        document.querySelector('.remoteVideo').setAttribute('playsinline', '');
        localMediaStream = await navigator.mediaDevices.getUserMedia(webRTC_mediaStreamQuery)
        localVideo.value.srcObject = localMediaStream

        if (isLawyer) {
          // 加入房间
          // socket.on('existing', async data => {
          //   console.log('existing', data)
          //   Dialog.alert({
          //     title: '提示',
          //     message: data,
          //   }).then(() => {
          //     // on close
          //     if (isLawyer) {
          //       window.location.reload()
          //     } else {
          //       router.replace('/')
          //     }
          //   });
          // })
          socket.emit('join', lawyerId)
          socket.emit('setStatus', {
            status: 'free',
            lawyer: `律师-${lawyerId}`,
            uuid: lawyerId
          })
        } else {
          waitAudio.value.play()
          lawyerSearch()
          connection.onicecandidate = e => {
            if (e.candidate) {
              socket.emit('message', curLawyer.uuid, {
                type: 'candidate',
                from: 'xiaodu',
                candidate: e.candidate,
                lawyer: curLawyer.nickname,
                to: curLawyer.uuid
              })
            }
          }
        }

        socket.on('leaved', () => {
          if (remoteMediaStream !== null) {
            Dialog.alert({
              title: '通话结束',
              message: '对方已挂断～',
            }).then(() => {
              // on close
              if (isLawyer) {
                window.location.reload()
              } else {
                router.replace('/')
              }
            });
          } else {
            !isLawyer && Dialog.alert({
              title: '提示',
              message: '对方未接听～',
            }).then(() => {
              // on close
              if (isLawyer) {
                window.location.reload()
              } else {
                router.replace('/')
              }
            });
          }
        })

        /** Track 方式 */
        localMediaStream && localMediaStream.getTracks().forEach(track => connection.addTrack(track, localMediaStream))
        connection.ontrack = (e) => {
          if (remoteVideo.value.srcObject !== e.streams[0]) {
            waitAudio.value.pause()

            remoteMediaStream = e.streams[0]
            remoteVideo.value.srcObject = e.streams[0]

            startTiming()
          }
        }
      } catch (error) {
        Dialog.alert({
          title: '提示',
          message: '请打开授权～',
        }).then(() => {
          // on close
          if (isLawyer) {
            window.location.reload()
          } else {
            router.replace('/')
          }
        });
      }
    }

    const getRemoteVide = () => {
      socket.on('message', async (room, data) => {
        const { type } = data
        switch (type) {
          case 'call':
            if (isLawyer) {
              videoAudio.value.play()
              socket.emit('setStatus', {
                status: 'busy',
                lawyer: `律师-${lawyerId}`,
                uuid: lawyerId
              })
              Dialog.confirm({
                title: '提示',
                confirmButtonText: '接听',
                message: '视频咨询，是否接听？',
              })
              .then(async () => {
                // on confirm
                videoAudio.value.pause()
                await connection.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true
                }).then(offer => {
                  connection.setLocalDescription(offer)
                  socket.emit('message', lawyerId, {
                    type: 'offer',
                    from: 'xiaodu',
                    offer,
                    lawyer: `律师-${lawyerId}`,
                    to: lawyerId
                  })
                })
              })
              .catch(() => {
                // on cancel
                socket.emit('leave', lawyerId || curLawyer && curLawyer.uuid || '')
                window.location.reload()
              })
            }
            break;
          case 'offer':
            if (!isLawyer && data.offer) {
              await connection.setRemoteDescription(new RTCSessionDescription(data.offer))
              connection.createAnswer().then(answer => {
                connection.setLocalDescription(answer)
                socket.emit('message', curLawyer.uuid, {
                  type: 'answer',
                  from: 'xiaodu',
                  answer,
                  lawyer: curLawyer.nickname,
                  to: curLawyer.uuid
                })
              })
              break;
            }
            return
          case 'answer':
            if (isLawyer && data.answer) {
              await connection.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
            break;
          case 'candidate':
            if (connection && data.candidate) {
              await connection.addIceCandidate(new RTCIceCandidate(data.candidate))
            }
            break;
          case 'close':
            closeVideo()
        }
      })
    }

    onMounted(() => {
      getLocalVideo()
      getRemoteVide()
    })

    onUnmounted(() => {
      closeVideo()
    })

    return {
      localVideo,
      remoteVideo,
      clearLawyerList,
      closeVideo,
      waitAudio,
      videoAudio,
      callTime,
      showLog,
      videoKey,
      Logs,
      // RTT,
      FPS
    }
  },
})
</script>

<style scoped>
.video-page {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.localVideo,
.remoteVideo {
  background: #303133;
  transform: rotateY(180deg);
}
.localVideo {
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 30vh;
  background: #fff;
  z-index: 3;
}
.remoteVideo {
  width: 100%;
  height: 100%;
}
.phone-section {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-80%, -50%);
  z-index: 5;
  color: #fff;
}
.ping-fps {
  color: #fff;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
}
</style>
