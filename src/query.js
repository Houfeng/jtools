/// <reference path="class.js" />
/// <reference path="sizzle.js" />
/// <reference path="effect.js" />


var $ = query = function (selector, context) {
    /// <summary>查找页面元素</summary>
    /// <param name="selector" type="String">查询字字符</param>
    /// <param name="context" type="Object">限定父级范围</param>
    /// <returns type="Array" />
    return new query.Fn(selector, context);
};

//定义
query.Fn = $class({
    $init: function (selector, context) {
        var me = this;
        if (!selector)
            return;
        if (query.Fn.isFunction(selector)) {
            query.Fn.ready(selector);
            return;
        }
        if (selector.$type === query.Fn)
            return selector;
        if (query.Fn.isString(selector) && selector.indexOf('<') > -1 && selector.indexOf('>') > -1)
            return query(query.Fn.domParse(selector));
        if (query.Fn.isString(selector))
            selector = query.Fn.find(selector, context);
        if (query.Fn.isArray(selector) && !query.Fn.isElement(selector)) {
            query.Fn.each(selector, function (i) {
                me[i] = this;
            });
            me.length = selector.length;
            return;
        }
        if (selector) {
            me[0] = selector;
            me.length = 1;
            return;
        }
    },
    each: function (fn) {
        query.Fn.each(this, fn);
        return this;
    }
});

//静态方法
query.Fn.$static($helper).$static({
    $init: function () {
        this.ready = $event(this, 'ready');
        if (document.readyState
        && (document.readyState === "complete" || document.readyState === "loaded"))
            this.ready.tigger();
        $event(document, "DOMContentLoaded").bind(this.ready.tigger);
    },
    _find: function (selector, context) {
        context = context || document;
        if (window.Sizzle)
            return window.Sizzle(selector, context);
        if (context && context.querySelectorAll)
            return context.querySelectorAll(selector);
        else
            return function () { };
    },
    find: function (selector, context) {
        context = context || document;
        var _list = [];
        query(context).each(function () {
            var rs = query.Fn._find(selector, this);
            query.Fn.each(rs, function () {
                _list.push(this);
            });
        });
        return _list;
    },
    domParse: function (context) {
        if (!this._parse_dom_div)
            this._parse_dom_div = document.createElement('div');
        if (this.isString(context)) {
            this._parse_dom_div.innerHTML = context;
            return this._parse_dom_div.childNodes;
        }
        else if (query.Fn.isElement(context)) {
            this._parse_dom_div.appendChild(context);
            return this._parse_dom_div.innerHTML;
        }
    }
});

