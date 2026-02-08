import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, imageBase64, language } = await req.json();

    // If image is provided, use Pl@ntNet API for disease detection
    if (imageBase64) {
      const plantnetResult = await identifyWithPlantNet(imageBase64);
      const aiResponse = await generateFarmerResponse(plantnetResult, message, language);
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Text-only: use Lovable AI for general farming chat
    const aiResponse = await chatWithAI(message, language);
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("farming-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function identifyWithPlantNet(imageBase64: string): Promise<string> {
  const PLANTNET_API_KEY = Deno.env.get("PLANTNET_API_KEY");
  if (!PLANTNET_API_KEY) throw new Error("PLANTNET_API_KEY is not configured");

  // Convert base64 to blob for multipart upload
  const binaryString = atob(imageBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  const blob = new Blob([bytes], { type: "image/jpeg" });
  formData.append("images", blob, "plant.jpg");
  formData.append("organs", "leaf");

  // First try disease identification
  const diseaseUrl = `https://my-api.plantnet.org/v2/diseases/identify?api-key=${PLANTNET_API_KEY}`;
  let diseaseResult = null;

  try {
    const diseaseResp = await fetch(diseaseUrl, {
      method: "POST",
      body: formData,
    });
    if (diseaseResp.ok) {
      diseaseResult = await diseaseResp.json();
    } else {
      const errText = await diseaseResp.text();
      console.error("Pl@ntNet disease API error:", diseaseResp.status, errText);
    }
  } catch (err) {
    console.error("Pl@ntNet disease API call failed:", err);
  }

  // Also try plant species identification
  const formData2 = new FormData();
  const blob2 = new Blob([bytes], { type: "image/jpeg" });
  formData2.append("images", blob2, "plant.jpg");
  formData2.append("organs", "leaf");

  const speciesUrl = `https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&lang=en&api-key=${PLANTNET_API_KEY}`;
  let speciesResult = null;

  try {
    const speciesResp = await fetch(speciesUrl, {
      method: "POST",
      body: formData2,
    });
    if (speciesResp.ok) {
      speciesResult = await speciesResp.json();
    } else {
      const errText = await speciesResp.text();
      console.error("Pl@ntNet species API error:", speciesResp.status, errText);
    }
  } catch (err) {
    console.error("Pl@ntNet species API call failed:", err);
  }

  // Build summary from Pl@ntNet results
  let summary = "";

  if (speciesResult?.results?.length > 0) {
    const topSpecies = speciesResult.results[0];
    const confidence = Math.round((topSpecies.score || 0) * 100);
    const plantName = topSpecies.species?.scientificNameWithoutAuthor || "Unknown";
    const commonNames = topSpecies.species?.commonNames?.join(", ") || "N/A";

    if (confidence < 30) {
      return "UNCLEAR_IMAGE";
    }

    summary += `Plant identified: ${plantName} (${commonNames})\nConfidence: ${confidence}%\n`;
  }

  if (diseaseResult?.results?.length > 0) {
    const topDisease = diseaseResult.results[0];
    const diseaseConfidence = Math.round((topDisease.score || 0) * 100);
    const diseaseName = topDisease.disease?.label || topDisease.label || "Unknown disease";

    if (diseaseConfidence < 30) {
      summary += "\nDisease detection: Confidence too low to determine disease reliably.";
    } else {
      summary += `\nDisease detected: ${diseaseName}\nDisease confidence: ${diseaseConfidence}%`;
    }
  } else {
    summary += "\nNo disease detected based on Pl@ntNet analysis.";
  }

  if (!summary) {
    return "NO_RESULTS";
  }

  return summary;
}

async function generateFarmerResponse(
  plantnetResult: string,
  userMessage: string,
  language: string
): Promise<string> {
  if (plantnetResult === "UNCLEAR_IMAGE") {
    const langMessages: Record<string, string> = {
      english: "The image is unclear. Please upload a clear photo of the affected leaf in good lighting.",
      hindi: "छवि स्पष्ट नहीं है। कृपया अच्छी रोशनी में प्रभावित पत्ती की एक स्पष्ट तस्वीर अपलोड करें।",
      tamil: "படம் தெளிவாக இல்லை. பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தை நல்ல வெளிச்சத்தில் பதிவேற்றவும்.",
    };
    return langMessages[language] || langMessages.english;
  }

  if (plantnetResult === "NO_RESULTS") {
    return "Could not identify the plant from the image. Please upload a clearer photo of the leaf.";
  }

  // Use Lovable AI to generate a farmer-friendly response based on Pl@ntNet data
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const languageMap: Record<string, string> = {
    english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
    kannada: "Kannada", bengali: "Bengali", marathi: "Marathi",
    gujarati: "Gujarati", malayalam: "Malayalam", punjabi: "Punjabi", odia: "Odia",
  };
  const langName = languageMap[language] || "English";

  const systemPrompt = `You are KisanMitra, an AI farming assistant for Indian farmers. Respond in ${langName} language.

Based ONLY on the following Pl@ntNet analysis results, provide a farmer-friendly response:

${plantnetResult}

Your response must include:
1. Plant name and disease name (if detected)
2. Disease cause (if disease detected)
3. Basic prevention steps
4. Safe treatment advice (both organic and chemical if relevant)
5. Add this warning: "Consult a local agriculture officer before heavy chemical use."

If no disease is detected, say: "No disease detected based on Pl@ntNet analysis." and give general care tips for the identified plant.

Be respectful and encouraging. Keep it practical for farmers.
User's additional question: ${userMessage}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage || "Please analyze the plant image results." },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error("AI service error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Unable to generate response.";
}

async function chatWithAI(message: string, language: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const languageMap: Record<string, string> = {
    english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
    kannada: "Kannada", bengali: "Bengali", marathi: "Marathi",
    gujarati: "Gujarati", malayalam: "Malayalam", punjabi: "Punjabi", odia: "Odia",
  };
  const langName = languageMap[language] || "English";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are KisanMitra, an AI farming assistant specializing in Indian agriculture. Respond in ${langName} language. Provide helpful, practical advice about farming, crops, weather, pest control, fertilizers, and agricultural practices. Keep responses concise and farmer-friendly.`,
        },
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error("AI service error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Unable to generate response.";
}
