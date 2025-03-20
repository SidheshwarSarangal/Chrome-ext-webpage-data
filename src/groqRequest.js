import Groq from "groq-sdk";

export async function fetchGroqResponse(pageText) {
    try {
        if (!pageText || pageText.trim() === "No text found on page.") {
            return { response: "No text found to get converted.", totalTokens: 0 };
        }


        const response = await fetch(chrome.runtime.getURL("config.json"));
        const config = await response.json();
        const API_KEY = config.API_KEY;

        if (!API_KEY) {
            console.error("❌ Groq API Key is missing!");
            return { response: "Error: Missing API Key in config.json", totalTokens: 0 };
        }


        const groq = new Groq({ apiKey: API_KEY });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Analyze the following page text:
                    1. Key facts/definitions
                    2. Relevant data/statistics
                    3. Clear insights and conclusions
                    
                    Text: ${pageText}`
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        return {
            response: completion.choices[0].message.content,
            totalTokens: completion.usage.total_tokens
        };
    } catch (error) {
        console.error("❌ Groq API Error:", error);
        return { response: `Error: ${error.message}`, totalTokens: 0 };
    }
}

async function convertImageUrlToBase64(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Base64 only
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export async function analyzeVisualContent(imageUrl) {
    try {
        // Load API Key from config
        const response = await fetch(chrome.runtime.getURL("config.json"));
        const config = await response.json();
        const API_KEY = config.API_KEY;

        if (!API_KEY) {
            console.error("❌ Groq API Key is missing!");
            return { analysis: "Error: Missing API Key" };
        }

        // Convert the image URL to base64
        const base64Image = await convertImageUrlToBase64(imageUrl);

        const groq = new Groq({ apiKey: API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `If the image contains a statistical graph, chart, or data visualization, analyze the data and provide ONLY the key conclusions or insights as clear, vertical bullet points (one per line). 
                            - Do NOT describe the chart, bars, colors, or general appearance. 
                            - Do NOT write conclusions in a horizontal paragraph. 
                            - If no statistical data is present, just respond with 'nothing found' and nothing else.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: 1024
        });

        return {
            analysis: chatCompletion.choices[0].message.content
        };
    } catch (error) {
        console.error("❌ Error analyzing visual content with Groq:", error);
        return { analysis: `Error: ${error.message}` };
    }
}