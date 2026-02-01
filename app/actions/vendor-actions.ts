'use server';

import {docClient} from "@/lib/db"
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export type ActionState  = {
  success: boolean;
  message: string;
};

export async function createVendorAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  // 1. get data from Form
  const vendorId = formData.get("vendorId") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  try {
    // 2. write vendor data into DB
    const command = new PutCommand({
      TableName: "Vendors",
      Item: {
        PK: `VENDOR#${vendorId.toUpperCase()}`,
        SK: "METADATA",
        name: name,
        type: type,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
    });

    await docClient.send(command);
    
    return { success: true, message: "Add success" };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Write to DB failure" };
  }
}