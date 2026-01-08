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

rmp.on("message",message => {
    console.log(message)
})

if(params[2] == 3000){
    setTimeout(()=>{
        let message1 = {
            name:"maaz"
        }

        let m1id = rmp.stage(message1);
        console.log("m1id",m1id)

        let message2 = {
            name:rmp.getReference(m1id,["name"])
        }

        let m2id = rmp.stage(message2);

        let message3 = {
            friendName:rmp.getReference(m2id,["name"])
        }

        let m3id = rmp.stage(message3)

        let message3a = {
            _rmpid_:m3id,
            ...message3
        }
        rmp.send(m1id)
        rmp.send(m2id)
        rmp.send(m3id)
    },7000)
}