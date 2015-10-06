var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */



ozpIwc.transport.participant.SharedWorker = (function (log, transport, util) {
    /**
     * @class SharedWorker
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     *
     * @param {Object} config
     * @param {String} config.origin
     * @param {Object} config.sourceWindow
     * @param {Object} config.credentials
     * @param {Promise} [config.ready]
     */
    var SharedWorker = util.extend(transport.participant.Base, function (config) {
        transport.participant.Base.apply(this, arguments);

        /**
         * The origin of the Participant.
         * @property origin
         */
        /**
         * The name of the Participant.
         * @property name
         */
        this.origin = this.name = config.origin;

        /**
         * The MessageChannel port to communicate on
         * @property sourceWindow
         * @type Window
         */
        this.port = config.port;

        /**
         * @property credentials
         * @type {Object}
         */
        this.credentials = config.credentials;

        /**
         * The type of the participant.
         * @property participantType
         * @type  String
         * @default "postMessageProxy"
         */
        this.participantType = "postMessageProxy";

        this.permissions.pushIfNotExist("ozp:iwc:origin", this.origin);

        this.on("connectedToRouter", function () {
            this.permissions.pushIfNotExist('ozp:iwc:address', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:sendAs', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:receiveAs', this.address);
        }, this);
        /**
         * @property heartBeatStatus.origin
         * @type String
         */
        this.heartBeatStatus.origin = this.origin;

        var self = this;
        this.port.addEventListener("message", function (e) {
            var data = e.data;
            if(typeof(data) === "string"){
                try {
                    data = JSON.parse(e.data);
                } catch(e){
                    // may not be failure, whomever gets forwarded the message
                    // can choose to allow strings instead of objects.
                }
            }
            if (data && data.windowEvent) {
                self.handleWindowEvent(data.windowEvent);
            }
            self.forwardFromMessageChannel(data, e);
        }, false);
    });

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * The participant hijacks anything addressed to "$transport" and serves it
     * directly.  This isolates basic connection checking from the router, itself.
     *
     * @method handleTransportpacket
     * @private
     * @static
     * @param {ozpIwc.transport.packet.SharedWorker} participant
     * @param {Object} packet
     */
    var handleTransportPacket = function (participant, packet) {
        var reply = {
            'ver': 1,
            'dst': participant.address,
            'src': '$transport',
            'replyTo': packet.msgId,
            'msgId': participant.generateMsgId(),
            'entity': {
                "address": participant.address
            }
        };

        participant.sendToRecipient(reply);
    };


//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Receives a packet on behalf of this participant and forwards it via SharedWorker.
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    SharedWorker.prototype.receiveFromRouterImpl = function (packetContext) {
        this.sendToRecipient(packetContext.packet);
    };

    /**
     * Sends a message to the other end of our connection.  Wraps any string mangling
     * necessary by the SharedWorker implementation of the browser.
     *
     * @method sendToParticipant
     * @param {ozpIwc.packet.Transport} packet
     * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
     */
    SharedWorker.prototype.sendToRecipient = function (packet) {
        this.port.postMessage(packet);
    };


    /**
     * Sends a packet received via SharedWorker to the Participant's router.
     *
     * @method forwardFromPostMessage
     * @todo track the last used timestamp and make sure we don't send a duplicate messageId
     * @param {ozpIwc.packet.Transport} packet
     * @param {Event} event
     */
    SharedWorker.prototype.forwardFromMessageChannel = function (packet, event) {
        if (typeof(packet) !== "object") {
            log.error("Unknown packet received: " + JSON.stringify(packet));
            return;
        }
        if (event.origin !== this.origin) {
            /** @todo participant changing origins should set off more alarms, probably */
            if (this.metrics) {
                this.metrics.counter("transport." + this.address + ".invalidSenderOrigin").inc();
            }
            return;
        }

        packet = this.fixPacket(packet);

        // if it's addressed to $transport, hijack it
        if (packet.dst === "$transport") {
            handleTransportPacket(this, packet);
        } else {
            this.router.send(packet, this);
        }
    };

    /**
     * A handler for forwarded events from this participants corresponding window.
     * @TODO Currently just the event type is passed
     * @method handleWindowEvent
     * @param {String} eventType
     */
    SharedWorker.prototype.handleWindowEvent = function (eventType) {
        switch (eventType) {
            case "beforeunload":
                this.leaveEventChannel();
                break;
        }

    };

    return SharedWorker;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));
