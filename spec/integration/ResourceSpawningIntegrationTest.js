describe("Resource Spawning", function () {
  var world;
  beforeEach(function () {
    singletonContext.randomNumberGenerator.seedrandom(1);
    world = singletonContext.world = new World();
  });

  describe("when turned off", function () {
    it("should never introduce new resources into the world", function () {
      singletonContext.configuration.resourceSpawnRate = 0.0;
      _.times(50, function() {
        world.update();
      });
      expect(world.things.length).toBe(0);
    });
  });

  describe("at 0.5", function () {
    it("should spawn one resource for about every other turn", function () {
      singletonContext.configuration.resourceSpawnRate = 0.5;
      _.times(50, function() {
        world.update();
      });
      expect(world.things.length).toBe(25);
    });
  });

  describe("at 1.0", function () {
    it("should spawn a resource every turn", function () {
      singletonContext.configuration.resourceSpawnRate = 1.0;
      _.times(50, function() {
        world.update();
      });
      expect(world.things.length).toBe(50);
    });
  });
});