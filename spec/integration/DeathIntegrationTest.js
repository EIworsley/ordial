const World = require("../../src/javascript/lib/World");
describe("Critter Death", function(){
  var world, critter;
  beforeEach(function () {
    world = singletonContext.world = new World();
    critter = new Critter({vitals: {mana: 1}});
    world.place(critter, {x: 1, y: 0});
  });
  
  describe("when a critter runs out of food", function(){
    it("dies, but its body remains for a bit.", function(){
      expect(critter.isDead()).toBeFalsy();
      
      for(var i = 0; i < singletonContext.configuration.decompositionTime; i++){
        world.update();
      }
      expect(critter.isDead()).toBeTruthy();
      expect(world.contains(critter)).toBe(true);

      world.update();
      
      expect(world.contains(critter)).toBe(false);
    });
    
    it("another critter can eat the corpse", function(){
      var rex = new Critter({vitals: {mana: 300}, genes: [['action', 'MOVE_FORWARD']]});
      world.place(rex, {x: 1, y: 1});
      
      //depending on which critter's update step runs first, the critter may die after Rex moves
      world.update();
      world.update();
      expect(world.contains(critter)).toBe(false);
      expect(rex.vitals.mana).toBeGreaterThan(300);
    });

    describe("when another critter is eating it", () => {
      it("dies and turns into a corpse", () => {
        var rex = new Critter({vitals: {mana: 300}, genes: [['action', 'EAT_THING_IN_FRONT']]});
        world.place(rex, {x: 1, y: 1});
        critter.vitals.mana = 9;

        world.update(); // -3
        world.update(); // -2
        world.update(); // -2
        world.update(); // -1
        world.update(); // -1
        expect(critter.isDead()).toBeTruthy();
        expect(world.contains(critter)).toBe(true);

        world.update(); // rex eats the corpse

        expect(world.contains(critter)).toBe(false);
      });
    });
  });
});

