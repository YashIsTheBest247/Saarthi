/**
 * Demo-safe canned responses. Used only when GEMINI_API_KEY is missing
 * or a live call fails, so the product always works on stage.
 * Each carries `_mock: true` so the UI can show a subtle "sample" badge.
 */

export const mocks = {
  kavach: {
    _mock: true,
    riskScore: 94,
    verdict: "Scam",
    category: "Digital Arrest Scam",
    headline: "यह एक खतरनाक धोखाधड़ी है — किसी भी पैसे का भुगतान न करें।",
    summary:
      "This message pretends to be from the police/CBI and threatens arrest unless you pay or share details. Real agencies never arrest you over a video call or ask for money on UPI.",
    redFlags: [
      { flag: "Threat of immediate arrest", explanation: "Creates panic so you act without thinking. No genuine officer works this way." },
      { flag: "Asks to keep it secret", explanation: "Scammers isolate victims so no family member can warn them." },
      { flag: "Demands money via UPI / gift cards", explanation: "Courts and police never collect fines through UPI or QR codes." },
    ],
    safeActions: [
      "Cut the call. Do not share OTP, Aadhaar or bank details.",
      "Do not install any app like AnyDesk or TeamViewer.",
      "Verify by calling the official number from the real website yourself.",
    ],
    ifVictim: [
      "Call 1930 (cyber helpline) immediately — the first hours matter most.",
      "Report at cybercrime.gov.in and inform your bank to freeze the transaction.",
    ],
    helpline: "1930 · cybercrime.gov.in",
  },

  samajh: {
    _mock: true,
    title: "Hospital Bill — Inpatient Charges",
    docType: "Medical Bill",
    summary:
      "This is a hospital bill for a 2-day admission. The total payable is ₹48,200, but a few line items look duplicated and one charge may be claimable from your insurance.",
    keyPoints: [
      "Admission: 2 days (room + nursing).",
      "Total billed: ₹48,200; advance paid: ₹20,000; balance due: ₹28,200.",
      "Insurance TPA approval number is missing on this copy.",
    ],
    amounts: [
      { label: "Total billed", value: "₹48,200" },
      { label: "Balance due", value: "₹28,200" },
      { label: "Payment deadline", value: "On discharge" },
    ],
    actionItems: [
      { task: "Ask the billing desk to remove the duplicated 'consumables' line", deadline: "Before payment" },
      { task: "Get the TPA/insurance approval number added to the bill", deadline: "Today" },
    ],
    watchOuts: [
      "'Consumables' is charged twice (₹1,200 each) — query this.",
      "Service charge of 5% on medicines is unusual — ask for a breakup.",
    ],
    jargon: [
      { term: "TPA", meaning: "Third Party Administrator — the company that processes your insurance claim." },
      { term: "Consumables", meaning: "Small use-and-throw items like gloves, syringes, cotton." },
    ],
  },

  haq: {
    _mock: true,
    summary: "Based on your profile, you likely qualify for at least 6 schemes — here are the strongest matches.",
    schemes: [
      {
        name: "PM-KISAN Samman Nidhi",
        level: "Central",
        category: "Income support",
        benefit: "₹6,000 per year in 3 instalments, directly to your bank account.",
        whyYouQualify: "You are a land-holding farmer — the core eligibility for PM-KISAN.",
        howToApply: ["Visit pmkisan.gov.in → 'New Farmer Registration'", "Enter Aadhaar & land details", "Verify at your local CSC if needed"],
        documents: ["Aadhaar", "Land records", "Bank passbook"],
        officialLink: "pmkisan.gov.in",
        confidence: "High",
      },
      {
        name: "Ayushman Bharat (PM-JAY)",
        level: "Central",
        category: "Health",
        benefit: "Free hospital treatment up to ₹5 lakh per family per year.",
        whyYouQualify: "Your household income falls within the PM-JAY beneficiary criteria.",
        howToApply: ["Check eligibility on pmjay.gov.in", "Visit a nearby empanelled hospital or CSC", "Get your Ayushman card made"],
        documents: ["Aadhaar", "Ration card"],
        officialLink: "pmjay.gov.in",
        confidence: "Likely",
      },
      {
        name: "Atal Pension Yojana",
        level: "Central",
        category: "Pension",
        benefit: "Guaranteed pension of ₹1,000–₹5,000/month after age 60.",
        whyYouQualify: "You are aged 18–40 and in the unorganised sector.",
        howToApply: ["Ask your bank to open an APY account", "Choose pension amount & auto-debit"],
        documents: ["Aadhaar", "Bank account"],
        officialLink: "npscra.nsdl.co.in",
        confidence: "High",
      },
    ],
  },

  sehat: {
    _mock: true,
    mode: "prescription",
    summary: "Your prescription has 2 medicines. Switching to generics could save you about ₹540 a month.",
    medicines: [
      {
        brandName: "Glycomet 500",
        genericName: "Metformin 500 mg",
        purpose: "Controls blood sugar in type-2 diabetes.",
        howToTake: "Usually with or after meals — follow your doctor's timing.",
        estBrandPrice: "~₹120 / strip",
        estGenericPrice: "~₹18 / strip",
        savingsNote: "Same salt (Metformin). Generic saves ~85%.",
      },
      {
        brandName: "Ecosprin 75",
        genericName: "Aspirin 75 mg",
        purpose: "Keeps blood thin to protect the heart.",
        howToTake: "Once daily, usually after dinner.",
        estBrandPrice: "~₹12 / strip",
        estGenericPrice: "~₹6 / strip",
        savingsNote: "Available at Jan Aushadhi Kendra cheaply.",
      },
    ],
    janAushadhiNote:
      "Pradhan Mantri Jan Aushadhi Kendras sell the same-quality generic medicines at much lower prices. Find your nearest one at janaushadhi.gov.in.",
    whenToSeeDoctor: [
      "Never stop or switch a medicine without telling your doctor.",
      "See a doctor if blood sugar stays high, or you feel dizzy/breathless.",
    ],
    disclaimer: "Sehat is not a doctor. This is general information — confirm any change with your doctor or pharmacist. Prices are rough estimates.",
  },
};
