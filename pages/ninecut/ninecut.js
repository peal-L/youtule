const getAuth = require('../../libs/auth.js');

Page({
    data: {
        isX: false,
        img: '',
        imgList: [],
        canvas: {
            width: 0,
            height: 0
        },
        cut: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
    },

    // 图片加载
    imgAdd() {
        let that = this;
        that.loading.show();
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success(res) {
                // 裁剪插件
                that.cut.cut({
                    url: res.tempFilePaths[0],
                    rate: 1 / 1,
                    done(res2) {
                        console.log(res2);
                        // return false;
                        that.setData({
                            img: res.tempFilePaths[0],
                            cut: {
                                x: res2.x,
                                y: res2.y,
                                width: res2.width,
                                height: res2.height
                            }
                        });
                    },
                    cancel() {
                        that.loading.hide();
                    },
                });
            },
            fail() {
                that.loading.hide();
            }
        })
    },

    // 图片加载完成
    imgLoad(e) {
        this.setData({
            canvas: {
                width: e.detail.width,
                height: e.detail.height
            }
        });
        this.drawCut();
    },

    // 切分九图
    drawCut() {
        let that = this;
        let piece = that.data.cut.width / 3;
        let img = that.data.img;
        let width = that.data.canvas.width;
        let height = that.data.canvas.height;
        let ctx = wx.createCanvasContext('my_canvas');
        // 先将图片完整绘制
        ctx.drawImage(img, 0, 0, width, height);
        ctx.draw(false, function() {
            let imgList = [];
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    console.log(x * piece + that.data.cut.x, y * piece + that.data.cut.y)
                    wx.canvasToTempFilePath({
                        canvasId: 'my_canvas',
                        x: x * piece + that.data.cut.x,
                        y: y * piece + that.data.cut.y,
                        width: piece - 8.5,
                        height: piece - 8.5,
                        fileType: 'png',
                        success: function(res) {
                            imgList[y * 3 + x] = res.tempFilePath;
                            if (x == 2 && y == 2) {
                                that.setData({
                                    imgList: imgList
                                });
                                that.loading.hide();
                            }
                        },
                    });
                }
            }
        });
    },

    // 循环保存到相册
    saveImg() {
        let that = this;
        that.loading.show('正在保存（1/9）');
        getAuth({
            auth: 'scope.writePhotosAlbum',
            text: '保存相册',
            success() {
                for (let i = 0; i < 9; i++) {
                    wx.saveImageToPhotosAlbum({
                        filePath: that.data.imgList[i],
                        success() {
                            if (i == 8) {
                                that.loading.hide();
                                that.tip.show({
                                    text: '保存成功',
                                });
                            }
                        },
                        fail() {
                            that.loading.hide();
                            that.tip.show({
                                text: '保存失败',
                                bg: '#d05a5a'
                            });
                        },
                        complete() {
                            i == 8 || that.loading.show('正在保存（' + (i + 2) + '/9）');
                        }
                    });
                }
            },
            fail() {
                that.loading.hide();
                that.tip.show({
                    text: '获取权限失败',
                    bg: '#d05a5a'
                });
            }
        })
    },


    onReady: function() {
        this.setData({
            isX: wx.getMenuButtonBoundingClientRect().bottom > 70
        });
        this.tip = this.selectComponent("#tip");
        this.loading = this.selectComponent("#loading");
        this.cut = this.selectComponent("#cut");
    },

    onShareAppMessage: function() {
        return {
            title: '一键即可完成拼长图、切九图、模糊图',
            path: '/pages/index/index',
            imageUrl: 'http://up.wawa.fm/16,0607c05a120975'
        }
    }
})