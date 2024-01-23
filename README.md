# UrlApplicationState.js
A simple JavaScript Object to store and read the application state from the URLs search parameters.

## How it works
The Object registers a listener that checks for changes in input and select elements with the '.stateful' class assigned.
If the state changes it emits the 'stateChanged' event. 

## Usage

Just download and include this file in your html

```html
<script type="javascript" src="/path/to/your/js/UrlApplicationState.js"></script>
```

You can now use the UrlAppState Object in your Javascript

```javascript
const currentState = UrlAppState.currentState
```

To get the current state as a parameter string you can use
```javascript
const params = UrlAppState.toSearchString()
```

You can also give an object as parameter to convert to a search string. 
```javascript
const params = UrlAppState.toSearchString({key1: 'value1', key2: 'value2'})
```
To get the value of a particular key you can use the getState(key) method:
```javascript
const key1 = UrlAppState.getState('key1')
```


To check if only one particular key in the state has changed you can use the hasOnlyKeyChanged(key) method
```javascript
var onlyKey1Changed =  UrlAppState.hasOnlyKeyChanged('key1')
```


