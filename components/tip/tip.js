let timer;
Component({

    data: {
        text: '',
        show: false,
        barHeight: 0,
        custom: false,
        bg: '',
        color: '',
    },

    methods: {
        show: function(param) {
            let that = this;
            if (!that.data.show) {
                that.once(param);
            } else {
                clearTimeout(timer);
                that.setData({
                    show: false
                });
                setTimeout(function() {
                    that.once(param);
                }, 300);
            }
        },

        once: function(param) {
            let that = this;
            that.setData({
                text: param.text,
                show: true,
                custom: param.custom || false,
                bg: param.bg || '#3b7d9c',
                color: param.color || '#fff'
            });

            timer = setTimeout(function() {
                that.setData({
                    show: false
                });
            }, param.duration || 1500);
        }
    },

    lifetimes: {
        attached() {
            this.setData({
                barHeight: wx.getMenuButtonBoundingClientRect().bottom + 10
            })
        }
    }

})