import Vue from 'vue';

const socketStore = {
  state: {
    socket: {
      // 连接状态
      isConnected: false,
      // 消息内容
      message: '',
      // 重新连接错误
      reconnectError: false,
    },
    userInfo: {
      id: '',
      username: '',
      nickname: '',
      faceImage: '',
      faceImageBig: '',
      qrcode: '',
    },
    friendList: {
      isNull: true,
      indexList: [],
      user: {},
    },
    friendMap: {},
  },

  mutations: {
    setUserInfo (state, v) {
      state.userInfo.id = v.id;
      state.userInfo.username = v.username;
      state.userInfo.nickname = v.nickname;
      state.userInfo.password = v.password;
      state.userInfo.faceImage = v.faceImage;
      state.userInfo.faceImageBig = v.faceImageBig;
      state.userInfo.qrcode = v.qrcode;
    },
    setFriendList (state, v) {
      state.friendList = v;
    },
    setFriendMap (state, v) {
      state.friendMap = v;
    },

    SOCKET_ONOPEN (state, event) {
      // 连接打开触发的函数
  
      Vue.prototype.$socket = event.currentTarget;
      state.socket.event = event.currentTarget;
 
      state.socket.isConnected = true;
      let fastCon = {
        action: 1,
        chatMsg: {
          sendUserId: this.getters ? this.getters.userId : '',
          acceptId: '',
          msg: '',
        },
        extand: '',
      };
      Vue.prototype.$socket.send (JSON.stringify (fastCon));
 
    },

    SOCKET_SEND (state, event) {
      // 连接打开触发的函数
   
      state.socket.event.sendObj ({
        action: 5,
        chatMsg: {
          sendUserId: this.getters.userId,
          acceptId: '',
          msg: '登录发送心跳',
        },
        extand: '',
      });
      let me = this;
      setInterval (() => {
        state.socket.event.sendObj ({
          action: 5,
          chatMsg: {
            sendUserId: me.getters.userId,
            acceptId: '',
            msg: '在线发送心跳',
          },
          extand: '',
        });
      }, 30000);
    },
    SOCKET_ONCLOSE (state, event) {
      // 连接关闭触发的函数
      state.socket.isConnected = false;
  
    },
    SOCKET_ONERROR (state, event) {
      // 连接发生错误触发的函数
      console.error ('错误：', state, event);
    },
    SOCKET_ONMESSAGE (state, message, dispatch) {
      // 收到消息时触发的函数

      if (message.action == 11) {
        this.dispatch ('ReceiveRemind');
      }
      state.socket.message = message;
     
    },
    SOCKET_RECONNECT (state, count) {
      // 重新连接触发的函数
      console.info ('重连:', state, count);
    },
    SOCKET_RECONNECT_ERROR (state) {
      // 重新连接失败触发的函数
      state.socket.reconnectError = true;
      console.error ('重连失败');
    },
  },

  actions: {
    customerAdded (context) {
      // 新连接添加函数
 
    },
  },
};

export default socketStore;
