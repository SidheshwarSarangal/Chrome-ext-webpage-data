# 🚀 Chrome-ext-webpage-data

> 📢 **License Notice:** This code is copyrighted © 2025 Sidheshwar Sarangal.  
> All rights reserved. No part of this repository may be copied, used, modified, or distributed without **explicit written permission**.  
> For inquiries, contact sidheshwar.sarangal@gmail.com.

---

**Chrome-ext-webpage-data** is a simple and powerful Chrome extension that allows users to extract **text and images** from any webpage, convert them into a readable format, and **download the content as a `.txt` file**.

---

## 📦 Features

- 📝 Extracts all visible text and images from the current webpage  
- 📁 Converts extracted data into a plain text format  
- ⬇️ Automatically downloads the result as a `.txt` file  
- ⚡️ Lightweight, fast, and easy to use

---

## 🛠️ How to Use

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/chrome-ext-webpage-data.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right corner)
4. Click **"Load unpacked"** and select the cloned project folder
5. Navigate to any webpage you'd like to extract data from
6. Click the **Extensions** icon (puzzle piece) in the top-right corner of Chrome
7. Select **"My Chrome Extension"**
8. Click the **"Get Info!!!!"** button

✨ Wait a moment — a `.txt` file with the extracted content will be automatically downloaded!

---

## 🧹 Troubleshooting

If you're facing issues with the extension not working or the `dist` folder missing, try the following:

```bash
# Remove the old 'dist' folder
rm -rf dist/

# Rebuild the extension bundle
npx webpack --config webpack.config.js
```

---

## 📌 Note

Make sure you have `Node.js` and `Webpack` installed globally if you're rebuilding the project manually.
