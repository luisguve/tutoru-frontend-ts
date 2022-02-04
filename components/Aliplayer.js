var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useEffect, useRef, useMemo } from 'react';
import fetchJsFromCDN from 'fetch-js-from-cdn';

var SOURCE_URL = 'https://g.alicdn.com/de/prismplayer/2.9.3/aliplayer-min.js';
var Aliplayer = function (_a) {
    var config = _a.config, onGetInstance = _a.onGetInstance, _b = _a.sourceUrl, sourceUrl = _b === void 0 ? SOURCE_URL : _b;
    if (!config) {
        throw new Error('Missing Aliplayer config');
    }
    if (!sourceUrl || !/^http/.test(sourceUrl)) {
        throw new Error('Invalid source url, default is: ' + SOURCE_URL);
    }
    var id = useMemo(function () { return "aliplayer-" + Math.floor(Math.random() * 1000000); }, []);
    var player = useRef(null);
    useEffect(function () {
        if (!id || player.current) {
            return;
        }
        fetchJsFromCDN(sourceUrl, 'Aliplayer')
            .then(function (data) {
            var Aliplayer = data;
            if (player.current) {
                return;
            }
            player.current = new Aliplayer(__assign(__assign({}, config), { "id": id }), function (player) {
                onGetInstance && onGetInstance(player);
            });
        });
    }, [id, config]);
    useEffect(function() {
        if (window) {
            require("./deps/aliplayercomponent-1.0.5.min.js")
        }
    }, [])
    return React.createElement("div", { id: id });
};

export default Aliplayer;
