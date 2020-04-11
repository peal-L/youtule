let check;
let cancel;
Component({

    data: {
        bottom: 0,

        img: '',
        rate: 1 / 1, // 宽高比

        width: 0, // 可移动区域宽
        height: 0, // 可移动区域高

        imgSize: { // image节点元素的宽高
            width: 0,
            height: 0
        },

        output: { // 用于返回的数据
            x: 0,
            y: 0,
            width: 0, // 图片裁剪后的真实像素
            height: 0
        },

        realRate: 1 // 图片真实像素相对于dom像素的比例
    },

    methods: {
        cut(param) {
            this.setData({
                img: param.url,
                rate: param.rate,
                show: true,
            });
            check = param.done;
            cancel = param.cancel || '';
        },

        // 确定
        check() {
            let that = this;
            setTimeout(function() {
                check(that.data.output);
                that.setData({
                    show: false
                });
            }, 100);

        },

        // 取消
        cancel() {
            let that = this;
            setTimeout(function() {
                cancel && cancel();
                that.setData({
                    show: false
                });
            }, 100);

        },

        // 移动图片
        onMove(e) {
            this.setData({
                ['output.x']: Math.abs(e.detail.x * this.data.realRate),
                ['output.y']: Math.abs(e.detail.y * this.data.realRate),
            })
            console.log(this.data.output);
        },

        // 图片加载完成
        imgLoad(e) {
            let width = 0,
                height = 0,
                viewArea = [],
                rate = e.detail.width / e.detail.height;

            if (rate == 1) {
                width = '100%';
                height = '100%';
                viewArea = [e.detail.width, e.detail.height];
            } else if (rate < 1) {
                width = '100%';
                height = this.data.width / rate + 'px';
                viewArea = [e.detail.width, e.detail.width / this.data.rate];
            } else if (rate > 1) {
                width = this.data.height * rate + 'px';
                height = '100%';
                viewArea = [e.detail.height, e.detail.height / this.data.rate];
            }

            this.setData({
                imgSize: {
                    width: width,
                    height: height
                },
                output: {
                    width: viewArea[0],
                    height: viewArea[1],
                    x: 0,
                    y: 0
                },
                // 计算dom相对于真实大小的比例
                realRate: rate < 1 ? e.detail.width / this.data.width : e.detail.height / this.data.width,
            });
            console.log(this.data.realRate)
        },
    },

    lifetimes: {
        attached() {
            let that = this;
            that.setData({
                bottom: wx.getMenuButtonBoundingClientRect().bottom > 70 ? 10 : 0
            });
            setTimeout(function() {
                const query = wx.createSelectorQuery().in(that)
                query.selectAll('#fixed-area').boundingClientRect()
                query.exec(function(res) {
                    // 用于设置拖动框的大小比例
                    that.setData({
                        width: res[0][0].width - 4,
                        height: (res[0][0].width - 4) / that.data.rate,
                    })
                })
            }, 100);
        }
    }

})