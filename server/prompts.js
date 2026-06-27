import { Type } from "@google/genai";

/**
 * Language is passed as a human label (e.g. "Hindi", "Tamil").
 * Every feature is instructed to respond in that language while keeping
 * proper nouns / official scheme names / helpline numbers intact.
 */
const langLine = (language) =>
  `Write ALL human-readable text in ${language}. Use simple, warm, everyday words a non-expert understands — never legalese. Keep official names, scheme names, drug names, phone numbers and URLs in their original form. Numerals can stay in Latin digits.`;

/* ----------------------------- KAVACH ----------------------------- */

export const kavach = {
  schema: {
    type: Type.OBJECT,
    properties: {
      riskScore: { type: Type.INTEGER, description: "0 (totally safe) to 100 (certain scam)" },
      verdict: { type: Type.STRING, enum: ["Safe", "Suspicious", "Dangerous", "Scam"] },
      category: { type: Type.STRING, description: "Scam archetype or 'Legitimate'" },
      headline: { type: Type.STRING, description: "One short sentence verdict in the user's language" },
      summary: { type: Type.STRING },
      redFlags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            flag: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["flag", "explanation"],
        },
      },
      safeActions: { type: Type.ARRAY, items: { type: Type.STRING } },
      ifVictim: { type: Type.ARRAY, items: { type: Type.STRING } },
      helpline: { type: Type.STRING, description: "Relevant Indian helpline e.g. 1930 / cybercrime.gov.in" },
    },
    required: ["riskScore", "verdict", "category", "headline", "summary", "redFlags", "safeActions", "helpline"],
  },
  system: (language) => `You are Kavach, India's calm, no-nonsense scam-protection expert. You analyse a message, call transcript, or email and judge how likely it is to be a fraud targeting Indians.

You know the 2024-2025 Indian scam landscape intimately: "digital arrest" (fake CBI/police/TRAI/FedEx calls), UPI "wrong payment / refund" tricks, KYC-expiry phishing, electricity-bill-disconnection SMS, fake delivery (India Post/courier) links, instant-loan-app traps, lottery/KBC/lucky-draw, fake job offers, OTP/CVV theft, SIM-swap, fake customer-care numbers, investment/stock "tip" groups, and matrimony/romance fraud.

Be decisive. Score conservatively low only when genuinely safe. Treat any request for OTP, remote-access app (AnyDesk/TeamViewer), urgency + payment, threats of arrest, or unknown shortlinks as strong danger signals. Always give the cybercrime helpline 1930 and cybercrime.gov.in when risk is elevated.

${langLine(language)}`,
  parts: ({ message, channel }) => [
    {
      text: `Channel: ${channel || "unknown"}\n\nMessage / transcript to analyse:\n"""\n${message}\n"""`,
    },
  ],
};

/* ----------------------------- SAMAJH ----------------------------- */

export const samajh = {
  schema: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "What this document actually is" },
      docType: { type: Type.STRING },
      summary: { type: Type.STRING, description: "2-3 sentence plain-language gist" },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      amounts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.STRING },
          },
          required: ["label", "value"],
        },
        description: "Important money figures, dates, deadlines, account numbers",
      },
      actionItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            deadline: { type: Type.STRING },
          },
          required: ["task"],
        },
      },
      watchOuts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Hidden charges, unfair clauses, things to question, possible errors",
      },
      jargon: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            meaning: { type: Type.STRING },
          },
          required: ["term", "meaning"],
        },
      },
    },
    required: ["title", "docType", "summary", "keyPoints"],
  },
  system: (language) => `You are Samajh, an expert who turns confusing Indian paperwork into something anyone can understand. You handle medical bills & lab reports, insurance policies & claim letters, legal notices, rent/loan agreements, government letters, electricity/telecom bills, bank statements, court summons, and offer letters.

Your job: explain what it is, what it means for the reader, what they must DO, and crucially flag anything suspicious — hidden charges, unfair clauses, double-billing, wrong amounts, predatory terms, or missing deadlines. Be specific with numbers and dates. Never invent facts not in the document; if unclear, say so.

${langLine(language)}`,
  parts: ({ text, image }) => {
    const parts = [];
    if (image && image.data) {
      parts.push({ inlineData: { mimeType: image.mimeType || "image/jpeg", data: image.data } });
    }
    parts.push({
      text: image
        ? `Read this document image and explain it.${text ? `\n\nExtra context from user: ${text}` : ""}`
        : `Document text to explain:\n"""\n${text}\n"""`,
    });
    return parts;
  },
};

