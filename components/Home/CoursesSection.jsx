import React from 'react';
import { BookOpen, Users, FileText, ClipboardCheck, TrendingUp } from 'lucide-react';

const LMSFeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Theory",
      titleSi: "සිද්ධාන්ත පන්ති",
      description: "විෂය නිර්දේශයේ සියලුම සිද්ධාන්ත අංගසම්පූර්ණ ලෙස ආවරණය කරන, විශේෂ ක්‍රමවේද ඔස්සේ සිදුකරන ඉගැන්වීම් ක්‍රියාවලිය",
      gradient: "from-blue-500 to-blue-600",
      iconBg: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Seminar Series",
      titleSi: "සම්මන්ත්‍රණ මාලාව",
      description: "විභාගය අරමුණු කරගනිමින් පවත්වන, නැවත විෂය කරුනු සිහිපත් කරවන, විශාල සිසුන් සංඛ්‍යාවකගේ සිහින යථාර්ථයක් කළ විශේෂ සම්මන්ත්‍රණ මාලාව",
      gradient: "from-purple-500 to-purple-600",
      iconBg: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Paper Practice",
      titleSi: "ප්‍රශ්න පත්‍ර පුහුණුව",
      description: "විභාගයට සූදානම් කරවීම වෙනුවෙන්ම පවත්වන ප්‍රශ්න පත්‍ර ලියවීම, සාකච්ඡා කිරීම හා අධීක්ෂණය",
      gradient: "from-cyan-500 to-cyan-600",
      iconBg: "from-cyan-500 to-blue-500"
    },
    {
      icon: ClipboardCheck,
      title: "Student Record Book",
      titleSi: "සිසු වාර්තා පොත",
      description: "විෂයෙහි නිපුණතාවය සෑම පෙරහුරු විභාගයකදීම අධීක්ෂණය කිරීම",
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="relative py-8 lg:py-10 overflow-hidden bg-gradient-to-br from-[var(--hero-bg-start)] via-[var(--hero-bg-mid)] to-[var(--hero-bg-end)]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl bg-blue-400/20 dark:bg-blue-500/10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl bg-purple-400/20 dark:bg-purple-500/10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl bg-green-400/20 dark:bg-green-500/10 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header - REDUCED */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)] mb-3">
            ඉගෙනුම් පද්ධතිය
          </h2>
          <p className="text-base sm:text-lg text-[var(--hero-text-secondary)] max-w-2xl mx-auto">
            විභාගයට සූදානම් වීම සඳහා අවශ්‍ය සියලුම පහසුකම් සහිත විශිෂ්ඨ ඉගැන්වීම් වැඩසටහන
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative backdrop-blur-sm border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--hero-card-bg)',
                borderColor: 'var(--hero-card-border)',
              }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content - REDUCED */}
              <h3 className="text-xl font-bold mb-2 text-[var(--hero-text-primary)]">
                {feature.title}
              </h3>
              <p className="text-base font-semibold font-[family-name:var(--font-sinhala)] mb-3" style={{
                backgroundImage: `linear-gradient(to right, var(--hero-gradient-start), var(--hero-gradient-mid))`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {feature.titleSi}
              </p>
              <p className="text-sm text-[var(--hero-text-secondary)] leading-relaxed font-[family-name:var(--font-sinhala)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Featured Card - Outstanding Results */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative backdrop-blur-sm border-2 rounded-3xl p-6 lg:p-10" style={{
            backgroundColor: 'var(--hero-card-bg)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              
              {/* Content - REDUCED */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block mb-2 px-3 py-1 rounded-full" style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    ★ විශේෂාංගය
                  </span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)] mb-2">
                  විශිෂ්ඨ ප්‍රතිඵල
                </h3>
                <p className="text-lg text-[var(--hero-text-secondary)] mb-2">
                  Outstanding Results
                </p>
                <p className="text-sm text-[var(--hero-text-secondary)] leading-relaxed mb-5 font-[family-name:var(--font-sinhala)]">
                  F → B, C → A ලෙස ප්‍රතිඵල වල දැවැන්ත පෙරලියක් ඇතිකළ ආසහිතෙන Science පන්තිය
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <div className="px-5 py-3 rounded-xl backdrop-blur-sm" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">F → B</div>
                    <div className="text-xs text-[var(--hero-text-secondary)] mt-1">Grade Improvement</div>
                  </div>
                  <div className="px-5 py-3 rounded-xl backdrop-blur-sm" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">C → A</div>
                    <div className="text-xs text-[var(--hero-text-secondary)] mt-1">Grade Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LMSFeaturesSection;
