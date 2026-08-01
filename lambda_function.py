import json
import boto3

def lambda_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        body = json.loads(event.get("body", "{}") or "{}")
        text = body.get("notes", "")

        client = boto3.client("bedrock-runtime", region_name="us-east-1")
        response = client.converse(
            modelId="us.amazon.nova-2-lite-v1:0",
            messages=[
                {
                    "role": "user",
                    "content": [{"text": f"Format these raw notes into a 3-point standup report:\n1. What I did\n2. What I will do\n3. Blockers\n\nNotes: {text}"}]
                }
            ],
            inferenceConfig={"maxTokens": 500}
        )

        result_text = response["output"]["message"]["content"][0]["text"]
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"report": result_text})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
