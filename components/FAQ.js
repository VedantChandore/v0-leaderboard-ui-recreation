"use client"

import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ExternalLink,
  Clock,
  Shield,
  Mail,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Globe,
  Award,
  Users
} from "lucide-react"

const faqData = [
  {
    id: 1,
    category: "Getting Started",
    icon: <Globe className="h-5 w-5" />,
    question: "How do I find my Google Cloud Skills Boost profile URL?",
    answer: (
      <div className="space-y-3">
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Go to <a href="https://skills.google" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">skills.google <ExternalLink className="h-3 w-3" /></a></li>
          <li>Sign in with the same account you used for enrollment</li>
          <li>Click on your profile icon → "Profile"</li>
          <li>Make sure your profile is public, then copy the URL from your browser</li>
        </ol>
      </div>
    )
  },
  {
    id: 2,
    category: "Credits & Access",
    icon: <Zap className="h-5 w-5" />,
    question: "How do I claim my 400 free Google Cloud Skills Boost credits?",
    answer: (
      <div className="space-y-3">
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Open an Incognito Window (Ctrl/Cmd + Shift + N)</li>
          <li>Go to the provided link</li>
          <li>Enter the unique access code: <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">6s-EDUCR-74::sZn8so5nU614OkREONJbKQ</code> in the popup</li>
          <li>Sign in to your Skills Boost account</li>
          <li>Once you see 9 initial credits, complete the lab "A Tour of Google Cloud Hands-on Labs"</li>
          <li>After scoring 100 and ending the lab, 400 credits will be automatically added</li>
        </ol>
      </div>
    )
  },
  {
    id: 3,
    category: "Troubleshooting",
    icon: <AlertCircle className="h-5 w-5" />,
    question: "I didn't get my credits after completing the first lab. What should I do?",
    answer: (
      <div className="space-y-3">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Wait 20–30 minutes and refresh the page</li>
          <li>Check again at <a href="https://skills.google/my_account/credits" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">skills.google/my_account/credits <ExternalLink className="h-3 w-3" /></a></li>
          <li>If you still don't see them, contact <a href="mailto:gdgocsupport@google.com" className="text-blue-600 hover:text-blue-800 underline">gdgocsupport@google.com</a> (and please be patient — it may take 48–72 hours for a reply)</li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    category: "Credits & Access",
    icon: <Info className="h-5 w-5" />,
    question: "My credits show 0 or 9 instead of 400. Is that normal?",
    answer: (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Yes — this is normal!</p>
              <p className="text-green-700 text-sm mt-1">Initially you get 9 credits to start the first lab. Once you finish "A Tour of Google Cloud Hands-on Labs" and end the lab, your full 400 credits will appear.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    category: "Account Security",
    icon: <Shield className="h-5 w-5" />,
    question: "Can I share my access code with someone else?",
    answer: (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">No — Do not share your access code!</p>
              <p className="text-red-700 text-sm mt-1">Each access code is unique and one-time use only. If used on another account, your completions won't be tracked and you'll lose campaign eligibility.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    category: "Timeline",
    icon: <Clock className="h-5 w-5" />,
    question: "What's the campaign deadline?",
    answer: (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">🕒 The last date to complete all labs and badges is 31st October, 5 PM IST.</p>
              <p className="text-amber-700 text-sm mt-1">The access pass is valid for 1 month only, and the deadline cannot be extended.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 7,
    category: "Progress Limits",
    icon: <Award className="h-5 w-5" />,
    question: "How many labs can I complete in a day?",
    answer: (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">You can complete up to 15 labs per day.</p>
              <p className="text-blue-700 text-sm mt-1">This limit is set by the platform — it helps ensure consistent daily progress and avoids last-minute rushes.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 8,
    category: "Gen AI Arcade",
    icon: <Users className="h-5 w-5" />,
    question: "What if I don't see enough slots for the Gen AI Arcade Game?",
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">Don't worry! The Gen AI Arcade Game opens new slots daily.</p>
        <p className="text-gray-700">If it's full, simply check back the next day.</p>
      </div>
    )
  },
  {
    id: 9,
    category: "Gen AI Arcade",
    icon: <Users className="h-5 w-5" />,
    question: "How do I access the Gen AI Arcade Game?",
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">Go to <a href="https://skills.google" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">skills.google <ExternalLink className="h-3 w-3" /></a> and enter this access code:</p>
        <div className="bg-gray-100 p-3 rounded-lg">
          <code className="text-gray-800 font-mono">1q-genai-10091</code>
        </div>
        <p className="text-sm text-amber-700 font-medium">Note: The game will be active from 4th October 2025 onward.</p>
      </div>
    )
  },
  {
    id: 10,
    category: "Program Requirements",
    icon: <Award className="h-5 w-5" />,
    question: "Where can I see the syllabus for the program?",
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">You can view the complete campaign syllabus here:</p>
        <a href="https://goo.gle/gcsj25" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline font-medium">
          <ExternalLink className="h-4 w-4" />
          goo.gle/gcsj25
        </a>
        <p className="text-gray-700">It includes all mandatory labs and skill badges.</p>
      </div>
    )
  },
  {
    id: 11,
    category: "Program Requirements",
    icon: <CheckCircle className="h-5 w-5" />,
    question: "Are all skill badges mandatory?",
    answer: (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Yes. Only the listed badges in the syllabus document will count towards your completion.</p>
              <p className="text-blue-700 text-sm mt-1">Labs or badges outside that list won't count and may consume your credits unnecessarily.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 12,
    category: "Program Requirements",
    icon: <AlertCircle className="h-5 w-5" />,
    question: "I completed some extra labs — will those count?",
    answer: (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">No. Only the official campaign labs are considered.</p>
              <p className="text-red-700 text-sm mt-1">Completing additional labs may use up your free credits, and no extra credits can be provided.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 13,
    category: "Support",
    icon: <Mail className="h-5 w-5" />,
    question: "What should I do if I face issues with enrollment or credits?",
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">If you:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>Didn't receive your enrollment email</li>
          <li>Can't redeem credits</li>
          <li>Can't access or complete labs</li>
        </ul>
        <p className="text-gray-700">Please write to <a href="mailto:gdgocsupport@google.com" className="text-blue-600 hover:text-blue-800 underline">gdgocsupport@google.com</a> after checking your spam folder.</p>
        <p className="text-sm text-amber-700 font-medium">The support team may take 48–72 hours to respond.</p>
      </div>
    )
  },
  {
    id: 14,
    category: "Account Management",
    icon: <CheckCircle className="h-5 w-5" />,
    question: "How can I ensure my completions are tracked?",
    answer: (
      <div className="space-y-3">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Use the same Google account for all labs and completions</li>
          <li>Make sure your profile is public</li>
          <li>Redeem credits on the same enrolled account</li>
        </ul>
      </div>
    )
  },
  {
    id: 15,
    category: "Local Support",
    icon: <Users className="h-5 w-5" />,
    question: "Whom do I contact for questions about rewards or progress?",
    answer: (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">For all queries related to rewards, prizes, or leaderboard progress, contact your GDGoC Organisers — not the Google campaign team directly.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
]

const categories = [
  "All",
  "Getting Started", 
  "Credits & Access", 
  "Troubleshooting", 
  "Timeline", 
  "Program Requirements", 
  "Gen AI Arcade", 
  "Support", 
  "Account Management", 
  "Account Security",
  "Progress Limits",
  "Local Support"
]

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.props?.children?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category) => {
    const colors = {
      "Getting Started": "bg-blue-100 text-blue-800 border-blue-200",
      "Credits & Access": "bg-green-100 text-green-800 border-green-200",
      "Troubleshooting": "bg-red-100 text-red-800 border-red-200",
      "Timeline": "bg-amber-100 text-amber-800 border-amber-200",
      "Program Requirements": "bg-purple-100 text-purple-800 border-purple-200",
      "Gen AI Arcade": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Support": "bg-orange-100 text-orange-800 border-orange-200",
      "Account Management": "bg-teal-100 text-teal-800 border-teal-200",
      "Account Security": "bg-red-100 text-red-800 border-red-200",
      "Progress Limits": "bg-blue-100 text-blue-800 border-blue-200",
      "Local Support": "bg-green-100 text-green-800 border-green-200"
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              StudyJams FAQs
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find answers to common questions about Google Cloud StudyJams program
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search FAQs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 h-12 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" 
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-lg border ${getCategoryColor(faq.category)}`}>
                          {faq.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(faq.category)}`}>
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {expandedItems.has(faq.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedItems.has(faq.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="pt-4">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No FAQs Found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            If you couldn't find the answer you're looking for, don't hesitate to reach out to our support team or GDGoC organisers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3"
              onClick={() => window.open('mailto:gdgocsupport@google.com', '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Google Support
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3"
            >
              <Users className="h-4 w-4 mr-2" />
              Contact GDGoC Organisers
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
