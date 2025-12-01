/**
 * Living Legacy Page - Create Your Digital Legacy While You're Still Here
 *
 * Allows people in end-of-life situations or anyone who wants to proactively
 * create their digital presence for loved ones to access after they pass away.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Video,
  Mic,
  FileText,
  Lock,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Gift,
  BookOpen,
  Cake,
  GraduationCap,
  Baby,
  MessageCircle,
  Camera,
  Upload
} from 'lucide-react'

export default function LivingLegacyPage() {
  const navigate = useNavigate()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const handleGetStarted = () => {
    navigate('/pricing/living-legacy')
  }

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              TalkToYouAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-medium mb-6">
            <Gift className="w-5 h-5" />
            <span>The Ultimate Gift of Love</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Create Your{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Living Legacy
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Don't wait until it's too late. Create your digital presence now,
            ensuring your voice, wisdom, and love live on forever for those you cherish most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Creating Your Legacy
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-md flex items-center gap-2 border-2 border-orange-200"
            >
              Learn How It Works
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-100">
              <Video className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Your Voice & Face</h3>
              <p className="text-gray-600">Realistic video avatar that looks and sounds like you</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-100">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
              <p className="text-gray-600">AES-256 encryption with notary-controlled access</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-100">
              <Heart className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Forever Preserved</h3>
              <p className="text-gray-600">50+ year hosting guarantee for your family</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Create Your Legacy */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Why Create Your{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Living Legacy
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Creating your legacy while you're still here is an act of profound love and empowerment
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Give Them Your Voice</h3>
              <p className="text-gray-700">
                Don't leave your family wondering what you would have said. Record your wisdom,
                stories, and love intentionally, in your own words.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Be There for Milestones</h3>
              <p className="text-gray-700">
                Create messages for their graduation, wedding day, or when they become parents.
                Be present for moments you might not live to see.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Take Control of Your Story</h3>
              <p className="text-gray-700">
                Tell your life story the way you want it remembered. Share what matters most
                to you, without relying on others to piece it together.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Preserve Your Wisdom</h3>
              <p className="text-gray-700">
                Share the lessons you've learned, the advice you wish you'd received,
                and the values you want to pass down to future generations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Find Peace and Purpose</h3>
              <p className="text-gray-700">
                Creating your legacy can be deeply therapeutic. It gives you meaningful work
                and the comfort of knowing your loved ones will always have you.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Don't Wait Until It's Too Late</h3>
              <p className="text-gray-700">
                Most families wish they had more recordings, more stories, more time.
                You have the power to give them that gift right now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            How It{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Creating your Living Legacy is a guided, thoughtful process designed to be meaningful and manageable
          </p>

          <div className="space-y-6">
            {[
              {
                step: 1,
                icon: Upload,
                title: 'Upload Your Life Data',
                description: 'Import your WhatsApp chats, emails, photos, videos, and social media. Our AI analyzes everything to create your baseline personality.'
              },
              {
                step: 2,
                icon: MessageCircle,
                title: 'Record Intentional Messages',
                description: 'We guide you through recording messages for specific people and situations. Share stories, wisdom, advice, and love in your own words.'
              },
              {
                step: 3,
                icon: Camera,
                title: 'Create Your Video Avatar',
                description: 'Record a short video or upload photos. We create a realistic avatar that looks and sounds exactly like you, speaking in your voice.'
              },
              {
                step: 4,
                icon: Gift,
                title: 'Create Time Capsule Messages',
                description: 'Record messages for future milestones: birthdays, graduations, weddings, when they become parents. Be there for moments that matter.'
              },
              {
                step: 5,
                icon: Users,
                title: 'Set Access Controls',
                description: 'Choose who gets access and when. Provide a secure link to your notary or executor that activates only after you pass away.'
              },
              {
                step: 6,
                icon: Lock,
                title: 'Legal Documentation',
                description: 'We generate the documentation needed for your will and estate planning. Everything is encrypted and secure until the right time.'
              },
              {
                step: 7,
                icon: CheckCircle,
                title: 'Review & Update Anytime',
                description: 'Your legacy isn\'t locked. Add new messages, update stories, or refine your avatar anytime before activation.'
              },
              {
                step: 8,
                icon: Heart,
                title: 'Forever Preserved for Your Family',
                description: 'When the time comes, your loved ones gain access to your complete digital presence. They can talk to you, hear your voice, see your face, and feel your love forever.'
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-8 shadow-md border border-orange-100 flex items-start gap-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-6 h-6 text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-700 text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Include */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            What You Can{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Include
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Your Living Legacy can contain any type of content that represents who you are
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-orange-600" />
                Life Story & History
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Childhood memories and family history</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>How you met your partner and fell in love</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Career journey and professional wisdom</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Important life lessons and pivotal moments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Cultural heritage and family traditions</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Heart className="w-7 h-7 text-orange-600" />
                Messages for Specific People
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Personal messages for your spouse/partner</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Individual messages for each child by name</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Letters to grandchildren and future generations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Messages for close friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Advice for specific family members</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-orange-600" />
                Wisdom & Life Advice
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Parenting advice and lessons learned</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Career and professional guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Relationship wisdom and love advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Your life philosophy and values</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Spiritual and religious beliefs</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border border-orange-200">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Gift className="w-7 h-7 text-orange-600" />
                Time Capsule Messages
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Cake className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Birthday messages for milestone ages</span>
                </li>
                <li className="flex items-start gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Graduation and achievement celebrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Wedding day and relationship milestones</span>
                </li>
                <li className="flex items-start gap-2">
                  <Baby className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>When they become parents themselves</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>"Open when you need comfort" messages</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-rose-100 p-8 rounded-2xl border-2 border-orange-200">
            <h3 className="text-2xl font-bold mb-4 text-center">Beyond Words: Multimedia Legacy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Video className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Video Messages</h4>
                <p className="text-gray-700 text-sm">Record yourself speaking directly to loved ones</p>
              </div>
              <div className="text-center">
                <Mic className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Voice Recordings</h4>
                <p className="text-gray-700 text-sm">Audio messages with your natural voice</p>
              </div>
              <div className="text-center">
                <FileText className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Written Letters</h4>
                <p className="text-gray-700 text-sm">Type messages for those who prefer reading</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Who Is This{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              For
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Living Legacy is for anyone who wants to ensure their voice lives on
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">People in Palliative Care</h3>
              <p className="text-gray-700 mb-4">
                If you're facing a terminal diagnosis, creating your Living Legacy gives you control,
                purpose, and the profound comfort of knowing your loved ones will always have you.
              </p>
              <p className="text-gray-600 italic">
                "I wanted to make sure my daughters knew how much I loved them, even when I couldn't
                be there. Creating my legacy gave me peace."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">Elderly & Aging Adults</h3>
              <p className="text-gray-700 mb-4">
                Preserve your stories for grandchildren and great-grandchildren who may not be old
                enough to remember you. Share your wisdom, heritage, and the history they'll treasure.
              </p>
              <p className="text-gray-600 italic">
                "My grandchildren can now hear stories about their great-grandparents directly from me.
                It's a gift that spans generations."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">Parents of Young Children</h3>
              <p className="text-gray-700 mb-4">
                Nobody expects tragedy, but being prepared means your children will always know your
                love. Create messages for their milestones you hope to see but want to guarantee they'll have.
              </p>
              <p className="text-gray-600 italic">
                "As a new mom, I wanted to make sure that if anything happened to me, my son would
                always know who I was and how much I loved him."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">High-Risk Professions</h3>
              <p className="text-gray-700 mb-4">
                Military personnel, first responders, pilots, and others in dangerous work can ensure
                their families are protected emotionally, no matter what happens.
              </p>
              <p className="text-gray-600 italic">
                "As a firefighter, I know the risks. Creating my legacy means my wife and kids
                will always have me, even if the worst happens."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">Anyone Who Wants to Be Proactive</h3>
              <p className="text-gray-700 mb-4">
                You don't need to be sick or in danger. Creating your legacy is a thoughtful,
                loving act that gives you peace of mind and your family an irreplaceable gift.
              </p>
              <p className="text-gray-600 italic">
                "I'm healthy and young, but after losing my dad suddenly, I didn't want my family
                to go through that regret. I created my legacy for peace of mind."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access & Security */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Secure, Private,{' '}
            <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              Protected
            </span>
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Your legacy is protected with military-grade encryption and ironclad access controls
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <Lock className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">AES-256 Encryption</h3>
              <p className="text-gray-300">
                Military-grade encryption protects all your data, messages, and media.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <Shield className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Notary Control</h3>
              <p className="text-gray-300">
                Access is only granted when your executor verifies with legal documentation.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <Users className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">You Control Access</h3>
              <p className="text-gray-300">
                Choose exactly who can access your legacy and when they receive it.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <CheckCircle className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">50+ Year Guarantee</h3>
              <p className="text-gray-300">
                Your legacy is hosted and protected for generations, no ongoing fees.
              </p>
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-center">How the Notary Link System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  1
                </div>
                <h4 className="text-xl font-bold mb-2">You Create & Secure</h4>
                <p className="text-gray-300">
                  After completing your legacy, you receive a unique encrypted link. Share this
                  with your executor, notary, or include it in your will.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  2
                </div>
                <h4 className="text-xl font-bold mb-2">Verification Required</h4>
                <p className="text-gray-300">
                  When the time comes, your executor uploads death certificate or legal documentation.
                  We verify authenticity to prevent misuse.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  3
                </div>
                <h4 className="text-xl font-bold mb-2">Access Granted</h4>
                <p className="text-gray-300">
                  Your designated loved ones receive access. They can talk to you, hear your voice,
                  see your face, and feel your love forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Legacy{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            One-time investment for a lifetime of connection
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Essential Legacy */}
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border-2 border-orange-200">
              <h3 className="text-2xl font-bold mb-2">Essential Legacy</h3>
              <div className="text-4xl font-bold mb-6">
                €499
                <span className="text-lg text-gray-600 font-normal"> one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Text-based AI personality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Upload existing data (chats, emails)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Record 50+ intentional messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Access for up to 5 family members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Notary link system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>50-year hosting guarantee</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Complete Legacy - Popular */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 p-8 rounded-2xl border-4 border-orange-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2 rounded-full font-bold text-sm">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Complete Legacy</h3>
              <div className="text-4xl font-bold mb-6">
                €999
                <span className="text-lg text-gray-600 font-normal"> one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Everything in Essential, plus:</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Voice cloning</strong> with your natural voice</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Video avatar</strong> that looks like you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Unlimited messages & recordings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Time capsule messages for milestones</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Access for up to 15 family members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Priority support & guidance</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Premium Legacy */}
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 rounded-2xl border-2 border-orange-200">
              <h3 className="text-2xl font-bold mb-2">Premium Legacy</h3>
              <div className="text-4xl font-bold mb-6">
                €1,999
                <span className="text-lg text-gray-600 font-normal"> one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Everything in Complete, plus:</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Professional video recording</strong> session</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Guided interview with legacy specialist</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Ultra-realistic avatar with micro-expressions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Unlimited family members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>100-year hosting guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>White-glove concierge service</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              All plans include lifetime updates before activation • No recurring fees after purchase • Money-back guarantee
            </p>
            <p className="text-sm text-gray-500">
              Need a payment plan? Contact us about monthly installments while creating your legacy.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Everything you need to know about creating your Living Legacy
          </p>

          <div className="space-y-4">
            {[
              {
                question: 'What happens if I recover from my illness or don\'t pass away for many years?',
                answer: 'That\'s wonderful! Your Living Legacy remains fully under your control until activation. You can update it, add new messages, pause it, or even delete it at any time. There are no ongoing fees, and your one-time payment ensures it\'s there whenever needed - whether that\'s next year or in 50 years.'
              },
              {
                question: 'How does the notary/executor activation system work?',
                answer: 'When you complete your legacy, we generate a unique encrypted link. You share this with your executor, notary, or include it in your will. When the time comes, your executor uses this link to upload verification (death certificate or legal documentation). We verify its authenticity, and then grant access to your designated family members. This prevents premature or unauthorized access.'
              },
              {
                question: 'Can I change who has access after I\'ve set it up?',
                answer: 'Yes, absolutely. You maintain full control until activation. You can add or remove family members, change your executor, update the notary link, or modify any settings at any time before your passing.'
              },
              {
                question: 'What if my family doesn\'t want this or finds it uncomfortable?',
                answer: 'It\'s important to discuss your wishes with your family beforehand. Many people are initially uncertain about the technology but find immense comfort once they understand it. You can also create private messages that family members can choose to access when they\'re ready - there\'s no pressure to use it immediately.'
              },
              {
                question: 'How realistic is the AI? Will it really sound like me?',
                answer: 'Our AI learns from your uploaded data (messages, emails, social media) and combines it with your intentional recordings to create a remarkably accurate personality. With voice cloning and video avatar technology, your loved ones will hear your actual voice and see your face. It won\'t be perfect, but most users are amazed by how authentic it feels.'
              },
              {
                question: 'What happens to my data if your company goes out of business?',
                answer: 'We maintain multiple safeguards: (1) Your data is stored redundantly across multiple secure locations. (2) We have contractual agreements with backup hosting providers to maintain your legacy even if we cease operations. (3) You can request an export of all your raw data at any time. Your legacy is protected regardless of our company\'s status.'
              },
              {
                question: 'Is this legally binding? Can it be part of my will?',
                answer: 'Your Living Legacy is a digital memorial service, not a legal document. However, you can and should reference it in your will or estate planning documents. We provide documentation templates that your attorney can integrate. The notary link system ensures proper legal verification before access is granted.'
              },
              {
                question: 'How long does it take to create a Living Legacy?',
                answer: 'Most people spend 5-15 hours over several weeks. You don\'t need to do it all at once - you can work at your own pace, save your progress, and return whenever you\'re ready. We provide guided prompts and suggestions to make the process meaningful but manageable.'
              },
              {
                question: 'Can I see examples or try it before committing?',
                answer: 'We offer a demo experience where you can see how the AI works and explore sample legacy profiles (with permission from families who\'ve chosen to share). You can also start creating your legacy and preview everything before finalizing your purchase.'
              },
              {
                question: 'What if I\'m not tech-savvy?',
                answer: 'Our interface is designed to be simple and intuitive. We provide step-by-step guidance, video tutorials, and live support. Many of our users are in their 70s and 80s with limited tech experience. If you can use email, you can create your Living Legacy. We also offer white-glove concierge service in our Premium plan.'
              },
              {
                question: 'Is my information secure and private?',
                answer: 'Yes. We use AES-256 military-grade encryption for all data. Your information is never shared, sold, or used for any purpose other than creating your legacy. Only people you explicitly grant access to will ever see or interact with your legacy, and only after proper verification.'
              },
              {
                question: 'Can I include photos and videos I already have?',
                answer: 'Absolutely! You can upload photos, videos, audio recordings, and documents. Our AI will analyze everything to create a more complete personality profile, and your loved ones will have access to all these precious memories.'
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-orange-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <HelpCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold text-lg text-gray-900">{faq.question}</span>
                  </div>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-700 pl-10">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Love Deserves to Live Forever
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Don't leave your legacy to chance. Take control of your story,
            preserve your wisdom, and give your loved ones the gift of your eternal presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-white text-orange-600 rounded-xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl flex items-center gap-3"
            >
              Create Your Living Legacy
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/pricing/living-legacy')}
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-xl hover:bg-white/10 transition-all flex items-center gap-3"
            >
              View Pricing
            </button>
          </div>
          <p className="text-sm opacity-75">
            30-day money-back guarantee • No ongoing fees • 50+ year hosting guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold">TalkToYouAI Living Legacy</span>
          </div>
          <p className="text-gray-400 mb-4">
            Preserving love, wisdom, and memories for generations to come
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-orange-400 transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/pricing')} className="hover:text-orange-400 transition-colors">
              Pricing
            </button>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Contact Us</span>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            © 2024 TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
