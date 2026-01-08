import { EventEmitter } from "node:events";
import utils from "../utils/utils.js";
import { copyFile } from "node:fs";

class RMP{
    constructor(object){
        this.emitter=new EventEmitter();
        this.adapter=object.adapter;
        this.hashValueMapping=new Map()
    }

    parse(object,currentPath){
       
        // console.log(currentPath)

        if(typeof object == "boolean" || !object || typeof object == "string" || typeof object == "number"){
            // console.log(object);
            this.hashValueMapping.set(utils.getHash(currentPath),object)
            return;
        }

        if(Array.isArray(object)){
            for(let i=0;i<object.length;i++){
                let copiedPath=[...currentPath,i]
                // console.log("ullulu",JSON.stringify(copiedPath));
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

    stage(message){
        return message;
        let id=utils.getRandomNumber();
        message={
            payload:msg,
            rmpHeader:{
                // bypass:false,
                id:id,
            }
        }
    }

    send(msg){
        this.parse(msg,[id]);
        
        this.adapter.send
    }

    on(eventName,callback){
        this.emitter.on(eventName,callback);
    }
}

export default RMP;


// const complexTestData = {
//     // 1. Standard Nested Object
//     metadata: {
//         id: 500,
//         flags: {
//             isVerified: true,
//             priority: "high"
//         }
//     },
//     // 2. Mixed Array (Primitives + Objects + Nested Arrays)
//     logs: [
//         "system_start",
//         { event: "login", code: 200 },
//         [10, 20, [30]] 
//     ],
//     // 3. Edge Case: Empty structures
//     emptyStates: {
//         emptyObj: {},
//         emptyArr: []
//     },
//     // 4. Different Primitive types (Strings, Numbers)
//     values: {
//         score: 98.5,
//         label: "test-run",
//         zero: 0,
//         emptyString: ""
//     },
//     // 5. Null (to test your !object check)
//     nullable: null,
//     // 6. Deeply nested path
//     a: { b: { c: { d: "depth-check" } } }
// };

const message=1;
//To run the test:
const rmp = new RMP({ adapter: {} });
console.log(message==rmp.stage(message))
// const path = ["1"];

// rmp.parse(["abcdefg",1,null,true,false], path);

// // Check the results
// console.log("Mapped Hashes:");
// console.log(rmp.hashValueMapping);