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