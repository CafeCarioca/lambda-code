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
    
    # Get the order details from the event
    order_id = event.get('OrderID')
    user_id = event.get('UserID')
    
    if not order_id or not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: Missing OrderID or UserID')
        }
    try:
        # Update the order status to 'Cancelled'
        response = table.update_item(
            Key={
                'pk': user_id,
                'sk': f'Order#{order_id}'
            },
            UpdateExpression="set #status = :status",
            ExpressionAttributeNames={
                '#status': 'Status'
            },
            ExpressionAttributeValues={
                ':status': 'Cancelled'
            },
            ReturnValues="UPDATED_NEW"
        )
        return {
            'statusCode': 200,
            'body': json.dumps(f'Order {order_id} for user {user_id} cancelled successfully')
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error cancelling order: {e.response["Error"]["Message"]}')
        }
