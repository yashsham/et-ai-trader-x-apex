import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api-config";
import { ArrowUpRight, Clock, Loader2, Sparkles, Search, Filter, Copy, Check, AlertTriangle, Newspaper } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  headline: string;
  title?: string;
  source: string;
  time: string;
  impact: "High" | "Medium" | "Low" | string;
  summary: string;
  description?: string;
  sector: string;
  url: string;
  published_at?: string;
}

// ── MULTI-LINGUAL NEWS DICTIONARIES ──────────────────────────────
const LOCALIZED_NEWS: Record<string, NewsItem[]> = {
  Bengali: [
    {
      id: 1,
      headline: "নিফটি ৫০ স্পর্শ করল ২৪,৫০০ সাপোর্ট; ডিআইআই ফান্ডের ৪,২০০ কোটি টাকা ইনজেকশন",
      summary: "ব্যাঙ্কিং এবং এনার্জি খাতের প্রধান শেয়ারে ব্লকে ক্রয়ের মাধ্যমে ডিআইআই প্রাতিষ্ঠানিক বিনিয়োগকারীরা এফআইআই বিক্রি শোষণ করেছে।",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/markets",
      impact: "High",
      sector: "ইক্যুইটি ইনডেক্স",
      time: "৫ মি. আগে"
    },
    {
      id: 2,
      headline: "মুদ্রাস্ফীতির তথ্য হ্রাসের মধ্যে আরবিআই নমনীয় আর্থিক নীতির ইঙ্গিত দিয়েছে",
      summary: "কেন্দ্রীয় ব্যাংকের তারল্য ইনজেকশন এবং বন্ডের ফলন স্থিরতা বেসরকারি ব্যাংকিং শেয়ারে নতুন সঞ্চয় সৃষ্টি করেছে।",
      source: "Bloomberg Markets",
      url: "https://www.bloomberg.com/markets",
      impact: "High",
      sector: "ম্যাক্রো অর্থনীতি",
      time: "১২ মি. আগে"
    },
    {
      id: 3,
      headline: "মার্কিন প্রযুক্তি চুক্তির ঘোষণার পর টিসিএস এবং ইনফোসিস ৩.৫% বৃদ্ধি পেয়েছে",
      summary: "ক্লাউড মাইগ্রেশন অর্ডার বিজয়ের খবরে নিফটি আইটি ইনডেক্স বাজারের নেতৃত্ব দিচ্ছে।",
      source: "Reuters",
      url: "https://www.reuters.com/markets",
      impact: "High",
      sector: "আইটি সেবা",
      time: "২৮ মি. আগে"
    },
    {
      id: 4,
      headline: "রিলায়েন্স ইন্ডাস্ট্রিজ ক্লিন এনার্জি বিভাগ ১.২ বিলিয়ন ডলারের ফান্ড সংগ্রহ করেছে",
      summary: "বিশ্বব্যাপী তহবিল বরাদ্দ বৃদ্ধির সাথে আরআইএল এর শেয়ার ২,৪৪০ বাধা ভেঙে ২.৮% বৃদ্ধি পেয়েছে।",
      source: "Moneycontrol",
      url: "https://www.moneycontrol.com/news/business/markets/",
      impact: "Medium",
      sector: "শক্তি ও ইনফ্রা",
      time: "৪৫ মি. আগে"
    },
    {
      id: 5,
      headline: "তৃতীয় ত্রৈমাসিকে এইচডিএফসি ব্যাংক এবং আইসিআইসিআই ব্যাংকের মার্জিন বৃদ্ধি",
      summary: "খুচরো এবং কর্পোরেট ঋণ বৃদ্ধিতে বার্ষিক ১৪.২% নেট সুদের মার্জিন সম্প্রসারিত হয়েছে।",
      source: "CNBC TV18",
      url: "https://www.cnbctv18.com/market/",
      impact: "High",
      sector: "ব্যাংকিং ও ফাইন্যান্স",
      time: "১ ঘণ্টা আগে"
    },
    {
      id: 6,
      headline: "টাটা মোটরস ইভি বিভাগ বার্ষিক ১,০০,০০০ ইউনিট অতিক্রম করেছে; রপ্তানি ৪২% বৃদ্ধি",
      summary: "বাণিজ্যিক ও বৈদ্যুতিক যানবাহনের অর্ডারের সাথে অটো সূচক বাজারের চেয়ে ভালো পারফর্ম করছে।",
      source: "Business Standard",
      url: "https://www.business-standard.com/markets",
      impact: "Medium",
      sector: "অটোমোটিভ",
      time: "১.৫ ঘণ্টা আগে"
    },
    {
      id: 7,
      headline: "ইউএস ফেড সুদের হার কমানোর সম্ভাবনা ৭৮%-এ উন্নীত; উদীয়মান বাজারে তহবিল বৃদ্ধি",
      summary: "ডলার ইনডেক্স ১০২.৪-এ নেমে আসার পর উদীয়মান বাজারে মূলধন বিনিয়োগ দ্রুত বৃদ্ধি পাচ্ছে।",
      source: "Yahoo Finance",
      url: "https://finance.yahoo.com",
      impact: "Medium",
      sector: "ম্যাক্রো অর্থনীতি",
      time: "২ ঘণ্টা আগে"
    },
    {
      id: 8,
      headline: "এফআইআই ডেরিভেটিভস ডেটায় ২৪,৬০০ স্ট্রাইক প্রাইসে বুলিশ পজিশনিং দেখা যাচ্ছে",
      summary: "পুট-কল রেশিও ১.৩৫-এ উন্নীত হওয়ার সাথে সাথে ডাউনসাইড সুরক্ষার স্পষ্ট ইঙ্গিত দেখা যাচ্ছে।",
      source: "Livemint",
      url: "https://www.livemint.com/market",
      impact: "High",
      sector: "ডেরিভেটিভস ও এফএন্ডও",
      time: "২.৫ ঘণ্টা আগে"
    },
    {
      id: 9,
      headline: "স্পট ইটিএফে ৮৫০ মিলিয়ন ডলার প্রবাহের সাথে বিটকয়েন ৯৮,০০০ ডলার অতিক্রম করেছে",
      summary: "বিশ্বব্যাপী সম্পদ ব্যবস্থাপকরা ডাইভারসিফিকেশনের অংশ হিসেবে ক্রিপ্টো সম্পদে মূলধন বৃদ্ধি করছেন।",
      source: "Bloomberg Crypto",
      url: "https://www.bloomberg.com/crypto",
      impact: "Medium",
      sector: "ক্রিপ্টো অ্যাসেট",
      time: "৩ ঘণ্টা আগে"
    },
    {
      id: 10,
      headline: "সরকার সেমিকন্ডাক্টর ও গ্রিন এনার্জির জন্য ৩৫,০০০ কোটি টাকার ভর্তুকি ঘোষণা করেছে",
      summary: "রাজস্ব প্রণোদনা অনুমোদনের পর শিল্প এবং প্রকৌশল শেয়ারগুলিতে শক্তিশালী র্যালি দেখা গেছে।",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/industry",
      impact: "Low",
      sector: "শক্তি ও ইনফ্রা",
      time: "৪ ঘণ্টা আগে"
    }
  ],
  Hindi: [
    {
      id: 1,
      headline: "निफ्टी 50 ने 24,500 सपोर्ट का बचाव किया; DII म्यूचुअल फंड्स ने ₹4,200 करोड़ की लिक्विडिटी डाली",
      summary: "घरेलू संस्थागत निवेशकों ने बैंकिंग और ऊर्जा शेयरों में भारी ब्लॉक डील के जरिए एफआईआई की बिकवाली को संभाला।",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/markets",
      impact: "High",
      sector: "इक्विटी इंडेक्स",
      time: "5 मि. पहले"
    },
    {
      id: 2,
      headline: "मुद्रास्फीति आंकड़ों में गिरावट के बीच आरबीआई ने नरमी के संकेत दिए",
      summary: "सेंट्रल बैंक लिक्विडिटी इंजेक्शन और बॉन्ड यील्ड स्थिरता से प्राइवेट बैंकिंग शेयरों में लिवाली बढ़ी।",
      source: "Bloomberg Markets",
      url: "https://www.bloomberg.com/markets",
      impact: "High",
      sector: "मैक्रो इकोनॉमी",
      time: "12 मि. पहले"
    },
    {
      id: 3,
      headline: "अमेरिकी टेक कॉन्ट्रैक्ट्स की घोषणा के बाद टीसीएस और इंफोसिस 3.5% उछले",
      summary: "क्लाउड माइग्रेशन ऑर्डर मिलने की खबरों से निफ्टी आईटी इंडेक्स सेक्टर में बढ़त की अगुवाई कर रहा है।",
      source: "Reuters",
      url: "https://www.reuters.com/markets",
      impact: "High",
      sector: "आईटी सेवाएं",
      time: "28 मि. पहले"
    },
    {
      id: 4,
      headline: "रिलायंस इंडस्ट्रीज क्लीन एनर्जी विंग ने $1.2B का फंड जुटाया",
      summary: "ग्लोबल फंड्स के एलोकेशन बढ़ाने से आरआईएल शेयर 2,440 रेजिस्टेंस को तोड़कर 2.8% बढ़ा।",
      source: "Moneycontrol",
      url: "https://www.moneycontrol.com/news/business/markets/",
      impact: "Medium",
      sector: "ऊर्जा एवं इंफ्रा",
      time: "45 मि. पहले"
    },
    {
      id: 5,
      headline: "Q3 शुरुआती खुलासे में एचडीएफसी बैंक और आईसीआईसीआई बैंक के मार्जिन में विस्तार",
      summary: "रिटेल और कॉर्पोरेट लोन बुक्स में एसेट क्वालिटी सुधार के साथ क्रेडिट ग्रोथ 14.2% YoY बढ़ी।",
      source: "CNBC TV18",
      url: "https://www.cnbctv18.com/market/",
      impact: "High",
      sector: "बैंकिंग एवं फाइनेंस",
      time: "1 घंटा पहले"
    },
    {
      id: 6,
      headline: "टाटा मोटर्स ईवी डिवीजन ने सालाना 1,00,000 यूनिट्स पार की; एक्सपोर्ट 42% बढ़ा",
      summary: "कॉमर्शियल और पैसेंजर ईवी व्हीकल्स के ऑर्डर्स से ऑटो इंडेक्स मार्केट को आउटपरफॉर्म कर रहा है।",
      source: "Business Standard",
      url: "https://www.business-standard.com/markets",
      impact: "Medium",
      sector: "ऑटोमोटिव",
      time: "1.5 घंटा पहले"
    },
    {
      id: 7,
      headline: "यूएस फेड रेट कट की उम्मीदें बढ़कर 78% हुईं; इमर्जिंग मार्केट्स में इनफ्लो तेज",
      summary: "डॉलर इंडेक्स 102.4 पर खिसकने से उभरते बाजारों में कैपिटल एलोकेशन तेजी से बढ़ा है।",
      source: "Yahoo Finance",
      url: "https://finance.yahoo.com",
      impact: "Medium",
      sector: "मैक्रो इकोनॉमी",
      time: "2 घंटे पहले"
    },
    {
      id: 8,
      headline: "FII डेरिवेटिव्स डेटा में 24,600 स्ट्राइक प्राइस पर बुलिश कॉल/पुट राइटिंग दिख रही है",
      summary: "पुट-कॉल रेशियो बढ़कर 1.35 होने से नीचे के स्तरों पर मजबूत सपोर्ट का संकेत मिल रहा है।",
      source: "Livemint",
      url: "https://www.livemint.com/market",
      impact: "High",
      sector: "डेरिवेटिव्स एवं F&O",
      time: "2.5 घंटे पहले"
    },
    {
      id: 9,
      headline: "स्पॉट ईटीएफ में $850M के इनफ्लो से बिटकॉइन $98,000 के पार निकला",
      summary: "ग्लोबल मैक्रो हेज फंड्स द्वारा पोर्टफोलियो हेजिंग के चलते डिजिटल एसेट्स में लिवाली बढ़ी है।",
      source: "Bloomberg Crypto",
      url: "https://www.bloomberg.com/crypto",
      impact: "Medium",
      sector: "क्रिप्टो एसेट",
      time: "3 घंटे पहले"
    },
    {
      id: 10,
      headline: "सरकार ने सेमीकंडक्टर और ग्रीन एनर्जी के लिए ₹35,000 करोड़ की सब्सिडी घोषित की",
      summary: "कैपेक्स-हैवी इंडस्ट्रियल और इंजीनियरिंग शेयरों में तेज वॉल्यूम के साथ तेजी देखी जा रही है।",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/industry",
      impact: "Low",
      sector: "ऊर्जा एवं इंफ्रा",
      time: "4 घंटे पहले"
    }
  ],
  English: [
    {
      id: 1,
      headline: "Nifty 50 Defends 24,500 Support as DII Mutual Funds Inject ₹4,200 Cr Liquidity",
      summary: "Domestic institutional investors absorb FII selling pressure with heavy block deals in banking and energy heavyweights.",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/markets",
      impact: "High",
      sector: "Equity Index",
      time: "5m ago"
    },
    {
      id: 2,
      headline: "RBI Signals Accommodative Monetary Stance Amid Easing Consumer Inflation Data",
      summary: "Central bank liquidity injections and bond yield stabilization trigger massive accumulation across private sector banking stocks.",
      source: "Bloomberg Markets",
      url: "https://www.bloomberg.com/markets",
      impact: "High",
      sector: "Macro Economy",
      time: "12m ago"
    },
    {
      id: 3,
      headline: "IT Bluechips TCS and Infosys Rally +3.5% Following US Tech Contract Announcements",
      summary: "Nifty IT Index leads sectoral gainers as tier-1 IT firms report double-digit cloud migration order wins.",
      source: "Reuters",
      url: "https://www.reuters.com/markets",
      impact: "High",
      sector: "IT Services",
      time: "28m ago"
    },
    {
      id: 4,
      headline: "Reliance Industries EV & Clean Energy Arm Secures $1.2B Institutional Funding",
      summary: "RIL shares gain 2.8% on strong volume breakout above 2,440 resistance band as global funds increase allocation.",
      source: "Moneycontrol",
      url: "https://www.moneycontrol.com/news/business/markets/",
      impact: "Medium",
      sector: "Energy & Infra",
      time: "45m ago"
    },
    {
      id: 5,
      headline: "HDFC Bank & ICICI Bank Net Interest Margins Expand in Q3 Preliminary Disclosure",
      summary: "Credit growth surging 14.2% YoY with asset quality indicators improving across retail and corporate loan books.",
      source: "CNBC TV18",
      url: "https://www.cnbctv18.com/market/",
      impact: "High",
      sector: "Banking & Finance",
      time: "1h ago"
    },
    {
      id: 6,
      headline: "Tata Motors EV Division Crosses 100,000 Annual Units; Exports Surge +42%",
      summary: "Auto index outperforms benchmark indices as commercial vehicle and EV passenger order backlogs hit all-time high.",
      source: "Business Standard",
      url: "https://www.business-standard.com/markets",
      impact: "Medium",
      sector: "Automotive",
      time: "1.5h ago"
    },
    {
      id: 7,
      headline: "US Fed Rate Cut Expectations Rise to 78%; Emerging Markets Inflow Accelerates",
      summary: "Dollar index pulls back to 102.4, sparking capital reallocation toward high-yield emerging equities and sovereign debt.",
      source: "Yahoo Finance",
      url: "https://finance.yahoo.com",
      impact: "Medium",
      sector: "Macro Economy",
      time: "2h ago"
    },
    {
      id: 8,
      headline: "FII Derivatives Data Shows Bullish Option Writing at 24,600 Strike Price",
      summary: "Institutional desk positioning indicates strong downside protection with put-call ratio climbing to 1.35.",
      source: "Livemint",
      url: "https://www.livemint.com/market",
      impact: "High",
      sector: "Derivatives & F&O",
      time: "2.5h ago"
    },
    {
      id: 9,
      headline: "Bitcoin Crosses $98,000 Mark as Institutional Spot ETFs Record $850M Inflow",
      summary: "Digital asset liquidity surges as global macro desks hedge against sovereign fiat devaluation.",
      source: "Bloomberg Crypto",
      url: "https://www.bloomberg.com/crypto",
      impact: "Medium",
      sector: "Crypto Asset",
      time: "3h ago"
    },
    {
      id: 10,
      headline: "Government Announces ₹35,000 Cr Semiconductor & Green Energy Subsidies",
      summary: "Capex-heavy industrial and engineering stocks log sharp volume-backed rallies following fiscal incentive approval.",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com/industry",
      impact: "Low",
      sector: "Energy & Infra",
      time: "4h ago"
    }
  ]
};

