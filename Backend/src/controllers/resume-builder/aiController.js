import { getGeminiClient, GEMINI_MODEL } from "../../config/ai.js";
import Resume from "../../model/ResumeBuilder.js";

// Retry helper with exponential backoff for transient errors
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isTransient = error?.status === 503 || 
                     error?.message?.includes("503") || 
                     error?.message?.includes("Service Unavailable") ||
                     error?.message?.includes("high demand") ||
                     error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isTransient && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`AI API transient error - retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Helper: call Gemini via native SDK (same pattern as resumeAnalyzer)
const callGemini = async (prompt) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return response.text;
};

// enhance professional summary
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `You are an expert in resume writing. Enhance the professional summary in 1-2 sentences, ATS-friendly, highlighting key skills and experience. Return only text. 
    Content: ${userContent}`;

    const enhancedContent = await retryWithBackoff(() => callGemini(prompt));

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("AI Summary Enhancement Error:", error?.message || error);
    const isTransient = error?.message?.includes("503") || error?.message?.includes("RESOURCE_EXHAUSTED");
    const status = isTransient ? 503 : 400;
    return res.status(status).json({ 
      message: isTransient 
        ? "AI service is temporarily busy. Please try again in a few seconds." 
        : error.message 
    });
  }
};

// enhance job description
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `Enhance job description in 1-2 sentences with action verbs and measurable impact. ATS-friendly. Return only text.
    Content: ${userContent}`;

    const enhancedContent = await retryWithBackoff(() => callGemini(prompt));

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("AI Job Enhancement Error:", error?.message || error);
    const isTransient = error?.message?.includes("503") || error?.message?.includes("RESOURCE_EXHAUSTED");
    const status = isTransient ? 503 : 400;
    return res.status(status).json({ 
      message: isTransient 
        ? "AI service is temporarily busy. Please try again in a few seconds." 
        : error.message 
    });
  }
};

// upload resume (NO AUTH)
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `Extract structured resume data in JSON format. 
      The JSON should strictly follow this schema:
      {
        "professional_summary": "string",
        "skills": ["string"],
        "personal_info": { "full_name": "string", "profession": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string", "website": "string" },
        "experience": [{ "company": "string", "position": "string", "start_date": "string", "end_date": "string", "description": "string", "is_current": "boolean" }],
        "project": [{ "name": "string", "type": "string", "description": "string", "link": "string" }],
        "education": [{ "institution": "string", "degree": "string", "field": "string", "graduation_date": "string", "gpa": "string" }],
        "certification": [{ "certificate_name": "string", "description": "string", "issuer": "string", "issue_date": "YYYY-MM-DD", "credential_url": "string" }]
      }
      Only return the JSON object, no markdown fences.
      Resume Text: ${resumeText}`;

    const extractedText = await retryWithBackoff(() => callGemini(prompt));

    console.log("Raw Extracted Data:", extractedText);
    
    // Clean potential markdown tags just in case
    const cleanedData = extractedText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedData);

    const newResume = await Resume.create({
      title,
      ...parsedData,
    });

    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    console.error("AI Upload Error:", error?.message || error);
    const errorMsg = error?.message || "Failed to parse resume";
    const isTransient = errorMsg.includes("503") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("high demand");
    const status = isTransient ? 503 : 400;
    return res.status(status).json({ 
      message: isTransient 
        ? "AI service is temporarily busy. Please try again in a few seconds." 
        : `Resume upload failed: ${errorMsg}`
    });
  }
};