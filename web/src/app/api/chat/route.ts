import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 512,
        });

        const responseText = completion.choices[0]?.message?.content || 'No response from AI.';

        return NextResponse.json({ text: responseText });
    } catch (error: any) {
        console.error('Groq API Error:', error);
        return NextResponse.json({
            error: 'Failed to communicate with AI',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
