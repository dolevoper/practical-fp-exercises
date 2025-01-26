type Func<T, U> = (p: T) => U;

type Reader<Config, Value> = Func<Config, Value>;

export function map<Config, Value, NewValue>(projection: Func<Value, NewValue>): Func<Reader<Config, Value>, Reader<Config, NewValue>>;
export function map<Config, Value, NewValue>(reader: Reader<Config, Value>, projection: Func<Value, NewValue>): Reader<Config, NewValue>;
export function map<Config, Value, NewValue>(readerOrProjection: Reader<Config, Value> | Func<Value, NewValue>, projection?: Func<Value, NewValue>): Reader<Config, NewValue> | Func<Reader<Config, Value>, Reader<Config, NewValue>> {
    function execMap(reader: Reader<Config, Value>, projection: Func<Value, NewValue>): Reader<Config, NewValue> {
        return (config: Config) => projection(reader(config));
    }

    return arguments.length > 1
        ? execMap(readerOrProjection as Reader<Config, Value>, projection!)
        : (reader: Reader<Config, Value>) => execMap(reader, readerOrProjection as Func<Value, NewValue>);
}

export function flatMap<Config, Value, NewValue>(projection: Func<Value, Reader<Config, NewValue>>): Func<Reader<Config, Value>, Reader<Config, NewValue>>;
export function flatMap<Config, Value, NewValue>(reader: Reader<Config, Value>, projection: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue>;
export function flatMap<Config, Value, NewValue>(readerOrProjection: Reader<Config, Value> | Func<Value, Reader<Config, NewValue>>, projection?: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue> | Func<Reader<Config, Value>, Reader<Config, NewValue>> {
    function execMap(reader: Reader<Config, Value>, projection: Func<Value, Reader<Config, NewValue>>): Reader<Config, NewValue> {
        return (config: Config) => projection(reader(config))(config);
    }

    return arguments.length > 1
        ? execMap(readerOrProjection as Reader<Config, Value>, projection!)
        : (reader: Reader<Config, Value>) => execMap(reader, readerOrProjection as Func<Value, Reader<Config, NewValue>>);
}
