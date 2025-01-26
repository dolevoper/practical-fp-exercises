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

const validateUserName = (user: User) => {}; // not empty

const validateUserAge = (user: User) => {}; // positive

const validatePasswordLength = (user: User) => {}; // at least 8 characters long

const validatePasswordCharacters = (user: User) => {}; // alphanumeric

const createRegisterRequestConfig = (user: User): AxiosRequestConfig => ({ }); // get the base url from the environment variables (procss.env.BASE_URL)

const user = { name: "omer", age: 34, password: "Aa123456" };
