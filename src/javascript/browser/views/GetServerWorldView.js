var Backbone = require("backbone");

GetServerWorld = Backbone.View.extend({
    initialize: function (options) {},
    events: {
        'click #server-world-button': 'buttonClicked'
    },
    buttonClicked: function () {
        this.trigger("getServerWorldRequest");
    },
    render: function () {
        this.$el.html('<div class="button" id="server-world-button">' + "Get Server World" + '</div>');
        return this;
    },
});

module.exports = GetServerWorld;