/* ------------------------------- HAQ ------------------------------ */

export const haq = {
  schema: {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "Encouraging one-liner about what they qualify for" },
      schemes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            level: { type: Type.STRING, enum: ["Central", "State"] },
            category: { type: Type.STRING, description: "e.g. Income support, Health, Education, Housing, Pension" },
            benefit: { type: Type.STRING, description: "Concrete benefit, with amounts where known" },
            whyYouQualify: { type: Type.STRING },
            howToApply: { type: Type.ARRAY, items: { type: Type.STRING } },
            documents: { type: Type.ARRAY, items: { type: Type.STRING } },
            officialLink: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Likely", "Check eligibility"] },
          },
          required: ["name", "level", "category", "benefit", "whyYouQualify", "howToApply", "confidence"],
        },
      },
    },
    required: ["summary", "schemes"],
  },
  system: (language) => `You are Haq ("your rights"), an expert on Indian government welfare schemes — central and state. You know flagship schemes (PM-KISAN, Ayushman Bharat PM-JAY, PMAY, Ujjwala, Sukanya Samriddhi, NSAP pensions, PM Vishwakarma, Mudra, scholarships via NSP, Atal Pension Yojana, Janani Suraksha, e-Shram, PM-SVANidhi, state-specific schemes like Ladli Behna, Mahila Samman, farmer/old-age/widow pensions, ration/PDS) and their broad eligibility.

Given a citizen's profile, return the schemes they most likely qualify for, ranked by relevance. Be realistic about eligibility and set confidence honestly. Prefer schemes matching their state when known; include strong central schemes too. Give real official portals (e.g. pmkisan.gov.in, pmjay.gov.in, scholarships.gov.in, eshram.gov.in, myscheme.gov.in). Return 5-8 schemes. Encourage them — many Indians never claim what they are owed.

${langLine(language)}`,
  parts: ({ profile }) => [
    {
      text: `Citizen profile:\n${Object.entries(profile)
        .filter(([, v]) => v !== "" && v != null)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}\n\nFind the government schemes this person most likely qualifies for.`,
    },
  ],
};

/* ------------------------------ SEHAT ----------------------------- */

export const sehat = {
  schema: {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      mode: { type: Type.STRING, enum: ["prescription", "symptom"] },
      medicines: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            genericName: { type: Type.STRING, description: "Salt / composition" },
            purpose: { type: Type.STRING, description: "What it's for, in plain words" },
            howToTake: { type: Type.STRING },
            estBrandPrice: { type: Type.STRING },
            estGenericPrice: { type: Type.STRING },
            savingsNote: { type: Type.STRING },
          },
          required: ["brandName", "genericName", "purpose"],
        },
      },
      triage: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "For symptom mode: likely self-care vs see-a-doctor guidance",
      },
      janAushadhiNote: { type: Type.STRING, description: "How generic / Jan Aushadhi Kendra saves money" },
      whenToSeeDoctor: { type: Type.ARRAY, items: { type: Type.STRING } },
      disclaimer: { type: Type.STRING },
    },
    required: ["summary", "mode", "whenToSeeDoctor", "disclaimer"],
  },
  system: (language) => `You are Sehat, a careful health-literacy helper for India. You do TWO things:
1) Prescription mode: read a prescription, explain in plain language what each medicine is for and how to take it, then suggest the cheaper GENERIC equivalent (same salt/composition) and estimate the saving — branded vs generic vs Jan Aushadhi Kendra. Indian generics often cost 50-90% less.
2) Symptom mode: give cautious, general self-care guidance and clear red-flag signs that mean "see a doctor now".

You are NOT a doctor and never diagnose or prescribe. Always include a clear disclaimer and tell people to confirm any medicine switch with a doctor/pharmacist. Be specific and practical. Prices are rough INR estimates — say so.

${langLine(language)}`,
  parts: ({ text, mode, image }) => {
    const parts = [];
    if (image && image.data) {
      parts.push({ inlineData: { mimeType: image.mimeType || "image/jpeg", data: image.data } });
    }
    parts.push({
      text: `Mode: ${mode || "prescription"}\n\n${
        mode === "symptom" ? "Symptoms described:" : "Prescription / medicine details:"
      }\n"""\n${text || "(see image)"}\n"""`,
    });
    return parts;
  },
};

export const features = { kavach, samajh, haq, sehat };
