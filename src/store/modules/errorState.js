const errorState = {
    state: {
        // 过期文件
        expiredFile: false,
    },
    mutations: {

        SET_EXPEREDFILE: (state, value) => {
            state.expiredFile = value;
        },

    },
    actions: {
    }
};

export default errorState;
