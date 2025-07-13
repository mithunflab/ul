import React from 'react';
import { Mic, Zap, Sparkles } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: "Voice-First Interface",
      description: "Describe complex workflows naturally in 29+ languages. No coding required.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description: "Claude AI creates production-ready n8n workflows with proper error handling.",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "Instant Deployment",
      description: "Automatically deploy and activate workflows in your n8n instance with one click.",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Revolutionary Features
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the future of automation with cutting-edge voice AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 group hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-50 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
