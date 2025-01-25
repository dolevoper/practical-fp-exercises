import * as _ from "remeda";

// Refactor updatePlayer
type Vector2D = { x: number, y: number };

type Player = {
  position: Vector2D;
  velocity: Vector2D;
};

const accelaration = 2;
const maxVelocity = 10;

function updatePlayer(player: Player, inputData: Vector2D): Player {
  const newDirection = normalizeVector(inputData);
  const destination = scaleVector(newDirection, maxVelocity);
  const updatedVelocity = moveTowards(player.velocity, destination, accelaration);

  return {
    ...player,
    velocity: updatedVelocity,
    position: addVectors(player.position, updatedVelocity)
  };
}

function vectorLength(vector: Vector2D) {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

function scaleVector(vector: Vector2D, by: number): Vector2D {
  return {
    x: vector.x * by,
    y: vector.y * by
  };
}

function normalizeVector(vector: Vector2D): Vector2D {
  const length = vectorLength(vector);

  return scaleVector(vector, 1 / length);
}

function moveTowards(vector: Vector2D, destination: Vector2D, step: number): Vector2D {
  return {
    x: vector.x > destination.x ? Math.max(vector.x - step, destination.x) : Math.min(vector.x + step, destination.x),
    y: vector.y > destination.y ? Math.max(vector.y - step, destination.y) : Math.min(vector.y + step, destination.y)
  };
}

function addVectors(vector1: Vector2D, vector2: Vector2D): Vector2D {
  return {
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y
  };
}


// Build your own mini validation library!
// Implement all the missing validators
type Validator = (value: unknown) => boolean;

const isAnything = (value: unknown) => true;
const isString = isAnything;
const isNumber = isAnything;
const isBoolean = isAnything;
const either = (...validators: Validator[]) => isAnything;
const isPrimitive = isAnything;
const isArrayOf = (validator: Validator) => isAnything;
const hasShape = (validators: Record<PropertyKey, Validator>) => isAnything;
const optionally = (validator: Validator) => isAnything;

const isValidResponse = hasShape({
  id: isString,
  firstName: isString,
  middleName: optionally(isString),
  lastName: isString,
  addresses: isArrayOf(hasShape({ street: isString, city: isString })),
  phones: optionally(hasShape({
    home: optionally(isString),
    mobile: optionally(isString),
    work: optionally(isString)
  }))
});

console.log(isValidResponse({})); // false
console.log(isValidResponse([])); // false
console.log(isValidResponse("hello")); // false
console.log(isValidResponse({
  id: "aaa",
  firstName: "bbb",
  lastName: "ccc",
  addresses: []
})); // true
console.log(isValidResponse({
  id: "aaa",
  firstName: "bbb",
  lastName: "ccc",
  addresses: [{}]
})); // false
console.log(isValidResponse({
  id: "aaa",
  firstName: "bbb",
  lastName: "ccc",
  addresses: [{ city: "hello", street: "world" }],
  phones: {}
})); // true
