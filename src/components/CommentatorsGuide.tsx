import React from 'react';
import { Feather, BookOpen, HeartHandshake, Scroll, GraduationCap, X } from 'lucide-react';

interface CommentatorsGuideProps {
  onClose?: () => void;
  isDark: boolean;
}

export const CommentatorsGuide: React.FC<CommentatorsGuideProps> = ({ onClose, isDark }) => {
  const commentators = [
    {
      name: "முனைவர் மு. வரதராசனார் (Dr. Mu. Va)",
      period: "1912 - 1974",
      style: "எளிய தமிழ் நடை",
      desc: "செந்தமிழின் நயமும் தெளிவும் குன்றாமல், ஒவ்வொரு சொல்லுக்கும் நேரடியானதும் தெளிவானதுமான பொருள் விளக்கம் தரும் ஒப்புயர்வற்ற உரை.",
      badge: "செந்தமிழ் உரை"
    },
    {
      name: "கலைஞர் மு. கருணாநிதி",
      period: "1924 - 2018",
      style: "கவிதை நடையும் சமுதாயப் பார்வையும்",
      desc: "திராவிட இயக்கத்தின் இலக்கிய ஆளுமை. வள்ளுவக் கருத்துக்களைப் பாமரரும் உணரும் வண்ணம் சொல்நயமும் எதுகை மோனையும் மிளிரும் கவித்துவ உரை.",
      badge: "கவிதை நயவுரை"
    },
    {
      name: "பேராசிரியர் சாலமன் பாப்பையா",
      period: "1936 - தற்போது வரை",
      style: "நடைமுறை மக்கள் வழக்கு",
      desc: "பட்டிமன்றப் புகழ் அறிஞர். அன்றாட மனித வாழ்வின் எதார்த்தச் சூழல்களோடு பொருந்திப்போகும் உரையாடல் பாணியிலான வாழ்வியல் விளக்கம்.",
      badge: "நடைமுறை உரை"
    },
    {
      name: "பரிமேலழகர்",
      period: "13-ஆம் நூற்றாண்டு",
      style: "தொன்மையான செவ்வியல் உரை",
      desc: "திருக்குறளுக்கு அமைந்த பதின்மர் உரைகளில் தலையாய உரை. தொல்காப்பிய இலக்கண மரபையும் நுட்பமான மெய்யியல் பொருளையும் வெளிப்படுத்தும் உரை.",
      badge: "செவ்வியல் உரை"
    }
  ];

  return (
    <section className={`rounded-2xl border p-6 sm:p-8 mb-10 transition-colors ${
      isDark ? 'bg-[#1E1B17] border-[#332E27]' : 'bg-white border-[#E6DFD3] shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-classical">
              நால்வர் தமிழ் உரைக் களஞ்சியம் (Commentators of Thirukkural)
            </h2>
            <p className="text-xs text-stone-500">
              திருக்குறளின் ஆழத்தை வெவ்வேறு காலக்கட்டங்களிலும் இலக்கியக் கண்ணோட்டங்களிலும் வெளிக்கொணர்ந்த தமிழ் அறிஞர்கள்
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {commentators.map((c, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
              isDark ? 'bg-[#241F1A] border-[#362F26]' : 'bg-[#FAF7F2] border-[#E8DFC0]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#9A3412] tracking-wide">
                  {c.badge}
                </span>
                <span className="text-[11px] text-stone-500">
                  {c.period}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                {c.name}
              </h3>
              <div className="text-xs text-[#8C2D19] dark:text-[#E8A578] font-medium mb-2">
                {c.style}
              </div>
              <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
