import React from 'react';
import { Building2, BarChart3, Share2 } from 'lucide-react';

const UseCasesSection: React.FC = () => {
  const useCases = [
    {
      icon: Building2,
      category: "Business Automation",
      title: "Smart Lead Management",
      description: "Create a workflow that sends me Slack notifications when we get new leads in HubSpot",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: BarChart3,
      category: "Data Integration",
      title: "Automated Data Sync",
      description: "Import customer data from Stripe to Airtable every hour",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Share2,
      category: "Content Management",
      title: "Cross-Platform Posting",
      description: "Auto-post Instagram content to Twitter and LinkedIn",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Real-World Use Cases
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            See how WorkFlow AI transforms everyday business processes with voice commands
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 group hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-medium text-indigo-400 uppercase tracking-wide">
                    {useCase.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-50 mt-2">
                    {useCase.title}
                  </h3>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
                  <p className="text-slate-300 italic">
                    "{useCase.description}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;