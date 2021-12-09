/** socket 配置 */
export const socket_config = {
  url: 'http://192.168.6.182:3479',
  config: {}
}

/** webRTC ICE 配置 */
export const webRTC_configuration = {
  iceServers: [
    {
      urls: 'stun:119.28.31.21:3478',
    },
    {
      urls: 'turn:119.28.31.21:3478',
      username: 'user123',
      credential: 'pass123'
    }
  ],
  iceTransportPolicy: 'relay', // 可选值 all or relay
  iceCandidatePoolSize: 0,
  optionalArgument: {
    optional: [{
      DtlsSrtpKeyAgreement: true
    }, {
      googImprovedWifiBwe: true
    }, {
      googScreencastMinBitrate: 300
    }, {
      googIPv6: true
    }, {
      googDscp: true
    }, {
      googCpuUnderuseThreshold: 55
    }, {
      googCpuOveruseThreshold: 85
    }, {
      googSuspendBelowMinBitrate: true
    }, {
      googCpuOveruseDetection: true
    }],
    mandatory: {}
  }
}

/** webRTC offer 配置 */
export const webRTC_offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
}

/** webRTC 流媒体 配置 */
export const webRTC_mediaStreamQuery = {
  video: {
    facingMode: "user",
    width: {
      min: 600,
      ideal: 1280,
      max: 1920,
    },
    height: {
      min: 400,
      ideal: 800,
      max: 1080
    }
  },
  audio: true
}
