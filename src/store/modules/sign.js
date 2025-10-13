const sign = {
    state: {
        modifyFileTimes: 0, // 盖章次数

    },
    mutations: {

        SET_MODIFYFILETIMES(state, value) {
            state.modifyFileTimes = value;
        }
    },
    getters: {
        modifyFileTimes: state => state.modifyFileTimes
    }
};

export default sign;
