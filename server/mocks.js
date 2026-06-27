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

  lekhak: {
    _mock: true,
    title: "Complaint Letter — Wrong Electricity Bill",
    to: "The Executive Engineer, Electricity Board",
    subject: "Complaint regarding incorrect electricity bill for consumer no. [Consumer Number]",
    letter:
      "To,\nThe Executive Engineer,\n[Electricity Board Office Address]\n\nSubject: Complaint regarding incorrect electricity bill\n\nRespected Sir/Madam,\n\nI am [Your Name], residing at [Your Address], holding consumer number [Consumer Number]. My electricity bill for the month of [Month] shows an amount of ₹[Amount], which is far higher than my usual monthly bill of around ₹[Usual Amount].\n\nI believe there has been an error in the meter reading or billing. I request you to kindly review my meter reading and issue a corrected bill at the earliest.\n\nI am attaching a copy of the disputed bill for your reference. Kindly do the needful.\n\nThank you.\n\nYours faithfully,\n[Your Name]\n[Phone Number]\n[Date]",
    attachments: ["Copy of the disputed bill", "Copy of a previous normal bill", "ID proof"],
    tips: ["Keep a copy of this letter and note down the complaint number you receive.", "You can also file this on the board's online portal or helpline."],
  },

  vyapaar: {
    _mock: true,
    title: "Diwali Offer — WhatsApp Message",
    content:
      "🪔 *Diwali Dhamaka at [Shop Name]!* 🪔\n\nMake this festival sweeter — *20% OFF* on all sweets & dry fruits! 🎉\n\n✨ Fresh, pure & made with love\n📍 Visit us at [Area] or message to order\n🛵 Home delivery available\n\nOffer till [Date]. Happy Diwali to you and your family! 🙏",
    variations: [
      "🎉 This Diwali, gift health & taste! Flat 20% off on premium dry fruits at [Shop Name]. Order on WhatsApp now! 🪔",
      "Sweeten your celebrations 🍬 20% off all mithai this Diwali at [Shop Name]. Limited time — visit today!",
    ],
    hashtags: ["#DiwaliOffer", "#[ShopName]", "#Sweets", "#ShopLocal", "#FestiveSale"],
    tips: ["Send between 10am–12pm or 6–8pm for best response.", "Add one clear photo of your product to double replies."],
  },

  naukri: {
    _mock: true,
    title: "Resume — Retail Sales Associate",
    summary: "Here's a clean, ready-to-use resume based on your details. Tailor the [brackets] before sending.",
    output:
      "[YOUR NAME]\n[City] · [Phone] · [Email]\n\nOBJECTIVE\nHardworking and customer-friendly sales associate with 2 years of retail experience, seeking a role where I can grow and deliver great service.\n\nSKILLS\n• Customer service & billing\n• Stock management\n• Spoken Hindi & English\n• Basic computer / UPI handling\n\nEXPERIENCE\nSales Associate — [Shop/Company], [City] (2022–2024)\n• Handled daily sales and billing for 50+ customers\n• Managed stock and reduced shortages\n\nEDUCATION\n12th Pass — [School/Board], [Year]",
    highlights: ["2 years retail experience", "Customer service & billing", "Bilingual (Hindi/English)"],
    whereToLook: ["National Career Service — ncs.gov.in", "Your state Rojgar / Sewayojan portal", "Apna app for local jobs", "Employment News (weekly)"],
    tips: ["Keep your resume to one page.", "Carry 2-3 printed copies and a soft copy on your phone."],
  },

  samay: {
    _mock: true,
    summary: "You have 5 commitments — 2 are urgent. Here's a plan that gets everything done before each deadline.",
    topPriority: "Start the Physics assignment now — it's due tomorrow 5 PM and needs ~3 hours, the tightest deadline you have.",
    tasks: [
      {
        title: "Physics assignment (Ch. 5 problems)",
        deadline: "Tomorrow, 5:00 PM",
        priority: "High",
        estimate: "3 hrs",
        category: "Studies",
        why: "Shortest deadline and graded.",
        firstStep: "Open the problem set and finish the first 3 questions in a 45-min sprint.",
        draft: "Outline:\n1. List formulae for Ch.5\n2. Solve Q1–Q5 (kinematics)\n3. Solve Q6–Q10 (forces)\n4. Re-check units & final answers",
      },
      {
        title: "Prepare sales deck for Monday meeting",
        deadline: "Sunday night",
        priority: "High",
        estimate: "2.5 hrs",
        category: "Work",
        why: "Client-facing and fixed meeting date.",
        firstStep: "Draft the 5 key slides: Problem, Solution, Demo, Pricing, Next steps.",
        draft: "Slide outline:\n• Title\n• The problem (1 stat)\n• Our solution\n• Live demo\n• Pricing\n• Why now + next steps",
      },
      {
        title: "Pay rent",
        deadline: "5th of the month",
        priority: "Medium",
        estimate: "10 min",
        category: "Personal",
        why: "Fixed date, avoids late fee.",
        firstStep: "Set a UPI autopay or transfer now so it's off your plate.",
      },
      {
        title: "Mom's birthday gift",
        deadline: "Sunday",
        priority: "Medium",
        estimate: "30 min",
        category: "Personal",
        why: "Meaningful and time-bound.",
        firstStep: "Order a gift online today so it arrives in time.",
      },
    ],
    schedule: [
      { block: "Today, 4:00–7:00 PM", task: "Physics assignment", focus: "Finish all Ch.5 problems in two focus sprints." },
      { block: "Today, 8:00–8:15 PM", task: "Pay rent + order gift", focus: "Knock out both quick personal tasks." },
      { block: "Saturday, 11 AM–1:30 PM", task: "Sales deck", focus: "Build the 6 core slides from the outline." },
      { block: "Sunday, 5–6 PM", task: "Sales deck polish", focus: "Rehearse and tighten the demo flow." },
    ],
  },
};
