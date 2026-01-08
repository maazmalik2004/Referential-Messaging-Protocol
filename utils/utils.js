import {v4} from "uuid"
import crypto from "crypto"

function getRandomNumber(){
    return v4();
}

function getHash(object){
    let strObject=JSON.stringify(object)
    return crypto.createHash("sha256").update(strObject).digest("hex")
}

export default {
    getRandomNumber,
    getHash
}

// console.log(getHash({
//     a:[1,2,3,4],
//     b:"Maaz"
// }))
