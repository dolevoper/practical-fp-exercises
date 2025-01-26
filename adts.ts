import type { AxiosRequestConfig } from "axios";
import * as _ from "remeda";
import * as Either from "./adts/either";
import * as Reader from "./adts/reader";

const safeDiv = (denominator: number) => (numerator: number) => {
    if (denominator === 0) {
        return Either.left("Dividing by 0 is illegal.");
    }

    return Either.right(numerator / denominator);
};

console.log(
    _.pipe(
        100,
        safeDiv(2),
        Either.flatMap(safeDiv(10)),
        // Either.flatMap(safeDiv(0)), // Uncomment this line to see an error!
        Either.flatMap(safeDiv(5)),
        Either.unbox(
            _.identity(),
            (res) => `The result is ${res}`
        )
    )
);

type User = {
    name: string,
    age: number,
    password: string,
};

const validateUserName = (user: User) => user.name === "" ? Either.left("User name cannot be empty") : Either.right(user); // not empty

const validateUserAge = (user: User) => user.age < 0 ? Either.left("Age must be a non-negative number") : Either.right(user); // positive

const validatePasswordLength = (user: User) => user.password.length < 8 ? Either.left("Password must contain at least 8 characters") : Either.right(user); // at least 8 characters long

const validatePasswordCharacters = (user: User) => user.password.match(/[a-zA-Z0-9]*/) ? Either.right(user) : Either.left("Password must contain only letters and digits"); // alphanumeric

const createRegisterRequestConfig = (user: User) => Reader.ask<string, AxiosRequestConfig>(
    (baseURL) => ({ baseURL, method: "post", data: user })
); // get the base url from the environment variables (procss.env.BASE_URL)

const user = { name: "omer", age: 34, password: "Aa123456" };

// Expected result:
// Error message if user validation failed
// or
// Request config object to pass to axios

const res = _.pipe(
    user,
    validateUserName,
    Either.flatMap(validateUserAge),
    Either.flatMap(validatePasswordLength),
    Either.flatMap(validatePasswordCharacters),
    Either.map(createRegisterRequestConfig),
);

Either.fork(
    res,
    console.error,
    _.piped(
        Reader.execWith(process.env.BASE_URL!),
        console.log
    )
);
