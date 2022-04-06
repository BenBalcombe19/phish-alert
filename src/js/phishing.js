var Sentiment = require('sentiment');
var sentiment = new Sentiment();
const emojiTree = require('emoji-tree');



class Phishing {
    constructor(){
        this.scores = {
            address: 1,
            name: 1,
            subject: 1,
        }
        this.linkArray = [];
        this.attachmentArray = [];
        this.specialCharacterRegex = new RegExp('[!#$+:;%^&*(){}|<>\-]');
    }

    validateAddress(address){

    }

    validateName(fromName){
        let containsSpecialCharacter = this.specialCharacterRegex.test(fromName);
        let containsEmoji = this.isEmoji(fromName);

        if (containsSpecialCharacter && containsEmoji){
            this.scores.name = 5;
        } else if(containsSpecialCharacter){
            this.scores.name = 4;
        } else if(containsEmoji){
            this.scores.name = 4;
        }
    }
    
    validateSubject(subject, userEmail){
        let urgencyCounter = 0;
        let urgencyWords = ["now","hurry","quick","limited","urgent","urgently","important",'required'];
        let tokenisedSubject = subject ? subject.toLowerCase().split(" ") : [];
        console.log('TOKENISED SUBJECT', tokenisedSubject)
        let containsSpecialCharacter = this.specialCharacterRegex.test(subject);
        let username = userEmail.split('@')[0];
        
        tokenisedSubject.forEach(word => {
            if (urgencyWords.includes(word)){
                urgencyCounter++;
            }
        });
    
        if (containsSpecialCharacter){
            if (urgencyCounter < 2){
                this.scores.subject = 4;
            }  else {
                this.scores.subject = 5;
            }
        } else  if(urgencyCounter != 0){
            if (urgencyCounter == 1){
                this.scores.subject = 3;
            } else if (urgencyCounter == 2){
                this.scores.subject = 4;
            } else {
                this.scores.subject = 5;
            }
        } else if(subject.includes(username)){
            this.scores.subject = 5;
        } else if (this.isEmoji(subject)){
            this.scores.subject = 4;
        }
        // var result = sentiment.analyze(subject);
        // console.log("Sentiment result:",result);
    }
    
    validateBody(body, senderAddress){
        let AnchorTagArray = this._getAnchorTags(body);

        AnchorTagArray.forEach(anchorTag => {
            let isValidHost,isLinkTextDisparity,isSenderDomainDisparity = false;
            let riskRating = 1;

            // Loop through all links that contain link text and a href attribute
            if (anchorTag.innerText.trim().length != 0 && anchorTag.href.trim().length != 0 && !anchorTag.href.includes('mailto')){

                isValidHost = this.isValidHost(anchorTag.hostname)
                isLinkTextDisparity = this._isLinkTextDisparity(anchorTag.href, anchorTag.innerText)
                isSenderDomainDisparity = this._isSenderDomainDisparity(senderAddress, anchorTag.hostname)
                riskRating = this._calculateLinkScore(isSenderDomainDisparity,isLinkTextDisparity, isValidHost)

                this.linkArray.push({
                    href: anchorTag.href,
                    hostname: anchorTag.hostname,
                    innerText: anchorTag.innerText.replace(/(\r\n|\n|\r)/gm, ""), // Remove all line breaks
                    riskRating : riskRating,
                    senderDomainDisparity: isSenderDomainDisparity
                })
            }
        })
        
        return this.linkArray
    }

    validateAttachments(attachments){

        // attachments.forEach(attachment => {
        //         this.attachmentArray.push({
        //             fileName: attachment.name,
        //             size: attachment.size,
        //             type: attachment.type,
        //         })
        // })
        
        return this.attachmentArray
    }
    

    isEmoji(string){
        emojiTree(string).forEach((character) => {
            if(character.type === 'emoji'){
                return true
            }
        })

        return false;
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
    isValidHost(domain){
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
        let parser = require('tld-extract');
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

    // Returns risk score
    _calculateLinkScore(isSenderDomainDisparity, isLinkTextDisparity, isValidHost){
        if (isLinkTextDisparity || !isValidHost){
            return 5;
        } else if (isSenderDomainDisparity){
            return 4;
        } else {
            return 1;
        }
    }
}

module.exports.Phishing = Phishing;