import json
import boto3

def lambda_handler(event, context):
    try:
        # Parse the input from the React frontend
        body_str = event.get('body', '{}')
        if not body_str:
             body_str = '{}'
        body = json.loads(body_str)
        text = body.get('notes', 'No notes provided.')

        # Call Bedrock (Hardcoded to us-east-1)
        client = boto3.client('bedrock-runtime', region_name='us-east-1')
        
        # Configure the inference parameters for Amazon Nova Lite
        inf_params = {"maxTokens": 500}
        
        native_request = {
            "schemaVersion": "messages-v1",
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": f"Format these raw notes into a professional 3-point standup report: 1. What I did, 2. What I will do, 3. Blockers.\n\nNotes: {text}"}]
                }
            ],
            "inferenceConfig": inf_params
        }

        response = client.invoke_model(
            modelId='us.amazon.nova-lite-v1:0',
            body=json.dumps(native_request)
        )

        model_response = json.loads(response.get('body').read())
        
        # Extract the text from the Nova Lite response structure
        result_text = model_response.get("output", {}).get("message", {}).get("content", [{}])[0].get("text", "Error extracting text.")

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
