'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Mail, Phone, MapPin, Send, MessageCircle, Globe,
  Clock, ArrowRight, CheckCircle, Sparkles, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import CanvasBackground from '@/components/premium/CanvasBackground';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';
import ShinyText from '@/components/premium/ShinyText';
import MagneticButton from '@/components/premium/MagneticButton';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'salariarudar5@gmail.com',
      sub: 'We reply within 24 hours',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+91 (Available on request)',
      sub: 'Mon-Fri, 10am-6pm IST',
      color: 'from-fuchsia-500 to-pink-500',
    },
    {
      icon: Globe,
      title: 'Follow Us',
      detail: '@Rudar-teach',
      sub: 'GitHub & Social Media',
      color: 'from-rose-500 to-red-500',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      detail: 'Mon - Fri',
      sub: '10:00 AM - 6:00 PM IST',
      color: 'from-amber-400 to-orange-500',
    },
  ];

  const services = [
    {
      icon: '🎂',
      title: 'Custom Birthday Websites',
      desc: 'Beautiful, personalized birthday websites with photos, animations, and interactive games tailored for your loved ones.',
    },
    {
      icon: '💻',
      title: 'Custom Website Development',
      desc: 'Full-stack web applications, e-commerce platforms, portfolio websites, and business websites built with modern technologies.',
    },
    {
      icon: '🎮',
      title: 'Game Development',
      desc: 'Browser-based games, mobile games, and interactive game experiences using HTML5, Canvas, and modern game engines.',
    },
    {
      icon: '🎨',
      title: 'UI/UX Design',
      desc: 'Beautiful, intuitive user interfaces with smooth animations, responsive design, and premium user experiences.',
    },
    {
      icon: '⚡',
      title: 'Full Stack Development',
      desc: 'Complete web solutions with React, Next.js, Node.js, MongoDB, and modern cloud infrastructure.',
    },
    {
      icon: '🚀',
      title: 'Performance Optimization',
      desc: 'Speed up your existing website, improve SEO, and optimize for the best user experience across all devices.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-5xl sm:text-7xl mb-6"
          >
            💌
          </motion.div>

          <CinematicReveal direction="up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4 sm:mb-6">
              Get In{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                <ShinyText text="Touch" color="from-pink-600 to-rose-500" />
              </span>
            </h1>
          </CinematicReveal>

          <CinematicReveal direction="up" delay={0.1}>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Have a project in mind? Need a custom birthday website? Want to collaborate?
              I&apos;d love to hear from you! Let&apos;s create something amazing together.
            </p>
          </CinematicReveal>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-pink-100/50 card-hover-glow text-center"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
                  <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{info.title}</h3>
                <p className="text-xs sm:text-sm text-pink-600 font-medium mb-0.5">{info.detail}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">{info.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <Sparkles className="w-3.5 h-3.5" />
              Services
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-gray-900 mb-4">
              What I Can{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Build For You
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              I offer a range of web development services to bring your ideas to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-pink-100/50 card-hover-glow"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{service.icon}</div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Left - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Send a Message
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-gray-900 mb-4">
                  Let&apos;s Build Something{' '}
                  <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Amazing</span>
                </h2>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                  Whether you need a custom birthday website for your partner, a full business website, or just want to say hello - I&apos;m here to help!
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: 'Free consultation & quote' },
                  { icon: CheckCircle, text: 'Custom designs tailored to your needs' },
                  { icon: CheckCircle, text: 'Responsive & mobile-friendly' },
                  { icon: CheckCircle, text: 'Fast delivery & ongoing support' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Developer Info Card */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 sm:p-6 text-white shadow-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl sm:text-2xl">
                    👨‍💻
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Rudar Salaria</h3>
                    <p className="text-white/70 text-xs sm:text-sm">Full Stack Developer & Designer</p>
                  </div>
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  Passionate about creating beautiful web experiences. Specializing in couple apps, birthday platforms, and custom websites.
                </p>
                <a
                  href="https://github.com/Rudar-teach"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs sm:text-sm text-white/90 hover:text-white font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  github.com/Rudar-teach
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard intensity="medium" className="p-6 sm:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: 2 }}
                      className="text-6xl mb-4"
                    >
                      💖
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base">
                      Thank you for reaching out! I&apos;ll get back to you within 24 hours. 💕
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all"
                        required
                      >
                        <option value="">Select a topic...</option>
                        <option value="custom-birthday">Custom Birthday Website</option>
                        <option value="custom-website">Custom Website Development</option>
                        <option value="game-development">Game Development</option>
                        <option value="ui-ux">UI/UX Design</option>
                        <option value="fullstack">Full Stack Development</option>
                        <option value="collaboration">Collaboration / Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell me about your project or just say hello..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all resize-none"
                        required
                      />
                    </div>

                    <MagneticButton>
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        Send Message
                        <Send className="w-4 h-4" />
                      </button>
                    </MagneticButton>
                  </form>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display font-black text-base sm:text-lg">Love Dove</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            © 2025 Love Dove by Rudar Salaria. Made with 💖
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-pink-400 transition-colors">
              Home
            </Link>
            <Link href="/contact" className="text-xs sm:text-sm text-gray-400 hover:text-pink-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