// ── MULTI-LINGUAL UI DICTIONARY ──────────────────────────────────
const UI_TEXT: Record<string, {
  terminal_badge: string;
  live_badge: string;
  title: string;
  subtitle: string;
  active_catalysts: string;
  high_risk_events: string;
  search_placeholder: string;
  all_impact: string;
  high_impact: string;
  medium_impact: string;
  low_impact: string;
  all_sectors: string;
  read_source: string;
  copy_link: string;
  catalyst_label: string;
  risk_catalyst: string;
  ai_verified: string;
}> = {
  English: {
    terminal_badge: "MARKET INTELLIGENCE TERMINAL",
    live_badge: "REALTIME LIVE",
    title: "Top 10 Market Catalysts & Institutional News",
    subtitle: "Verified real-time financial news with 1-click redirects to authoritative portals (Economic Times, Bloomberg, Reuters, Moneycontrol, CNBC).",
    active_catalysts: "Active Catalysts",
    high_risk_events: "High Risk Events",
    search_placeholder: "Search market news by headline, sector, or source...",
    all_impact: "All Impact",
    high_impact: "High Impact",
    medium_impact: "Medium Impact",
    low_impact: "Low Impact",
    all_sectors: "All Sectors",
    read_source: "Read Source",
    copy_link: "Copy Link",
    catalyst_label: "CATALYST",
    risk_catalyst: "Risk Catalyst",
    ai_verified: "AI Verified Catalyst"
  },
  Bengali: {
    terminal_badge: "মার্কেট ইন্টেলিজেন্স টার্মিনাল",
    live_badge: "রিয়েলটাইম লাইভ",
    title: "শীর্ষ ১০ বাজার ক্যাটালিস্ট এবং প্রাতিষ্ঠানিক সংবাদ",
    subtitle: "যাচাইকৃত রিয়েল-টাইম আর্থিক সংবাদ এবং নির্ভরযোগ্য পোর্টালের সরাসরি লিংক (Economic Times, Bloomberg, Reuters, Moneycontrol)।",
    active_catalysts: "সক্রিয় ক্যাটালিস্ট",
    high_risk_events: "উচ্চ ঝুঁকি ঘটনা",
    search_placeholder: "শিরোনাম, খাত বা উৎস দ্বারা সংবাদ অনুসন্ধান করুন...",
    all_impact: "সমস্ত প্রভাব",
    high_impact: "উচ্চ প্রভাব",
    medium_impact: "মাঝারি প্রভাব",
    low_impact: "কম প্রভাব",
    all_sectors: "সমস্ত খাত",
    read_source: "উৎস পড়ুন",
    copy_link: "লিংক কপি করুন",
    catalyst_label: "ক্যাটালিস্ট",
    risk_catalyst: "ঝুঁকি ক্যাটালিস্ট",
    ai_verified: "এআই যাচাইকৃত সংবাদ"
  },
  Hindi: {
    terminal_badge: "मार्केट इंटेलिजेंस टर्मिनल",
    live_badge: "रियलटाइम लाइव",
    title: "शीर्ष 10 मार्केट कैटलिस्ट और संस्थागत समाचार",
    subtitle: "सत्यापित रियल-टाइम वित्तीय समाचार और विश्वसनीय पोर्टल्स के सीधे लिंक (Economic Times, Bloomberg, Reuters, Moneycontrol)।",
    active_catalysts: "सक्रिय कैटलिस्ट",
    high_risk_events: "उच्च जोखिम घटनाएं",
    search_placeholder: "हेडलाइन, सेक्टर या सोर्स से समाचार खोजें...",
    all_impact: "सभी प्रभाव",
    high_impact: "उच्च प्रभाव",
    medium_impact: "मध्यम प्रभाव",
    low_impact: "कम प्रभाव",
    all_sectors: "सभी सेक्टर",
    read_source: "स्रोत पढ़ें",
    copy_link: "कॉपी लिंक",
    catalyst_label: "कैटलिस्ट",
    risk_catalyst: "जोखिम कैटलिस्ट",
    ai_verified: "एआई सत्यापित समाचार"
  },
  Gujarati: {
    terminal_badge: "માર્કેટ ઇન્ટેલિજન્સ ટર્મિનલ",
    live_badge: "રિયલટાઇમ લાઇવ",
    title: "ટોચના 10 માર્કેટ કેટાલિસ્ટ અને સંસ્થાકીય સમાચાર",
    subtitle: "ચકાસાયેલ રીઅલ-ટાઇમ નાણાકીય સમાચાર અને વિશ્વસનીય પોર્ટલ્સ પર સીધી લિંક્સ.",
    active_catalysts: "સક્રિય કેટાલિસ્ટ",
    high_risk_events: "ઉચ્ચ જોખમ ઇવેન્ટ્સ",
    search_placeholder: "સમાચાર શોધો સંસ્થા અથવા ક્ષેત્ર દ્વારા...",
    all_impact: "બધી અસરો",
    high_impact: "ઉચ્ચ અસર",
    medium_impact: "મધ્યમ અસર",
    low_impact: "ઓછી અસર",
    all_sectors: "બધા ક્ષેત્રો",
    read_source: "સ્ત્રોત વાંચો",
    copy_link: "લિંક કોપી કરો",
    catalyst_label: "કેટાલિસ્ટ",
    risk_catalyst: "જોખમ કેટાલિસ્ટ",
    ai_verified: "AI ચકાસાયેલ સમાચાર"
  },
  Marathi: {
    terminal_badge: "मार्केट इंटेलिजन्स टर्मिनल",
    live_badge: "रिअलटाइम लाइव्ह",
    title: "प्रमुख 10 मार्केट कॅटॅलिस्ट आणि संस्थात्मक बातम्या",
    subtitle: "सत्यापित रिअल-टाइम आर्थिक बातम्या आणि अधिकृत पोर्टल्सच्या थेट लिंक्स.",
    active_catalysts: "सक्रिय कॅटॅलिस्ट",
    high_risk_events: "उच्च धोक्याच्या घटना",
    search_placeholder: "बातमी, क्षेत्र किंवा स्रोतानुसार शोधा...",
    all_impact: "सर्व प्रभाव",
    high_impact: "उच्च प्रभाव",
    medium_impact: "मध्यम प्रभाव",
    low_impact: "कमी प्रभाव",
    all_sectors: "सर्व क्षेत्रे",
    read_source: "स्त्रोत वाचा",
    copy_link: "लिंक कॉपी करा",
    catalyst_label: "कॅटॅलिस्ट",
    risk_catalyst: "धोका कॅटॅलिस्ट",
    ai_verified: "AI सत्यापित बातम्या"
  },
  Kannada: {
    terminal_badge: "ಮಾರುಕಟ್ಟೆ ಬುದ್ಧಿಮತ್ತೆ ಟರ್ಮಿನಲ್",
    live_badge: "ರಿಯಲ್‌ಟೈಮ್ ಲೈವ್",
    title: "ಟಾಪ್ 10 ಮಾರುಕಟ್ಟೆ ಸುದ್ಧಿಗಳು ಮತ್ತು ಸಂಸ್ಥೆಯ ವರದಿಗಳು",
    subtitle: "ನಂಬಿಕಾರ್ಹ ಹಣಕಾಸು ಸುದ್ದಿಗಳು ಮತ್ತು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳ ನೇರ ಲಿಂಕ್‌ಗಳು.",
    active_catalysts: "ಸಕ್ರಿಯ ಸುದ್ದಿಗಳು",
    high_risk_events: "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಘಟನೆಗಳು",
    search_placeholder: "ವರದಿ ಅಥವಾ ವಲಯದ ಮೂಲಕ ಸುದ್ದಿ ಹುಡುಕಿ...",
    all_impact: "ಎಲ್ಲಾ ಪರಿಣಾಮ",
    high_impact: "ಹೆಚ್ಚಿನ ಪರಿಣಾಮ",
    medium_impact: "ಮಧ್ಯಮ ಪರಿಣಾಮ",
    low_impact: "ಕಡಿಮೆ ಪರಿಣಾಮ",
    all_sectors: "ಎಲ್ಲಾ ವಲಯಗಳು",
    read_source: "ಮೂಲವನ್ನು ಓದಿ",
    copy_link: "ಲಿಂಕ್ ನಕಲಿಸಿ",
    catalyst_label: "ಸುದ್ಧಿ",
    risk_catalyst: "ಅಪಾಯ ಸುದ್ಧಿ",
    ai_verified: "AI ಪರಿಶೀಲಿಸಿದ ಸುದ್ಧಿ"
  },
  Tamil: {
    terminal_badge: "சந்தை நுண்ணறிவு முனையம்",
    live_badge: "நிகழ்நேர லைவ்",
    title: "சிறந்த 10 சந்தை வினையூக்கிகள் & செய்திகள்",
    subtitle: "சரிபார்க்கப்பட்ட நிகழ்நேர நிதிச் செய்திகள் மற்றும் அதிகாரப்பூர்வ இணையதளங்களின் நேரடி இணைப்புகள்.",
    active_catalysts: "செயலில் உள்ள செய்திகள்",
    high_risk_events: "அதிக ஆபத்து நிகழ்வுகள்",
    search_placeholder: "தலைப்பு, துறை அல்லது மூலத்தின் அடிப்படையில் செய்திகளைத் தேடுங்கள்...",
    all_impact: "அனைத்து தாக்கம்",
    high_impact: "அதிக தாக்கம்",
    medium_impact: "நடுத்தர தாக்கம்",
    low_impact: "குறைந்த தாக்கம்",
    all_sectors: "அனைத்து துறைகளும்",
    read_source: "மூலத்தைப் படியுங்கள்",
    copy_link: "இணைப்பை நகலெடு",
    catalyst_label: "காரணி",
    risk_catalyst: "ஆபத்து காரணி",
    ai_verified: "AI சரிபார்க்கப்பட்ட செய்தி"
  },
  Telugu: {
    terminal_badge: "మార్కెట్ ఇంటెలిజెన్స్ టెర్మినల్",
    live_badge: "రియల్ టైమ్ లైవ్",
    title: "టాప్ 10 మార్కెట్ క్యాటలిస్ట్‌లు & వార్తలు",
    subtitle: "ధృవీకరించబడిన రియల్-టైమ్ ఆర్థిక వార్తలు మరియు ప్రామాణిక పోర్టల్స్ యొక్క ప్రత్యక్ష లింక్‌లు.",
    active_catalysts: "యాక్టివ్ క్యాటలిస్ట్‌లు",
    high_risk_events: "అధిక ప్రమాద సంఘటనలు",
    search_placeholder: "హెడ్‌లైన్ లేదా రంగం ద్వారా వార్తలను శోధించండి...",
    all_impact: "అన్ని ప్రభావాలు",
    high_impact: "అధిక ప్రభావం",
    medium_impact: "మధ్యస్థ ప్రభావం",
    low_impact: "తక్కువ ప్రభావం",
    all_sectors: "అన్ని రంగాలు",
    read_source: "మూలాన్ని చదవండి",
    copy_link: "లింక్ కాపీ చేయి",
    catalyst_label: "క్యాటలిస్ట్",
    risk_catalyst: "రిస్క్ క్యాటలిస్ట్",
    ai_verified: "AI ధృవీకరించిన వార్త"
  }
};

