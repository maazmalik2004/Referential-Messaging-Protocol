<img width="3279" height="1901" alt="Add a subheading (8)" src="https://github.com/user-attachments/assets/91b202c8-13ef-4bc1-9ac1-219416e3b826" />

## Consider a very simple scenario
<img width="1825" height="787" alt="image" src="https://github.com/user-attachments/assets/365dcfa1-efe4-4f1c-b4d2-eb4314159ebf" />

### RMP is a protocol for linking and resolving data and references in out of order messages. It guarentees eventual resolution.

# Use Case Examples
## 1) Sending a token/ certificate everytime
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
### Client
```JS
import RMP from "./protocol/RMP.js";

let params = process.argv;

let rmp = new RMP({
    port:params[2],
    remoteIp:params[3],
    remotePort:params[4],
    persistence: true,
    reemit: false
});

rmp.on("connected",()=>{
    console.log("[APP] connected")
});

rmp.on("disconnected",()=>{
    console.log("[APP] disconnected")
});

let certificateMessage = {
    certificate:certificate
};

let certificateId = rmp.stage(certificateMessage);

let message = {
    certificate:rmp.getReference(certificateId, ["certificate"]),
    data:data
};

let messageId = rmp.stage(message);

//order doesn't matter. we can send the message before the certificate and it will be just as valid
rmp.send(messageId);
rmp.send(certificateId);
```
### Server
```JS
import RMP from "./protocol/RMP.js";

let params = process.argv;

let rmp = new RMP({
    port:params[2],
    remoteIp:params[3],
    remotePort:params[4],
    persistence: true,
    reemit: false
});

rmp.on("message",async(message) => {
    console.log("[APP] received message ",message)
    console.log("[APP] value resolved now",await message.certificate);
});
```

## 2) Redundant Stale Copies
During Network address translation (NAT) in computer networking, the router, updates the source IP field with its own public IP in the IP header. however a copy of the source IP might be present in the application payload which the server will use to carry out some networking level task at the application level which is common in custom protocols or P2P systems. This results in two out of sync copies which dont match. RMP ensures a single source of truth where the one copy can reference the other.  

<img width="956" height="785" alt="image" src="https://github.com/user-attachments/assets/15d344e7-31a5-4678-af9d-be6cb09ecaa1" />

## 3) Ordering of Blocks in a Blockchain
In a blockchain, blocks may arrive out of order. Each node must reorder the blocks correctly and agree with other nodes on the order of the blocks. With RMP blocks can simply reference previous blocks in the chain, resolving eventually, no matter the order in which they arrive in. 

## 4) The Curse of Collaboration
In a collaborative environment like canva, google docs, colab etc. the same set of styles is applied at 10s of places across the document. Each time, the style set/ set of delta changes is sent from the frontend to the backend. Instead, the style information, document information or the collaborator information can be sent once and referenced later. Instead of fetching all of user information everytime, references can resolve it prior to reaching the server side application while the frontend is never even made aware of this additional information except in the form of references.
