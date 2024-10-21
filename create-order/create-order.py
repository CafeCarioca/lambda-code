import os
import json
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    # Get the table name from the environment variable
    table_name = os.environ.get('TABLE')
    
    if not table_name:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: TABLE environment variable is not set')
        }
    
    # Reference the DynamoDB table
    table = dynamodb.Table(table_name)
    
    # Define the orders and items for both users
    orders = [
        # Orders for user_001
        {
            'pk': 'joaco',
            'sk': 'Order#022',
            'GSI1_pk': 'Order',
            'GSI1_sk': 'user_022#022',
            'lsi1_sk': 'OrderData',
            'OrderID': '5165',
            'OrderDate': '2024-10-17',
            'Status': 'InProgress',
            'TotalAmount': Decimal('1500.00')  # Use Decimal instead of float
        }
    ]
    
    # Insert each order and item into the DynamoDB table
    try:
        for order in orders:
            table.put_item(Item=order)
        
        return {
            'statusCode': 200,
            'body': json.dumps('Orders and items added successfully')
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error creating orders: {e.response["Error"]["Message"]}')
        }
