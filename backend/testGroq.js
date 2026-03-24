const dotenv = require('dotenv');
dotenv.config();

async function testGroq() {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
        console.error("❌ ERROR: GROQ_API_KEY is not set in .env");
        return;
    }

    console.log("🚀 Testing Groq API (llama-3.1-8b-instant)...");

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are WellnessBuddy, a helpful assistant." },
                    { role: "user", content: "Hi! This is a test." }
                ],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errData}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        console.log("✅ SUCCESS! Groq replied:");
        console.log("-----------------------------------------");
        console.log(reply);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    }
}

testGroq();
