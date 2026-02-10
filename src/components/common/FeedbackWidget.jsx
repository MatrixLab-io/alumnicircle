import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/helpers';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const FEEDBACK_TYPES = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'ux_issue', label: 'UX Issue' },
  { value: 'performance', label: 'Performance' },
  { value: 'support', label: 'Support' },
];

export default function FeedbackWidget({ userName, userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('feedback');
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const panelRef = useRef(null);

  useEffect(() => {
    if (userName) setName(userName);
    if (userEmail) setEmail(userEmail);
  }, [userName, userEmail]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');

    try {
      const typeLabel = FEEDBACK_TYPES.find((t) => t.value === type)?.label || type;
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[AlumniCircle] ${typeLabel}: from ${name}`,
          from_name: name,
          email,
          message,
          type: typeLabel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setMessage('');
        setType('feedback');
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 2500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Feedback Panel */}
      <div
        className={cn(
          'absolute bottom-16 right-0 w-[380px] max-h-[calc(100vh-120px)] overflow-y-auto',
          'rounded-2xl shadow-2xl border transition-all duration-300 origin-bottom-right',
          'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700/50',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <ChatIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Send Feedback
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We&apos;d love to hear from you!
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <div className="px-5 pb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Thank you!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your feedback has been sent successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
                      type === t.value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                    )}
                  >
                    {type === t.value && (
                      <svg className="w-3 h-3 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                placeholder="Your name"
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200',
                  'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
                  'border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                placeholder="your@email.com"
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200',
                  'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
                  'border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                  errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setErrors((prev) => ({ ...prev, message: undefined })); }}
                placeholder="Share your thoughts, suggestions, or report issues..."
                rows={4}
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 resize-none',
                  'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
                  'border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                  errors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <p className="text-xs text-red-500 text-center">Something went wrong. Please try again.</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className={cn(
                'w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-300',
                'bg-gradient-to-r from-primary-600 to-purple-500',
                'hover:from-primary-500 hover:to-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
                'flex items-center justify-center gap-2'
              )}
            >
              {status === 'sending' ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
          'bg-primary-600 hover:bg-primary-500 text-white',
          'shadow-lg hover:shadow-[0_0_25px_rgba(147,51,234,0.6)]',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
          isOpen && 'rotate-90 bg-primary-700'
        )}
        aria-label="Send feedback"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <ChatIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  );
}
