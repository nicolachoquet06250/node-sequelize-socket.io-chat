class Observable {
    get(prop) {
        return this[`_${prop}`] !== undefined ? this[`_${prop}`] : null;
    }
    set(prop, value) {
        let old = this[`_${prop}`];
        if(typeof old === 'object') {
            if (old.length !== value.length) {
                this[`on${prop.substr(0, 1).toUpperCase()}${prop.substr(1, prop.length - 1).toLowerCase()}Change`](old, value);
                this[`_${prop}`] = value;
            }
        } else {
            if (old !== value) {
                this[`on${prop.substr(0, 1).toUpperCase()}${prop.substr(1, prop.length - 1).toLowerCase()}Change`](old, value);
                this[`_${prop}`] = value;
            }
        }
    }
}