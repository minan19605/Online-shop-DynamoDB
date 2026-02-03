'use server';

import {docClient} from "@/lib/db"
import { BatchWriteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { 
//   VENDOR_OPTIONS, 
//   PRODUCT_CATEGORIES, 
//   PRODUCT_IMAGES, 
  MainCategory 
} from "@/lib/constants";

export interface SavedProductRow {
  category: MainCategory | ""; // 'CHICKEN', 'BEEF'
  subCategory: string;  // "wings" , "drum sticks"
  imageUrl: string;
  unit: string;
  price: number | string;
  count: number;
}

export interface FetchedProduct {
    PK: string;
    SK: string;
    category: string; // 'CHICKEN', 'BEEF'
    count: string;
    createAt: string;
    imageUrl: string;
    name: string;  // "wings" , "drum sticks"
    price: number | string;
    unit: string;
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
        const items = (response.Items as FetchedProduct[]) || [];
        // console.log("Query products: ", items)

        return {success: true, data: items};
    }catch(error) {
        console.error("Query Error: ", error);
        return {success: false, error: "Failed to query products"}
    }
}

export async function saveProducts(vendorId: string, products: SavedProductRow[]): Promise<ActionState> {
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

export async function getAllProductsForCustomer() {
  try {
    const command = new ScanCommand({
      TableName: "Vendors",
      // 过滤只取出产品数据（SK 以 PROD# 开头）
      FilterExpression: "begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":prefix": "PROD#",
      },
    });

    const response = await docClient.send(command);
    return { success: true, data: response.Items as FetchedProduct[] || [] };
  } catch (error) {
    return { success: false, error: "Failed to load products" };
  }
}