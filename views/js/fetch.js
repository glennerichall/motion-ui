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
};

export async function delet(url) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", url, true);
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
};

export async function post(url, body) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    if (!!body) {
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(body));
    } else {
        xhttp.send();
    }
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
};