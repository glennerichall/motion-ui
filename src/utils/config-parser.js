const transpose = separator => (config, current) => {
    current = current.trim();
    if (current.length === 0 ||
        current.startsWith('#') ||
        current.startsWith(';')) {
        return config;
    }
    let key_value = current.split(separator);
    let key = key_value[0].trim().toLowerCase();
    let value = key_value[1].trim().toLowerCase();
    if (value === 'off') value = false;
    else if (value === 'on') value = true;
    if (config[key] !== undefined) {
        if (!Array.isArray(config[key])) {
            // let first = config[key];
            config[key] = [config[key]];
            // config[key].push(first);
        }
        config[key].push(value);
    } else {
        config[key] = value;
    }
    return config;
};

export {transpose}

export function parse(config, separator) {
    config = config.toString().split('\n');
    return config.reduce(transpose(separator || ' '), {});
}