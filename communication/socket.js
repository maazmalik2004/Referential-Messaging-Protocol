import {EventEmitter} from "node:events"
import { WebSocketServer, WebSocket } from 'ws';
import utils from "../utils/utils.js"

class Socket {
    constructor(object){
        this.emitter = new EventEmitter();
        this.port = object.port;

        this.serverIp = object.serverIp;
        this.serverPort = object.serverPort;

        this.timeout = object.timeout || 3000;
        this.maxResendAttempts = object.maxResendAttempts || 3;

        this.unacknowledgedMessages = new Map();
        this.deliveredMessages = new Set();

        this.clientReady = false

        //setting up the server
        this.server = new WebSocketServer({ port: this.port });
        this.server.on("connection", socket => {
            console.log("[COMMUNICATION/SERVER] new client connected");

            socket.on("message", data => {
                let message = JSON.parse(data);
                console.log("[COMMUNICATION/SERVER] parsed message ", message)

                if(message.communicationHeader.label == "ACK"){
                    this.unacknowledgedMessages.delete(message.communicationHeader.id);
                    return;
                } 
            
                //sending acknowledgement
                let ackMessage = {
                    communicationHeader:{
                        label:"ACK",
                        id:message.communicationHeader.id
                    }
                }
                
                if(this.clientReady)this.client.send(JSON.stringify(ackMessage))

                //de-duplication
                if(!this.deliveredMessages.has(message.communicationHeader.id)){
                    this.deliveredMessages.add(message.communicationHeader.id)
                    delete message.communicationHeader;
                    this.emitter.emit("message",message)
                }
            })

            socket.on("close", (object) => {
                console.log("[COMMUNICATION/SERVER] socket connection closed ", object)
            })

            socket.on("error", (error) => {
                // throw new Error("[COMMUNICATION/SERVER] socket error ", error)
                console.log("[COMMUNICATION/SERVER] socket error ", error)
            })
        })

        //setting up the client
        setInterval(()=>{
            if(this.clientReady)return;
            console.log("[COMMUNICATION] attempting connection")
            this.client = new WebSocket(`ws://${this.serverIp}:${this.serverPort}`)

            this.client.on("open", (object)=>{
                console.log("[COMMUNICATION/CLIENT] connected to server ", object);
                // clearInterval(intervalId)
                this.clientReady = true;
                this.emitter.emit("connected")
            })

            this.client.on("close", (code, reason) => {
                console.log("[COMMUNICATION/CLIENT] connection closed ", code+", "+reason)
                this.clientReady = false;
                this.client.removeAllListeners();
                this.emitter.emit("disconnected")
            })

            this.client.on("error", (error) => {
                console.log("[COMMUNICATION/CLIENT] error ", error)
            })
        },3000);
    }

    resend(message){
        if(message.communicationHeader.resendAttempts < this.maxResendAttempts){
            message.communicationHeader.resendAttempts = message.communicationHeader.resendAttempts + 1;
            this.client.send(JSON.stringify(message));
            
            this.unacknowledgedMessages.set(message.communicationHeader.id, message);
            setTimeout(()=>{
                if(this.unacknowledgedMessages.has(message.communicationHeader.id)){
                    this.resend(message);
                }
            },  this.timeout)
        }else{
            delete message.communicationHeader
            this.emitter.emit("dropped", message)
        }
    }

    send(message){
        // encapsulation/ wrappping
        let id = utils.getRandomNumber();
        message = {
            ...message,
            communicationHeader:{
                label:"MSG",
                id: id,
                resendAttempts:0
            }
        }
        this.client.send(JSON.stringify(message));
        
        this.unacknowledgedMessages.set(id, message);
        setTimeout(()=>{
            if(this.unacknowledgedMessages.has(id)){
                this.resend(message)
            }
        },  this.timeout)
    }

    on(eventName, callback){
        this.emitter.on(eventName, callback);
    }
}

export default Socket;
