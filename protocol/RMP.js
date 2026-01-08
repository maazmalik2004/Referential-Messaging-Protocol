import { EventEmitter } from "node:events";
import utils from "../utils/utils.js";

class RMP{
    constructor(object){
        this.emitter=new EventEmitter();
        this.adapter=object.adapter;
        this.hashValueMapping = new Map();
        this.hashDeferredPromiseMapping = new Map();

        this.idMessageMapping = new Map();

        this.adapter.on("message",message=>{
            console.log("[RMP] received message ",message)

            this.idMessageMapping.set(message.rmpHeader.id, message)
            console.log("baiganayein1",this.hashValueMapping.size)
            console.log("baiganayein1",this.hashDeferredPromiseMapping.size)
            this.parse(message.payload, [message.rmpHeader.id])
            console.log("baiganayein",this.hashValueMapping)
            console.log("baiganayein",this.hashDeferredPromiseMapping)
            this.emitter.emit("message", message.payload)
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

    parse(object,currentPath){
        console.log("UWU ONIICHAN")
        if(this.isPrimitive(object)){
            let address = utils.getHash(currentPath);
            if(this.hashDeferredPromiseMapping.has(address)){
                this.hashDeferredPromiseMapping.get(address).resolve(object)
            }
            this.hashValueMapping.set(address,object)
            return;
        }
        if(this.isReference(object)){
            let address = utils.getHash(currentPath)
            this.hashValueMapping.set(address,object)
            object = this.resolve(object);
            return;
        }
        if(Array.isArray(object)){
            for(let i=0;i<object.length;i++){
                let copiedPath=[...currentPath,i]
                let address = utils.getHash(copiedPath)
                if(this.hashDeferredPromiseMapping.has(address)){
                    this.hashDeferredPromiseMapping.get(address).resolve(object[i])
                }
                this.hashValueMapping.set(address, object[i])
                this.parse(object[i],copiedPath)
            }
            return;
        }
        for(const [key,value] of Object.entries(object)){
            let copiedPath=[...currentPath,key]
            let address = utils.getHash(copiedPath);
            if(this.hashDeferredPromiseMapping.has(address)){
                this.hashDeferredPromiseMapping.get(address).resolve(object)
            }
            this.hashValueMapping.set(address,value);
            this.parse(value,copiedPath) 
        }
    }

    stage(object, identifier){
        let id = identifier || utils.getRandomNumber();
        console.log("bhutagorilla",id)
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
        return !!object._rmpref_
    }

    isPrimitive(object){
        return typeof object == "boolean" || typeof object == "string" || typeof object == "number" || object == null || object == undefined;
    }

    getReference(message, path = []){
        path.shift(message._rmpid_)
        return {
            _rmpref_: utils.getHash(path)
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


// // const complexTestData = {
// //     // 1. Standard Nested Object
// //     metadata: {
// //         id: 500,
// //         flags: {
// //             isVerified: true,
// //             priority: "high"
// //         }
// //     },
// //     // 2. Mixed Array (Primitives + Objects + Nested Arrays)
// //     logs: [
// //         "system_start",
// //         { event: "login", code: 200 },
// //         [10, 20, [30]] 
// //     ],
// //     // 3. Edge Case: Empty structures
// //     emptyStates: {
// //         emptyObj: {},
// //         emptyArr: []
// //     },
// //     // 4. Different Primitive types (Strings, Numbers)
// //     values: {
// //         score: 98.5,
// //         label: "test-run",
// //         zero: 0,
// //         emptyString: ""
// //     },
// //     // 5. Null (to test your !object check)
// //     nullable: null,
// //     // 6. Deeply nested path
// //     a: { b: { c: { d: "depth-check" } } }
// // };

// const message=1;
// //To run the test:
// const rmp = new RMP({ adapter: {} });
// console.log(message==rmp.stage(message))
// // const path = ["1"];

// // rmp.parse(["abcdefg",1,null,true,false], path);

// // // Check the results
// // console.log("Mapped Hashes:");
// // console.log(rmp.hashValueMapping);


// let m1 = {
//     name:[{
//         name:rmp.getReference(m3),
//         age:"male",
//         gender:21
//     }]
// }

// let m1id = rmp.stage(m1)

// let m2 = {
//     name:rmp.getReference(m1id,["name",0,"gender"])
// }

// rmp.stage(m1, m1id)
