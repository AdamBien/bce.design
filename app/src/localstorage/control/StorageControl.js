import { appName } from "../../app.config.js";
const KEY = `${appName}.localstorage.control`;

/**
 * @param {object} object - the object to be saved
 */
const save = (object) => {
    try {
        const serialized = JSON.stringify(object);
        localStorage.setItem(KEY, serialized);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * 
 * @returns {object} - the serialized object
 */
const load = _ => { 
    try {
        const serialized = localStorage.getItem(KEY);
        return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

export { load,save };