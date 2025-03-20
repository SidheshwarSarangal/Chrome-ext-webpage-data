document.addEventListener("DOMContentLoaded", () => {
    const processButton = document.getElementById("process-text");

    if (!processButton) {
        console.error("❌ Button not found! Check popup.html.");
        return;
    }

    processButton.addEventListener("click", async () => {
        console.log("🟢 Button clicked! Running text extraction & screenshot capture...");

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                console.error("❌ No active tab found.");
                return;
            }

            console.log(`📌 Using active tab ID: ${tab.id}`);

            // ✅ Inject content script only in the correct tab
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["dist/contentScript.bundle.js"]
            });

            console.log("✅ Content script injected successfully.");

            // Step 1: Run Text Extraction & AI Processing
            const aiResponse = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id, { type: "RUN_LOGIC" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("❌ AI error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError.message);
                    } else if (response && response.status === "done") {
                        console.log("🤖 AI Response:", response.aiResponse);
                        resolve(response.aiResponse);
                    } else {
                        console.error("❌ Unexpected AI response:", response);
                        reject("Unexpected AI response");
                    }
                });
            });

            // Step 2: Trigger Screenshot Capture
            chrome.runtime.sendMessage({ type: "START_FULL_PAGE_CAPTURE", tabId: tab.id }, (response) => {
                console.log("📥 Full-page capture started:", response);
                
            });

            

        } catch (error) {
            console.error("❌ Error:", error);
        }
    });


});

/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCREENSHOTS_READY") {
        console.log("📸 Full-page screenshots received:", message.images);

        message.images.forEach((img, index) => {
            console.log(`🖼️ Screenshot #${index + 1}:`, img);
        });

        sendResponse({ status: "received" });
    }
});
*/