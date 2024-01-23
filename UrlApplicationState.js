/***
 * We may switch to an global appstate object using the following class
 * 
 */

class ApplicationState {
    constructor() {
        this.previousState = {};
        this.currentState = this.getStateFromURL();

        $(document).on('change', 'input.stateful', (event) => this.handleInputStateChange(event));
        $(document).on('change', 'select.stateful', (event) => this.handleSelectStateChange(event));
          
        // If the current state is empty, trigger the change in stateful elements to ensure the loading of the default values
        $(document).ready( () => !Object.keys(this.currentState).length && $('.stateful').trigger("change") )
    }

    async handleInputStateChange(event) {      
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
            await this.updateState(key, value);
        }
    }
    
    async handleSelectStateChange(event) {     
        const element = $(event.target);
        var key = element.attr('name');
        var value = element.val();
        await this.updateState(key, value);
    }      

    /**
     * Retrieves the current Application state from the URL parameters
     * 
     * @returns {object} state 
     */
    getStateFromURL() {
        var queryParams = new URLSearchParams(window.location.search);
        var state = {};
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
     * Checks if only the specified key has changed in the state object.
     *
     * @param {string} key - The key to check for changes.
     * @returns {boolean} True if only the specified key has changed, false otherwise.
     */
    hasOnlyKeyChanged(key) {
        // Check if the specific key has changed.
        const keyChanged = this.currentState[key] !== this.previousState[key];

        // Check if other keys have also changed.
        const otherKeysChanged = Object.keys(this.currentState).some(k => {
            return k !== key && this.currentState[k] !== this.previousState[k];
        });

        return keyChanged && !otherKeysChanged;
    }


    /***
     * Updates the application state with a specified key and value
     * 
     * @param {string} key
     * @param value
     * 
     * @calls updateURLWithState(state)
     */
     async updateState (key, value) {
        this.previousState = this.currentState;
        this.currentState = await this.getStateFromURL(); 

        this.currentState[key] = value;
        this.updateURLWithState(this.currentState);
        // trigger the stateChanged event
        $(document).trigger('stateChanged')
        //  applyState(state);
    }

    /***
     * Update URL with State
     * Updates the URL with the new Application State
     * 
     * @param {object} state
     */
     updateURLWithState (state) {
        var url = new URL(window.location);
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
    toSearchString (state = this.currentState) {
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
    getState (key) {
        const urlParams = new URLSearchParams(window.location.search);
        const value = urlParams.get(key);
        try {
            return JSON.parse(value)
        } catch (e) {
            console.warning(e)
            return value
        }
    }


}

// Create a new Global AppState Object
const AppState = new ApplicationState()
