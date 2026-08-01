<img width="1906" height="869" alt="image" src="https://github.com/user-attachments/assets/bbd6f6a0-a87d-4f51-af1b-f86833f8c246" />



# Standup Sentinel

> **Transform chaotic daily developer notes into structured, professional standup reports in seconds.**

Built as part of the **AWS Weekend Annoying Task Challenge**, Standup Sentinel solves the daily friction of writing status updates after long coding sessions.

---

## The Problem & Vision
Context switching from deep technical problem-solving to formatting daily standup or weekly status reports takes mental energy away from engineering. Developers often leave unstructured notes across scratchpads, PRs, and commit logs.

**Standup Sentinel** acts as an AI sidekick: paste raw, unformatted notes into the left panel, and it instantly generates a formatted, team-ready update on the right panel covering:
1. **What I Did:** Clear bullet points of completed work.
2. **What I Will Do:** Next immediate tasks and objectives.
3. **Blockers:** Bottlenecks or external dependencies.

---

##  Architecture & AWS Tech Stack


```

[ React + Tailwind Frontend ] ──▶ (AWS Amplify)
│
(HTTP POST)
▼
[ AWS Lambda Function URL ]
│
(boto3 Converse API)
▼
[ Amazon Bedrock (Nova 2 Lite) ]
│
▼
[ AWS CloudWatch ]

```

* **AWS Kiro:** Spec-driven agentic tool used to generate component architecture and backend logic.
* **AWS Amplify:** Continuous deployment and hosting for the React SPA.
* **AWS Lambda (Function URL):** Serverless Python backend providing direct HTTP endpoints without API Gateway overhead.
* **Amazon Bedrock:** Powered by `us.amazon.nova-2-lite-v1:0` via the AWS `converse` API.
* **AWS CloudWatch:** Real-time log monitoring and execution tracing.

---

##  Local Development Setup

### Prerequisites
* Node.js (v18+)
* npm or yarn

### Steps
1. Clone the repository:
```bash
   git clone https://github.com/trivedikavya/Standup-Sentinel.git
   cd Standup-Sentinel
```

2. Install dependencies:
```bash
npm install
```


3. Run the development server:
```bash
npm run dev

```




