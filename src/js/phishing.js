var Sentiment = require('sentiment');
var sentiment = new Sentiment();
const emojiTree = require('emoji-tree');
const parser = require('tld-extract');

class Phishing {
    constructor(){
        this.overallRating = 1;
        this.riskRatings = {
            address: 1,
            name: 1,
            subject: 1,
        }
        this.linkArray = [];
        this.attachmentArray = [];
        this.specialCharacterRegex = new RegExp('[!#$+:;%^&*(){}|<>\-]');
    }

    calculateOverallRating(){
        let elementCounter = 0;
        let riskTotal = 0;

        Object.values(this.riskRatings).forEach(value => {
            riskTotal += value;
            elementCounter++;
        })

        if (this.linkArray.length !=0){
            this.linkArray.forEach(link => {
                riskTotal += link.riskRating
                elementCounter++;
            })
        }

        if (this.attachmentArray.length !=0){
            this.attachmentArray.forEach(attachment => {
                riskTotal += attachment.riskRating
                elementCounter++;
            })
        }

        this.overallRating = Math.ceil(riskTotal / elementCounter)
    }

    validateAddress(address){

    }

    validateName(fromName){
        let containsSpecialCharacter = this.specialCharacterRegex.test(fromName);
        let emojiCount = this._emojiCount(fromName);

        if (containsSpecialCharacter && emojiCount){
            this.riskRatings.name = 5;
        } else if(containsSpecialCharacter){
            this.riskRatings.name = 4;
        } else if(emojiCount > 1){
            this.riskRatings.name = 4;
        }
    }
    
    validateSubject(subject, userEmail){
        let urgencyCounter = 0;
        let urgencyWords = ["now","hurry","quick","limited","urgent","urgently","important",'required'];
        let tokenisedSubject = subject ? subject.toLowerCase().split(" ") : [];
        let containsSpecialCharacter = this.specialCharacterRegex.test(subject);
        let username = userEmail.split('@')[0];
        
        tokenisedSubject.forEach(word => {
            if (urgencyWords.includes(word)){
                urgencyCounter++;
            }
        });
    
        if (containsSpecialCharacter){
            if (urgencyCounter < 2){
                this.riskRatings.subject = 4;
            }  else {
                this.riskRatings.subject = 5;
            }
        } else  if(urgencyCounter != 0){
            if (urgencyCounter == 1){
                this.riskRatings.subject = 3;
            } else if (urgencyCounter == 2){
                this.riskRatings.subject = 4;
            } else {
                this.riskRatings.subject = 5;
            }
        } else if(subject.includes(username)){
            this.riskRatings.subject = 5;
        } else if (this._emojiCount(subject) > 1){
            this.riskRatings.subject = 4;
        }
        // var result = sentiment.analyze(subject);
        // console.log("Sentiment result:",result);
    }
    
    validateBody(body, senderAddress){
        let AnchorTagArray = this._getAnchorTags(body);

        AnchorTagArray.forEach(anchorTag => {
            let isValidHost,isLinkTextDisparity,isSenderDomainDisparity;
            let riskRating = 1;

            // Loop through all links that contain link text and a href attribute
            if (anchorTag.innerText.trim().length != 0 && anchorTag.href.trim().length != 0 && !anchorTag.href.includes('mailto')){

                isValidHost = this._isValidHost(anchorTag.hostname)
                isLinkTextDisparity = this._isLinkTextDisparity(anchorTag.href, anchorTag.innerText)
                isSenderDomainDisparity = this._isSenderDomainDisparity(senderAddress, anchorTag.hostname)
                riskRating = this._calculateLinkRating(isSenderDomainDisparity,isLinkTextDisparity, isValidHost)

                this.linkArray.push({
                    href: anchorTag.href,
                    hostname: anchorTag.hostname,
                    innerText: anchorTag.innerText.replace(/(\r\n|\n|\r)/gm, ""), // Remove all line breaks
                    riskRating : riskRating,
                    senderDomainDisparity: isSenderDomainDisparity
                })
            }
        })
        
        // return this.linkArray
    }

    validateAttachments(attachments){
        attachments.forEach(attachment => {
            this.attachmentArray.push({
                fileName: attachment.name,
                size: attachment.size,
                type: attachment.type,
                riskRating: this._fileTypeRating(attachment.name)
            })
        })
        
        // return this.attachmentArray
    }
    
    //************************************************//
    ////// NAME/SUBJECT EVALUATION HELPER METHODS //////
    //************************************************//

    _emojiCount(string){
        let emojiCount = 0;
        for (let character of emojiTree(string)){
            if(character.type == 'emoji'){
                emojiCount++;
            }
        } 
        return emojiCount;
    }
    
    //************************************************//
    ////////// LINK EVALUATION HELPER METHODS //////////
    //************************************************//

    // Returns an array of all anchor tags in the email DOM
    _getAnchorTags(htmlString){
        // Create dummy DOM element so that getElementsByTagName() 
        // can be used to scrape all anchor tags into HTML Collection

        let el = document.createElement( 'html' );
        el.innerHTML = htmlString;

        return Array.from(el.getElementsByTagName( 'a' ));
    }

    // Returns true if domain is an ip address
    _isValidHost(domain){
        let regex = new RegExp('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$');
        let isIPAddress = regex.test(domain);

        return isIPAddress ? false : true; // If link domain is an ipAddress then return 5 as risk rating, else 1   
    }

    // Returns true if the link text is a url and does not match the href of the link
    _isLinkTextDisparity(href,linkText){
        if (this._isValidUrl(linkText)){
            if (href != linkText){
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    // Returns true if the sender domain ie google.com from accounts@google.com doesn't match the domains in the links
    _isSenderDomainDisparity(senderAddress, hostname){
        let address = senderAddress.split('@').pop();

        try {
            let senderDomain = parser.parse_host(address, {allowUnknownTLD : true}).domain;
    
            return senderDomain != parser.parse_host(hostname, {allowUnknownTLD : true}).domain ? true : false;
        } catch{
            console.log('errored', senderAddress,hostname)
            return false;
        }
    }

    // Returns true if the link text is a valid URL
    _isValidUrl(linkText) {
        let url;
        
        try {
            url = new URL(linkText);
        } catch (_) {
            return false;  
        }
      
        return url.protocol === "http:" || url.protocol === "https:";
    }

    // Returns risk rating
    _calculateLinkRating(isSenderDomainDisparity, isLinkTextDisparity, isValidHost){
        if (isLinkTextDisparity || !isValidHost){
            return 5;
        } else if (isSenderDomainDisparity){
            return 4;
        } else {
            return 1;
        }
    }

    //************************************************//
    /////// ATTACHMENT EVALUATION HELPER METHODS ///////
    //************************************************//

    _fileTypeRating(fileName){
        let safeAttachments = ['gif','jpg','jpeg','png','tif','tiff','mpg','mpeg','mp3','wav']
        let somewhatSafeAttachments = ['doc','pdf','pptx','xls','txt','docx','xlsx','xlsm']
        let notSafeAttachments = ['exe','zip','rar']

        if (typeof fileName != 'undefined'){
            let extension = fileName.split('.').pop().toLowerCase();
            
            if (safeAttachments.includes(extension)){
                return 1;
            } else if (somewhatSafeAttachments.includes(extension)){
                return 2;
            }
            else if (notSafeAttachments.includes(extension)){
                return 5;
            } else {
                return 4;
            }
        }
        return 3;
    }
}

module.exports.Phishing = Phishing;