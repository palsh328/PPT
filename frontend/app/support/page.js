'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SupportPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const supportCategories = [
    { id: 'general', name: 'General Inquiry', icon: InformationCircleIcon },
    { id: 'order', name: 'Order Issues', icon: ExclamationTriangleIcon },
    { id: 'technical', name: 'Technical Support', icon: QuestionMarkCircleIcon },
    { id: 'billing', name: 'Billing & Payments', icon: CheckCircleIcon }
  ];

  const faqs = [
    {
      category: 'general',
      questions: [
        {
          q: 'How do I track my order?',
          a: 'You can track your order by logging into your account and visiting the Orders section. You\'ll receive tracking information via email once your order ships.'
        },
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for most items. Products must be in original condition with all packaging and accessories.'
        },
        {
          q: 'Do you offer international shipping?',
          a: 'Currently, we ship within the United States. International shipping options are coming soon.'
        }
      ]
    },
    {
      category: 'order',
      questions: [
        {
          q: 'My order hasn\'t arrived yet',
          a: 'Please check your tracking information first. If your order is delayed beyond the estimated delivery date, contact us with your order number.'
        },
        {
          q: 'I received the wrong item',
          a: 'We apologize for the error. Please contact us immediately with your order number and photos of the incorrect item for a quick resolution.'
        },
        {
          q: 'Can I cancel my order?',
          a: 'Orders can be cancelled within 1 hour of placement if they haven\'t been processed yet. Contact us as soon as possible.'
        }
      ]
    },
    {
      category: 'technical',
      questions: [
        {
          q: 'The website is not loading properly',
          a: 'Try clearing your browser cache and cookies. If the issue persists, try using a different browser or contact our technical support.'
        },
        {
          q: 'I can\'t log into my account',
          a: 'Use the "Forgot Password" link on the login page. If you\'re still having trouble, contact us with your registered email address.'
        },
        {
          q: 'Payment is not going through',
          a: 'Ensure your payment information is correct and your card has sufficient funds. Try a different payment method or contact your bank.'
        }
      ]
    },
    {
      category: 'billing',
      questions: [
        {
          q: 'I was charged twice for the same order',
          a: 'This might be a temporary authorization hold. If you see duplicate charges after 3-5 business days, contact us with your order details.'
        },
        {
          q: 'How do I get a receipt for my purchase?',
          a: 'Receipts are automatically sent to your registered email address. You can also download them from your account\'s order history.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Refunds are processed according to our return policy. Once we receive and inspect your returned item, refunds typically take 5-7 business days.'
        }
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Support ticket submitted:', formData);
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      priority: 'medium',
      message: ''
    });
  };

  const currentFaqs = faqs.find(f => f.category === selectedCategory)?.questions || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            How can we help you?
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get support for your orders, technical issues, and general inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Options
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Live Chat</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Phone Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1-800-PULSE-TECH</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@pulsepixeltech.com</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Business Hours
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                  <span className="text-gray-900 dark:text-white">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                  <span className="text-gray-900 dark:text-white">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                  <span className="text-gray-900 dark:text-white">Closed</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Support Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Submit a Support Ticket
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issues</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Submit Support Ticket
                </button>
              </form>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {supportCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {currentFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {faq.a}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;