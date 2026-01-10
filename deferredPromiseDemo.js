// let deferredResponse = null

// function getDeferredPromise() {
//     let resolve, reject;
//     const promise = new Promise((res, rej) => {
//         resolve = res;
//         reject = rej;
//     });
//     return {
//         promise,
//         resolve,
//         reject
//     };
// }

// setTimeout(()=>{
//     deferredResponse.resolve("value")
// },20000)
// console.log(await sendRequest())


// function sendRequest(request){
//     deferredResponse = getDeferredPromise();

//     return deferredResponse.promise
// }

