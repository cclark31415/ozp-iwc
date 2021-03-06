##Intents API Action: register(nodeKey,nodeValue,invocationCallback)
* `nodeValue`: **Object** - the registration value to store in the node.
   * `nodeValue.label`: **String** - a title/label to distinguish this application.
   * `nodeValue.icon`: **String** - a URL path to an icon to distinguish this application.


###Applies to only the Intents API

###Registers an application to handle and IWC Intent

To register to handle an intent, the `register` action is used.
When registering an intent handler, two entity properties are used to make choosing a handler easier for the end user:

1.  **label**: A short string noting the application handling the intent (typically the application title).
2.  **icon**: A url path to a icon to use for the application.

When a label/icon is not provided, the page title of the application is used as the label and the icon will default to a
predefined default icon.

```

var config = {
    "label": "My JSON Viewer",
    "icon": "https://www.example.com/icon.png"
};

var onInvoke = function(payload) {
    return someAppFunction(payload);
};

var viewRef = new iwc.intents.Reference("/application/json/view");
viewRef.register(config, onInvoke);
```
If the registration node path matches `/{minor}/{major}/{action}` ("/application/json/view") the handler Id will be
generated automatically and returned in the promise resolution.

If the registration node path matches `/{minor}/{major}/{action}/{handlerId}` ("/application/json/view/123") the
handler Id given will be used.

The registration promise resolution does not handle the intent invocation, rather reports the status of the registration:
```
{
    "resource": "/application/json/view/3229d7e2"
}
```

The `resource` property of the response is the node that was used for the handler. To unregister simply
delete said node:
```
intentsApi.delete("/application/json/view/3228d7e2");
```

###Responding to the invoker
The callback registered with the `register` action can return any serialized value (stirng,number,bool,object). The
value that is returned will be sent back to the IWC client that called `invoke`.
