var Sentiment = require('sentiment');
var sentiment = new Sentiment();


class Phishing {
    constructor(){
        this.scores = {
            address: 1,
            name: 1,
            subject: 1
        }
        this.phishy = false;
    }

    validateAddress(address){
        console.log("Validating sender email address")
        if (address == "noreply-purchases@youtube.com"){
            this.phishy = true;
        }
    }
    
    validateSubject(subject){
        let urgencyCounter = 0;
        let urgencyWords = ["now","hurry","quick","limited","urgent","urgently","important"];
        let tokenisedSubject = subject ? subject.toLowerCase().split(" ") : "";
        let containsSpecialCharacter = false
        let regex = new RegExp('[!#$%^&*(){}|<>]');

        
        tokenisedSubject.forEach(word => {
            if (urgencyWords.includes(word)){
                urgencyCounter++;
            }
        });
        
        containsSpecialCharacter = regex.test(subject);

        if (containsSpecialCharacter){
            if (urgencyCounter < 2){
                this.scores.subject = 4;
            }  else {
                this.scores.subject = 5;
            }
        } else {
            if (urgencyCounter != 0){
                if (urgencyCounter == 1){
                    this.scores.subject = 3;
                } else if (urgencyCounter == 2){
                    this.scores.subject = 4;
                } else {
                    this.scores.subject = 5;
                }
            }
        }
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