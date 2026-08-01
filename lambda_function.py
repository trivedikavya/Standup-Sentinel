import json
import os
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Define CORS headers to return in all responses
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Max-Age": "86400"
    }
    
    # Identify the HTTP method to support both REST APIs and HTTP APIs on API Gateway
    method = event.get('httpMethod')
    if not method:
        method = event.get('requestContext', {}).get('http', {}).get('method', 'POST')
        
    # Handle preflight CORS request (OPTIONS)
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
        
    try:
        # Extract the JSON request body
        body_str = event.get('body', '')
        if not body_str:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({"error": "Missing request body"})
            }
            
        try:
            body = json.loads(body_str)
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({"error": "Invalid JSON format in body"})
            }
            
        raw_notes = body.get('raw_notes', '')
        if not raw_notes:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({"error": "Missing 'raw_notes' parameter in JSON payload"})
            }
            
        # Initialize Amazon Bedrock runtime client
        region = os.environ.get('AWS_REGION', 'us-east-1')
        bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name=region
        )
        
        # Prepare the Claude prompt
        user_prompt = f"Format these raw notes into a 3-point standup report: 1. What I did, 2. What I will do, 3. Blockers.\n\nRaw Notes:\n{raw_notes}"
        
        # Payload format for Claude 3 (Messages API format)
        bedrock_payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        }
                    ]
                }
            ]
        }
        
        # Call Bedrock Claude 3 Haiku Model
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            contentType="application/json",
            accept="application/json",
            body=json.dumps(bedrock_payload)
        )
        
        # Parse output
        response_body = json.loads(response.get('body').read())
        formatted_report = response_body['content'][0]['text']
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                "report": formatted_report
            })
        }
        
    except ClientError as e:
        print(f"AWS Bedrock invocation failure: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                "error": "Failed to call Amazon Bedrock. Check IAM role permissions.",
                "details": str(e)
            })
        }
    except Exception as e:
        print(f"Unexpected handler error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                "error": "Internal Server Error",
                "details": str(e)
            })
        }
