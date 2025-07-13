import { generateClient } from 'aws-amplify/data';

// This import will work after you run `npx amplify sandbox` and define your data model
// in `amplify/data/resource.ts`. Because we have `ignoreBuildErrors: true` in `next.config.ts`,
// the project will still build even if this file doesn't exist yet.
import type { Schema } from '@/amplify/data/resource';

export const client = generateClient<Schema>();
