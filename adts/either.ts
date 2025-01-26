type Func<T, U> = (p: T) => U;

type Either<Left, Right> =
    | { _type: "left", value: Left }
    | { _type: "right", value: Right };

export function left<T>(value: T): Either<T, unknown> {
    return { _type: "left", value };
}

export function Right<T>(value: T): Either<unknown, T> {
    return { _type: "right", value };
}

export function map<Left, Right, NewRight>(projection: Func<Right, NewRight>): Func<Either<Left, Right>, Either<Left, NewRight>>;
export function map<Left, Right, NewRight>(either: Either<Left, Right>, projection: Func<Right, NewRight>): Either<Left, NewRight>;
export function map<Left, Right, NewRight>(eitherOrProjection: Either<Left, Right> | Func<Right, NewRight>, projection?: Func<Right, NewRight>): Either<Left, NewRight> | Func<Either<Left, Right>, Either<Left, NewRight>> {
    function execMap(either: Either<Left, Right>, projection: Func<Right, NewRight>): Either<Left, NewRight> {
        if (either._type === "left") {
            return either;
        }

        return {
            _type: "right",
            value: projection(either.value),
        };
    }

    return typeof eitherOrProjection !== "function"
        ? execMap(eitherOrProjection, projection!)
        : (either: Either<Left, Right>) => execMap(either, eitherOrProjection);
}

export function flatMap<Left, Right, NewRight, NewLeft = Left>(projection: Func<Right, Either<NewLeft, NewRight>>): Func<Either<Left, Right>, Either<Left | NewLeft, NewRight>>;
export function flatMap<Left, Right, NewRight, NewLeft = Left>(either: Either<Left, Right>, projection: Func<Right, Either<NewLeft, NewRight>>): Either<Left | NewLeft, NewRight>;
export function flatMap<Left, Right, NewRight, NewLeft = Left>(eitherOrProjection: Either<Left, Right> | Func<Right, Either<NewLeft, NewRight>>, projection?: Func<Right, Either<NewLeft, NewRight>>): Either<Left | NewLeft, NewRight> | Func<Either<Left, Right>, Either<Left | NewLeft, NewRight>> {
    function execFlatMap(either: Either<Left, Right>, projection: Func<Right, Either<NewLeft, NewRight>>): Either<Left | NewLeft, NewRight> {
        if (either._type === "left") {
            return either;
        }

        return projection(either.value);
    }

    return typeof eitherOrProjection !== "function"
        ? execFlatMap(eitherOrProjection, projection!)
        : (either: Either<Left, Right>) => execFlatMap(either, eitherOrProjection);
}
