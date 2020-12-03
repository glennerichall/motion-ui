class Bob {
    constructor(name) {
        this.name = name;
    }

    print(...args) {
        console.log(this.name + ':' + args.join(','));
        return this;
    }
}

function toDispatcherProxy() {
    const targets = Array.from(arguments);
    return new Proxy({}, {
        get: (obj, prop) =>
            (...args) => toDispatcherProxy(
                ...targets.map(target => target[prop](...args)))
    });
}


const bob = toDispatcherProxy(
    new Bob('1'),
    new Bob('2')
);

bob.print('yo', 'yeah').print('ya');