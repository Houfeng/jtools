/// <reference path="class.js" />

var ajax = function (options) {
    var request = new ajax.Request(options);
    request.send(options.data);
};
ajax.stringToJson = function (str) {
    var jsonObject = (new Function("return " + str + ";"))();
    return jsonObject;
};
ajax.jsonToString = function (obj) {
    var THIS = this;
    switch (typeof (obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(THIS.jsonToString).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(THIS.jsonToString(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null || obj == undefined) {
                return 'null';
            } else {
                var string = [];
                for (var p in obj)
                    string.push(THIS.jsonToString(p) + ':' + THIS.jsonToString(obj[p]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        case 'boolean':
            return obj;
        case false:
            return obj;
    }
};
ajax.handelPostData = function (_data) {
    var buffer = [];
    if ($helper.isString(_data))
        return _data;
    else if ($helper.isArray(_data))
        $helper.each(_data, function () {
            buffer.push(encodeURIComponent(this.name) + "=" + encodeURIComponent(this.value));
        });
    else
        $helper.each(_data, function (name) {
            buffer.push(encodeURIComponent(name) + "=" + encodeURIComponent(this));
        });
    return buffer.join('&');
};
ajax.wrapUrl = function (_url) {
    if (_url.indexOf('?') > -1)
        _url += "&_t=" + Math.random();
    else
        _url += "?_t=" + Math.random();
    return _url;
},
ajax.createHttpRequest = function () {
    if (window.XMLHttpRequest)
        return new window.XMLHttpRequest();
    else {
        var msReqests = ['MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0',
                'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
        $helper.each(msReqests, function () {
            try {
                var httpRequest = new ActiveXObject(this);
                return httpRequest;
            } catch (ex) { }
        });
    }
};
ajax.ajaxSend = $event(ajax, 'ajaxSend');
ajax.ajaxDone = $event(ajax, 'ajaxDone');
ajax.get = function (options) {
    options.type = 'get';
    ajax(options);
};
ajax.post = function (options) {
    options.type = 'post';
    ajax(options);
};
ajax.getJSON = function (options) {
    var _success = options.success;
    options.success = function (dt) {
        _success(ajax.stringToJson(dt));
    };
    ajax.get(options);
};
//实现跨域的异步请求方法
ajax.getJSONP = function (options) {
    options.success = options.success || options.callback; //修正回调函数
    var script = document.createElement('script');
    //生成jsonp回调函数
    var callbackName = 'jsonpcallback' + Math.random().toString().replace('.', '');
    window[callbackName] = function (data) {//函数体
        if (options.callback)
            options.callback(data);
        document.body.removeChild(script);
        window[callbackName] = null;
    };
    //
    if (options.url.indexOf('?') > -1)
        options.url += "&callback=" + callbackName;
    else
        options.url += "?callback=" + callbackName;
    options.url += "&" + ajax.handelPostData(options.data);
    script.setAttribute('src', options.url);
    document.body.appendChild(script);
};
//ajax核心对象
ajax.Request = $class({
    httpRequest: null,
    options: null,
    $init: function (_options) {
        var me = this;
        me.options = _options || {};
        me.options.type = !$helper.isNull(me.options.type) ? me.options.type : "get";
        me.options.async = !$helper.isNull(me.options.async) ? me.options.async : true;
        me.options.dataType = !$helper.isNull(me.options.dataType) ? me.options.dataType : '*/*';
        me.options.contentType = !$helper.isNull(me.options.contentType) ? me.options.contentType : 'application/x-www-form-urlencoded';
        me.options.timeout = !$helper.isNull(me.options.timeout) ? me.options.timeout : 120;
        me.options.success = options.success || options.callback;
        me.httpRequest = ajax.Request.createHttpRequest();
        me.httpRequest.open = me.httpRequest.open || me.httpRequest.Open;
        me.httpRequest.send = me.httpRequest.send || me.httpRequest.Send;
        me.httpRequest.onreadystatechange = function () {
            var request = me.httpRequest;
            if (request.readyState == 4) {
                if (request.status == 200 && me.options.success)
                    me.options.success(request.responseText);
                else if (request.status == 500 && me.options.error)
                    me.options.error(request.responseText);
                ajax.ajaxDone.tigger(request.responseText);
            }
        }
    },
    send: function (_data) {
        var me = this;
        ajax.ajaxSend.tigger(_data);
        me.httpRequest.open(me.options.type, ajax.wrapUrl(me.options.url), me.options.async);
        me.httpRequest.timeout = me.options.timeout * 1000;
        me.httpRequest.setRequestHeader("Accept", me.options.dataType);
        me.httpRequest.setRequestHeader("Content-Type", me.options.contentType);
        me.httpRequest.send(ajax.handelPostData(_data));
    }
});
