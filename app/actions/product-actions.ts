'use server';

import {docClient} from "@/lib/db"
import { BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { 
  VENDOR_OPTIONS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_IMAGES, 
  MainCategory 
} from "@/lib/constants";

export interface ProductRow {
  category: MainCategory | ""; // 'CHICKEN', 'BEEF'
  subCategory: string;  // "wings" , "drum sticks"
  imageUrl: string;
  unit: string;
  price: number | string;
  count: number;
}


export type ActionState  = {
  success: boolean;
  message: string;
};

export async function getVendorProducts(vendorId: string) {
    try {
        const command = new QueryCommand({
            TableName: 'Vendors',
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ':pk': `VENDOR#${vendorId.toUpperCase()}`,
                ':skPrefix': 'PROD#'
            },
        });

        const response = await docClient.send(command);
        const items = response.Items || [];
        console.log("Query products: ", items)

        return {success: true, data: items};
    }catch(error) {
        console.error("Query Error: ", error);
        return {success: false, error: "Failed to query products"}
    }
}

export async function saveProducts(vendorId: string, products: ProductRow[]): Promise<ActionState> {
    try {
        const putRequests = products.map(prod => ({
            PutRequest: {
            Item: {
                PK: `VENDOR#${vendorId.toUpperCase()}`,
                SK: `PROD#${prod.category.toUpperCase()}#${prod.subCategory.toUpperCase()}`,
                name: prod.subCategory, // 具体的名称
                category: prod.category,
                price: prod.price,
                unit: prod.unit,
                count: prod.count,
                imageUrl: prod.imageUrl,
                createdAt: new Date().toISOString()
            }
            }
        }));

        await docClient.send(new BatchWriteCommand({
            RequestItems: {
            "Vendors": putRequests
            }
        }));

        return { success: true, message: "Add success" };
    } catch (error) {
        console.error("DynamoDB Error:", error);
        return { success: false, message: "Write to DB failure" };
    }
  
}