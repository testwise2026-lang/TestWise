'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface FeedbackModalProps {
  role: 'student' | 'teacher';
}

export default function FeedbackModal({ role }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check local storage to see if feedback was submitted in the last 30 days
    const lastFeedbackDate = localStorage.getItem(`lastFeedbackDate_${role}`);
    
    if (lastFeedbackDate) {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const timeSinceLastFeedback = Date.now() - parseInt(lastFeedbackDate, 10);
      
      if (timeSinceLastFeedback < thirtyDaysInMs) {
        return; // Don't show if within 30 days
      }
    }

    // Small delay before showing to let the dashboard load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || feedback.trim() === '') return;
    
    setIsSubmitting(true);
    
    try {
      // Get current user id if available (optional)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save feedback to Supabase
      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            role: role, 
            rating: rating, 
            comment: feedback,
            user_id: user?.id || null 
          }
        ]);
        
      if (error) throw error;
      
      // Save to local storage
      localStorage.setItem(`lastFeedbackDate_${role}`, Date.now().toString());
      setSubmitted(true);
      
      // Close after showing success message
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    // Set for tomorrow if they click remind later
    const tomorrow = Date.now() - (29 * 24 * 60 * 60 * 1000); // effectively sets it to 29 days ago so it pops up tomorrow
    localStorage.setItem(`lastFeedbackDate_${role}`, tomorrow.toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className={`p-6 text-white ${role === 'student' ? 'bg-violet-600' : 'bg-teal-600'}`}>
          <h3 className="text-xl font-bold mb-1">We value your thoughts!</h3>
          <p className="text-sm opacity-90">
            {role === 'student' 
              ? 'How was your learning & testing experience this month?' 
              : 'How was your teaching & monitoring experience this month?'}
          </p>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Thank You!</h4>
            <p className="text-slate-500 mt-2">Your feedback helps us improve TestWise.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                Rate your experience
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg 
                      className={`w-10 h-10 ${
                        (hoveredRating || rating) >= star 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-slate-200 fill-slate-200'
                      } transition-colors duration-200`} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-semibold text-slate-700 mb-2">
                What could we do better? <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="feedback"
                required
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
                placeholder="Please share your thoughts..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRemindLater}
                className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Remind Later
              </button>
              <button
                type="submit"
                disabled={rating === 0 || feedback.trim() === '' || isSubmitting}
                className={`flex-1 py-2.5 px-4 font-bold rounded-xl transition-colors text-white text-sm flex justify-center items-center ${
                  rating === 0 || feedback.trim() === '' 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : role === 'student' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

