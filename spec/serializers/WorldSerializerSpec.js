describe("WorldSerializer", function(){
  var worldSerializer;
  beforeEach(function(){
    worldSerializer = new WorldSerializer();
  });
  
  describe("#serialize", function(){
    var world;
    beforeEach(function(){
      world = new World();
    });
    
    it("sets the width and height", function(){
      var serializedWorld = worldSerializer.serialize(world);
      var parsedWorld = JSON.parse(serializedWorld);
      expect(parsedWorld.width).toBe(40);
      expect(parsedWorld.height).toBe(25);
    });
    
    it("stores the things in the world", function(){
      world.place(new Rock(), {x: 3, y:5});
      var serializedWorld = worldSerializer.serialize(world);
      
      var parsedWorld = JSON.parse(serializedWorld);
      expect(parsedWorld.things[0].type).toBe("rock");
     
    });
    
    it("includes the location of each thing", function(){
      world.place(new Rock(), {x: 3, y:5});
      var serializedWorld = worldSerializer.serialize(world);
      
      var parsedWorld = JSON.parse(serializedWorld);
       expect(parsedWorld.things[0].location).toEqual({x:3, y:5});
    });
    
    it("serializes critters", function(){
      spyOn(singletonContext.critterSerializer, "preserialize").and.returnValue({"some":"critter json"});
      world.place(new Critter(), {x: 3, y:5});
      var serializedWorld = worldSerializer.serialize(world);
      
      var parsedWorld = JSON.parse(serializedWorld);
      expect(parsedWorld.things[0].some).toBe('critter json');
    });
  });
});