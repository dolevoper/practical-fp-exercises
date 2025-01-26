type Func<T, U> = (p: T) => U;

type Reader<Config, Value> = { __brand: "reader", exec: Func<Config, Value> };

export function ask<Config, Value>(exec: Func<Config, Value>): Reader<Config, Value> {
    return { __brand: "reader", exec };
}

function isReader<Config, Value>(value: unknown): value is Reader<Config, Value> {
    return typeof value === "object" && !!value && "__brand" in value && value.__brand === "reader";
}

export function execWith<Config, Value>(config: Config): Func<Reader<Config, Value>, Value>;
export function execWith<Config, Value>(reader: Reader<Config, Value>, config: Config): Value;
export function execWith<Config, Value>(readerOrConfig: Reader<Config, Value> | Config, config?: Config): Value | Func<Reader<Config, Value>, Value> {
    return isReader<Config, Value>(readerOrConfig)
        ? readerOrConfig.exec(config!)
        : (reader: Reader<Config, Value>) => reader.exec(readerOrConfig as Config);
}

export function map<Config, Value, NewValue>(projection: Func<Value, NewValue>): Func<Reader<Config, Value>, Reader<Config, NewValue>>;
export function map<Config, Value, NewValue>(reader: Reader<Config, Value>, projection: Func<Value, NewValue>): Reader<Config, NewValue>;
export function map<Config, Value, NewValue>(readerOrProjection: Reader<Config, Value> | Func<Value, NewValue>, projection?: Func<Value, NewValue>): Reader<Config, NewValue> | Func<Reader<Config, Value>, Reader<Config, NewValue>> {
    function execMap(reader: Reader<Config, Value>, projection: Func<Value, NewValue>): Reader<Config, NewValue> {
        return ask((config: Config) => projection(execWith(reader, config)));
    }

    return arguments.length > 1
        ? execMap(readerOrProjection as Reader<Config, Value>, projection!)
        : (reader: Reader<Config, Value>) => execMap(reader, readerOrProjection as Func<Value, NewValue>);
}

export function flatMap<Config, Value, NewValue>(projection: Func<Value, Reader<Config, NewValue>>): Func<Reader<Config, Value>, Reader<Config, NewValue>>;
export function flatMap<Config, Value, NewValue>(reader: Reader<Config, Value>, projection: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue>;
export function flatMap<Config, Value, NewValue>(readerOrProjection: Reader<Config, Value> | Func<Value, Reader<Config, NewValue>>, projection?: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue> | Func<Reader<Config, Value>, Reader<Config, NewValue>> {
    function execMap(reader: Reader<Config, Value>, projection: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue> {
        return ask((config: Config) => execWith(projection(execWith(reader, config)), config));
    }

    return arguments.length > 1
        ? execMap(readerOrProjection as Reader<Config, Value>, projection!)
        : (reader: Reader<Config, Value>) => execMap(reader, readerOrProjection as Func<Value, Reader<Config, NewValue>>);
}
