/**
 * @submodule bus.api.Type
 */

/**
 * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the IWC.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.NamesApiValue"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class NamesApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.NamesApi = ozpIwc.createApi(function(config) {
    /**
     * How often a heartbeat message should occur.
     * @property heartbeatFrequency
     * @type {Number}
     * @default 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * The amount of heartbeats to drop an unresponsive participant after
     * @property heartbeatDropCount
     * @type {number|*}
     * @default 3
     */
    this.heartbeatDropCount = config.heartbeatDropCount || 3;
    
    for(var key in ozpIwc.apiMap){
        var api = ozpIwc.apiMap[key];
        var resourceName='/api/' + api.address;
        this.data[resourceName]=new ozpIwc.ApiNode({
            resource: resourceName,
            entity: {'actions': api.actions},
            contentType: 'application/vnd.ozp-iwc-api-v1+json'
        });
    }
});

// Default handlers are fine for list, bulkGet, watch, and unwatch with any properly formed resource
ozpIwc.NamesApi.useDefaultRoute(["list","bulkGet"],"/{c:(?:api|address|multicast|router).*}");

//====================================================================
// Address, Multicast, and Router endpoints
//====================================================================
ozpIwc.NamesApi.declareRoute({
    action: ["set","delete"],
    resource: "/{collection:api|address|multicast|router}",
    filters: []
}, function(packet,context,pathParams) {
    throw new ozpIwc.NoPermissionError(packet);    
});
ozpIwc.NamesApi.declareRoute({
    action: "get",
    resource: "/{collection:api|address|multicast|router}",
    filters: []
}, function(packet,context,pathParams) {
    return {
        "contentType": "application/json",
        "entity": this.matchingNodes(packet.resource).map(function(node) {
            return node.resource;
         })
    };
});
//====================================================================
// API endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/api/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/api/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-api-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Address endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/address/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/address/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-address-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address

    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Multicast endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/multicast/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/multicast/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-multicast-address-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    
    //
    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Router endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/router/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/router/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-router-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    
    //
    context.node.set(packet);
    return {response:"ok"};
});