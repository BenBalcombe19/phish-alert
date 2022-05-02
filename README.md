# Phish Alert

Phish Alert is a free open-source anti-phishing Chrome extension for gmail using the <a href="https://github.com/KartikTalwar/gmail.js/">gmail.js</a> library. You can install and use Phish Alert direct from the Chrome Web Store by clicking <a href="https://chrome.google.com/webstore/detail/phish-alert/plmmadcoagfaddabkjcolnplkfddbglp">here</a>.

In order to download and run the code locally, the following instructions will instruct you to do so.
 

## Get Started

  

First get the code and build it:


```
# Get code
git clone https://github.com/BenBalcombe19/phish-alert

# Navigate to the directory
cd gmailjs-node-boilerplate

# ensure you're running latest version of node!
npm update

# Install dependencies and build
npm install
npm run dev
```

Now ensure the code loads and works:

- Open a new chrome browser window and go to `chrome://extensions/`.
- Click the 'Load unpacked' button in the top left and load the 'dist' folder containing the extension (`manifest.json`) in your browser.
-   Load  `mail.google.com`  in your browser and open an email. Click the jigsaw icon in the top right and click the extension icon and a popup should appear with information on the current email.


If that works, you should now be ready to customise the extension-code. Do this by editing the `extensionInjector.js`,`extension.js` and `popup.js` files.





