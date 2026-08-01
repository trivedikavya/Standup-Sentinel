import React, { useState } from "react";
import { Shield, Sparkles, Clipboard, Check, Trash2, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

// 2. Placeholder variable as requested
const LAMBDA_URL = "https://pmi2w6p563l332egg2flh2w7om0msher.lambda-url.us-east-1.on.aws/";

export default function App() {
  const [rawNotes, setRawNotes] = useState("");
  const [formattedReport, setFormattedReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
    if (!rawNotes.trim()) {
      setError("Please enter some raw notes first.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    setFormattedReport("");
    
    // Simulate multi-stage loading messages for a premium feel
    const steps = [
      "Analyzing raw notes...",
      "Connecting to AWS Lambda...",
      "Bedrock invoking Claude 3 Haiku...",
      "Polishing standup layout..."
    ];
    
    let stepIndex = 0;
    setLoadingStep(steps[stepIndex]);
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setLoadingStep(steps[stepIndex]);
      }
    }, 1200);

    try {
      if (LAMBDA_URL === "YOUR_LAMBDA_URL_HERE" || !LAMBDA_URL) {
        // Fallback for demo when URL is not configured
        await new Promise(resolve => setTimeout(resolve, 4500));
        clearInterval(stepInterval);
        
        // Return a mock output to demonstrate how the app will look
        const mockOutput = `### 1. What I did
- Successfully implemented the Vite frontend layout with Tailwind CSS v4.
- Integrated Lucide icons and dark theme styling for high aesthetic quality.
- Prepared the \`lambda_function.py\` script for Amazon Bedrock integration.

### 2. What I will do
- Deploy the AWS Lambda function and set up Bedrock IAM permissions.
- Replace \`LAMBDA_URL\` with the deployed API Gateway/Lambda URL.
- Test the end-to-end integration with Claude 3 Haiku.

### 3. Blockers
- None. (Awaiting AWS Bedrock model access verification).`;
        
        setFormattedReport(mockOutput);
        setIsLoading(false);
        return;
      }

      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw_notes: rawNotes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(stepInterval);
      
      // Parse response payload from Lambda
      if (data && typeof data === "object") {
        setFormattedReport(data.report || data.formatted_notes || JSON.stringify(data, null, 2));
      } else {
        setFormattedReport(data);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setError(`Failed to format report: ${err.message}. Make sure your LAMBDA_URL is set and CORS is configured.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!formattedReport) return;
    navigator.clipboard.writeText(formattedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = rawNotes.trim() ? rawNotes.trim().split(/\s+/).length : 0;
  const charCount = rawNotes.length;

  return (
    <div className="min-h-screen bg-[#070b13] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-8 flex-grow flex flex-col justify-center">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl shadow-inner mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Standup <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Sentinel</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light">
            AI-powered daily notes companion. Transform chaotic thoughts into structured, professional standup updates in seconds.
          </p>
        </div>

        {/* Configuration Notice */}
        {LAMBDA_URL === "YOUR_LAMBDA_URL_HERE" && (
          <div className="max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-amber-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-400">Demo Mode:</span> `LAMBDA_URL` is set to the default placeholder. Clicking "Format Report" will simulate an AWS Bedrock Claude 3 Haiku call. To run live, configure the Lambda function in AWS and update the URL in <code className="bg-amber-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">App.jsx</code>.
            </div>
          </div>
        )}

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mt-4">
          
          {/* Input Panel */}
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-200">Raw Daily Notes</h2>
              </div>
              {rawNotes && (
                <button 
                  onClick={() => { setRawNotes(""); setError(""); }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative flex-grow flex flex-col">
              <textarea
                value={rawNotes}
                onChange={(e) => {
                  setRawNotes(e.target.value);
                  if (error) setError("");
                }}
                placeholder="E.g., Finished the index.html styling. Need to debug the AWS API Gateway route - blocking me. Tomorrow will write readme and finalize lambda integration."
                className="w-full min-h-[280px] flex-grow bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />
              
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleFormat}
              disabled={isLoading}
              className={`mt-6 w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                isLoading 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] border border-indigo-500/30"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span>Format Report</span>
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-200">Formatted Standup</h2>
              </div>
              {formattedReport && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 py-1 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-grow flex flex-col bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 min-h-[350px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                  </div>
                  <p className="text-xs text-slate-400 font-mono animate-pulse">{loadingStep}</p>
                </div>
              ) : formattedReport ? (
                <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {formattedReport.split('\n\n').map((block, idx) => {
                    // Check if it's a section header (e.g. ### 1. What I did, or 1. What I did)
                    const isHeader = block.trim().startsWith('###') || 
                                     /^\d+\.\s+/.test(block.trim()) ||
                                     block.trim().toLowerCase().includes('what i');
                    
                    if (isHeader) {
                      return (
                        <div key={idx} className="border-l-2 border-indigo-500 pl-3 my-3 first:mt-0">
                          <h3 className="font-semibold text-indigo-300 text-sm tracking-wide uppercase">
                            {block.replace(/###\s*/, '').trim()}
                          </h3>
                        </div>
                      );
                    }
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                        {block.split('\n').map((line, lIdx) => {
                          const cleanLine = line.replace(/^\s*[-*+]\s*/, '').replace(/^\s*\d+\.\s*/, '').trim();
                          if (!cleanLine) return null;
                          return <li key={lIdx} className="leading-relaxed">{cleanLine}</li>;
                        })}
                      </ul>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Ready to Format</p>
                    <p className="text-slate-600 text-xs mt-1 max-w-[240px]">
                      Enter your notes on the left and click the button to generate your 3-point report.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 mt-12 py-4 border-t border-slate-900">
        <p>Standup Sentinel © {new Date().getFullYear()} — Powered by AWS Bedrock & Claude 3 Haiku</p>
      </footer>
    </div>
  );
}
