// function autoRefreshEvents() {
//
//     function update(events, sel) {
//         for (var i = 0; i < events.length; i++) {
//             var camera = events[i].camera;
//             var elem = document.querySelector('#cam-' + camera + '.camera .events ' + sel);
//             elem.innerHTML = events[i].total;
//             if (events[i].total) {
//                 elem.classList.add('has-events');
//             } else {
//                 elem.classList.remove('has-events');
//             }
//         }
//     }
//
//     function fetch() {
//         var xhttp = new XMLHttpRequest();
//         xhttp.onreadystatechange = function () {
//             if (this.readyState === 4 && this.status === 200) {
//                 var count = JSON.parse(xhttp.responseText);
//                 console.log(count);
//
//                 var cameras = {};
//                 var allEvents = [];
//                 var todayEvents = [];
//
//                 for (var i = 0; i < count.length; i++) {
//                     var name = count[i].camera;
//                     var camera = cameras[name];
//                     if (!camera) {
//                         camera = cameras[name] = {
//                             name: name,
//                             events: 0,
//                             last: '',
//                             date: null
//                         };
//                     }
//                     if(camera.last < count[i].date) {
//                         camera.date = count[i].date;
//                         camera.last = count[i].total;
//                     }
//                     camera.events += count[i].total;
//                 }
//
//                 for(var key in cameras) {
//                     allEvents.push({
//                         camera : cameras[key].name,
//                         total: cameras[key].events
//                     });
//                     todayEvents.push({
//                         camera : cameras[key].name,
//                         total: cameras[key].last
//                     });
//                 }
//
//                 update(allEvents, '.all');
//                 update(todayEvents, '.today');
//
//             }
//         };
//         xhttp.open("GET", "/motion/events/count?date=everyday", true);
//         xhttp.send();
//         setTimeout(fetch, 10000);
//     }
//
//     fetch();
// }

export async function fetch(url) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    return new Promise((resolve, reject) => {
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(this.status);
                }
            }
        }
    })

}