import Matter from "matter-js";

const {
  Body,
  Bodies,
  Common,
  Composites,
  Constraint,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World
} = Matter;

let scale = 0.9;

const car = Composites.car(110, 0, 150 * scale, 30 * scale, 30 * scale);
let accel = 0;
let boost = 1;
let timeScale = 1;
let timeScaleChangeRate = 0.05;
let slow = false;

// create engine
const engine = Engine.create(),
  world = engine.world;

car.bodies[1].friction = 0.8;
car.bodies[2].friction = 0.8;
setInterval(function() {
  const carBody = car.bodies[0];
  const carWheel1 = car.bodies[1];
  const carWheel2 = car.bodies[2];
  const carVel1 = carWheel1.angularVelocity;
  const carVel2 = carWheel2.angularVelocity;
  if (slow) {
    if (timeScale > 0.3) {
      timeScale -= timeScaleChangeRate;
    }
  } else {
    if (timeScale < 1) {
      timeScale += timeScaleChangeRate;
    }
  }

  engine.timing.timeScale = timeScale;
  if (accel) {
    const dx = accel * 0.05 * boost;

    // Body.setVelocity(carBody, { y: carVel.y, x: carVel.x + dx });
    //
    Body.setAngularVelocity(carWheel1, carVel1 + dx);
    Body.setAngularVelocity(carWheel2, carVel2 + dx);
  }
}, 100);

const group1 = Body.nextGroup(true);

const bridge = Composites.stack(160, 290, 10, 1, 0, 0, function(x, y) {
  const rect = Bodies.rectangle(x - 20, y, 53, 20, {
    collisionFilter: { group: group1 },
    chamfer: 5,
    density: 0.005,
    frictionAir: 0.05,
    render: {
      fillStyle: "#575375"
    }
  });

  rect.friction = 1;
  return rect;
});

const softBody1 = Composites.softBody(150, 150, 5, 6, 1, 1, false, 8, {}, {});

const bridgeConstraint1 = Constraint.create({
  pointA: { x: 210, y: 320 },
  bodyB: bridge.bodies[0],
  pointB: { x: -25, y: 0 },
  length: 2,
  stiffness: 0.9
});

const bridgeConstraint2 = Constraint.create({
  pointA: { x: 525, y: 320 },
  bodyB: bridge.bodies[bridge.bodies.length - 1],
  pointB: { x: 25, y: 0 },
  length: 2,
  stiffness: 0.9
});

Composites.chain(bridge, 0.3, 0, -0.3, 0, {
  stiffness: 1,
  length: 0,
  render: {
    visible: false
  }
});

const stack = Composites.stack(250, 50, 2, 4, 0, 0, function(x, y) {
  const rect = Bodies.rectangle(x, y, 20, 20, Common.random(20, 40));
  rect.friction = 1;
  return rect;
});

const stack2 = Composites.stack(450, 50, 8, 7, 0, 0, function(x, y) {
  const circle = Bodies.circle(x, y, 10, Common.random(20, 40));
  circle.friction = 0.3;
  return circle;
});

document.body.addEventListener("keydown", function(e) {
  switch (e.key) {
    case "ArrowRight":
      accel = 1;
      e.preventDefault();
      break;
    case "ArrowLeft":
      accel = -1;
      e.preventDefault();
      break;
    case " ":
      boost = 10;
      e.preventDefault();
      break;
    case "Shift":
      slow = true;
      e.preventDefault();
      break;
  }
});

document.body.addEventListener("keyup", function(e) {
  switch (e.key) {
    case "ArrowRight":
    case "ArrowLeft":
      accel = 0;
      e.preventDefault();
      break;
    case " ":
      boost = 1;
      e.preventDefault();
      break;
    case "Shift":
      slow = false;
      e.preventDefault();
      break;
  }
});

// create renderer
const render = Render.create({
  element: document.getElementById("game"),
  engine: engine,
  options: {
    width: 1200,
    height: 700,
    showAngleIndicator: false,
    showCollisions: false
  }
});

Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

// add bodies
World.add(world, [
  // walls
  Bodies.rectangle(400, 0, 800, 50, { friction: 1, isStatic: true }),
  Bodies.rectangle(400, 600, 800, 50, { friction: 1, isStatic: true }),
  Bodies.rectangle(800, 300, 50, 600, { friction: 1, isStatic: true }),
  Bodies.rectangle(0, 300, 50, 600, { friction: 1, isStatic: true })
]);
World.add(world, [bridge, bridgeConstraint1, bridgeConstraint2]);
World.add(world, stack);
World.add(world, stack2);
World.add(world, softBody1);
// World.add(world, cloth);

World.add(world, car);

// scale = 0.8;
// World.add(world, Composites.car(350, 300, 150 * scale, 30 * scale, 30 * scale));

World.add(world, [
  Bodies.rectangle(100, 100, 150, 20, {
    isStatic: true,
    angle: 0
  }),

  Bodies.rectangle(350, 150, 400, 20, {
    isStatic: true,
    angle: Math.PI * 0.06
  }),

  Bodies.rectangle(650, 300, 250, 20, {
    isStatic: true,
    angle: -Math.PI * 0.06
  }),

  Bodies.rectangle(150, 320, 100, 20, {
    isStatic: true,
    angle: 0
  }),
  Bodies.rectangle(300, 560, 600, 20, {
    isStatic: true,
    angle: Math.PI * 0.04
  })
]);

// add mouse control
const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

// run the engine
Engine.run(engine);