//方法
query.Fn.$extend({
    //选取
    find: function (selector) {
        return query(selector, this);
    },
    parent: function () {
        return query(this[0].parentNode);
    },
    contents: function () {
        return query(this[0].childNodes);
    },
    pre: function () {
        var that = this[0].previousSibling;
        while (query.Fn.isText(that))
            that = that.previousSibling
        return query(that);
    },
    next: function () {
        var that = this[0].nextSibling;
        while (query.Fn.isText(that))
            that = that.nextSibling
        return query(that);
    },
    eq: function (index) {
        if (index < 0)
            return query(this[this.length - 1]);
        return query(this[index]);
    },
    first: function () {
        return this.eq(0);
    },
    last: function () {
        return this.eq(-1);
    },
    //dom
    remove: function () {
        return this.each(function () {
            if (this.parentNode && this.parentNode.removeChild)
                this.parentNode.removeChild(this, true);
        });
    },
    clone: function () {
        return query(this[0].cloneNode(true));
    },
    append: function (a) {
        if (typeof a == "string") {
            return this.each(function () {
                this.innerHTML += a;
            });
        }
        else {
            return this.each(function () {
                var me = this;
                query(a).each(function () {
                    me.appendChild(this);
                });
            });
        }
    },
    appendTo: function (a) {
        return this.each(function () {
            var me = this;
            query(a).each(function () {
                query(this).append(me);
            });
        });
    },
    replace: function (a) {
        this.before(a);
        this.remove();
    },
    before: function (a) {
        return this.each(function () {
            var me = this;
            query(a).each(function () {
                me.parentNode.insertBefore(this, me);
            });
        });
    },
    after: function (a) {
        return this.each(function () {
            var me = this;
            query(a).each(function () {
                me.parentNode.insertBefore(this, me.nextSibling);
                me = this;
            });
        });
    },
    wrap: function (a) {
        var a = query(a);
        this.before(a);
        this.appendTo(a);
    },
    wrapInner: function (a) {
        return this.each(function () {
            var me = query(this);
            var oldContents = me.contents();
            var wrap = query(a);
            me.append(wrap);
            wrap.append(oldContents);
        });
    },
    html: function (a) {
        if (a)
            return this.each(function () { this.innerHTML = a; });
        else {
            var buffer = [];
            this.each(function () { buffer.push(this.innerHTML); });
            return buffer.join('');
        }
    },
    text: function (a) {
        if (a)
            return this.each(function () { this.innerText = a; });
        else {
            var buffer = [];
            this.each(function () { buffer.push(this.innerText); });
            return buffer.join('');
        }
    },
    //特性/属性
    attr: function (a, b) {
        if (a && query.Fn.isString(a) && b)
            return this.each(function () { this.setAttribute(a, b); });
        else if (a && query.Fn.isString(a) && !b)
            return this[0].getAttribute(a);
        else if (a && query.Fn.isObject(a))
            return this.each(function () {
                var me = this;
                query.Fn.each(a, function (name) {
                    me.setAttribute(name, this);
                });
            });
        else
            return this;
    },
    removeAttr: function (a) {
        if (query.Fn.isArray(a))
            return this.each(function () {
                var me = this;
                query.Fn.each(a, function () {
                    me.removeAttribute(this);
                });
            });
        else
            return this.each(function () {
                this.removeAttribute(a);
            });
    },
    pop: function (a, b) {
        if (a && query.Fn.isString(a) && !query.Fn.isNull(b))
            return this.each(function () {
                this[a] = b;
            });
        else if (a && query.Fn.isString(a) && query.Fn.isNull(b))
            return this[0][a];
        else if (a && query.Fn.isObject(a))
            return this.each(function () {
                var me = this;
                query.Fn.each(a, function (name) {
                    me[name] = this;
                });
            });
        else
            return this;
    },
    data: function (a, b) {
        return this.pop(a, b);
    },
    val: function (a) {
        if (a)
            return this.each(function () { this.value = a; });
        else if (this[0]) {
            return this[0].value;
        }
        return this;
    },
    //样式
    addClass: function (a) {
        var me = this;
        if (query.Fn.isArray(a))
            query.Fn.each(a, function () {
                me.addClass(this);
            });
        else
            return this.each(function (i) {
                if (!query(this).hasClass(a)) {
                    var className = this.className || '';
                    var classList = className.split(' ');
                    classList.push(a);
                    this.className = classList.join(' ');
                }
            });
    },
    removeClass: function (a) {
        var me = this;
        if (query.Fn.isArray(a))
            query.Fn.each(a, function () {
                me.removeClass(this);
            });
        else
            return this.each(function () {
                if (query(this).hasClass(a)) {
                    var className = this.className || '';
                    var classList = className.split(' ');
                    classList.splice(a, 1);
                    this.className = classList.join(' ');
                }
            });
    },
    hasClass: function (a) {
        var rs = false;
        this.each(function () {
            var className = this.className || '';
            var classList = className.split(' ');
            for (var i in classList) {
                if (classList[i] == a) {
                    rs = true;
                    return rs;
                }
            }
        });
        return rs;
    },
    css: function (a, b) {
        if (a && b)
            return this.each(function () {
                if (this.style && this.style[a])
                    this.style[a] = b;
            });
        else if (a && !query.Fn.isString(a))
            return this.each(function () {
                for (var i in a)
                    this.style[i] = a[i];
            });
        else if (a && this[0])
            return this[0].style[a];
        else
            return this;
    },
    offset: function () {
        var me = this[0];
        if (!me) return this;
        var _offset = {
            left: me.offsetLeft,
            top: me.offsetTop,
            width: me.offsetWidth,
            height: me.offsetHeight
        };
        return _offset;
    },
    width: function (a) {
        if (a) {
            return this.each(function () {
                if (this.style)
                    this.style.width = parseInt(a) + "px";
            });
        }
        else if (this[0] && this[0].style)
            return parseInt(this[0].style.width);
    },
    height: function (a) {
        if (a) {
            return this.each(function () {
                if (this.style)
                    this.style.height = parseInt(a) + "px";
            });
        }
        else if (this[0] && this[0].style)
            return parseInt(this[0].style.height);
    },
    outerWidth: function () {
        return this.offset().width;
    },
    outerHeight: function () {
        return this.offset().height;
    },
    //效果
    animate: function (styles, dur, callback, tween) {
        var eff = new Effect(this, styles, dur, callback, tween);
        eff.start();
        return this.each(function () {
            query(this).data('$animateId', eff);
        });
    },
    stop: function () {
        return this.each(function () {
            var eff = query(this).data('$animateId');
            if (eff && eff.stop)
                eff.stop();
        });
    },
    show: function () {
        return this.each(function () {
            var me = query(this);
            var dsp = me.data('$old-display') || '';
            me.css({ 'display': dsp });
        });
    },
    hide: function () {
        return this.each(function () {
            var me = query(this);
            var old = me.css('display');
            me.data('$old-display', old != 'none' ? old : '');
            me.css('display', 'none');
        });
    },
    fadeIn: function (dur, callback) {
        if (query.Fn.isNull(dur))
            dur = 600;
        if (query.Fn.isFunction(dur)) {
            callback = dur;
            dur = 600;
        }
        return this.each(function () {
            var me = query(this);
            var op = me.data('$old-opacity') || 1;
            me.animate({ 'opacity': op }, dur, callback);
        });
    },
    fadeOut: function (dur, callback) {
        if (query.Fn.isNull(dur))
            dur = 600;
        if (query.Fn.isFunction(dur)) {
            callback = dur;
            dur = 600;
        }
        return this.each(function () {
            var me = $(this);
            var old = parseFloat(me.css('opacity'));
            me.data('$old-opacity', old > 0 ? old : 1);
            me.animate({ 'opacity': 0 }, dur, callback);
        });
    }
});

//事件
query.Fn.$extend({
    bind: function (name, fn) {
        if (!this[name])
            this[name] = $event(this, name);
        if (fn)
            this[name].bind(fn);
        return this;
    },
    unbind: function (name, fn) {
        if (this[name]) {
            if (fn)
                this[name].unbind(fn);
            else
                this[name].clear();
        }
        return this;
    },
    $init: function () {
        var _events = ['contextmenu', 'scroll', 'resize',
        'click', 'dblclick', 'mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout',
        'touchstart', 'touchmove', 'touchend',
        'focus', 'blur', 'change', 'keyup', 'keydown', 'keypress'
        ];
        for (var i = 0; i < _events.length; i++)
            this.bind(_events[i]);
    }
});