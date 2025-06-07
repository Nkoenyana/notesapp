import {Amplify} from "aws-amplify";
import amplifyOutputs from "amplify-json";
import {generateClient} from "aws-amplify/data";

/**
 * @type {import('aws-amplify/data').Client<import('~/amplify/data/resource').Schema>}
 */

Amplify.configure(amplifyOutputs);

export const client = ({
    authMode: "userPool",
})