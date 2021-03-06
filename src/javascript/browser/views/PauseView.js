var Backbone = require("backbone");

PauseView = Backbone.View.extend({
  initialize: function (options) {
    this.paused = options.paused;
  },
  events: {
    'click #pause-button': 'pause'
  },
  pause: function () {
    this.trigger("pauseButtonClicked");
  },
  render: function () {
    this.$el.html('<div class="button" id="pause-button">' + this.buttonText() + '</div>');
    return this;
  },
  buttonText: function () {
    return this.paused ? "resume" : "pause";
  }
});

module.exports = PauseView;