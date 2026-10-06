// Application-wide translations
// Add keys here to support new UI strings in both languages.

export const translations = {
  en: {
    appName: 'Tender Package Builder',
    appTagline: 'Prepare, verify, and generate a complete tender document package — securely in your browser.',
    appDescription: 'All documents stay on your device. Nothing is uploaded to any server.',

    // Navigation
    navHome: 'Home',
    navDocs: 'Documentation',
    switchTobn: 'বাংলা',
    switchToEn: 'English',

    // Landing hero
    heroTitle: 'Tender Document Package Builder',
    heroSubtitle: 'Prepare, verify, and generate a complete tender document package securely in your browser.',
    heroPrivacyNote: '🔒 All documents stay on your device. Nothing leaves your browser.',
    ctaStart: 'Start New Package',
    ctaLoad: 'Load Requirements File',

    // Workflow steps
    workflowTitle: 'How it works',
    step1Title: 'Load Requirements',
    step1Desc: 'Upload the requirements.json file provided for your tender.',
    step2Title: 'Add Documents',
    step2Desc: 'Upload the PDF documents you need to include in the package.',
    step3Title: 'Match & Verify',
    step3Desc: 'Assign each document to its requirement. Resolve missing or expired items.',
    step4Title: 'Generate Package',
    step4Desc: 'Download a single, correctly ordered PDF package ready for submission.',

    // Features
    featuresTitle: 'Built for procurement offices',
    feat1Title: 'Fully Private',
    feat1Desc: 'All processing happens in your browser. No documents are ever uploaded.',
    feat2Title: 'Validation Engine',
    feat2Desc: 'Instantly detects missing, expired, or duplicate documents.',
    feat3Title: 'Bilingual',
    feat3Desc: 'Full English and বাংলা interface support.',
    feat4Title: 'PDF Generation',
    feat4Desc: 'Generates a numbered, cover-paged PDF package with one click.',

    // Status labels
    statusOk: 'OK',
    statusMissing: 'Missing',
    statusExpired: 'Expired',
    statusExpiryNeeded: 'Expiry Date Needed',
    statusNotProvided: 'Not Provided',

    // Tender info labels
    tenderId: 'Tender ID',
    tenderTitle: 'Tender Title',
    procuringEntity: 'Procuring Entity',
    bidder: 'Bidder',
    submissionDeadline: 'Submission Deadline',

    // Requirement labels
    mandatory: 'Mandatory',
    optional: 'Optional',
    hasExpiry: 'Has Expiry',

    // Footer
    footerBuilt: 'Built for AI DevFest Hackathon',
    footerPrivacy: 'Your documents never leave your browser.',
  },

  bn: {
    appName: 'দরপত্র প্যাকেজ বিল্ডার',
    appTagline: 'আপনার ব্রাউজারে নিরাপদে সম্পূর্ণ দরপত্র ডকুমেন্ট প্যাকেজ তৈরি ও যাচাই করুন।',
    appDescription: 'সকল ডকুমেন্ট আপনার ডিভাইসে থাকে। কোনো সার্ভারে আপলোড হয় না।',

    // Navigation
    navHome: 'হোম',
    navDocs: 'ডকুমেন্টেশন',
    switchTobn: 'বাংলা',
    switchToEn: 'English',

    // Landing hero
    heroTitle: 'দরপত্র ডকুমেন্ট প্যাকেজ বিল্ডার',
    heroSubtitle: 'আপনার ব্রাউজারে নিরাপদে সম্পূর্ণ দরপত্র ডকুমেন্ট প্যাকেজ প্রস্তুত, যাচাই ও তৈরি করুন।',
    heroPrivacyNote: '🔒 সকল ডকুমেন্ট আপনার ডিভাইসে থাকে। কিছুই ব্রাউজারের বাইরে যায় না।',
    ctaStart: 'নতুন প্যাকেজ শুরু করুন',
    ctaLoad: 'রিকোয়ারমেন্ট ফাইল লোড করুন',

    // Workflow steps
    workflowTitle: 'কিভাবে কাজ করে',
    step1Title: 'রিকোয়ারমেন্ট লোড করুন',
    step1Desc: 'আপনার দরপত্রের জন্য প্রদত্ত requirements.json ফাইল আপলোড করুন।',
    step2Title: 'ডকুমেন্ট যোগ করুন',
    step2Desc: 'প্যাকেজে অন্তর্ভুক্ত করতে হবে এমন PDF ডকুমেন্ট আপলোড করুন।',
    step3Title: 'ম্যাচ ও যাচাই করুন',
    step3Desc: 'প্রতিটি ডকুমেন্ট তার রিকোয়ারমেন্টের সাথে সংযুক্ত করুন। মিসিং বা মেয়াদোত্তীর্ণ আইটেম সমাধান করুন।',
    step4Title: 'প্যাকেজ তৈরি করুন',
    step4Desc: 'দাখিলের জন্য প্রস্তুত সঠিক ক্রমের একটি PDF প্যাকেজ ডাউনলোড করুন।',

    // Features
    featuresTitle: 'সরকারি ক্রয় দপ্তরের জন্য তৈরি',
    feat1Title: 'সম্পূর্ণ গোপনীয়',
    feat1Desc: 'সব প্রক্রিয়া আপনার ব্রাউজারে হয়। কোনো ডকুমেন্ট আপলোড হয় না।',
    feat2Title: 'ভ্যালিডেশন ইঞ্জিন',
    feat2Desc: 'মিসিং, মেয়াদোত্তীর্ণ বা ডুপ্লিকেট ডকুমেন্ট তাৎক্ষণিক শনাক্ত করে।',
    feat3Title: 'দ্বিভাষিক',
    feat3Desc: 'সম্পূর্ণ ইংরেজি ও বাংলা ইন্টারফেস সমর্থন।',
    feat4Title: 'PDF তৈরি',
    feat4Desc: 'এক ক্লিকে নম্বরযুক্ত কভার পেজসহ PDF প্যাকেজ তৈরি করে।',

    // Status labels
    statusOk: 'ঠিক আছে',
    statusMissing: 'অনুপস্থিত',
    statusExpired: 'মেয়াদোত্তীর্ণ',
    statusExpiryNeeded: 'মেয়াদ শেষের তারিখ প্রয়োজন',
    statusNotProvided: 'দেওয়া হয়নি',

    // Tender info labels
    tenderId: 'দরপত্র আইডি',
    tenderTitle: 'দরপত্রের শিরোনাম',
    procuringEntity: 'ক্রয়কারী সংস্থা',
    bidder: 'দরদাতা',
    submissionDeadline: 'দাখিলের সময়সীমা',

    // Requirement labels
    mandatory: 'বাধ্যতামূলক',
    optional: 'ঐচ্ছিক',
    hasExpiry: 'মেয়াদ আছে',

    // Footer
    footerBuilt: 'AI DevFest হ্যাকাথনের জন্য তৈরি',
    footerPrivacy: 'আপনার ডকুমেন্ট কখনও আপনার ব্রাউজার ছাড়ে না।',
  },
}

/**
 * Returns the translation object for the given language.
 * Falls back to English for any missing keys.
 */
export function getT(lang) {
  return translations[lang] ?? translations.en
}
