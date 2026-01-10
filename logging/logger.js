import Storage from "./storage.js";

class Logger{
    constructor(object){
        object = object || {};
        this.adapter = new Storage({
            identifier:"RMP-LOGS"
        });
        // this.maxFileSize = object.maxFileSize || 67108864 //64MB
        this.maxFileSize = 90000
    }

    //append only
    logMessage(message){
        console.log("[LOGGER] logging message ",message)
        let head = this.adapter.get("HEAD") || 0;

        //metadata of the old file
        let logMetadata = this.adapter.get("METADATA"+head)
        if(!logMetadata){
            logMetadata = {
                currentSize : 0
            }
        }

        let messageSize = Buffer.byteLength(JSON.stringify(message),"utf8");
        if(logMetadata.currentSize + messageSize > this.maxFileSize){
            head = head+1;
            logMetadata = this.adapter.get("METADATA"+head);
            if(!logMetadata){
                logMetadata = {
                    currentSize:0
                }
            }
        }

        let logFile = this.adapter.get("LOG"+head) || [];
        logFile.push(message);
        logMetadata.currentSize = logMetadata.currentSize + messageSize;

        this.adapter.set("LOG"+head,logFile)
        this.adapter.set("HEAD",head)
        this.adapter.set("METADATA"+head, logMetadata)
    }

    reset(){
        //read head
        let head = this.adapter.get("HEAD") || 0;
        
        //delete all log and metadata files
        for(let i=0;i<=head;i++){
            this.adapter.delete("LOG"+i);
            this.adapter.delete("METADATA"+i)
        }

        //delete index and head files
        this.adapter.delete("INDEX");
        this.adapter.delete("HEAD");

        console.log("[LOGGER] logs cleared")
    }

    getMessages(){
        let head = this.adapter.get("HEAD") || 0;
        let messages = [];
        
        for(let i=0;i<=head;i++){
            let logFile = this.adapter.get("LOG"+i) || [];
            messages = [...messages, ...logFile];
        }

        return messages
    }
}

export default Logger;