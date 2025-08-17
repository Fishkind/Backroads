// This is the Service Worker file (sw.js)
self.addEventListener('message', async (event) => {
    const { type, payload } = event.data;
    const apiKey = ""; // Canvas provides this automatically
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    if (type === 'GENERATE_SUGGESTIONS') {
        const { city, prompt } = payload;
        try {
            const apiPayload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "text/plain" },
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions found.";
            
            event.source.postMessage({ type: 'SUGGESTIONS_RESULT', payload: { city, text } });

        } catch (error) {
            event.source.postMessage({ type: 'SUGGESTIONS_RESULT', payload: { city, error: error.message } });
        }
    } else if (type === 'GENERATE_AUDIO') {
        const { day, prompt } = payload;
        try {
            const apiPayload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
                },
                model: "gemini-2.5-flash-preview-tts"
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            
            event.source.postMessage({ type: 'AUDIO_RESULT', payload: { audioData: part?.inlineData?.data, mimeType: part?.inlineData?.mimeType } });

        } catch (error) {
            event.source.postMessage({ type: 'AUDIO_RESULT', payload: { error: error.message } });
        }
    }
});
