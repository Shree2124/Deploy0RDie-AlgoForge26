import { groq } from "@/lib/groq/client";
import { supabaseAdmin as supabase } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

type DetectionResult = {
  label: string;
  confidence: number;
  bbox: number[];
};

type ProjectDetails = {
  id: string;
  vendorName: string;
  budget: number;
  latitude: number;
  longitude: number;
};

type FakeDetectionResult = {
  isFake: boolean;
  reason: string;
};

type AISummary = {
  ai_risk_level: string;
  ai_discrepancies: string[];
  ai_verdict: string;
};

const validateRequest = ({
  rtiId,
  userId,
}: {
  rtiId: string;
  userId: string;
}) => {
  if (!rtiId || !userId) {
    throw new Error("Missing required parameters: rtiId or userId");
  }
};

const getRTILocation = async (rtiId: string): Promise<{ latitude: number; longitude: number }> => {
  const { data, error } = await supabase
    .from("rti_requests")
    .select("location")
    .eq("id", rtiId)
    .single();

  if (error || !data || !data.location) {
    console.error(`Failed to fetch location for RTI ${rtiId}:`, error);
    throw new Error("Could not find location for the specified RTI.");
  }

  let loc = data.location as any;
  let latitude: number | undefined;
  let longitude: number | undefined;

  // Sometimes frontends send invalidly quoted JSON strings { lat: ..., lon: ... }
  // which fail JSON.parse but get stored as strings in DB.
  if (typeof loc === 'string') {
    try {
      loc = JSON.parse(loc);
    } catch (e) {
      const latMatch = loc.match(/lat["']?\s*:\s*([\d.-]+)/);
      const lonMatch = loc.match(/(?:lon|lng|longitude)["']?\s*:\s*([\d.-]+)/);
      
      if (latMatch && lonMatch) {
        latitude = parseFloat(latMatch[1]);
        longitude = parseFloat(lonMatch[1]);
      }
    }
  }

  if (typeof loc === 'object' && loc !== null) {
    latitude = loc.latitude ?? loc.lat;
    longitude = loc.longitude ?? loc.lng ?? loc.lon;
  }

  if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
    throw new Error(`Invalid location data format in RTI request: ${JSON.stringify(data.location)}`);
  }

  return { latitude, longitude };
};

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findMatchingProject = async (
  reportLat: number,
  reportLon: number
): Promise<ProjectDetails | null> => {
  console.log(`[ProjectMatching] Latitude: ${reportLat}, Longitude: ${reportLon}`);

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*");

  if (error || !projects) {
    console.error("[ProjectMatching] Error fetching projects:", error);
    throw new Error("Failed to fetch projects for location matching.");
  }

  let closestProject: ProjectDetails | null = null;
  let minDistance = Infinity;

  for (const project of projects) {
    if (!project.latitude || !project.longitude) continue;

    const distance = haversineDistance(
      reportLat,
      reportLon,
      project.latitude,
      project.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestProject = project;
    }
  }

  const RADIUS = 70; // 70 meters

  if (closestProject && minDistance <= RADIUS) {
    console.log(`Match found project: '${closestProject.id}' within ${minDistance.toFixed(2)}m`);
    return closestProject;
  }

  console.warn(`No project within ${RADIUS}m radius. Closest was ${minDistance.toFixed(2)}m`);
  return null;
};

const runObjectDetection = async (imageFile: File): Promise<DetectionResult[]> => {
  const SERVICE_URL = "http://127.0.0.1:8000/predict";

  try {
    if (!imageFile || !(imageFile instanceof File)) {
      console.warn("[ObjectDetection] Image missing or invalid");
      return [];
    }

    console.log("[ObjectDetection] Requesting ML service...");

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(SERVICE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ObjectDetection] Error:", response.status, errorText);
      return [];
    }

    const responseData = await response.json();

    if (!responseData || !Array.isArray(responseData.detections)) {
      console.error("[ObjectDetection] Invalid response format");
      return [];
    }

    const detections = responseData.detections.map((det: any) => ({
      label: det.class_name,
      confidence: parseFloat((det.confidence * 100).toFixed(2)),
      bbox: det.bbox,
    }));

    console.log("[ObjectDetection] Success:", detections);
    return detections;

  } catch (error: any) {
    console.error("[ObjectDetection] Runtime error:", error.message);
    return [];
  }
};

const detectFakeIssue = async ({
  userInput,
  projectDetails,
  detectionResults,
}: {
  userInput: any;
  projectDetails: ProjectDetails | null;
  detectionResults: DetectionResult[];
}): Promise<FakeDetectionResult> => {
  if (!projectDetails) {
    return {
      isFake: true,
      reason: "No matching project found within valid radius of proposed work site.",
    };
  }

  // Potential for additional checks (e.g. comparing detected objects with expected project work)
  return {
    isFake: false,
    reason: "Project site matches reported location.",
  };
};

const buildPrompt = ({
  projectDetails,
  detectionResults,
  fakeDetection,
  userInput,
}: any) => {
  const projectDetailsText = projectDetails
    ? JSON.stringify(projectDetails, null, 2)
    : "No matching project found.";

  return `
Analyze the following infrastructure RTI request based on the provided data.

PROJECT DETAILS (PROXIMITY MATCH):
${projectDetailsText}

OBJECT DETECTION RESULTS (FROM PROVIDED MEDIA):
${JSON.stringify(detectionResults, null, 2)}

FAKE DETECTION RESULT:
${JSON.stringify(fakeDetection, null, 2)}

USER QUESTION/INPUT:
${JSON.stringify(userInput, null, 2)}

TASK:
1. Determine the overall risk level ('Low', 'Medium', 'High', 'Critical').
2. List any discrepancies or anomalies found during the analysis as an array of strings.
3. Provide a final, conclusive verdict on the RTI query.

STRICT OUTPUT FORMAT (JSON ONLY):
{
  "ai_risk_level": "<risk_level>",
  "ai_discrepancies": ["discrepancy 1", "discrepancy 2"],
  "ai_verdict": "<conclusive_verdict>"
}
`;
};

const storeAIResults = async (
  rtiId: string,
  aiSummary: AISummary,
  fakeDetection: any,
  detectionResults: any
) => {
  try {
    console.log("[DBUpdate] Updating RTI with AI results:", rtiId);

    const ai_details = {
      ai_risk_level: aiSummary.ai_risk_level || null,
      ai_discrepancies: aiSummary.ai_discrepancies || [],
      ai_verdict: aiSummary.ai_verdict || null,
      ai_fake: fakeDetection?.isFake ?? false,
      ai_detection: detectionResults || [],
      processed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("rti_requests")
      .update({ ai_details })
      .eq("id", rtiId)
      .select();

    if (error) {
      console.error("[DBUpdate] Error:", error);
      throw error;
    }

    console.log("[DBUpdate] Success:", data);

  } catch (err) {
    console.error("[DBUpdate] Unexpected update error:", err);
  }
};

const generateAISummary = async ({
  projectDetails,
  detectionResults,
  fakeDetection,
  userInput,
}: {
  projectDetails: any;
  detectionResults: any[];
  fakeDetection: any;
  userInput: any;
}): Promise<AISummary> => {
  try {
    const prompt = buildPrompt({
      projectDetails,
      detectionResults,
      fakeDetection,
      userInput,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an AI system for civic RTI verification. Analyze the data and return JSON output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);

  } catch (error) {
    console.error("Groq AI Error:", error);
    return {
      ai_risk_level: "Error",
      ai_discrepancies: ["Failed to generate summary."],
      ai_verdict: "An error occurred during AI analysis.",
    };
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const rtiId = formData.get("rtiId") as string;
    const userId = formData.get("userId") as string;
    const userInput = JSON.parse((formData.get("userInput") as string) || "{}");
    const imageFile = formData.get("image") as File;

    validateRequest({ rtiId, userId });

    // RTI might benefit from location-based verification even without image, 
    // but the user's flow includes "image detection".

    // 1. Get RTI location
    const { latitude, longitude } = await getRTILocation(rtiId);

    // 2. Find matching project
    const projectDetails = await findMatchingProject(latitude, longitude);

    // 3. Image Detection
    let detectionResults: DetectionResult[] = [];
    if (imageFile) {
      detectionResults = await runObjectDetection(imageFile);
    }

    // 4. Fake Detection logic
    const fakeDetection = await detectFakeIssue({
      userInput,
      projectDetails,
      detectionResults,
    });

    // 5. Build AI Summary
    const aiSummary = await generateAISummary({
      projectDetails,
      detectionResults,
      fakeDetection,
      userInput,
    });

    // 6. Store results in ai_details column
    await storeAIResults(rtiId, aiSummary, fakeDetection, detectionResults);

    return NextResponse.json({
      success: true,
      data: {
        detectionResults,
        fakeDetection,
        aiSummary,
      },
    });

  } catch (error: any) {
    console.error("RTI AI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
