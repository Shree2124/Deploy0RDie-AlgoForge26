import { groq } from "@/lib/groq/client";
import { supabase } from "@/lib/supabase/client";
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
  issueId,
  citizenId,
}: {
  issueId: string;
  citizenId: string;
}) => {
  if (!issueId || !citizenId) {
    throw new Error("Missing required parameters: issueId or citizenId");
  }
};

const getReportLocation = async (issueId: string): Promise<{ latitude: number; longitude: number }> => {
  const { data, error } = await supabase
    .from("citizen_reports")
    .select("latitude, longitude")
    .eq("id", issueId)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch location for issue ${issueId}:`, error);
    throw new Error("Could not find location for the specified issue.");
  }

  return { latitude: data.latitude, longitude: data.longitude };
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
  console.log(
    `[ProjectMatching] Report location: { lat: ${reportLat}, lon: ${reportLon} }`
  );

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*");

  if (error || !projects) {
    console.error("[ProjectMatching] Error fetching projects:", error);
    throw new Error("Failed to fetch projects for location matching.");
  }

  console.log(
    `[ProjectMatching] Found ${projects.length} projects to check.`
  );

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

    console.log(
      `[ProjectMatching] Checking '${project.id}': ${distance.toFixed(
        2
      )} meters (${(distance / 1000).toFixed(3)} km)`
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestProject = project;
    }
  }

  if (closestProject) {
    console.log(
      `[ProjectMatching] Closest project: '${closestProject.id}' at ${minDistance.toFixed(
        2
      )} meters`
    );
  }

  
  const RADIUS = 70;

  if (closestProject && minDistance <= RADIUS) {
    console.log(
      `Match found: '${closestProject.id}' within ${RADIUS}m`
    );
    return closestProject;
  }

  console.warn(
    `No project within ${RADIUS}m. Closest was ${minDistance.toFixed(
      2
    )}m`
  );

  return null;
};

const verifyCitizen = async (citizenId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", citizenId)
    .single();

  console.log(data);

  if (error) {
    console.error(`Error fetching citizen ${citizenId}:`, error);
    throw new Error("Could not verify citizen status.");
  }

  if (!data || data.verification_status !== "Approved") {
    throw new Error("Citizen is not verified.");
  }

  console.log(`Citizen ${citizenId} is verified.`);
};

const runObjectDetection = async (imageFile: File): Promise<DetectionResult[]> => {
  const SERVICE_URL = "http://127.0.0.1:8000/predict";

  try {
    if (!imageFile || !(imageFile instanceof File)) {
      console.warn("[ObjectDetection] Invalid image input");
      return [];
    }

    console.log("[ObjectDetection] Sending request to ML service...");

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(SERVICE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("[ObjectDetection] ML service error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      throw new Error(`ML Service Error: ${response.status} ${response.statusText}`);
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error("[ObjectDetection] Failed to parse JSON:", parseError);
      throw new Error("Invalid JSON response from ML service");
    }

    if (!responseData || !Array.isArray(responseData.detections)) {
      console.error("[ObjectDetection] Unexpected response format:", responseData);
      throw new Error("Invalid detection response format");
    }

    const detections = responseData.detections.map((det: any) => ({
      label: det.class_name,
      confidence: parseFloat((det.confidence * 100).toFixed(2)), // Convert to percentage
      bbox: det.bbox,
    }));

    console.log("[ObjectDetection] Success:", detections);

    return detections as DetectionResult[];

  } catch (error: any) {
    // 6. Catch Network / Runtime Errors
    console.error("[ObjectDetection] Error occurred:", {
      message: error.message,
      stack: error.stack,
    });

    // Fail gracefully (important for pipeline)
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
  console.log("[FakeDetection] Running with projectDetails:", projectDetails);

  if (!projectDetails) {
    console.log("[FakeDetection] Flagging as fake: No matching project found.");
    return {
      isFake: true,
      reason: "No matching project found within a 50-meter radius.",
    };
  }

  // TODO: Add more sophisticated checks, e.g., comparing user input with project scope.

  console.log("[FakeDetection] No fake indicators found.");
  return {
    isFake: false,
    reason: "",
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
Analyze the following infrastructure issue based on the provided data.

PROJECT DETAILS:
${projectDetailsText}

OBJECT DETECTION RESULTS:
${JSON.stringify(detectionResults, null, 2)}

FAKE DETECTION RESULT:
${JSON.stringify(fakeDetection, null, 2)}

USER INPUT:
${JSON.stringify(userInput, null, 2)}

TASK:
1. Determine the overall risk level ('Low', 'Medium', 'High', 'Critical').
2. List any discrepancies or anomalies found during the analysis as an array of strings.
3. Provide a final, conclusive verdict on the issue.

STRICT OUTPUT FORMAT (JSON ONLY):
{
  "ai_risk_level": "<risk_level>",
  "ai_discrepancies": ["discrepancy 1", "discrepancy 2"],
  "ai_verdict": "<conclusive_verdict>"
}
`;
};

