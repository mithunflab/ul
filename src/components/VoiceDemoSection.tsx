import React, { useState } from 'react';
import { Mic, CheckCircle, Loader } from 'lucide-react';

const VoiceDemoSection: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleVoiceDemo = () => {
    if (isListening || isProcessing) return;
    
    setIsListening(true);
    
    // Simulate listening phase
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate processing phase
      setTimeout(() => {
        setIsProcessing(false);
        setShowResult(true);
        
        // Reset after showing result
        setTimeout(() => {
          setShowResult(false);
        }, 5000);
      }, 2000);
    }, 3000);
  };

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Experience Voice Automation
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Click the microphone and describe your automation needs in natural language
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12">
          {/* Voice Button */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Animated rings when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full animate-ping opacity-20 scale-150"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full animate-ping opacity-30 scale-125 animation-delay-75"></div>
                </>
              )}
              
              <button
                onClick={handleVoiceDemo}
                disabled={isListening || isProcessing}
                className={`relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-500/25 ${
                  isListening || isProcessing 
                    ? 'scale-110' 
                    : 'hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <Loader className="w-10 h-10 text-white animate-spin" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
            </div>
            
            <p className="text-slate-400 text-center max-w-xs">
              {isListening 
                ? "Listening... Speak now!" 
                : isProcessing 
                ? "Processing your request..." 
                : "Click to start voice input"
              }
            </p>
          </div>

          {/* Demo Cards */}
          <div className="space-y-6 max-w-2xl">
            {/* Voice Input Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-indigo-400 font-medium">Voice Input:</span>
              </div>
              <div className="text-slate-50 text-lg">
                {isListening ? (
                  <span className="animate-pulse">"Create a workflow that sends me Slack notifications when we get new leads in HubSpot"</span>
                ) : (
                  <span className="text-slate-400">"Create a workflow that sends me Slack notifications when we get new leads in HubSpot"</span>
                )}
              </div>
            </div>

            {/* AI Response Card */}
            <div className={`bg-gradient-to-r from-indigo-500/10 to-amber-500/10 border border-indigo-500/20 rounded-2xl p-6 transition-all duration-500 ${
              showResult ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${showResult ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-emerald-400 font-medium">AI Generated:</span>
              </div>
              <div className="space-y-2 text-slate-50">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Generated 4-node workflow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>HubSpot trigger configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Slack integration ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Ready to deploy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceDemoSection;