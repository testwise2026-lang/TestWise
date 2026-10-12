import { Bookmark, HelpCircle, BookOpen, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <h1 className="text-3xl font-bold text-[#17221B] relative z-10 flex items-center gap-3">
          <Bookmark className="text-indigo-500 fill-indigo-100" size={32} />
          Saved Items
        </h1>
        <p className="text-[#68736C] mt-2 max-w-2xl relative z-10 text-lg">
          Quickly access the tough questions you saved for revision and your favorite study notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Saved Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2 mb-4">
            <HelpCircle className="text-orange-500" /> Saved Questions
          </h2>
          
          <div className="bg-white p-6 rounded-2xl border border-[#DDE3DD] shadow-sm group hover:border-orange-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-100">
                Aptitude • Time & Distance
              </span>
              <button className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="font-medium text-[#17221B] mb-4">
              "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?"
            </p>
            <button className="text-sm font-bold text-violet-600 hover:text-violet-800 underline underline-offset-4">
              View Solution & Explanation
            </button>
          </div>
        </div>

        {/* Saved Notes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2 mb-4">
            <BookOpen className="text-teal-500" /> Saved eNotes
          </h2>
          
          <div className="bg-white p-6 rounded-2xl border border-[#DDE3DD] shadow-sm group hover:border-teal-200 transition-colors flex items-center justify-between">
            <div>
              <span className="text-xs font-bold px-2 py-1 bg-teal-50 text-teal-700 rounded border border-teal-100 mb-2 inline-block">
                Reasoning
              </span>
              <h3 className="font-bold text-[#17221B] text-lg">Blood Relations Logic Chart</h3>
              <p className="text-sm text-[#68736C] mt-1">Saved 2 days ago</p>
            </div>
            <button className="px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              Open Note
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

