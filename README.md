<img width="1906" height="869" alt="image" src="https://github.com/user-attachments/assets/bbd6f6a0-a87d-4f51-af1b-f86833f8c246" />


# Standup Sentinel 🛡️

Standup Sentinel is an AI-powered developer productivity tool that formats messy, raw daily notes into a clean, concise, 3-point standup report:
1. **What I did**
2. **What I will do**
3. **Blockers**

The application is powered by **Amazon Bedrock (Claude 3 Haiku)** on the backend and features a modern, responsive dark-themed interface built using **React** and **Tailwind CSS v4** on the frontend.

---

## Architecture Overview

```
[ User Input ] ---> [ React Frontend (Vite) ] 
                           |  (CORS POST Request)
                           v
                    [ AWS Lambda Backend ]
                           |  (boto3 InvokeModel)
                           v
                    [ Amazon Bedrock (Claude 3 Haiku) ]
```

---

## Project Structure

```
├── index.html            # Main entry file (Google fonts & SEO configured)
├── package.json          # Frontend dependencies & scripts
├── vite.config.js        # Vite build tool with Tailwind CSS v4 plugin
├── lambda_function.py    # Production-ready AWS Lambda backend handler
├── README.md             # Setup and deployment documentation
└── src/
    ├── App.jsx           # Main React component (Layout, state, & API calls)
    ├── index.css         # Tailwind imports and base typography styles
    └── main.jsx          # React app DOM mounting entrypoint
```

---

## Getting Started

### 1. Frontend Local Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# 1. Install all dependencies
npm install

# 2. Run the local development server
npm run dev

# 3. Build the production application
npm run build
```

The application will run locally at `http://localhost:5173`. 

> [!NOTE]
> **Demo Mode:** If the `LAMBDA_URL` in `src/App.jsx` is left as `"YOUR_LAMBDA_URL_HERE"`, the frontend runs in a simulated Demo Mode. Clicking **Format Report** will play loading steps and output a simulated standup response. This is useful for previewing aesthetics without active AWS credentials.

---

### 2. Backend AWS Lambda Deployment

To run the application with real AI formatting, deploy the backend code on AWS:

#### Step A: Create the Lambda Function
1. Log in to your AWS Console and navigate to **Lambda**.
2. Click **Create Function**.
3. Choose **Author from scratch**, set the runtime to **Python 3.12** (or Python 3.11/3.10), and click **Create**.
4. Copy the entire contents of [lambda_function.py](file:///c:/Users/hp/OneDrive/Desktop/Challenge/lambda_function.py) and paste it into the built-in Lambda code editor.
5. Click **Deploy**.

#### Step B: Set Up IAM Permissions
Your Lambda function needs permissions to invoke Amazon Bedrock's Claude 3 Haiku.
1. Go to the **Configuration** tab of your Lambda function.
2. Select **Permissions** on the left menu, then click on the **Execution role** link.
3. In the IAM console, click **Add permissions** -> **Create inline policy**.
4. Switch to the **JSON** editor and paste the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "bedrock:InvokeModel",
         "Resource": "arn:aws:bedrock:*:*:model/anthropic.claude-3-haiku-20240307-v1:0"
       }
     ]
   }
   ```
5. Click **Review policy**, name it (e.g., `LambdaBedrockInvokePolicy`), and click **Create policy**.
6. Ensure your AWS Bedrock account has **Model Access** enabled for `Claude 3 Haiku`.

#### Step C: Add API Gateway Trigger (CORS Handled in Lambda)
1. In the Lambda Console, click **Add Trigger** at the top of the function visualizer.
2. Choose **API Gateway**.
3. Select **Create a new API**, choose **HTTP API** (recommended for speed/cost) or **REST API**.
4. Under Security, select **Open** (the Lambda handler code manages CORS via the preflight options).
5. Click **Add**.
6. Copy the generated **API Endpoint** (e.g., `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/...`).

---

### 3. Connect Frontend to Lambda

1. Open [src/App.jsx](file:///c:/Users/hp/OneDrive/Desktop/Challenge/src/App.jsx) in your editor.
2. Locate the placeholder at the top of the file:
   ```javascript
   const LAMBDA_URL = "YOUR_LAMBDA_URL_HERE";
   ```
3. Replace `"YOUR_LAMBDA_URL_HERE"` with your copied API Gateway Endpoint:
   ```javascript
   const LAMBDA_URL = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/default/your-function-name";
   ```
4. Save the file.
5. Test the application in your browser. Raw notes will now invoke the live Bedrock model!