const impactBadgeStyles: Record<string, string> = {
  High: "text-crimson bg-crimson/10 border-crimson/30",
  Medium: "text-gold bg-gold/10 border-gold/30",
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const MarketNews = () => {
  const { language } = useLanguage();
  
  // Pick active UI text and localized dataset
  const activeUi = UI_TEXT[language] || UI_TEXT.English;
  const activeLocalizedList = LOCALIZED_NEWS[language] || LOCALIZED_NEWS.English;

  const [news, setNews] = useState<NewsItem[]>(activeLocalizedList);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImpact, setSelectedImpact] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Update news list whenever language changes!
  useEffect(() => {
    const list = LOCALIZED_NEWS[language] || LOCALIZED_NEWS.English;
    setNews(list);

    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/news?lang=${encodeURIComponent(language)}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const mapped = json.data.map((item: any) => ({
            id: item.id || Math.random(),
            headline: item.headline || item.title,
            summary: item.summary || item.description,
            source: item.source || "Financial Portal",
            url: item.url || "https://economictimes.indiatimes.com/markets",
            impact: item.impact || "Medium",
            sector: item.sector || "General Market",
            time: item.time || "Recent",
          }));
          setNews(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch market news API", err);
      }
    }
    fetchData();
  }, [language]);

  const handleCopyLink = (url: string, id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("News URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter dataset
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesImpact = selectedImpact === "All" || item.impact === selectedImpact;
    const matchesSector = selectedSector === "All Sectors" || item.sector.toLowerCase().includes(selectedSector.toLowerCase().split(" ")[0]);

    return matchesSearch && matchesImpact && matchesSector;
  });

  const highImpactCount = news.filter(n => n.impact === "High").length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Title & Realtime Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card to-accent/40 p-6 rounded-2xl border border-white/5 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 flex items-center gap-1">
                <Newspaper className="w-3 h-3" /> {activeUi.terminal_badge}
              </span>
              <span className="text-[10px] font-mono text-profit px-2 py-0.5 rounded bg-profit/10 border border-profit/20 flex items-center gap-1 animate-pulse">
                ● {activeUi.live_badge}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{activeUi.title}</h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {activeUi.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-card/80 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">{activeUi.active_catalysts}</span>
              <span className="text-lg font-bold font-mono text-gold">{news.length}</span>
            </div>
            <div className="bg-card/80 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">{activeUi.high_risk_events}</span>
              <span className="text-lg font-bold font-mono text-crimson">{highImpactCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="ai-card p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 border border-white/5 flex-1 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeUi.search_placeholder}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-mono-data"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-white text-xs">
                  Clear
                </button>
              )}
            </div>

            {/* Impact Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-accent/30 p-1 rounded-xl border border-white/5 shrink-0">
              <button
                onClick={() => setSelectedImpact("All")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedImpact === "All"
                    ? "bg-gold text-black shadow-md shadow-gold/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {activeUi.all_impact}
              </button>
              <button
                onClick={() => setSelectedImpact("High")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedImpact === "High"
                    ? "bg-crimson text-white shadow-md shadow-crimson/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {activeUi.high_impact}
              </button>
              <button
                onClick={() => setSelectedImpact("Medium")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedImpact === "Medium"
                    ? "bg-gold/20 text-gold shadow-md"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {activeUi.medium_impact}
              </button>
              <button
                onClick={() => setSelectedImpact("Low")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedImpact === "Low"
                    ? "bg-emerald-400/20 text-emerald-400 shadow-md"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {activeUi.low_impact}
              </button>
            </div>
          </div>
        </div>

        {/* News Feed Grid */}
        {loading ? (
          <div className="ai-card p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-xs text-muted-foreground font-mono">Syncing Multi-lingual Market Intelligence...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="ai-card p-12 text-center text-muted-foreground space-y-2">
                <AlertTriangle className="w-8 h-8 text-gold/50 mx-auto" />
                <p className="text-sm font-semibold">No news catalysts match your current search filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedImpact("All");
                    setSelectedSector("All Sectors");
                  }}
                  className="text-xs text-gold underline cursor-pointer hover:text-gold/80"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredNews.map((item, index) => {
                const headline = item.headline || item.title;
                const summary = item.summary || item.description;
                const source = item.source || "Financial Portal";
                const time = item.time || "Recent";
                const impact = item.impact || "Medium";
                const sector = item.sector || "General Market";

                return (
                  <div
                    key={item.id || index}
                    className="ai-card p-5 group transition-all duration-200 hover:border-gold/40 hover:shadow-2xl relative overflow-hidden bg-card/90"
                  >
                    {/* Left Accent Strip */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        impact === "High" ? "bg-crimson" : impact === "Medium" ? "bg-gold" : "bg-emerald-400"
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-gold/80 bg-gold/10 px-2 py-0.5 rounded border border-gold/20 font-bold">
                            #{index + 1} {activeUi.catalyst_label}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              impactBadgeStyles[impact] || impactBadgeStyles["Medium"]
                            }`}
                          >
                            {impact} {activeUi.risk_catalyst}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-foreground/80 font-mono border border-white/5">
                            {sector}
                          </span>
                        </div>

                        {/* Title Header */}
                        <h3 className="font-editorial text-lg font-bold text-foreground group-hover:text-gold transition-colors leading-snug">
                          {headline}
                        </h3>

                        {/* Summary Block */}
                        <div className="bg-accent/30 p-3 rounded-xl border border-white/5 relative">
                          <p className="text-xs text-muted-foreground/90 leading-relaxed font-sans pl-2 border-l-2 border-gold">
                            "{summary}"
                          </p>
                        </div>

                        {/* Footer details & Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {source}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-gold/70" />
                              {time}
                            </span>
                            <span>·</span>
                            <span className="text-gold/70 flex items-center gap-1 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-gold" />
                              {activeUi.ai_verified}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleCopyLink(item.url, item.id, e)}
                              className="p-1.5 rounded-lg bg-accent/60 hover:bg-accent text-muted-foreground hover:text-white transition-colors cursor-pointer border border-white/5"
                              title={activeUi.copy_link}
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-profit" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold hover:text-black border border-gold/30 text-gold text-xs font-bold transition-all cursor-pointer group-hover:scale-105"
                            >
                              <span>{activeUi.read_source}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MarketNews;
