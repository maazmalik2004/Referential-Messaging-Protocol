import Communication from "./socket.js"

let params = process.argv

let communication = new Communication({
    port:params[2],
    serverIp:params[3],
    serverPort:params[4]
})

communication.on("message",message=>{
    console.log("[APP] received message ", message)
})

communication.on("dropped",message=>{
    console.log("[APP] dropped message", message)
})

let intervalId = null
communication.on("connected",()=>{
    console.log("[APP] connected")

    intervalId = setInterval(()=>{
        communication.send({
            message:"hello"
        });
    }, 5000)
})


communication.on("disconnected",()=>{
    clearInterval(intervalId)
})
