import {generateClient} from "aws-amplify/data"; // Import Data client generator
import type {Schema} from "@/amplify/data/resource"; // Import your schema type
import {Amplify} from "aws-amplify"; // Import AmplifyJson for configuration
import amplifyJson from "amplify-json"; // Import your Amplify configuration
import * as fs from "fs";
import * as path from "path";

Amplify.configure(amplifyJson); // Configure Amplify with your JSON config
const client = generateClient<Schema>({
    authMode: 'iam', // Use user pool for authentication
    });

async function run() {
    try {
        // Read the JSON file
        const filePath = "src/data/notes.json"; // Adjust the path as necessary
        const data = fs.readFileSync(filePath, 'utf8');
        const notes = JSON.parse(data);
        // stirngyf attachments
        for (const note of notes) {
            if (note.attachments) {
                note.attachments = JSON.stringify(note.attachments);
            }
        }
        
        // Iterate over each note and create it in the database
        for (const note of notes) {
            await client.models.Note.create(note)
            .then((response) => {
                console.log(response.errors ? `Error creating note:` : `Note created successfully: ${response.data.id}`);
                console.log(response);
            })
        }
    } catch (error) {
        console.error('Error creating notes:', error);
    }
}

run().then(() => {
    console.log('All notes created successfully.');
}).catch((error) => {
    console.error('Error in run function:', error);
});