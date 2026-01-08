import { EventEmitter } from "node:events";
import utils from "../utils/utils.js";

class RMP{
    constructor(object){
        this.emitter=new EventEmitter();
        this.adapter=object.adapter;
        this.hashValueMapping = new Map();
        this.idMessageMapping = new Map();

        this.adapter.on("message",message=>{
            console.log("[RMP] received message ",message)
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

    parse(object,currentPath){
        if(this.isPrimitive(object)){
            this.hashValueMapping.set(utils.getHash(currentPath),object)
            return;
        }
        if(Array.isArray(object)){
            for(let i=0;i<object.length;i++){
                let copiedPath=[...currentPath,i]
                this.parse(object[i],copiedPath)
            }
            return;
        }
        for(const [key,value] of Object.entries(object)){
            let copiedPath=[...currentPath,key]
            let address=utils.getHash(copiedPath);
            this.hashValueMapping.set(utils.getHash(copiedPath),value);
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
        console.log(id)
        console.log("meowww",this.idMessageMapping.get(id))
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
