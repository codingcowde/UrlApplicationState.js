/**
 * Manage the State using URL search parameters
 * 
 */

class UrlApplicationState {
    constructor() {
        this.previousState = {};
        this.currentState = this.getStateFromURL();
        this.isLoadingState = false;

        $(document).on('change', 'input.stateful', this.debounce(this.handleInputStateChange.bind(this), 600));
        $(document).on('change', 'select.stateful', this.debounce(this.handleSelectStateChange.bind(this), 600));
        // Load state
        $(document).ready(() => !Object.keys(this.currentState).length && this._loadState())
    }

    /**
     * Closure to keep the given function from being run by a bouncing event
     * 
     * @param {function} func 
     * @param {int} delay in ms
     * @returns 
     */
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Handles state changes troggerd by input fields
     * 
     * @param {Event} event 
     */
    handleInputStateChange(event) {
        const element = $(event.target);
        const key = element.attr('name');
        let value = element.val();
        const type = element.attr('type');
        let update = true;

        switch (type) {
            case 'checkbox':
                value = element.prop('checked') ? 'on' : '';
                break;
            case 'radio':
                update = element.prop('checked');
                break;
            case 'password':
            case 'email':
                update = false;
                break;
        }

        if (update) {
            this.updateState(key, value);
        }
    }

    /**
     * Handles the state change triggered by a select field
     * 
     * @param {Event} event 
     */
    handleSelectStateChange(event) {
        const element = $(event.target);
        const key = element.attr('name');
        const value = element.val();
        this.updateState(key, value);
    }

    /**
     * Retrieves the current Application state from the URL parameters
     * 
     * @returns {object} state 
     */
    getStateFromURL() {
        const queryParams = new URLSearchParams(window.location.search);
        let state = {};
        queryParams.forEach((value, key) => {
            try {
                state[key] = JSON.parse(value);
            } catch (e) {
                state[key] = value;
            }
        });
        return state;
    }

    /**
     * Updates the application state with a specified key and value
     * 
     * @param {string} key
     * @param value
     * 
     * @calls updateURLWithState(state)
     */
    updateState(key, value) {
        this.previousState = { ...this.currentState };
        // Update the state directly
        value ? this.currentState[key] = value : delete this.currentState[key];

        // Update the URL with the new state
        this.updateURLWithState(this.currentState);

        // Save state if not currently loading from storage
        !this.isLoadingState && this._saveState();

        // Trigger the stateChanged event
        $(document).trigger('stateChanged');
    }

    /***
     * Update URL with State
     * Updates the URL with the new Application State
     * 
     * @param {object} state
     */
    updateURLWithState(state) {
        const url = new URL(window.location);
        url.search = ''; // Clear existing query params

        Object.keys(state).forEach(key => {
            // Check for non-empty values and non-empty arrays
            if (state[key] !== '' && state[key] !== null && state[key] !== undefined && !(Array.isArray(state[key]) && state[key].length === 0)) {
                url.searchParams.set(key, JSON.stringify(state[key]));
            }
        });
        window.history.pushState(state, '', url);
    }

    /***
     * To search string
     * 
     * This function takes a state object as input and returns it as a formated search string
     * 
     * @param {object} state
     * @returns {string}
     */
    toSearchString(state = this.currentState) {
        let params = [];

        Object.keys(state).forEach(key => {
            // Check for non-empty values and non-empty arrays
            if (state[key] !== '' && state[key] !== null && state[key] !== undefined && !(Array.isArray(state[key]) && state[key].length === 0)) {
                Array.isArray(state[key]) ? params.push(`${state[key].map(val => `${key}=${val}`).join('&')}`) : params.push(`${key}=${state[key]}`)
            }
        });
        return params.join('&')
    }

    /*****
     * Get the state by key
     * 
     * @param {string} key
     * @returns {any}
     */
    getState(key) {
        const urlParams = new URLSearchParams(window.location.search);
        const value = urlParams.get(key);
        try {
            return JSON.parse(value)
        } catch (e) {
            console.warning(e)
            return value
        }
    }

    /**
     * Save the current state to local storage
     */
    _saveState() {      
        const stringified = JSON.stringify(this.currentState);
        const url = window.location.pathname;
        console.debug("Saving state as ", url, stringified);
        window.localStorage.setItem(url, stringified);
    }

    /**
     * Private method to load the state from storage
     * If no stored state is found it will fallback to load the defaults set in the markup
     */
    async _loadState() {
        // If the current state is empty, trigger the change in stateful elements to ensure the loading of the default values
        this.isLoadingState = true; // Set flag to prevent saving

        console.debug("Load State");
        try {
            const url = window.location.pathname;
            const stringified = window.localStorage.getItem(url);
            if (!stringified) {
                throw "No Stored data";
            }
            const state = JSON.parse(stringified);
            this.updateURLWithState(state);
            this.currentState = state;
            $(document).trigger('stateChanged', { source: 'load' });
        } catch (error) {
            console.debug(error);
            $('.stateful').trigger("change");
        } finally {
            this.isLoadingState = false; // Reset flag

        }
    }

}

// Create a new Global AppState Object
const AppState = new UrlApplicationState();
