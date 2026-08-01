import json
import boto3

def lambda_handler(event, context):
    try:
        # Parse the input from the React frontend
        body = json.loads(event.get('body', '{}'))
        text = body.get('notes', 'No notes provided.')

        # Call Bedrock (Hardcoded to us-east-1)
        client = boto3.client('bedrock-runtime', region_name='us-east-1')
        
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [
                {
                    "role": "user",
                    "content": f"Format these raw notes into a professional 3-point standup report: 1. What I did, 2. What I will do, 3. Blockers.\n\nNotes: {text}"
                }
            ]
        }

        response = client.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=json.dumps(payload)
        )

        response_body = json.loads(response.get('body').read())
        result_text = response_body.get('content')[0].get('text')

        # Return success (AWS Console handles the CORS headers now!)
        return {
            'statusCode': 200,
            'body': json.dumps({'report': result_text})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
