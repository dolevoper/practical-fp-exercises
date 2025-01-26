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
  return _.pipe(
    inputData,
    normalizeVector,
    scaleVector(maxVelocity),
    moveTowards(player.velocity, accelaration),
    updateVelocity(player),
    movePlayer
  );
}

const updateVelocity = (player: Player) => (velocity: Vector2D): Player => ({
  ...player,
  velocity
});

const movePlayer = (player: Player): Player => ({
  ...player,
  position: addVectors(player.position, player.velocity)
});

function vectorLength(vector: Vector2D) {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

const scaleVector = (by: number) => (vector: Vector2D): Vector2D => ({
  x: vector.x * by,
  y: vector.y * by
});

function normalizeVector(vector: Vector2D): Vector2D {
  const length = vectorLength(vector);

  return scaleVector(1 / length)(vector);
}

const moveTowards = (vector: Vector2D, step: number) => (destination: Vector2D): Vector2D => ({
  x: vector.x > destination.x ? Math.max(vector.x - step, destination.x) : Math.min(vector.x + step, destination.x),
  y: vector.y > destination.y ? Math.max(vector.y - step, destination.y) : Math.min(vector.y + step, destination.y)
});

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
const isString = (value: unknown) => typeof value === "string";
const isNumber = (value: unknown) => typeof value === "number";
const isBoolean = (value: unknown) => typeof value === "boolean";
const either = (...validators: Validator[]) => (value: unknown) => validators.some((validator) => validator(value));
const isPrimitive = either(isString, isNumber, isBoolean);
const isArrayOf = (validator: Validator) => (value: unknown) => Array.isArray(value) && value.every(validator);

const hasShape = (validators: Record<PropertyKey, Validator>) => (value: unknown) => {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const allValidatorsPass = Object.entries(validators).every(([key, validator]) => validator(value[key as keyof typeof value]));
  const allKeysPass = Object.keys(value).every((key) => key in validators);

  return allKeysPass && allValidatorsPass;
};

const optionally = (validator: Validator) => (value: unknown) => value == null || validator(value);

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
