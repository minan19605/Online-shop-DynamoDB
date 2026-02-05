'use server';

import {docClient} from "@/lib/db"
import { BatchWriteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export interface customerSchema {
    PK: string; // 'USER#EMAIL'
    SK: string;  // `PROFILE`
    entityType: string; // 'CUSTOMER'
    username: string;  
    address: string;
    phone: string;
    email: string;
    updatedAt: string; // updated time
}

// Only one customer in DB,
// can fetch all customer from DB
// Normal procedure should be customer log in then have a customer ID
// put customer ID here as param to fetch from DB

export async function fetchCustomer() {
    try {

        const command = new ScanCommand({
            TableName: 'Customers',
            FilterExpression: "SK = :sk",
            ExpressionAttributeValues: {
                ':sk': 'PROFILE'
            },
            // Limit: 1,  // only one records
        });

        const response = await docClient.send(command)
        if(response.Items && response.Items.length > 0) {
            return {success: true, data: response.Items[0] as customerSchema}
        }
        return {success:false, error: "No customer profile found."}
    }catch(e) {
        console.error('Scan customer error: ', e);
        return {success: false, error: 'Database connection failed.'}
    }
}

export async function getCustomerDashboard(customerId: string) {
    console.log('Customer PK: ', customerId)
  const command = new QueryCommand({
    TableName: 'Customers',
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": customerId
    },
    ScanIndexForward: false, // 让最近的订单排在前面
    Limit: 21, // 20条订单 + 1条Profile
  });

  const response = await docClient.send(command);
  const items = response.Items || [];

  return {
    profile: items.find(i => i.SK === 'PROFILE'),
    orders: items.filter(i => i.SK.startsWith('ORD#')).slice(0, 20)
  };
}