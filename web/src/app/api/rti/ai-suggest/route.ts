import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
    try {
        const { department, subject, questions } = await request.json();

        if (!department || !subject) {
            return NextResponse.json(
                { error: "Department and Subject are required for AI suggestions." },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY is missing from environment variables.");
            return NextResponse.json(
                { error: "AI service is currently unavailable. Please inform the administrator to configure the Groq API key." },
                { status: 503 }
            );
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const formattedQuestions = questions && Array.isArray(questions) && questions.length > 0
            ? `Specifically formulate precise inquiries to address these points:\n${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
            : "";

        const systemPrompt = `You are an expert Indian Legal Assistant specializing in drafting formal requests under the Right to Information (RTI) Act, 2005.
Your task is to write a highly formal, polite, and legally valid RTI query body for a citizen. 
Do NOT include the sender/receiver address headers, subject line, or closing signatures. ONLY write the core body paragraphs of the application.
Start directly with "I, a citizen of India, kindly request the following information under section 6(1) of the Right to Information Act, 2005:". 
Keep it clear, concise, professional, and structured with bullet points if necessary.`;

        const userPrompt = `Draft the RTI query body for the following context:
Department: ${department}
Topic/Subject: ${subject}
${formattedQuestions}

Provide ONLY the main text. Do not output any meta-conversation or pleasantries.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama3-8b-8192",
            temperature: 0.3,
            max_tokens: 1024,
        });

        const suggestion = chatCompletion.choices[0]?.message?.content || "";

        if (!suggestion) {
            throw new Error("Groq returned an empty response.");
        }

        return NextResponse.json({ suggestion: suggestion.trim() });

    } catch (error: any) {
        console.error("Error generating RTI suggestion via Groq:", error);
        return NextResponse.json(
            { error: "Failed to generate AI suggestion", details: error.message },
            { status: 500 }
        );
    }
}
