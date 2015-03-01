describe("World", function() {
  var world, rob, zoe, kim, joe, stimulusPackager;

  beforeEach(function() {
    stimulusPackager = jasmine.createSpyObj('packager', ['package']);
    window.singletonContext.stimulusPackager = stimulusPackager;
    world = new World();
    rob = new Critter({mind: new CritterMind({action: Critter.Actions.MOVE_FORWARD })});
    zoe = new Critter({mind: new CritterMind({action: Critter.Actions.TURN_LEFT })});
    kim = new Critter({mind: new CritterMind({action: Critter.Actions.REPRODUCE })});
    joe = new Critter({mind: new CritterMind({action: Critter.Actions.TURN_RIGHT })});
  });

  describe("#update", function(){
    beforeEach(function() {
      Math.seedrandom('foo');
      var robsOriginalLocation, zoesOriginalLocation, kimsOriginalLocation, joesOriginalLocation;
      robsOriginalLocation = {x: 1, y: 1};
      zoesOriginalLocation = {x: 4, y: 4};
      kimsOriginalLocation = {x: 7, y: 7};
      joesOriginalLocation = {x: 7, y: 2};
      world.place(rob, robsOriginalLocation);
      world.place(zoe, zoesOriginalLocation);
      world.place(kim, kimsOriginalLocation);
      world.place(joe, joesOriginalLocation);
    });

    it("should call getActions on all critters", function(){
      spyOn(rob, "getActions");
      spyOn(zoe, "getActions");
      spyOn(kim, "getActions");
      world.update();
      expect(rob.getActions).toHaveBeenCalled();
      expect(zoe.getActions).toHaveBeenCalled();
      expect(kim.getActions).toHaveBeenCalled();
    });

    it("should get the critter's action based on its stimuli", function () {
      world = new World();
      var somethingInteresting = "Some stimulating conversation";
      stimulusPackager.package.and.returnValue(somethingInteresting);

      rob = new Critter();
      world.place(rob, {x:1, y:1});
      spyOn(rob, "getActions");
      world.update();
      expect(stimulusPackager.package).toHaveBeenCalledWith(world, rob);
      expect(rob.getActions).toHaveBeenCalledWith(somethingInteresting);
    });

    describe("when the getActions is MOVE_FORWARD", function() {
      it("should call #moveCritterForward", function() {
        spyOn(world, 'moveCritterForward');
        world.update();
        expect(world.moveCritterForward).toHaveBeenCalledWith(rob);
      });
    });

    describe("when the getActions is TURN_LEFT", function () {
      it("should call #turnCritterLeft", function () {
        spyOn(world, 'turnCritterLeft');
        world.update();
        expect(world.turnCritterLeft).toHaveBeenCalledWith(zoe);
      });
    });
    
    describe("when the getActions is TURN_RIGHT", function () {
      it("should call #turnCritterRight", function () {
        spyOn(world, 'turnCritterRight');
        world.update();
        expect(world.turnCritterRight).toHaveBeenCalledWith(joe);
      });
    });

    describe("when the getActions is REPRODUCE", function () {
      it("should call #reproduceCritter", function () {
        spyOn(world, 'reproduceCritter');
        world.update();
        expect(world.reproduceCritter).toHaveBeenCalledWith(kim);
      });
    });

    describe("when the getActions is INCREMENT_COUNTER", function () {
      var vanderbilt;
      beforeEach(function () {
        vanderbilt = new Critter({mind: new CritterMind({action: Critter.Actions.INCREMENT_COUNTER})});
        world.place(vanderbilt, {x:0, y:0});
        spyOn(world, 'incrementCounterOnCritter');
      });

      it("should call #incrementCounterOnCritter", function () {
        world.update();
        expect(world.incrementCounterOnCritter).toHaveBeenCalledWith(vanderbilt);
      });
    });

    describe("when the getActions is DECREMENT_COUNTER", function () {
      var coleman;
      beforeEach(function () {
        coleman = new Critter({mind: new CritterMind({action: Critter.Actions.DECREMENT_COUNTER})});
        world.place(coleman, {x:0, y:0});
        spyOn(world, 'decrementCounterOnCritter');
      });

      it("should call #decrementCounterOnCritter", function () {
        world.update();
        expect(world.decrementCounterOnCritter).toHaveBeenCalledWith(coleman);
      });
    });

    it("should update the critters' mana", function () {
      world.update();
      expect(zoe.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.TURN_LEFT.cost);
      expect(rob.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.MOVE_FORWARD.cost);
      expect(kim.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.REPRODUCE.cost);
    });

    it("should remove critters that drop to zero or negative mana", function() {
      rob.vitals.mana = 1;
      world.update();
      expect(world.things).not.toContain(rob);
      expect(world.things).toContain(zoe);
      expect(world.things).not.toContain(kim);
    });
    
    describe("when there are multiple actions", function(){
      var fred;
      beforeEach(function () {
        fred = new Critter();
        spyOn(fred, "getActions").and.returnValue([Critter.Actions.MOVE_FORWARD, Critter.Actions.REPRODUCE]);
        world.place(fred, {x:5, y:5});
      });

      it("applies both actions", function () {
        spyOn(world, "moveCritterForward");
        spyOn(world, "reproduceCritter");
        world.update();
        expect(world.moveCritterForward).toHaveBeenCalledWith(fred);
        expect(world.reproduceCritter).toHaveBeenCalledWith(fred);
      });
    });
  });

  describe("critter actions", function(){
    var robsOriginalLocation, zoesOriginalLocation, kimsOriginalLocation, joesOriginalLocation;
    beforeEach(function() {
      joesOriginalLocation = {x: 7, y: 2};
      robsOriginalLocation = {x: 1, y: 1};
      zoesOriginalLocation = {x: 4, y: 4};
      kimsOriginalLocation = {x: 7, y: 7};
      world.place(rob, robsOriginalLocation);
      world.place(zoe, zoesOriginalLocation);
      world.place(kim, kimsOriginalLocation);
      world.place(joe, joesOriginalLocation);
    });

    describe("#moveCritterForward", function() {
      it("should decrement the critter's mana by movement cost.", function(){
        expect(rob.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA);
        world.moveCritterForward(rob);
        expect(rob.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.MOVE_FORWARD.cost);
      });
      
      describe('when there is an empty tile in front of the critter', function() {
        beforeEach(function() {
          world.place(rob, {x: 4, y: 1});
          world.moveCritterForward(rob);
        });

        it("should remove the critter from the tile it is in", function(){
          expect(world.tiles[4][1]).not.toBe(rob);
        });

        it("should add the critter to the tile in front of the previous one", function() {
          expect(world.tiles[4][0]).toBe(rob);
          expect(rob.location).toEqual({x:4, y:0});
        })
      });

      describe("when there is another critter in front of rob", function() {
        beforeEach(function() {
          world.place(rob, {x: 4, y: 1});
          world.place(zoe, {x: 4, y: 0});
          world.moveCritterForward(rob);
        });

        it('should not move Rob', function(){
          expect(world.tiles[4][1]).toBe(rob);
          expect(rob.location).toEqual({x:4, y:1});
        });

        it('should not move Zoe', function() {
          expect(world.tiles[4][0]).toBe(zoe);
          expect(zoe.location).toEqual({x:4, y:0});
        });
      });

      describe('when there is the edge of the world in front of the critter', function() {
        beforeEach(function() {
          world.place(rob, {x: 4, y: 0});
          world.moveCritterForward(rob);
        });

        it('should not move Rob', function(){
          expect(rob.location).toEqual({x:4, y:0});
        });
      });

      describe("when there is a resource in front of the critter", function() {
        var resource, originalMana, costOfTheMove;
        beforeEach(function () {
          resource = new Resource();
          originalMana = rob.vitals.mana;
          costOfTheMove = Critter.Actions.MOVE_FORWARD.cost;
          world.place(rob, {x: 4, y: 1});
          world.place(resource, {x: 4, y: 0});
          world.moveCritterForward(rob);
        });

        it('should move Rob into the space', function(){
          expect(rob.location).toEqual({x: 4, y: 0});
        });

        it('should remove the resource from the tile', function(){
          expect(world.getThingAt({x:4, y:0})).not.toEqual(resource);
        });

        it('should remove the resource from the world', function(){
          expect(world.contains(resource)).toBe(false);
        });

        it("should increase rob's mana by the resource's value", function() {
          expect(rob.vitals.mana).toEqual(originalMana + resource.mana - costOfTheMove);
        });
      });
    });

    describe("#turnCritterLeft", function() {
      it("should decrement the critter's mana by turning cost", function(){
        expect(zoe.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA);
        world.moveCritterForward(zoe);
        expect(zoe.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.TURN_LEFT.cost);
      });

      it("should update the critter's cardinal direction", function () {
        expect(zoe.direction).toBe(CardinalDirection.NORTH);
        world.turnCritterLeft(zoe);
        expect(zoe.direction).toBe(CardinalDirection.WEST);
        world.turnCritterLeft(zoe);
        expect(zoe.direction).toBe(CardinalDirection.SOUTH);
        world.turnCritterLeft(zoe);
        expect(zoe.direction).toBe(CardinalDirection.EAST);
        world.turnCritterLeft(zoe);
        expect(zoe.direction).toBe(CardinalDirection.NORTH);
      });

      it("should not move the critter", function () {
        var oldLocation = _.extend(zoesOriginalLocation);
        world.update();
        expect(world.tiles[4][4]).toBe(zoe);
        expect(zoe.location).toEqual(oldLocation);
      });
    });

    describe("#turnCritterRight", function() {
      it("should decrement the critter's mana by turning cost", function(){
        expect(joe.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA);
        world.moveCritterForward(joe);
        expect(joe.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA - Critter.Actions.TURN_RIGHT.cost);
      });

      it("should update the critter's cardinal direction", function () {
        expect(joe.direction).toBe(CardinalDirection.NORTH);
        world.turnCritterRight(joe);
        expect(joe.direction).toBe(CardinalDirection.EAST);
        world.turnCritterRight(joe);
        expect(joe.direction).toBe(CardinalDirection.SOUTH);
        world.turnCritterRight(joe);
        expect(joe.direction).toBe(CardinalDirection.WEST);
        world.turnCritterRight(joe);
        expect(joe.direction).toBe(CardinalDirection.NORTH);
      });

      it("should not move the critter", function () {
        var oldLocation = _.extend(joesOriginalLocation);
        world.update();
        expect(world.tiles[7][2]).toBe(joe);
        expect(joe.location).toEqual(oldLocation);
      });
    });

    describe("#reproduceCritter", function () {
      var offspringLocation, originalWorldSize;
      beforeEach(function () {
        var kimsDirection = CardinalDirection.ALL_DIRECTIONS[
          Math.floor(Math.random() * CardinalDirection.ALL_DIRECTIONS.length)
          ];
        kim.direction = kimsDirection;
        originalWorldSize = world.things.length;
      });

      it("should decrement kim's mana by reproduction cost", function() {
        var startingMana = 100;
        kim.vitals.mana = startingMana;
        world.reproduceCritter(kim);
        expect(kim.vitals.mana).toEqual(startingMana - Critter.Actions.REPRODUCE.cost);
      });

      describe("left child", function() {
        beforeEach(function(){
          offspringLocation = world.getTileInDirection(RelativeDirection.LEFT, kim);
        });

        describe("when there is an open position to the left", function() {
          var offspring;

          beforeEach(function() {
            world.reproduceCritter(kim);
            offspring = world.getThingAt(offspringLocation);
          });

          it("should create a critter to the left", function(){
            expect(offspring).not.toBeFalsy();
          });

          describe("offspring", function() {
            it("should have its parent's mind", function(){
              expect(offspring.mind).toEqual(kim.mind);
            });

            it("should be oriented to the left of its parent", function(){
              expect(offspring.direction).toEqual(
                CardinalDirection.getDirectionAfterRotation(kim.direction, RelativeDirection.LEFT)
              );
            });
          });
        });

        describe("when there is a critter to the left", function() {
          var robsLocation;

          beforeEach(function() {
            robsLocation = world.getTileInDirection(RelativeDirection.LEFT, kim);
            world.place(rob, robsLocation);
            world.reproduceCritter(kim);
          });

          it("should not create a critter to the left", function() {
            expect(world.getThingAt(robsLocation)).toEqual(rob);
          });
        });

        describe("when the edge of the world is to the left", function () {
          var placeSpy;
          beforeEach(function() {
            kim.direction = CardinalDirection.NORTH;
            world.place(kim, {x: 0, y: 4});
            placeSpy = spyOn(world, "place");
          });

          it("should not place a critter to the left", function () {
            world.reproduceCritter(kim);
            expect(placeSpy.calls.count()).toEqual(1);
          });
        });

        describe("when there is a resource to the left", function () {
          var resource;
          beforeEach(function () {
            resource = new Resource();
            world.place(resource, offspringLocation);
            world.reproduceCritter(kim);
          });

          it("should create a critter to the left", function () {
            expect(world.getThingAt(offspringLocation) instanceof Critter).toBe(true);
          });

          it("should remove the resource", function () {
            expect(world.contains(resource)).toBe(false);
          });

          it("should increment the critter's mana by the resource's mana", function() {
            var child = world.getThingAt(offspringLocation);
            expect(child.vitals.mana).toEqual(Critter.DEFAULT_STARTING_MANA + resource.mana);
          });
        });
      });

      describe("right child", function(){
        beforeEach(function () {
          offspringLocation = world.getTileInDirection(RelativeDirection.RIGHT, kim);
        });

        describe("when there is an open position to the right", function() {
          var offspring;

          beforeEach(function() {
            world.reproduceCritter(kim);
            offspring = world.getThingAt(offspringLocation);
          });

          it("should create a critter to the right", function(){
            expect(offspring).not.toBeFalsy();
          });

          describe("offspring", function() {
            it("should have its parent's mind", function(){
              expect(offspring.mind).toEqual(kim.mind);
            });

            it("should be oriented to the right of its parent", function(){
              expect(offspring.direction).toEqual(
                CardinalDirection.getDirectionAfterRotation(kim.direction, RelativeDirection.RIGHT)
              );
            });
          });
        });

        describe("when there is a critter to the right", function() {
          var robsLocation;

          beforeEach(function() {
            robsLocation = world.getTileInDirection(RelativeDirection.RIGHT, kim);
            world.place(rob, robsLocation);
            world.reproduceCritter(kim);
          });

          it("should not create a critter to the right", function() {
            expect(world.getThingAt(robsLocation)).toEqual(rob);
          });
        });

        describe("when the edge of the world is to the right", function () {
          var placeSpy;
          beforeEach(function() {
            kim.direction = CardinalDirection.WEST;
            world.place(kim, {x: 4, y: 0});
            placeSpy = spyOn(world, "place");
          });

          it("should not place a critter to the left", function () {
            world.reproduceCritter(kim);
            expect(placeSpy.calls.count()).toEqual(1);
          });
        });

        describe("when there is a resource to the right", function () {
          var resource;
          beforeEach(function () {
            resource = new Resource();
            world.place(resource, offspringLocation);
            world.reproduceCritter(kim);
          });

          it("should create a critter to the right", function () {
            expect(world.getThingAt(offspringLocation) instanceof Critter).toBe(true);
          });

          it("should remove the resource", function () {
            expect(world.contains(resource)).toBe(false);
          });
        });
      });

      describe("when the critter doesn't have enough mana to reproduce", function(){
        beforeEach(function(){
          kim.vitals.mana = 1;
          world.reproduceCritter(kim);
        });
        
        it("should not create offspring", function(){
          expect(world.things.length).toEqual(originalWorldSize);
        });
      });

      describe("when the critter has exactly the amount of mana to reproduce", function() {
        beforeEach(function(){
          kim.vitals.mana = Critter.Actions.REPRODUCE.cost;
          world.reproduceCritter(kim);
        });
        
        it("should produce both offspring", function() {
          expect(world.things.length).toEqual(originalWorldSize + 2);
        });
      });
      
      describe("when the critter has more than enough mana to reproduce", function() {
        beforeEach(function() {
          kim.vitals.mana = Critter.Actions.REPRODUCE.cost + 1;
          world.reproduceCritter(kim);
        });
        
        it("should produce both offspring", function() {
          expect(world.things.length).toEqual(originalWorldSize + 2);
        });
      });
    });

    describe("#incrementCounterOnCritter", function () {
      var anna;
      beforeEach(function () {
        anna = new Critter();
      });

      it("should add one to the vitals.counter stat", function () {
        expect(anna.vitals.counter).toBe(Critter.DEFAULT_STARTING_COUNTER);
        world.incrementCounterOnCritter(anna);
        expect(anna.vitals.counter).toBe(Critter.DEFAULT_STARTING_COUNTER + 1);
      });

      it("should not cost any mana", function () {
        expect(anna.vitals.mana).toBe(Critter.DEFAULT_STARTING_MANA);
        world.incrementCounterOnCritter(anna);
        expect(anna.vitals.mana).toBe(Critter.DEFAULT_STARTING_MANA);
      });
    });

    describe("#decrementCounterOnCritter", function () {
      var anna;
      beforeEach(function () {
        anna = new Critter();
      });

      it("should subtract one to the vitals.counter stat", function () {
        expect(anna.vitals.counter).toBe(Critter.DEFAULT_STARTING_COUNTER);
        world.decrementCounterOnCritter(anna);
        expect(anna.vitals.counter).toBe(Critter.DEFAULT_STARTING_COUNTER - 1);
      });

      it("should not cost any mana", function () {
        expect(anna.vitals.mana).toBe(Critter.DEFAULT_STARTING_MANA);
        world.decrementCounterOnCritter(anna);
        expect(anna.vitals.mana).toBe(Critter.DEFAULT_STARTING_MANA);
      });
    });
  });

  describe("#place", function() {
    var location;

    describe('in a tile within the world', function() {
      beforeEach(function() {
        location = {
          x: Math.floor(Math.random() * 5),
          y: Math.floor(Math.random() * 5)
        };

        spyOn(console, "error").and.callThrough();
        world.place(rob, location);
      });

      it('should put Rob in a tile', function() {
        expect(world.tiles[location.x][location.y]).toBe(rob);
      });

      it('should default direction to north', function() {
        expect(rob.direction).toEqual(CardinalDirection.NORTH);
      });

      it("should set rob's location", function() {
        expect(rob.location).toEqual(location);
      });

      it('should not log an error', function() {
        expect(console.error).not.toHaveBeenCalled();
      });

      it('should add rob to worldly things', function() {
        var allMyRobs = _.filter(world.things, function(thing) { return thing === rob; });
        expect(allMyRobs.length).toEqual(1);
      });

      it('if rob is already placed, it should not add two robs to worldly things', function() {
        var anotherLocation = {x: 2, y: 2};
        world.place(rob, anotherLocation);
        var allMyRobs = _.filter(world.things, function(thing) { return thing == rob; });
        expect(allMyRobs.length).toEqual(1);
      });

      describe("when there is a thing in the target tile", function () {
        var aThing;
        beforeEach(function () {
          aThing = { a: "thing" };
          world.place(aThing, location);
        });

        it("should remove the thing in that tile from the world", function () {
          expect(world.contains(aThing)).toBe(true);
          world.place(rob, location);
          expect(world.contains(aThing)).toBe(false);
        });
      });
    });

    describe('in a tile outside the world', function() {
      var outsideTheWorld = {x: -1, y: -1};

      describe('and thing already has prior location', function() {
        var robsOldLocation;

        beforeEach(function() {
          robsOldLocation = {x: 1, y: 1};
          world.place(rob, robsOldLocation);
          world.place(rob, outsideTheWorld);
        });

        it("do nothing", function() {
          expect(world.tiles[robsOldLocation.x][robsOldLocation.y]).toEqual(rob);
          expect(world.tiles[outsideTheWorld.x]).toBeFalsy();
          expect(rob.location).toEqual(robsOldLocation);
        });
      });

      describe('and thing is being added to the world', function() {
        it("should throw an error", function() {
          function thisShouldThrow() {
            world.place(rob, outsideTheWorld);
          }
          expect(thisShouldThrow).toThrow();
        });

        it('should not add rob to worldly things', function() {
          try {
            world.place(rob, outsideTheWorld);
          }
          catch(e) {
            // ignore
          }
          finally {
            expect(world.things).not.toContain(rob);
          }
        });
      });
    });
  });

  describe("#remove", function() {
    var location;
    beforeEach(function() {
      location = {x: 1, y: 1};
      world.place(rob, location);
      world.remove(rob);
    });

    it("should remove the thing from the tile", function() {
      expect(world.getThingAt(location)).toBeUndefined();
    });

    it("should remove the thing from the things", function () {
      expect(world.things).not.toContain(rob);
    });

    it("should unset the location of the thing", function () {
      expect(rob.location).toBeUndefined();
    });
  });

  describe("#isLocationInsideWorld", function() {
    var x, y;

    describe("for an y within the world bounds", function() {
      beforeEach(function() {
        y = Math.floor(Math.random() * 8);
      });

      it("should return false for an x less than zero", function() {
        expect(world.isLocationInsideWorld({x: -1, y: y})).toBeFalsy();
      });

      it("should return true for an x within the world bounds", function() {
        expect(world.isLocationInsideWorld({x: Math.floor(Math.random() * 8), y: y})).toBeTruthy();
      });

      it("should return false for an x greater than width", function() {
        expect(world.isLocationInsideWorld({x: world.width, y: y})).toBeFalsy();
      });
    });

    describe("for an x within the world bounds", function() {
      beforeEach(function() {
        x = Math.floor(Math.random() * 8);
      });

      it("should return false for a y less than zero", function() {
        expect(world.isLocationInsideWorld({x: x, y: -1})).toBeFalsy();
      });

      it("should return true for a y within the world bounds", function() {
        expect(world.isLocationInsideWorld({x: x, y: Math.floor(Math.random() * 8)})).toBeTruthy();
      });

      it("should return true for a y greater than height", function() {
        expect(world.isLocationInsideWorld({x: x, y: world.height})).toBeFalsy();
      });
    });

  });

  describe("#getTileInDirection", function() {
    var relativeDirection;
    
    beforeEach(function() {
      rob.location = {x: 1, y:1};
    });

    describe("RelativeDirection.FORWARD", function () {
      beforeEach(function() {
        relativeDirection = RelativeDirection.FORWARD;  
      });
      
      it("should return coordinates for the tile to the WEST of Rob when Rob is facing WEST", function() {
        rob.direction = CardinalDirection.WEST;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x:0, y: 1});
      });

      it("should return coordinates for the tile to the EAST of Rob when Rob is facing EAST", function() {
        rob.direction = CardinalDirection.EAST;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 2, y: 1});
      });

      it("should return coordinates for the tile to the NORTH of Rob when Rob is facing NORTH", function() {
        rob.direction = CardinalDirection.NORTH;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 1, y: 0});
      });

      it("should return coordinates for the tile to the SOUTH of Rob when Rob is facing SOUTH", function() {
        rob.direction = CardinalDirection.SOUTH;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 1, y: 2});
      });  
    });

    describe("RelativeDirection.LEFT", function () {
      beforeEach(function() {
        relativeDirection = RelativeDirection.LEFT;
      });
      
      it("should return coordinates for the tile to the SOUTH of Rob when Rob is facing WEST", function() {
        rob.direction = CardinalDirection.WEST;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x:1, y: 2});
      });

      it("should return coordinates for the tile to the NORTH of Rob when Rob is facing ESAT", function() {
        rob.direction = CardinalDirection.EAST;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 1, y: 0});
      });

      it("should return coordinates for the tile to the WEST of Rob when Rob is facing NORTH", function() {
        rob.direction = CardinalDirection.NORTH;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 0, y: 1});
      });

      it("should return coordinates for the tile to the EAST of Rob when Rob is facing SOUTH", function() {
        rob.direction = CardinalDirection.SOUTH;
        expect(world.getTileInDirection(relativeDirection, rob)).toEqual({x: 2, y: 1});
      });
    });
  });

  describe("#getFreeTiles", function () {
    beforeEach(function () {
      world.height = 2;
      world.width = 2;
    });

    it("should return a list of empty tiles", function () {
      var freeTiles = world.getFreeTiles();
      expect(freeTiles).toMatchArray([
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: 1}
      ]);
    });

    describe("after a thing has been placed in a tile", function () {
      var thing;
      beforeEach(function () {
        thing = new Rock();
        world.place(thing, {x:1, y:0});
      });
      it("no longer returns that tile", function () {
        expect(world.getFreeTiles()).toMatchArray([
          {x: 0, y: 0},
          {x: 0, y: 1},
          {x: 1, y: 1}
        ]);
      });

      describe("after a thing has been removed from a tile", function () {
        beforeEach(function () {
          world.remove(thing);
        });
        it("returns that tile", function () {
          expect(world.getFreeTiles()).toMatchArray([
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 0},
            {x: 1, y: 1}
          ]);
        });
      });
    });
  });
});
