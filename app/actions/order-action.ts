'use server';

import {docClient} from "@/lib/db"
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

import { CartItem, CustomerProfile } from "../shop/page";
import { CancellationReason } from "@aws-sdk/client-dynamodb";

// 1. 定义一个兼容 AWS 错误结构的接口
interface TransactionCanceledError extends Error {
  CancellationReasons?: Array<{
    Code: string;
    Message?: string;
  }>;
}


export async function processOrders(customer:CustomerProfile, cartList: CartItem[], totalAmount: number) {

    const orderId = `ORD#${Date.now()}`
    const timestamp = new Date().toISOString()
    console.log('Customer: ', customer)

    // Step1: update the products records
    const updateProducts = cartList.map(item =>
    {
        console.log('In update values are: ', item.orderCount, item.product.count)
        return {Update: {
        TableName: 'Vendors',
        Key: {
            PK: item.product.PK,
            SK: item.product.SK,
        },
        UpdateExpression: "SET #c = #c - :qty",
        ConditionExpression: " #c >= :qty",
        ExpressionAttributeNames: {'#c': 'count'},
        ExpressionAttributeValues: {':qty': item.orderCount},
        ReturnValuesOnConditionCheckFailure: "ALL_OLD" as const
        }}
    })

    // step2: Add customer's order records
    const customerOrders = {
        Put: {
            TableName: 'Customers',
            Item: {
                PK: customer.PK,
                SK: orderId,
                type: 'ORDER',
                orderDate: timestamp,
                items: cartList.map(item => ({
                    name: item.product.name,
                    vendorName: item.vendor.name,
                    productImgUrl: item.product.imageUrl,
                    unit: item.product.unit,
                    price: item.product.price,
                    qty: item.orderCount,
                })),
                totalPrice: totalAmount,
                status: 'FINISHED'
            }
        }
    }
    
    // step3: Use atomic transaction to update Vendor and customer Table.
    try {
        const command = new TransactWriteCommand( {
            TransactItems: [
                ...updateProducts,
                customerOrders
            ]
        })
        await docClient.send(command)
        return {success: true, orderId: orderId}

    }catch(error) {
    if (error instanceof Error) {
        console.error("Original Error Name:", error.name);
        // 2. 将 error 断言为具有 CancellationReasons 的具体类型
        // TransactionCanceledException 是 AWS SDK 抛出的特定错误
        const awsError = error as TransactionCanceledError; // 在这里局部使用 any 是为了跳过复杂的 SDK 类型定义，或者定义一个接口
        if (error.name === "TransactionCanceledException" && awsError.CancellationReasons) {
            // 打印整个原因数组，看看 DB 到底返回了什么
            console.log("Cancellation Reasons Raw:", JSON.stringify(awsError.CancellationReasons, null, 2));

            awsError.CancellationReasons.forEach((reason: CancellationReason, index: number) => {
                // 检查是否是产品扣减失败（索引在 cartList 范围内）
                if (index < cartList.length) {
                    if (reason.Code === "ConditionalCheckFailed") {
                        const failedItem = cartList[index];
                        // 注意：不同版本的 SDK，reason.Item 可能在不同位置，或者被包裹
                        const actualStock = reason.Item?.count ?? "Unknown";
                        
                        console.error(`--- Stock Shortage Details ---`);
                        console.error(`Product: ${failedItem?.product?.name}`);
                        console.error(`Requested: ${failedItem?.orderCount}`);
                        console.error(`Actual DB Stock: ${actualStock}`);
                    }
                } else {
                    // 处理非产品的操作失败（比如 customerOrders）
                    if (reason.Code !== "None") {
                        console.error(`Customer Record Error: ${reason.Code} - ${reason.Message || ''}`);
                    }
                }
            });
            throw new Error("Order failed: Not enough products or database error");
        }else{
            console.error("An unexpected error occurred", error);
            throw error;
        }
    }
    }

}