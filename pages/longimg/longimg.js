// pages/longimg/longimg.js
Page({

    data: {
        isX: false,
        imgWH: '100px',
        imgList: [],
        chooseDone: false,
        canvasHeight: 0,
        minWidth: 0,
        padding: [0, '#fff'],
        isSetting: false
    },

    // 图片加载
    imgAdd() {
        let that = this;
        let list = that.data.imgList;
        that.loading.show();
        wx.chooseImage({
            count: 9 - list.length,
            // sizeType: ['compressed'],
            sourceType: ['album'],
            success(res) {
                console.log(res)
                for (let i = 0; i < res.tempFilePaths.length; i++) {
                    list.push({
                        url: res.tempFilePaths[i],
                    })
                }
                that.setData({
                    imgList: list,
                });
            },
            complete() {
                that.loading.hide();
            }
        })
    },

    // 图片删除
    imgDelete(e) {
        let that = this;
        let list = that.data.imgList;
        list.splice(e.target.dataset.index, 1);
        that.setData({
            imgList: list,
        });
    },

    // 图片加载完成
    imgLoad(e) {
        let targetW = 'imgList[' + e.target.dataset.index + '].width';
        let targetH = 'imgList[' + e.target.dataset.index + '].height';
        let minWidth = this.data.minWidth || e.detail.width;
        this.setData({
            [targetW]: e.detail.width,
            [targetH]: e.detail.height,
            // 对比留下图片的最小宽度
            minWidth: e.detail.width < minWidth ? e.detail.width : minWidth
        });
    },

    // 点击回到选择照片
    toChoose() {
        this.setData({
            chooseDone: false,
            canvasHeight: 0,
        });
    },

    // 点击开始预览
    toPreview() {
        let that = this;
        if (that.data.imgList.length > 1) {
            that.setData({
                chooseDone: true
            });
        } else {
            that.tip.show({
                text: '至少需要两张照片',
                bg: '#d05a5a'
            });
        }
    },

    // 点击显示设置
    toSetting() {
        this.setData({
            isSetting: !this.data.isSetting
        });
    },

    // 调整边距
    setPadding(e) {
        let padding = 'padding[0]'
        this.setData({
            [padding]: e.detail.value,
        });
    },

    // 绘制 -> 保存相册
    saveToAlbum() {
        let that = this;
        that.loading.show();
        setTimeout(function() {
            let list = that.data.imgList;
            // 计算canvas高度
            let screenWidth = that.data.minWidth;
            let canvasHeight = 0;
            // 还原预览图片边距
            let padding = that.data.padding[0] / (wx.getSystemInfoSync().windowWidth - 40) * screenWidth;
            let bg = that.data.padding[1];

            for (let i = 0; i < list.length; i++) {
                let height = screenWidth / list[i].width * list[i].height;
                list[i].drawHeight = height;
                canvasHeight += height + (i != list.length - 1 ? padding : 0);
            }
            that.setData({
                canvasHeight: canvasHeight,
            });
            // 开始绘制长图
            let ctx = wx.createCanvasContext('my_canvas');
            let startY = 0;
            // 背景色
            if (padding != 0) {
                ctx.setFillStyle(bg);
                ctx.fillRect(0, 0, screenWidth, canvasHeight);
            }
            for (let i = 0; i < list.length; i++) {
                // console.log(list[i].url, 0, startY, screenWidth, list[i].drawHeight)
                ctx.drawImage(list[i].url, 0, startY, screenWidth, list[i].drawHeight);
                startY += list[i].drawHeight + (i != list.length - 1 ? padding : 0);
            }
            // 绘制完成
            ctx.draw(false, function() {
                wx.canvasToTempFilePath({
                    canvasId: 'my_canvas',
                    quality: 1,
                    destWidth: screenWidth,
                    destHeight: startY,
                    fileType: 'jpg',
                    quality: 0.8,
                    success: function(res) {
                        // 保存本地 查看是否有保存相册权限
                        wx.getSetting({
                            success(res) {
                                if (res.authSetting['scope.writePhotosAlbum'] == undefined || res.authSetting['scope.writePhotosAlbum'] == true) {
                                    save();
                                } else {
                                    // 没有权限就提示去打开
                                    wx.showModal({
                                        title: '提示',
                                        content: '需要手动打开保存相册的权限',
                                        confirmText: '去打开',
                                        cancelText: '放弃',
                                        success(res) {
                                            if (res.confirm) {
                                                wx.openSetting({
                                                    success(res) {
                                                        if (res.authSetting['scope.writePhotosAlbum'] == true) {
                                                            save();
                                                        } else {
                                                            that.loading.hide();
                                                        }
                                                    }
                                                })
                                            } else if (res.cancel) {
                                                that.tip.show({
                                                    text: '获取权限失败',
                                                    bg: '#d05a5a'
                                                });
                                                that.loading.hide();
                                            }
                                        }
                                    })
                                }
                            },
                            fail() {
                                that.loading.hide();
                                that.tip.show({
                                    text: '获取授权信息失败',
                                    bg: '#d05a5a'
                                });
                            },
                        })

                        function save() {
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success() {
                                    that.tip.show({
                                        text: '保存成功',
                                    });
                                    that.setData({
                                        canvasHeight: 0
                                    });
                                    // 清空画布 释放缓存
                                    ctx.clearRect(0, 0, screenWidth, startY);
                                    ctx.draw();
                                },
                                fail() {
                                    that.tip.show({
                                        text: '保存失败',
                                        bg: '#d05a5a'
                                    });
                                },
                                complete() {
                                    that.loading.hide();
                                }
                            });
                        }
                    },
                });
            });
        }, 500);
    },

    onReady: function() {
        let that = this;
        that.setData({
            isX: wx.getMenuButtonBoundingClientRect().bottom > 70
        });
        // 查询图片预览框宽度使图片自适应
        let node = wx.createSelectorQuery();
        node.select('.img').boundingClientRect();
        node.exec(function(res) {
            that.setData({
                imgWH: (res[0].width - 40) / 3 + 'px',
            });
        })
        this.tip = this.selectComponent("#tip");
        this.loading = this.selectComponent("#loading");
    },

    onShareAppMessage: function() {
        return {
            title: '一键即可完成拼长图、切九图、模糊图',
            path: '/pages/index/index',
            imageUrl: 'http://up.wawa.fm/16,0607c05a120975'
        }
    }
})