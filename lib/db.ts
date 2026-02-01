// lib/dynamodb.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION, // e.g., "us-east-2"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,     // Uses AWS_ACCESS_KEY_ID from .env.local
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // Uses AWS_SECRET_ACCESS_KEY from .env.local
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export { docClient };
