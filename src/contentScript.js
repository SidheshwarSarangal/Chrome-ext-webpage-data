import html2canvas from "html2canvas";
async function captureFullPage() {
    console.log("📸 Starting smart visual content extraction...");

    const totalHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    let currentPosition = 0;

    const uniqueImages = new Set();

    while (currentPosition < totalHeight) {
        window.scrollTo(0, currentPosition);
        await new Promise(resolve => setTimeout(resolve, 800)); // Allow render

        const visualElements = [...document.querySelectorAll('img, canvas, .chartjs, .highcharts-container, .plotly')]
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            });

        if (visualElements.length > 0) {
            console.log(`📸 Visual content detected at ${currentPosition}, extracting...`);

            for (let el of visualElements) {
                if (el.tagName === 'IMG') {
                    // Ensure uniqueness by src
                    uniqueImages.add(JSON.stringify({
                        type: 'img',
                        src: el.src
                    }));
                } else if (el.tagName === 'CANVAS') {
                    // Use dataURL for uniqueness
                    uniqueImages.add(JSON.stringify({
                        type: 'canvas',
                        dataURL: el.toDataURL()
                    }));
                }
            }
        } else {
            console.log(`⏩ Skipping ${currentPosition}, no visual content.`);
        }

        currentPosition += viewportHeight;
    }

    window.scrollTo(0, 0);
    console.log("✅ Finished extracting visual content.");

    // Convert the Set to array of objects
    const images = Array.from(uniqueImages).map(item => JSON.parse(item));

    // ✅ Send to background
    chrome.runtime.sendMessage({ type: "VISUAL_CONTENT_EXTRACTED", images });
}


function cleanWebPageText(rawText) {
    return rawText
        // Remove common navigation or UI sections
        .replace(/(?:^|\n)(Skip to content|English|Select a language|High Contrast|Customer Support|Contact Sales|Log in|About|Products|Solutions|Pricing|Resources|Start free or get a demo)(?:\n|$)/gi, '')
        
        // Remove social media references
        .replace(/\b(facebook|linkedin|twitter|instagram|youtube|pinterest)\b/gi, '')
        
        // Remove CTAs and promotional repeated lines
        .replace(/Download (HubSpot|Report|Now|the Report).*?\n/gi, '')
        .replace(/(Scroll (Right|Left)|Click here|Get Started|Learn More|Start Now)/gi, '')
        
        // Remove common page headers/footers (generalized)
        .replace(/^\s*(Home|Terms of Service|Privacy Policy|Contact Us|Subscribe|Unsubscribe|Sitemap)\s*$/gim, '')
        
        // Remove any generic repetitive phrases often useless for LLM analysis
        .replace(/(?:\n|\s)(All rights reserved|Copyright.*?(\d{4})?|©\s*\d{4}).*/gi, '')
        
        // Remove extra newlines or spaces
        .replace(/\n{2,}/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "RUN_LOGIC") {
        console.log("📄 Extracting page text...");

        let pageText = document.body.innerText || "No text found on page.";
        const cleanedText = cleanWebPageText(pageText);
        console.log(cleanedText);
        


        chrome.runtime.sendMessage({ type: "GET_GROQ_RESPONSE", cleanedText }, (response) => {
            if (response && response.status === "success") {
                console.log("🤖 AI Response:", response.response);
                sendResponse({ status: "done", aiResponse: response.response });
            } else {
                console.error("❌ Error fetching AI response:", response?.message);
                sendResponse({ status: "error", error: response?.message });
            }
        });

        return true;
    }

    if (message.type === "START_SCROLL_AND_CAPTURE") {
        captureFullPage();
        sendResponse({ status: "started" });
    }
});
