var Sentiment = require('sentiment');
var sentiment = new Sentiment();


class Phishing {
    constructor(){
        this.phishy = false;
    }

    validateAddress(address){
        console.log("Validating sender email address")
        if (address == "noreply-purchases@youtube.com"){
            this.phishy = true;
        }
    }
    
    validateSubject(subject){
        console.log("Validating email subject")
        // var result = sentiment.analyze(subject);
        // console.log("Sentiment result:",result);
        let urgencyWords = ["now","hurry","quick","limited","important"];
        let tokenisedSubject = subject.toLowerCase().split(" ")

        tokenisedSubject.forEach(word => {
            urgencyWords.includes(word) ? this.phishy = true : this.phishy=this.phishy;
        });
    }
    
    validateBody(){
        console.log("Validating email body")
    }

}

module.exports.Phishing = Phishing;