Component({

  data: {
    show: false,
    text: ''
  },

  methods: {
    show: function(text) {
      this.setData({
        show: true,
        text: text || ''
      });
    },
    hide: function() {
      this.setData({
        show: false
      });
    }
  },

})