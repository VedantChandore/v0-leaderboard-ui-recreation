"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Globe, 
  Eye, 
  LogIn, 
  Target,
  CheckCircle,
  ArrowRight,
  Play
} from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Step 1: Access Your Google Cloud Skills Boost Profile",
    description: "Navigate to your Google Cloud Skills Boost account and access your profile settings.",
    image: "/images/step1-profile.jpg",
    caption: "Click on your profile icon in the top right corner to access your account settings and profile information. You can see your credits, dashboard, progress, and other options in the dropdown menu.",
    instructions: [
      "Go to cloudskillsboost.google",
      "Sign in with your Google account",
      "Click on your profile icon in the top right",
      "Select 'Profile' from the dropdown menu"
    ],
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Step 2: Make Your Profile Public",
    description: "Ensure your profile visibility is set to public so we can track your progress.",
    image: "/images/step2-public.jpg",
    caption: "Enable 'Make profile public' checkbox and copy your public profile URL from the green notification box. This URL is essential for tracking your progress on our leaderboard.",
    instructions: [
      "Scroll down to 'Public visibility' section",
      "Check the 'Make profile public' checkbox",
      "Copy the URL from the green notification box",
      "This URL will be used for tracking your progress"
    ],
    icon: <Eye className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Step 3: Sign In to StudyJams Leaderboard",
    description: "Access our leaderboard platform and sign in with your Google account.",
    image: "/images/step3-login.jpg",
    caption: "Visit https://gdgstudyjams.vercel.app/ and sign in using your Google account to access the leaderboard dashboard. Use the same Google account that you use for Google Cloud Skills Boost.",
    instructions: [
      "Visit https://gdgstudyjams.vercel.app/",
      "Click 'Continue with Google' button",
      "Sign in with the same Google account used for Skills Boost",
      "You'll be redirected to the leaderboard dashboard"
    ],
    icon: <LogIn className="h-5 w-5" />,
    highlight: "https://gdgstudyjams.vercel.app/"
  },
  {
    id: 4,
    title: "Step 4: Track Your Progress",
    description: "Submit your profile URL to start tracking your daily progress and compete with others.",
    image: "/images/step4-track.jpg",
    caption: "Click 'Track Progress' button and paste your public profile URL to join the leaderboard and track your daily achievements. Submit your profile daily to track new badges, points, and labs completed.",
    instructions: [
      "Click the 'Track Progress' button",
      "Paste your public profile URL",
      "Submit to join the leaderboard",
      "Update daily to track new badges and labs"
    ],
    icon: <Target className="h-5 w-5" />
  }
]

export function HowToGuide() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex)
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              How to Join the Leaderboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Follow these simple steps to join the GDG VIT Pune StudyJams leaderboard and start tracking your Google Cloud learning progress
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === currentStep ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {index + 1}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  Step {index + 1}
                </span>
              </button>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Instructions */}
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600`}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-gray-600">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              {/* Instructions List */}
              <div className="space-y-4 mb-8">
                {currentStepData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>

              {/* Special Highlight for Step 3 */}
              {currentStepData.highlight && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Website URL</span>
                  </div>
                  <a 
                    href={currentStepData.highlight}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-sm underline break-all"
                  >
                    {currentStepData.highlight}
                  </a>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {steps.length}
                </span>

                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12 flex flex-col justify-center">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={currentStepData.image} 
                    alt={currentStepData.title}
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50" style={{display: 'none'}}>
                    <div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        {React.cloneElement(currentStepData.icon, { className: "h-8 w-8 text-white" })}
                      </div>
                      <h3 className="text-gray-800 font-semibold mb-2">
                        {currentStepData.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Screenshot will appear here once added
                      </p>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-mono">
                          /public{currentStepData.image}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-800">Caption:</span> {currentStepData.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join hundreds of students already competing in the GDG VIT Pune StudyJams leaderboard. 
            Track your progress, earn badges, and climb the ranks!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3"
              onClick={() => window.open('https://gdgstudyjams.vercel.app/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Leaderboard
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3"
              onClick={() => window.open('https://cloudskillsboost.google', '_blank')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Go to Skills Boost
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
