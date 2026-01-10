import { EventEmitter } from "node:events";
import utils from "../utils/utils.js";
import Communication from "../communication/socket.js"
import Logger from "../logging/logger.js"

class RMP{
    constructor(object){
        this.emitter=new EventEmitter();
        this.adapter=new Communication({
            port:object.port,
            serverIp:object.remoteIp,
            serverPort:object.remotePort
        })
        this.logger=new Logger();
        this.persistence = object.persistence;

        this.hashValueMapping = new Map();
        this.hashDeferredPromiseMapping = new Map();
        this.idMessageMapping = new Map();

        if(this.persistence){
            this.loadMessages();
        }else{
            this.reset();
        }

        this.adapter.on("message",message=>{
            console.log("[RMP] received message ",message)
            this.logger.logMessage(message)

            this.idMessageMapping.set(message.rmpHeader.id, message)
           
            let result = this.parse(message.payload, [message.rmpHeader.id])

            console.log("baiganayein",this.hashValueMapping)
            console.log("baiganayein",this.hashDeferredPromiseMapping)

            this.emitter.emit("message", result)
        })

        this.adapter.on("connected",()=>{
            this.emitter.emit("connected");
        })

        this.adapter.on("disconnected",()=>{
            this.emitter.emit("disconnected");
        })

        this.adapter.on("dropped",(message)=>{
            this.emitter.emit("dropped", message);
        })
    }

    reset(){
        //clear logs
        this.logger.reset();
 
        //reject all pending promises
        for(let value of this.hashDeferredPromiseMapping.values()){
            value.reject("RMP buffer reset");
        }

        //reset mappings
        this.hashValueMapping = new Map();
        this.hashDeferredPromiseMapping = new Map();
        this.idMessageMapping = new Map();

        console.log("[RMP] RMP buffer cleared")
    }

    loadMessages(){
        let messages = this.logger.getMessages();
        for (let message of messages){
            console.log("[RMP] loading message ",message)
            this.idMessageMapping.set(message.rmpHeader.id, message);
            let result = this.parse(message.payload,[message.rmpHeader.id]);
            // this.emitter.emit("message",result);
        }
    }

    getDeferredPromise() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return {
            promise,
            resolve,
            reject
        };
    }

    
    resolve(reference){
        if(this.isReference(reference)){
            if(this.hashValueMapping.has(reference._rmpref_)){
                let value = this.hashValueMapping.get(reference._rmpref_);
                if(this.isReference(value)){
                    return this.resolve(value)
                }else{
                    return value;
                }
            }else{
                let defprom =  this.hashDeferredPromiseMapping.get(reference._rmpref_) || this.getDeferredPromise()
                this.hashDeferredPromiseMapping.set(reference._rmpref_, defprom)
                return defprom.promise
            }
        }
        else{
            return reference;
        }
    }

    parse(object,currentPath){
        if(this.isPrimitive(object)){
            let address = JSON.stringify(currentPath);
            this.register(address, object)
            return object;
        }
        else if(this.isReference(object)){
            let address = JSON.stringify(currentPath)
            this.register(address,object)
            return this.resolve(object);
        }
        else if(Array.isArray(object)){
            for(let i=0;i<object.length;i++){
                let copiedPath=[...currentPath,i]
                let address = JSON.stringify(copiedPath)
                this.register(address, object[i])
                if(this.isReference(object[i])){
                    object[i] = this.resolve(object[i])
                    continue;
                }
                object[i] = this.parse(object[i],copiedPath)
            }
            return object;
        }
        for(const [key,value] of Object.entries(object)){
            let copiedPath=[...currentPath,key]
            let address = JSON.stringify(copiedPath)
            this.register(address,value)           
            if(this.isReference(value)){
                object[key] = this.resolve(value);
                continue;
            }

            object[key] = this.parse(value,copiedPath)
        }
        return object
    }

    register(address, value){
        if(this.hashDeferredPromiseMapping.has(address)){
            this.hashDeferredPromiseMapping.get(address).resolve(this.resolve(value));
        }
        this.hashValueMapping.set(address, value);
    }

    stage(object, identifier){
        let id = identifier || utils.getRandomNumber();
        let message={
            payload:object,
            rmpHeader:{
                id:id
            }
        }
        console.log("setting id=>message mapping ",id+","+JSON.stringify(message,null,4))
        this.idMessageMapping.set(id, message)
        return id
    }

    isReference(object){
        if(!object)return false
        return !!object._rmpref_
    }

    isPrimitive(object){
        return typeof object == "boolean" || typeof object == "string" || typeof object == "number" || object == null || object == undefined;
    }

    getReference(id, path){
        path = path || [];
        path.unshift(id)
        return {
            _rmpref_: JSON.stringify(path)
        }
    }

    send(id){
        this.adapter.send(this.idMessageMapping.get(id))
    }

    on(eventName,callback){
        this.emitter.on(eventName,callback);
    }
}

export default RMP;