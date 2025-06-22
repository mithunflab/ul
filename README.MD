# 🎤 WorkFlow AI - Voice-Powered n8n Workflow Generator

[![Built with Bolt.new](https://img.shields.io/badge/Built%20with-Bolt.new-blue)](https://bolt.new)
[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green)](https://supabase.com)
[![ElevenLabs](https://img.shields.io/badge/Voice%20AI-ElevenLabs-purple)](https://elevenlabs.io)
[![Claude](https://img.shields.io/badge/AI-Claude-orange)](https://claude.ai)

> **The world's first voice-powered automation builder** - Create complex n8n workflows using just your voice, powered by AI.

## 🏆 Built for Bolt.new Hackathon 2025

**Targeting Multiple Challenges:**

- 🎤 **Voice AI Challenge** (ElevenLabs) - $25,000
- 🚀 **Startup Challenge** (Supabase) - $25,000
- 🎨 **Creative Use of AI** - $5,000
- 🦄 **Future Unicorn** - $5,000

## 🌟 What is WorkFlow AI?

WorkFlow AI revolutionizes automation by letting anyone create sophisticated n8n workflows through natural voice commands. Simply describe what you want to automate, and our AI generates, validates, and deploys complete workflows to your n8n instance.

### ✨ Key Features

- 🎤 **Voice-First Interface** - Describe workflows naturally in 29+ languages
- 🧠 **AI-Powered Generation** - Claude creates production-ready n8n workflows
- ⚡ **Instant Deployment** - Automatically deploy to your n8n instance
- 🌍 **Global Accessibility** - Multi-language support via ElevenLabs
- 📱 **Cross-Platform** - Works on desktop, tablet, and mobile
- 🔧 **Real-time Editing** - Modify workflows with voice commands
- 📊 **Visual Workflow Editor** - See your automation come to life
- 🔒 **Secure & Private** - Your data stays protected

## 🚀 Live Demo

**[Try WorkFlow AI →](https://your-demo-url.vercel.app)**

### 📺 Demo Video

[![WorkFlow AI Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

## 🎯 Use Cases

### 💼 Business Automation

- **"Create a workflow that sends me Slack notifications when we get new leads in HubSpot"**
- **"Sync all Google Calendar events to Notion and send daily summaries"**
- **"Backup important emails to Google Drive and categorize them"**

### 📊 Data Integration

- **"Import customer data from Stripe to Airtable every hour"**
- **"Generate weekly sales reports and email them to the team"**
- **"Monitor website uptime and alert if it goes down"**

### 🎨 Content Management

- **"Auto-post Instagram content to Twitter and LinkedIn"**
- **"Resize and optimize images when uploaded to Dropbox"**
- **"Create thumbnails for YouTube videos automatically"**

## 🛠️ Tech Stack

### Frontend

- **Vite + React** - Lightning-fast development
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Beautiful, responsive UI
- **React Query** - Smart data fetching
- **Lucide Icons** - Clean iconography

### Backend

- **Supabase Edge Functions** - Serverless backend
- **Supabase Database** - PostgreSQL with real-time
- **Supabase Auth** - User management
- **Supabase Storage** - File handling

### AI Integration

- **Claude API** - Workflow generation
- **ElevenLabs** - Speech-to-text & text-to-speech
- **Custom Prompts** - Optimized for n8n workflows

### n8n Integration

- **n8n REST API** - Workflow deployment
- **Workflow Validation** - Schema compliance
- **Real-time Monitoring** - Execution tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- Supabase account
- ElevenLabs API key
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/WorkFlow-ai.git
cd WorkFlow-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key

# Supabase Edge Function Environment
ANTHROPIC_API_KEY=your_claude_api_key
N8N_API_BASE_URL=your_n8n_instance_url
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to start building workflows with your voice!

## 📖 Usage Guide

### 1. Connect Your n8n Instance

```typescript
// First, connect your n8n instance
const n8nConfig = {
  baseURL: "https://your-n8n-instance.com",
  apiKey: "your-n8n-api-key",
};
```

### 2. Voice Workflow Creation

1. **Click the microphone** button
2. **Describe your workflow** naturally:
   - _"I want to sync my Google Sheets to Slack every morning"_
3. **Review the generated workflow** visually
4. **Deploy with one click** to your n8n instance

### 3. Voice Commands

```typescript
// Creation Commands
"Create a workflow that...";
"I need automation for...";
"Build me a process that...";

// Editing Commands
"Add error handling";
"Change the trigger to daily";
"Connect this to Slack";
"Remove the filter step";

// Deployment Commands
"Deploy this workflow";
"Test this automation";
"Activate the workflow";
```

## 🏗️ Project Structure

```
WorkFlow-ai/
├── src/
│   ├── components/           # React components
│   │   ├── VoiceInput/      # Voice recording & processing
│   │   ├── WorkflowEditor/  # Visual workflow builder
│   │   ├── N8nPreview/      # n8n workflow preview
│   │   └── DeployPanel/     # Deployment controls
│   ├── hooks/               # Custom React hooks
│   │   ├── useVoiceInput.ts # Voice processing
│   │   ├── useWorkflow.ts   # Workflow management
│   │   └── useN8nApi.ts     # n8n integration
│   ├── services/            # API services
│   │   ├── supabase.ts      # Supabase client
│   │   ├── elevenlabs.ts    # Voice AI service
│   │   └── n8n.ts           # n8n API wrapper
│   ├── types/               # TypeScript definitions
│   └── utils/               # Helper functions
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── generate-workflow/  # Claude workflow generation
│   │   ├── deploy-workflow/    # n8n deployment
│   │   └── voice-processing/   # Voice transcription
│   └── migrations/          # Database schema
└── docs/                    # Documentation
```

## 🤖 AI Workflow Generation

### Voice Processing Pipeline

```typescript
interface VoiceWorkflowPipeline {
  // 1. Voice Input (ElevenLabs)
  voiceInput: AudioData;

  // 2. Speech-to-Text
  transcription: string;

  // 3. Intent Analysis
  workflowIntent: {
    trigger: string;
    actions: string[];
    conditions?: string[];
  };

  // 4. Claude Generation
  n8nWorkflow: N8nWorkflowJSON;

  // 5. Validation & Deployment
  deployedWorkflow: DeployedWorkflow;
}
```

### Example Generated Workflow

```json
{
  "name": "Google Sheets to Slack Sync",
  "nodes": [
    {
      "id": "trigger-1",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "value": 24 }]
        }
      },
      "position": [0, 0]
    },
    {
      "id": "sheets-1",
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "read",
        "sheetId": "{{ $json.sheetId }}",
        "range": "A:Z"
      },
      "position": [300, 0]
    },
    {
      "id": "slack-1",
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#general",
        "text": "New data: {{ $json.data.length }} rows updated"
      },
      "position": [600, 0]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [["Google Sheets"]]
    },
    "Google Sheets": {
      "main": [["Send to Slack"]]
    }
  }
}
```

## 🌍 Multi-Language Support

WorkFlow AI supports 29+ languages through ElevenLabs:

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese
- And many more!

## 📊 Analytics & Monitoring

Track your automation success with built-in analytics:

- 📈 **Workflow Performance** - Execution times and success rates
- 🔄 **Usage Patterns** - Most used triggers and actions
- 🐛 **Error Tracking** - Automatic error detection and alerts
- 📱 **Voice Analytics** - Command recognition accuracy

## 🔐 Security & Privacy

- 🔒 **End-to-End Encryption** - All voice data encrypted
- 🚫 **No Data Storage** - Voice processed in real-time only
- 🛡️ **Secure APIs** - All integrations use OAuth 2.0
- 👤 **User Privacy** - GDPR compliant data handling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Hackathon Contributors

- **Rahees Ahmed** - Project Lead & Full-Stack Development

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

**Built for:** [World's Largest Hackathon by Bolt.new](https://worldslargesthackathon.devpost.com/)  
**Submission Date:** June 2025  
**Developer:** Rahees Ahmed  
**Demo:** [COMMING SOON]  
**Video:** [COMMING SOON]

### Challenges Targeted

- ✅ Voice AI Challenge (ElevenLabs)
- ✅ Startup Challenge (Supabase)
- ✅ Creative Use of AI
- ✅ Most Beautiful UI
- ✅ Future Unicorn Potential

## 🙏 Acknowledgments

- **Bolt.new** - For the amazing development platform
- **Supabase** - For the powerful backend infrastructure
- **ElevenLabs** - For cutting-edge voice AI technology
- **Anthropic** - For Claude's incredible AI capabilities
- **n8n** - For the open automation platform
- **The Open Source Community** - For making this possible

---

**Made with ❤️ by Rahees Ahmed for the Bolt.new Hackathon 2025**

_"Democratizing automation through the power of voice and AI"_
