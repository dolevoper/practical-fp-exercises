type Func<T, U> = (p: T) => U;

export type Either<Left, Right> =
    | { _type: "left", value: Left }
    | { _type: "right", value: Right };

export function left<T>(value: T): Either<T, never> {
    return { _type: "left", value };
}

export function right<T>(value: T): Either<never, T> {
    return { _type: "right", value };
}

export function fork<Left, Right>(either: Either<Left, Right>, onLeft: Func<Left, void>, onRight: Func<Right, void>) {
    if (either._type === "left") {
        onLeft(either.value);
    } else {
        onRight(either.value);
    }
}

export function unbox<Left, Right, Res>(onLeft: Func<Left, Res>, onRight: Func<Right, Res>): Func<Either<Left, Right>, Res>;
export function unbox<Left, Right, Res>(either: Either<Left, Right>, onLeft: Func<Left, Res>, onRight: Func<Right, Res>): Res;
export function unbox<Left, Right, Res>(eitherOrOnLeft: Either<Left, Right> | Func<Left, Res>, onLeftOrRight?: Func<Left, Res> | Func<Right, Res>, onRight?: Func<Right, Res>): Res | Func<Either<Left, Right>, Res> {
    function execUnbox(either: Either<Left, Right>, onLeft: Func<Left, Res>, onRight: Func<Right, Res>) {
        return either._type === "left"
            ? onLeft(either.value)
            : onRight(either.value);
    }

    return typeof eitherOrOnLeft !== "function"
        ? execUnbox(eitherOrOnLeft, onLeftOrRight as Func<Left, Res>, onRight!)
        : (either: Either<Left, Right>) => execUnbox(either, eitherOrOnLeft, onLeftOrRight as Func<Right, Res>);
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
