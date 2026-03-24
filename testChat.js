const fetch = require('node-fetch');

async function testChat() {
    try {
        const res = await fetch('http://localhost:5000/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "hi",
                moodContext: "Student is currently feeling Happy.",
                history: [
                    { sender: "ai", text: "Hi! How are you?" }
                ]
            })
        });
        const text = await res.text();
        console.log(res.status, text);
    } catch (e) {
        console.error(e);
    }
}
testChat();
