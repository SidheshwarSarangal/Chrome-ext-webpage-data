import { fetchGroqResponse, analyzeVisualContent } from "./groqRequest.js";
import { jsPDF } from "jspdf";  // If using modules/webpack


let fileContent = "";  // Global variable to accumulate all data (text + images)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // 🔄 Handle text analysis from Groq AI
    if (message.type === "GET_GROQ_RESPONSE") {
        console.log("🔄 Fetching Groq AI response...");

        fetchGroqResponse(message.cleanedText).then(({ response, totalTokens }) => {
            console.log(`📊 Total Tokens Used: ${totalTokens}`);
            console.log(message.cleanedText);

            if (response) {
                // ✅ Append text analysis to global fileContent
                fileContent += `\n\n📝 Text Analysis Result:\n${response}\n\n`;
                sendResponse({ status: "success", response });
            } else {
                sendResponse({ status: "error", message: "Failed to fetch AI response" });
            }
        }).catch(error => {
            console.error("❌ Error fetching Groq response:", error);
            sendResponse({ status: "error", message: error.message });
        });

        return true; // ✅ Keep sendResponse open for async
    }

    // 📸 Trigger full page capture by forwarding the message to the content script
    if (message.type === "START_FULL_PAGE_CAPTURE") {
        console.log("📸 Received request to start full-page capture...");
        chrome.tabs.sendMessage(message.tabId, { type: "START_SCROLL_AND_CAPTURE" }, sendResponse);
        return true;
    }

    // 🖼️ Handle visual content extraction and analysis
    if (message.type === "VISUAL_CONTENT_EXTRACTED") {
        (async () => {
            console.log("🖼️ Received visual content from content script.");

            for (const imgObj of message.images) {
                if (imgObj.type === 'img' && imgObj.src.startsWith('http')) {
                    const result = await analyzeVisualContent(imgObj.src);
                    console.log(`🧠 AI Analysis Result for image: ${imgObj.src}`);
                    console.log(`🧠 Analysis: ${result.analysis}`);

                    if (
                        result.analysis &&
                        !result.analysis.includes('Error:') &&
                        result.analysis.trim() !== 'Nothing found'
                    ) {
                        fileContent += `\n\n🖼️ Visual Analysis for ${imgObj.src}:\n${result.analysis}\n\n`;
                    } else {
                        console.log(`⏩ Skipping image due to error or no useful analysis: ${imgObj.src}`);
                    }
                } else {
                    console.log('⏩ Skipping non-image or unsupported source:', imgObj);
                }
            }

            // ✅ Now that ALL text and images are processed, create the PDF
            const blob = new Blob([fileContent], { type: 'text/plain' });
            const reader = new FileReader();

            reader.onload = function () {
                chrome.downloads.download({
                    url: reader.result,  // ✅ Data URL for download
                    filename: 'ai_combined_analysis.txt',
                    saveAs: true
                }, () => {
                    console.log("✅ Final combined AI analysis file download triggered!");
                    // Optional: clear fileContent after download
                    // fileContent = '';
                });
            };

            reader.readAsDataURL(blob);  // ✅ Start conversion for download

            // ✅ Send completion response back
            sendResponse({ status: "analysis_complete" });
        })();

        return true; // ✅ Keeps the async sendResponse valid
    }

});
