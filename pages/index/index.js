Page({

    /**
     * 页面的初始数据
     */
    data: {
        isX: false,
        index: 0,
    },

    change(e) {
        wx.vibrateShort();
        this.setData({
            index: e.detail.current
        })
    },

    onLoad: function(options) {
        this.setData({
            isX: getApp().globalData.isX
        })
    },

    onReady: function() {
        this.tip = this.selectComponent("#tip");
    },

    onShow: function() {

    },

    onHide: function() {

    },


    onUnload: function() {

    },


    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {
        return {
            title: '一键即可完成拼长图、切九图、模糊图',
            path: '/pages/index/index',
            imageUrl: 'http://up.wawa.fm/16,0607c05a120975'
        }
    },

    developing() {
        this.tip.show({
            text: "更多功能正在开发中",
            custom: true
        });
    },

    goTo(e) {
        setTimeout(function() {
            wx.navigateTo({
                url: '/pages/' + e.target.dataset.to + '/' + e.target.dataset.to,
            })
        }, 50);
    }
})