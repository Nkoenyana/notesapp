import {generateClient} from "aws-amplify/data";
import {type Schema} from "../amplify/data/resource.ts";
import {Amplify} from "aws-amplify";
/**
 * @type {import('aws-amplify/data').Client<import('~/amplify/data/resource').Schema>}
 */
import amplifyOutputs from "../amplify_outputs.json";

Amplify.configure(amplifyOutputs);

const client = generateClient({
    authMode: "iam",
})

async function seed() {
    // const existing = await client.models.Category.list();
    // console.log("Checking existing categories:", existing);
    // if (existing.data.length > 0) {
    //     console.log("Categories already exist, skipping seed.");
    //     return;
    // }
    const categories = [
        { name: "Personal", description: "Personal notes and reminders", color: "#FF5733" },
        { name: "Work", description: "Work-related notes and tasks", color: "#33FF57" },
        { name: "Business", description: "Business-related notes and documents", color: "#3357FF" },
    ];
    for (const category of categories) {
        try {
            console.log("Creating category:", category);
            await client.models.Category.create(category)
            .then((response) => {
                console.log("Category created successfully:", response);
            })
            .catch((error) => {
                console.error("Error creating category:", error);
            });
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }
}

seed()
    .then(() => console.log("Seeding completed."))
    .catch((error) => console.error("Seeding failed:", error));