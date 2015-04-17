var TestApi=ozpIwc.createApi(function() {});
TestApi.useDefaultRoute(ozpIwc.ApiBase.allActions);

describe("ApiBase",function() {
	var apiBase;
    
    
	beforeEach(function() {
		apiBase=new TestApi({
			'participant': new TestClientParticipant(),
            'name': "testApiBase.api"
		});
        
        apiBase.data["/foo"]=new ozpIwc.ApiNode({
            resource: "/foo",
            self: "https://example.com/iwc/foo",
            contentType: "text/plain",
            entity: "hello world"
        });
        apiBase.data["/foo/1"]=new ozpIwc.ApiNode({
            resource: "/foo/1",
            self: "https://example.com/iwc/foo/1",
            contentType: "text/plain",
            entity: "resource 1"
        });
        apiBase.data["/foo/2"]=new ozpIwc.ApiNode({
            resource: "/foo/2",
            self: "https://example.com/iwc/foo/2",
            contentType: "text/plain",
            entity: "resource 2"
        });
	});
    
    var testPacket=function(packet) {
        packet.src=packet.src || "unitTest";
        packet.msgId=packet.msgId || "i:1";
        packet.resource=packet.resource || "/foo";
        return new TestPacketContext({
            'leaderState': "leader",
            'packet': packet
        });
    };

//=====================================================================
// Basic Actions: Get
//=====================================================================
    describe("action get",function() {
        pit("returns a valid resource",function() {
            var context=testPacket({action:"get",resource:"/foo"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].contentType).toEqual("text/plain");
                expect(context.responses[0].entity).toEqual("hello world");
            });
        });

        pit("returns noResource for non-existent resource",function() {
            var context=testPacket({action:"get",resource:"/does-not-exist"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noResource");
                expect(context.responses[0].entity).toBeDefined();
            });
        });
    });
    

//=====================================================================
// Basic Actions: List
//=====================================================================

    describe("action list",function() {
        pit("returns an array of matching resources",function() {
            var context=testPacket({action:"list",resource:"/foo/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0]).toEqual(jasmine.objectContaining({
                    contentType: "application/json",
                    entity: ["/foo/1","/foo/2"]
                }));
            });
        });
        pit("returns an empty list if nothing matches",function() {
            var context=testPacket({action:"list",resource:"/does-not-exist/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0]).toEqual(jasmine.objectContaining({
                    contentType: "application/json",
                    entity: []
                }));
            });
        });
    });
//=====================================================================
// Basic Actions: bulkGet
//=====================================================================

    describe("action bulkGet",function() {
        pit("returns an array of matching resources",function() {
            var context=testPacket({action:"bulkGet",resource:"/foo/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].entity[0]).toEqual(jasmine.objectContaining({
                    contentType: "text/plain",
                    entity: "resource 1"
                }));
                expect(context.responses[0].entity[1]).toEqual(jasmine.objectContaining({
                    contentType: "text/plain",
                    entity: "resource 2"
                }));
            });
        });
        pit("returns an empty list if nothing matches",function() {
            var context=testPacket({action:"bulkGet",resource:"/does-not-exist/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].entity).toEqual([]);
            });
        });

    
    });
    
//=====================================================================
// Basic Actions: set
//=====================================================================
    describe("action set",function() {
        pit("modifies an existant resource",function() {
            var context=testPacket({
                    'resource': "/foo",
                    'action': "set",
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].entity).toEqual({foo:1});
                
            });
        });

        pit("creates a non-existent resource",function() {
            var context=testPacket({
                    'resource': "/does-not-exist",
                    'action': "set",
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/does-not-exist"].entity).toEqual({foo:1});
                
            });
        });
        pit("returns noMatch for a bad version pre-condition",function() {
            var context=testPacket({
                    'resource': "/foo",
                    'action': "set",
                    'ifTag': 20,
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noMatch");
                expect(context.responses[0].entity.expectedVersion).toEqual(20);
                expect(context.responses[0].entity.actualVersion).toEqual(0);
            });
        });
    });
//=====================================================================
// Basic Actions: delete
//=====================================================================
    describe("action delete",function() {
        pit("deletes an existant resource",function() {
            var context=testPacket({action:"delete",resource:"/foo"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].deleted).toEqual(true);
                
            });
        });

        pit("deletes a non-existent resource",function() {
            var context=testPacket({action:"delete",resource:"/does-not-exist"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/does-not-exist"]).toBeUndefined();
                
            });
        });
        pit("returns noMatch for a bad version pre-condition",function() {
            var context=testPacket({
                action: "delete",
                resource:"/foo",
                ifTag: 20
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noMatch");
                expect(context.responses[0].entity.expectedVersion).toEqual(20);
                expect(context.responses[0].entity.actualVersion).toEqual(0);
            });
        });
    });
//=====================================================================
// Basic Actions: watch
//=====================================================================

    describe("action watch on an existing resource",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/foo"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        pit("returns the current value",function() {
            return apiBase.receivePacketContext(watchContext).then(function() {
                expect(watchContext.responses.length).toEqual(1);
                expect(watchContext.responses[0].response).toEqual("ok");
                expect(watchContext.responses[0].contentType).toEqual("text/plain");
                expect(watchContext.responses[0].entity).toEqual("hello world");
            });
        });
        
        pit("notifies watchers when the resource value changes",function() {
            var context=testPacket({
                resource: "/foo",
                action: "set",
                entity: { foo:1}
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                console.log("Testing expectations");
                expect(apiBase.participant).toHaveSent({
                    resource: "/foo",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: { foo:1},
                        oldValue: "hello world"
                    }
                });
            });
        });
        pit("deleting the resource broadcasts to watchers",function() {
            var context=testPacket({action:"delete",resource:"/foo"});
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(apiBase.participant).toHaveSent({
                    resource: "/foo",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: null,
                        oldValue: "hello world"
                    }
                });
            });
        });
    });
    describe("action watch on an non-existent resource",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/does-not-exist"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        
        pit("returns a null value",function() {
            return apiBase.receivePacketContext(watchContext).then(function() {
                expect(watchContext.responses.length).toEqual(1);
                expect(watchContext.responses[0].response).toEqual("ok");
                expect(watchContext.responses[0].contentType).toBeUndefined();
                expect(watchContext.responses[0].entity).toBeUndefined();
            });
        });
        pit("broadcasts to watchers when the resource is created",function() {
            var context=testPacket({
                resource: "/does-not-exist",
                action: "set",
                entity: { foo:1}
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(apiBase.participant).toHaveSent({
                    resource: "/does-not-exist",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: { foo:1},
                        oldValue: undefined
                    }
                });
            });
        });
        pit("a watch on a non-existant resource does not create that resource",function() {
            var context=testPacket({
                resource: "/does-not-exist",
                action: "get"
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(context.responses[0].response).toEqual("noResource");
            });
        });

    });
//=====================================================================
// Basic Actions: unWatch
//=====================================================================

    describe("action unwatch",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/foo"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        
        pit("removes an existant watch",function() {
            var context=testPacket({
                resource: "/foo",
                action: "unwatch"
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(function() {
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.watchers["/foo"].length).toEqual(0);
            });
        });
        pit("is a NOP if there is no watch",function() {
            var context=testPacket({
                resource: "/foo",
                action: "unwatch"
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.watchers["/foo"]).toBeUndefined(0);
            });
        });

    });    
});