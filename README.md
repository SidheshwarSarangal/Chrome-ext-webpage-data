# Chrome-ext-webpage-data

This is a chrome extension which allows the user to extract data from a webpage(the text and images of that page) and convert them into readable form and download as a txt file.

To run it,
-> just clone this repository
-> go to chrome browser and to extension settings
-> turn on developer button
-> load this repo to chrome
-> go to a website page
-> click on the extensions button on the top right
-> Click "My Chrome Extension"
-> Click "Get Info!!!!"

Then just wait, and the txt file will be downloaded.

#if there is problem
Run this command to delete the dist folder: rm -rf dist/
Then run this command to create the necessay bundle files of dist folder: npx webpack --config webpack.config.js
