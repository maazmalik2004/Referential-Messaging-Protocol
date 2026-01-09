import Communication from "./communication/socket.js";
import RMP from "./protocol/RMP.js";

let params = process.argv;

let communication = new Communication({
    port:params[2],
    serverIp:params[3],
    serverPort:params[4]
})

let rmp = new RMP({
    adapter:communication
})

rmp.on("message",async(message) => {
    console.log("received now")
    console.log("[APP] resolved now",await message.name);
})

if(params[2] == 3000){
    setTimeout(()=>{
        let message1 = {
            name:{
                key:["nestedobject"]
            }
        }

        let m1id = rmp.stage(message1);
        console.log("get reference output ",rmp.getReference(m1id,["name","key",0]))
        console.log("m1id",m1id)

        let message2 = {
            name:rmp.getReference(m1id,["name","key",0])
        }

        let m2id = rmp.stage(message2);

        let message3 = {
            name:rmp.getReference(m2id,["name"])
        }

        let m3id = rmp.stage(message3)

        // let message3a = {
        //     _rmpid_:m3id,
        //     ...message3
        // }
        rmp.send(m3id)

        setTimeout(()=>{
            rmp.send(m2id)
            setTimeout(()=>{
                rmp.send(m1id)
            },3000)
        },3000)
    },7000)
}

// [3,ref2] [1,value] [2,ref1]