'use client'

export default function TeacherMonitoringPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Live Test Monitoring</h1>
        <p className="text-slate-600 mt-1">Proctor active tests and receive anti-cheat alerts in real-time.</p>
      </div>
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Tests</h3>
        <p className="text-slate-500 max-w-sm">There are no live tests running right now. Schedule a test to monitor it here.</p>
      </div>
    </div>
  );
}

