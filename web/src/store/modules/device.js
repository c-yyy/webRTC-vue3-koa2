const state = {
  config: null,
}
const mutations = {
  setConfig (state, config) {
    state.config = config
  },
}
const actions = {
}


export default {
  namespaced: true,
  state,
  mutations,
  actions
};
