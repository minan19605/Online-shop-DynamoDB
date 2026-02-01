'use server';

import {docClient} from "@/lib/db"
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export type ActionState  = {
  success: boolean;
  message: string;
};

export async function getAllVendors() {
    try {
        const command = new ScanCommand({
            TableName: 'Vendors',
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ":sk": "METADATA",
            }
        })
        const response = await docClient.send(command);
        return response.Items || [];

    }catch (e) {
        console.log('Scan vendor error: ', e)
        return []
    }
}

export async function createVendorAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  // 1. get data from Form
  const vendorId = formData.get("vendorId") as string;
  const name = formData.get("name") as string;
  const logo = formData.get('logo') as string;
  const type = formData.get("type") as string;

  try {
    // 2. write vendor data into DB
    const command = new PutCommand({
      TableName: "Vendors",
      Item: {
        PK: `VENDOR#${vendorId.toUpperCase()}`,
        SK: "METADATA",
        name: name,
        logo: logo,
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