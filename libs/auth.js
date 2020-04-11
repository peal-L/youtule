// 获取指定权限

function getAuth(param) {
    wx.getSetting({
        success(res) {
            if (res.authSetting[param.auth] == undefined || res.authSetting[param.auth] == true) {
                param.success();
            } else {
                // 没有权限就提示去打开
                wx.showModal({
                    title: '提示',
                    content: '需要手动打开' + param.text + '的权限',
                    confirmText: '去打开',
                    cancelText: '放弃',
                    success(res) {
                        if (res.confirm) {
                            wx.openSetting({
                                success(res) {
                                    if (res.authSetting[param.auth] == true) {
                                        param.success();
                                    } else {
                                        param.fail();
                                    }
                                }
                            })
                        } else if (res.cancel) {
                            param.fail();
                        }
                    }
                })
            }
        },
        fail() {
            param.fail();
        },
    })
}
module.exports = getAuth;