$(function() {
  Critter = Backbone.Model.extend({
    initialize: function(options) {
      this.direction = CardinalDirection.NORTH;

      if(options && options.mind){
        this.mind = options.mind;
      } else if(options && options.genes){
        this.mind = singletonContext.mindFactory.create(options.genes);
      } else {
        this.mind = CritterMind.EmptyMind;
      }
      this.genes = options && options.genes;

      this.color = _.sample(["lavender", "black", "blue", "orange", "eggshell", "pink", "teal", "purple"]);
      var vitalOverrides = (options && options.vitals) || {};
      this.vitals = _.defaults(vitalOverrides, defaultVitals());
    },

    getActions : function(stimuli) {
      return this.mind.getActions(stimuli, this.vitals);
    },

    canEat: function(yummyMorsel) {
      return yummyMorsel instanceof Resource;
    },

    eat: function(yummyMorsel) {
      if (yummyMorsel && yummyMorsel.mana) {
        this.vitals.mana += yummyMorsel.mana;
      }
    }
  });

  Critter.Actions = {
    MOVE_FORWARD: {
      key: 'move_forward',
      cost: 1
    },
    TURN_LEFT: {
      key: 'turn left',
      cost: 1
    },
    TURN_RIGHT: {
      key: 'turn right',
      cost: 1
    },
    REPRODUCE: {
      key: 'reproduce',
      cost: 10
    },
    STARE_OFF_INTO_SPACE: {
      key: 'noop',
      cost: 0
    },
    INCREMENT_COUNTER: {
      key: 'increment counter',
      cost: 0
    },
    DECREMENT_COUNTER: {
      key: 'decrement counter',
      cost: 0
    }
  };

  function defaultVitals() {
    return {
      counter: Critter.DEFAULT_STARTING_COUNTER,
      mana: Critter.DEFAULT_STARTING_MANA
    };
  }

  Critter.DEFAULT_STARTING_COUNTER = 0;
  Critter.DEFAULT_STARTING_MANA = 10;
});
