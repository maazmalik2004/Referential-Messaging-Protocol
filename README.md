### RMP is a protocol for referencing data and resolving references in out-of-order messages. A message can reference a value in another message or a value within itself. It guarentees eventual resolution.
<img width="3279" height="1901" alt="Add a subheading (8)" src="https://github.com/user-attachments/assets/91b202c8-13ef-4bc1-9ac1-219416e3b826" />
<img width="1825" height="787" alt="image" src="https://github.com/user-attachments/assets/365dcfa1-efe4-4f1c-b4d2-eb4314159ebf" />

## ➲ Installation
```TERMINAL
> npm install rmp-broker
```

## ➲ Code
### Sender
```JS
import RMP from "rmp-broker/protocol/RMP.js";

let params = process.argv;

let rmp = new RMP({
    port:params[2],
    remoteIp:params[3],
    remotePort:params[4],
    persistence: true,
    reemit: false
})

rmp.on("connected",()=>{
    console.log("[APP] connected");
    if(params[2] == 3000){
        let message1 = {
            name:{
                key:["targetValue"]
            }
        }

        let m1id = rmp.stage(message1);

        let message2 = {
            name:rmp.getReference(m1id,["name","key",0])
        }

        let m2id = rmp.stage(message2);

        //sending the reference before the value being referenced
        rmp.send(m2id)
        setTimeout(()=>{
            rmp.send(m1id)
        },3000)
    }
})

rmp.on("disconnected",()=>{
    console.log("[APP] disconnected");
})
```
```TERMINAL
> node peer.js 3000 localhost 5000
```
```TERMINAL
[APP] connected
```
### Receiver
```JS
import RMP from "rmp-broker/protocol/RMP.js";

let params = process.argv;

let rmp = new RMP({
    port:params[2],
    remoteIp:params[3],
    remotePort:params[4],
    persistence: true,
    reemit: false
})

rmp.on("message",async(message) => {
    console.log("[APP] received now")
    console.log("[APP] resolved now",await message.name.key);
})
```
```TERMINAL
> node peer.js 5000 localhost 3000
```
```TERMINAL
[APP] connected
[APP] received now
[APP] resolved now { key: [ 'targetValue' ] }
```

## ➲ Use Cases
### 1) Sending a token/ certificate everytime
 In traditional systems, a token or a cryptographic certificate is attached to each request. A token can be kilobytes in size. Even though it might not seem like much, it incurs a significant overhead. Consider a certificate signed by a private key. It is 594 Bytes in size (In UTF8 format, each character is a byte in size). For a thousand requests the resulting overhead is 594 Kilobytes. With RMP, the certificate can be sent once and simply referenced in latter messages. The resulting overhead is 594 + 32 X 999 = 32,562 Bytes (32.562 Kilobytes), an improvement of 94.52%. 

```PEM
-----BEGIN CERTIFICATE-----
MIIBijCCATygAwIBAgIURkkCTZlq5rOIEQxw6jGgiiBra1owBQYDK2VwMBgxFjAU
BgNVBAMMDWV4YW1wbGUubG9jYWwwHhcNMjYwMTExMDY1NDI2WhcNMjgwMTExMDY1
NDI2WjAYMRYwFAYDVQQDDA1leGFtcGxlLmxvY2FsMCowBQYDK2VwAyEARJaojjq7
mtdM310pEOr1swXOqh5IHqwEDVR44t3E8y6jgZcwgZQwHQYDVR0OBBYEFJmzdNQz
GOdUrx8Ax1d0gqfc4atOMB8GA1UdIwQYMBaAFJmzdNQzGOdUrx8Ax1d0gqfc4atO
MA8GA1UdEwEB/wQFMAMBAf8wQQYDVR0RBDowOIINZXhhbXBsZS5sb2NhbIIPKi5l
eGFtcGxlLmxvY2FshwR/AAABhxAAAAAAAAAAAAAAAAAAAAABMAUGAytlcANBAKxQ
8yEeDBl+vI+yDRgAT9tnRD37HVLk0cPxeVJu/OXV7tWCKCHy9QN6rLaX0QQ4/2HM
hzXOWIMDof6F8YkFow8=
-----END CERTIFICATE-----

```

### 2) Stale Copies During NAT
Redundant and out-of-sync copies of data are eliminated when the Single Source of Truth can be referenced to. For example, during Network Address Translation (NAT), the router swaps the source IP in the IP header with the public IP address of the router. The application level might contain a copy of the source IP in order to perform a network level task at the application level (Common in custom protocols and P2P networks). This creates a stale copy as the router is a layer 3 device and never interacts with application data. RMP eliminates this by allowing the application-level copy to point to the Single Source of Truth via RMP references.

<img width="956" height="785" alt="image" src="https://github.com/user-attachments/assets/15d344e7-31a5-4678-af9d-be6cb09ecaa1" />

### 3) Ordering of Blocks in a Blockchain
In a blockchain, blocks may arrive out of order. Each node must reorder the blocks correctly and agree with other nodes on the order of the blocks. With RMP blocks can simply reference previous blocks in the chain, resolving eventually, no matter the order in which they arrive in. 

### 4) Repetetive Changes in Collaborative Environments
In Canva, the same set of styles can be applied at tens of places in the design. The entire set of styles is sent each time, introducing additional overhead. RMP allows the style set to be sent once and referenced later any number of times.
