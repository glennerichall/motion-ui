const tokens = {};
let current = null;
let id = 0;
export const acquireToken = (callback) => {
    if (!!current) {
        current.setToken({...current, acquired: false});
    }
    const token = {acquired: true, setToken: callback, id: id++};
    callback(token);
    tokens[token.id] = token;
    current = token;
}

export const releaseToken = token => {
    if (token.setToken) {
        token.setToken({...token, acquired: false});
        delete tokens[token.id];
    }
    let other = Object.keys(tokens);
    if (other.length) current = tokens[other];
    else current = null;
    if (!!current) {
        current.setToken({...current, acquired: true});
    }
};

export const hasToken = token => token.acquired;