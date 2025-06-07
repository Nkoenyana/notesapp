import {Amplify} from "aws-amplify";
import amplifyOutputs from "amplify-json";
import {generateClient} from "aws-amplify/data";

Amplify.configure(amplifyOutputs);

export const client = ({
    authMode: "userPool",
})