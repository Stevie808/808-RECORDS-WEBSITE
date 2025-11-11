import React, { useState, useEffect } from 'react';
import { Send, Upload, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    artistName: '',
    message: '',
    demoLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [content, setContent] = useState({
    email: 'submissions@808records.com',
    location: 'Long Branch, NJ'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/site/contact`);
        if (response.data.content) {
          setContent({ ...content, ...response.data.content });
        }
      } catch (error) {
        console.error('Error fetching contact content:', error);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${BACKEND_URL}/api/submissions/`, {
        name: formData.name,
        email: formData.email,
        artistName: formData.artistName || null,
        message: formData.message,
        demoLink: formData.demoLink || null
      });

      setShowSuccess(true);
      
      toast({
        title: '✅ Submission Sent Successfully!',
        description: "We've received your demo. We'll review it and get back to you within 5-7 business days.",
      });

      setFormData({
        name: '',
        email: '',
        artistName: '',
        message: '',
        demoLink: ''
      });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-black relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Two-column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left column - Header & Info */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  <span className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">Apply Now</span>
                </div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                  Submit<br />Your Demo
                </h2>
                <p className="text-base md:text-lg text-white/40 font-light mb-12 leading-relaxed">
                  Think you're a good fit for 808 Records? Send us your best work and we will take a listen.
                </p>

                {/* Info cards */}
                <div className="space-y-6">
                  <div className="info-card-modern group">
                    <CheckCircle className="w-6 h-6 text-white/60 mb-4 group-hover:text-white transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-2">What We Look For</h3>
                    <p className="text-sm text-white/40 font-light leading-relaxed">
                      Original sound, professional quality, and commitment to artistic growth.
                    </p>
                  </div>
                  <div className="info-card-modern group">
                    <Clock className="w-6 h-6 text-white/60 mb-4 group-hover:text-white transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
                    <p className="text-sm text-white/40 font-light leading-relaxed">
                      We personally review all submissions within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Form */}
            <div className="lg:col-span-3">
              {showSuccess && (
                <div className="mb-6 p-6 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-green-300 mb-1">Submission Sent!</h3>
                      <p className="text-sm text-green-200/80">
                        Thank you for your submission. We'll review your demo and get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-field-modern">
                    <label className="form-label-modern">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-modern"
                      placeholder="Your full name"
                    />
                    <div className={`form-border-modern ${
                      focusedField === 'name' ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                  <div className="form-field-modern">
                    <label className="form-label-modern">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-modern"
                      placeholder="your@email.com"
                    />
                    <div className={`form-border-modern ${
                      focusedField === 'email' ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                </div>

                {/* Artist Name & Demo URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-field-modern">
                    <label className="form-label-modern">Artist Name (Optional)</label>
                    <input
                      type="text"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('artistName')}
                      onBlur={() => setFocusedField(null)}
                      className="input-modern"
                      placeholder="Your artist/stage name"
                    />
                    <div className={`form-border-modern ${
                      focusedField === 'artistName' ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                  <div className="form-field-modern">
                    <label className="form-label-modern">Demo Link (Optional)</label>
                    <input
                      type="url"
                      name="demoLink"
                      value={formData.demoLink}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('demoLink')}
                      onBlur={() => setFocusedField(null)}
                      className="input-modern"
                      placeholder="SoundCloud, Spotify, YouTube, etc."
                    />
                    <div className={`form-border-modern ${
                      focusedField === 'demoLink' ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                </div>

                {/* Message */}
                <div className="form-field-modern">
                  <label className="form-label-modern">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={6}
                    className="input-modern resize-none"
                    placeholder="Tell us about your music and why you want to join 808Records..."
                  />
                  <div className={`form-border-modern ${
                    focusedField === 'message' ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit-modern group w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      <span>Submit Demo</span>
                    </>
                  )}
                </button>
                
                {/* Contact Information */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm text-white/40 uppercase tracking-wider mb-2">Email</h4>
                      <a href={`mailto:${content.email}`} className="text-white hover:text-white/80 transition-colors">
                        {content.email}
                      </a>
                    </div>
                    <div>
                      <h4 className="text-sm text-white/40 uppercase tracking-wider mb-2">Location</h4>
                      <p className="text-white">{content.location}</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
