import { GoogleGenAI, Type } from "@google/genai";
import { OfficialRecord, AuditResult, RiskLevel } from '@/types/types';

// ✅ FIX: DO NOT expose API key to frontend
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Helper
const cleanBase64 = (b64: string) =>
  b64.replace(/^data:image\/\w+;base64,/, "");

/**
 * ✅ SINGLE PIPELINE (Image + Audit + Letter in ONE CALL)
 */
export const auditProject = async (
  governmentProject: any,
  citizenReport: { imageUrl: string; notes: string }
) => {
  try {
    // ✅ 1. Convert image → base64
    const imageRes = await fetch(citizenReport.imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // ✅ 2. ONE AI CALL (OPTIMIZED)
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // ✅ stable + cheap + multimodal
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(base64Image),
            },
          },
          {
            text: `
You are an expert government infrastructure auditor.

OFFICIAL RECORD:
Project: ${governmentProject.project_name}
Status: ${governmentProject.status}
Description: ${governmentProject.category}
Budget: ₹${governmentProject.budget}
Contractor: ${governmentProject.contractor}

CITIZEN NOTES:
${citizenReport.notes || "No additional notes"}

TASK:
1. Analyze the image:
   - If document → extract details
   - If infrastructure → detect defects (potholes, cracks, incomplete work)

2. Compare with official record

3. Identify discrepancies

4. Assign Risk Level:
   - Low / Medium / High

5. Provide reasoning

6. Generate a formal complaint letter

IMPORTANT:
Return ONLY valid JSON.
`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evidenceSummary: { type: Type.STRING },
            discrepancies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            riskLevel: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"],
            },
            reasoning: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            complaintLetter: { type: Type.STRING },
          },
          required: [
            "evidenceSummary",
            "discrepancies",
            "riskLevel",
            "reasoning",
            "confidenceScore",
            "complaintLetter",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);

    return {
      risk_level: result.riskLevel as RiskLevel,
      discrepancies: result.discrepancies,
      ai_verdict: result.reasoning,
      confidence: result.confidenceScore,
      evidence_summary: result.evidenceSummary,
      complaint_letter: result.complaintLetter,
    };

  } catch (error) {
    console.error("AI Audit failed:", error);

    return {
      risk_level: RiskLevel.UNKNOWN,
      discrepancies: ["AI Audit failed to process"],
      ai_verdict: "The AI service encountered an error.",
      confidence: 0,
      evidence_summary: "",
      complaint_letter: "",
    };
  }
};