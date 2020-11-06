function autoRefreshEvents() {
    function fetch() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var count = JSON.parse(xhttp.responseText);
                // console.log(count);
                for (var i = 0; i < count.length; i++) {
                    var camera = count[i].camera;
                    var elem = document.querySelector('#cam-' + camera + '.camera .events');
                    elem.innerHTML = count[i].total;
                    if (count[i].total) {
                        elem.classList.add('has-events');
                    } else {
                        elem.classList.remove('has-events');
                    }
                }
            }
        };
        xhttp.open("GET", "/motion/events/count", true);
        xhttp.send();
        setTimeout(fetch, 10000);
    }

    setTimeout(fetch, 10000);
}