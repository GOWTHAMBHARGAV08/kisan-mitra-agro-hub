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
    const { message, imageBase64, language, mode } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    // mode: "analyze" for plant health analyzer, default for chatbot
    if (mode === "analyze" && imageBase64) {
      const result = await analyzePlantImage(GROQ_API_KEY, imageBase64, message);
      return new Response(JSON.stringify({ response: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (imageBase64) {
      const result = await chatWithImage(GROQ_API_KEY, imageBase64, message, language);
      return new Response(JSON.stringify({ response: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await chatWithAI(GROQ_API_KEY, message, language);
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

async function callGroq(apiKey: string, messages: any[], model = "llama-3.3-70b-versatile"): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq API error:", response.status, errText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    throw new Error("AI service error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Unable to generate response.";
}

async function callGroqVision(apiKey: string, messages: any[]): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.2-90b-vision-preview",
      messages,
      temperature: 0.5,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq Vision API error:", response.status, errText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    throw new Error("AI vision service error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Unable to generate response.";
}

async function analyzePlantImage(apiKey: string, imageBase64: string, userMessage?: string): Promise<string> {
  const systemPrompt = `You are an expert plant pathologist AI for Indian farmers. Analyze the plant image and return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "plantName": "name of the plant",
  "status": "healthy" or "diseased" or "pest" or "nutrient_deficiency",
  "confidence": number 0-100,
  "description": "detailed description of observations",
  "diseaseDetected": "disease name if any, or null",
  "recommendations": ["treatment 1", "treatment 2", "treatment 3"],
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
  "severity": "low" or "medium" or "high" (only if not healthy, otherwise null)
}

Focus on plant diseases, pest damage, nutrient deficiencies, and overall health. Provide treatments suitable for Indian farming conditions. Always add: "Consult a local agriculture officer before heavy chemical use." as a precaution.`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: userMessage || "Please analyze this plant image for diseases and health issues." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    },
  ];

  return await callGroqVision(apiKey, messages);
}

async function chatWithImage(apiKey: string, imageBase64: string, message: string, language: string): Promise<string> {
  const languageMap: Record<string, string> = {
    english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
    kannada: "Kannada", bengali: "Bengali", marathi: "Marathi",
    gujarati: "Gujarati", malayalam: "Malayalam", punjabi: "Punjabi", odia: "Odia",
  };
  const langName = languageMap[language] || "English";

  const messages = [
    {
      role: "system",
      content: `You are KisanMitra, an AI farming assistant for Indian farmers. Respond in ${langName} language. Analyze any plant/crop images shared and provide helpful, practical farming advice. If disease is detected, provide cause, prevention, and treatment. Always add: "Consult a local agriculture officer before heavy chemical use."`,
    },
    {
      role: "user",
      content: [
        { type: "text", text: message || "Please analyze this image" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    },
  ];

  return await callGroqVision(apiKey, messages);
}

async function chatWithAI(apiKey: string, message: string, language: string): Promise<string> {
  const languageMap: Record<string, string> = {
    english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
    kannada: "Kannada", bengali: "Bengali", marathi: "Marathi",
    gujarati: "Gujarati", malayalam: "Malayalam", punjabi: "Punjabi", odia: "Odia",
  };
  const langName = languageMap[language] || "English";

  const messages = [
    {
      role: "system",
      content: `You are KisanMitra, an AI farming assistant specializing in Indian agriculture. Respond in ${langName} language. Provide helpful, practical advice about farming, crops, weather, pest control, fertilizers, and agricultural practices. Keep responses concise and farmer-friendly.`,
    },
    { role: "user", content: message },
  ];

  return await callGroq(apiKey, messages);
}
