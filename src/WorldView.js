$(function() {
  WorldView = Backbone.View.extend({
    render: function() {
      // render the grid
      // render the world inhabitants


      this.$el.html("<table border='1'>");
      for(var row = 0; row < 10; row++) {
        var rowHtml = "<tr>";
        for(var col = 0; col < 10; col++){
          var thing = this.model.getThingAt({x: col, y: row});
          var thingView = this.renderThingAt(thing);
          rowHtml += "<td>" + thingView + "</td>";
        }
        rowHtml += "</tr>";
        this.$("table").append(rowHtml);
      }
      return this;
    },

    renderThingAt: function(thing){
      if(thing != undefined && thing != null){
        return '<div class="critter ' + thing.direction.toLowerCase() + '"></div>';
      }
      return "";
    }
  });
});
