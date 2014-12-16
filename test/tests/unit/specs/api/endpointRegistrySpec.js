describe("Endpoint Registry",function() {
    var responses={
        'api': {
            '_links': {
                "data" : {'href':"data/v1"},
                "intents" : {'href':"intents/v1"},
                "applications": {'href':"applications/v2"}
            }
        },
        'foo/bar': { '_links': []}
    };

    beforeEach(function() {
        spyOn(ozpIwc.util,"ajax").and.callFake(function(config) {
            return new Promise(function(resolve,reject) {
               resolve(responses[config.href]|| {}); 
            });
        });
    });

    it("loads the API from the default root",function() {
        new ozpIwc.EndpointRegistry();
        expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href':"/api",'method':"GET"}));
    });
    
    it("loads the API from a specified root",function() {
        new ozpIwc.EndpointRegistry({'apiRoot':"foo/bar"});
        expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href':"foo/bar"}));
    });
    
    it("contains the linked endpoints",function() {
        var e=new ozpIwc.EndpointRegistry();
        expect(e.endpoint("data")).toBeDefined();
        expect(e.endpoint("intents")).toBeDefined();
        expect(e.endpoint("applications")).toBeDefined();
    });
    
    [["data","data/foo/bar","data/foo/bar"],
     ["applications","applications/1/2/3/4","applications/1/2/3/4"],
     ["data","","data"],
     ["data","/","data"]
    ].forEach(function(d) {
        it("endpoint " + d[0]+ " gets " +d[1] + " from " + d[2],function(done) {
            var e=new ozpIwc.EndpointRegistry();

            var point = e.endpoint(d[0]);
            point.baseUrl = d[0];
            point.get(d[1]).then(function() {
                expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    'href':d[2],
                    'method': "GET"
                }));
                done();
            })['catch'](function(err) {
                expect(err).toBe("not have occurred");
                done();
            });
        });
    });
    
});