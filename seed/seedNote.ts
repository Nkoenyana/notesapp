import {generateClient} from "aws-amplify/data";
import {type Schema} from "../amplify/data/resource.ts";
import {Amplify} from "aws-amplify";
import * as fs from "fs";
import * as path from "path";
/**
 * @type {import('aws-amplify/data').Client<import('~/amplify/data/resource').Schema>}
 */
import amplifyOutputs from "../amplify_outputs.json";

Amplify.configure(amplifyOutputs);

const client = generateClient({
    authMode: "iam",
})

async function seed() {
    // read json file data/notes.json
    const rawData = fs.readFileSync("seed/data/notes.json", "utf-8");
    const notes = JSON.parse(rawData)
    for (const note of notes) {
        try {
            console.log("Creating note:", note);
            await client.models.Note.create(note)
                .then((response) => {
                    console.log("Note created successfully:", response);
                })
                .catch((error) => {
                    console.error("Error creating note:", error);
                });
        } catch (error) {
            console.error("Error creating note:", error);
        }
    }
}

seed()
    .then(() => console.log("Seeding completed."))
    .catch((error) => console.error("Seeding failed:", error));