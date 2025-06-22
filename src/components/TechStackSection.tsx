import React from 'react';
import { Code, Database, Mic2, Brain } from 'lucide-react';

const TechStackSection: React.FC = () => {
  const technologies = [
    {
      name: "Bolt.new",
      description: "Development Platform",
      icon: Code,
      color: "text-blue-400"
    },
    {
      name: "Supabase",
      description: "Backend & Database",
      icon: Database,
      color: "text-emerald-400"
    },
    {
      name: "ElevenLabs",
      description: "Voice AI",
      icon: Mic2,
      color: "text-purple-400"
    },
    {
      name: "Claude",
      description: "AI Generation",
      icon: Brain,
      color: "text-amber-400"
    }
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Powered By Best-in-Class Tech
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Built on the most advanced platforms and AI technologies available today
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300">
                  <Icon className={`w-12 h-12 ${tech.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-xl font-bold text-slate-50 mb-2">
                    {tech.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {tech.description}
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

export default TechStackSection;