const storeAIResults = async (
  issueId: string,
  aiSummary: AISummary,
  fakeDetection: any,
  detectionResults: any
) => {
  try {
    console.log("[DB] Updating issue:", issueId);
    const { data: issueData, error: issueError } = await supabase.from("citizen_reports").select("*").eq("id", issueId).single();
    if (issueError) {
      console.error("[DB] Failed to fetch issue:", issueError);
      throw issueError;
    }
    console.log("[DB] Issue data:", issueData);

    const { data, error } = await supabase
      .from("citizen_reports")
      .update({
        ai_risk_level: aiSummary.ai_risk_level || null,
        ai_discrepancies: aiSummary.ai_discrepancies || null,
        ai_verdict: aiSummary.ai_verdict || null,
        ai_fake: fakeDetection?.isFake ?? false, 
        ai_detection: detectionResults || null,
      })
      .eq("id", issueId)
      .select(); 

    if (error) {
      console.error("[DB] Update failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("[DB] No rows updated. Possible reasons:");
      console.warn("- Invalid issueId");
      console.warn("- RLS blocking update");
      console.warn("- Row does not exist");
    } else {
      console.log("[DB] Update success:", data);
    }

  } catch (err) {
    console.error("[DB] Unexpected error:", err);
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
      model: "llama-3.1-8b-instant", // fast + powerful
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are an AI system for civic infrastructure monitoring.
Analyze the data and return structured JSON output only.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" }, // strict JSON output
    });

    const content = response.choices[0]?.message?.content || "{}";

    return JSON.parse(content);

  } catch (error) {
    console.error("Groq AI Error:", error);

    return {
      ai_risk_level: "Error",
      ai_discrepancies: ["Failed to generate AI summary."],
      ai_verdict: "An error occurred during analysis.",
    };
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const issueId = formData.get("issueId") as string;
    const citizenId = formData.get("citizenId") as string;
    const userInput = JSON.parse((formData.get("userInput") as string) || "{}");
    const imageFile = formData.get("image") as File;

    validateRequest({ issueId, citizenId });

    if (!imageFile) {
      throw new Error("Image file is required.");
    }

    
    const { latitude, longitude } = await getReportLocation(issueId);

    
    const projectDetails = await findMatchingProject(latitude, longitude);

    
    const detectionResults = await runObjectDetection(imageFile);

    
    const fakeDetection = await detectFakeIssue({
      userInput,
      projectDetails,
      detectionResults,
    });
    console.log("[Main] Fake detection result:", fakeDetection);

    
    const aiSummary = await generateAISummary({
      projectDetails,
      detectionResults,
      fakeDetection,
      userInput,
    });

    
    await storeAIResults(issueId, aiSummary, fakeDetection, detectionResults );

    return NextResponse.json({
      success: true,
      data: {
        detectionResults,
        fakeDetection,
        aiSummary,
      },
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};