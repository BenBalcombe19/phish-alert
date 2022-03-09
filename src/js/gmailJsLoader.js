"use strict";

const GmailFactory = require("gmail-js");
const jQuery = require("jquery");
// const phishing = require('./phishing.js');

window._gmailjs = window._gmailjs || new GmailFactory.Gmail(jQuery);
// window.phishing = new phishing();
