import { appName } from "../../app.config.js";
const KEY = `${appName}.localstorage.control`;

/**
 * @param {object} object - the object to be saved
 */
const save = (object) => {
    const serialized = JSON.stringify(object);
    localStorage.setItem(KEY,serialized);
}

/**
 * 
 * @returns {string} - the serialized object
 */
const load = _ => { 
    const serialized = localStorage.getItem(KEY);
    return JSON.parse(serialized);
}

export { load,save };