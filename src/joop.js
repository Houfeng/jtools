/**
 * @description OOP模块，为JS提供OOP机制，拥有完整的继承，多态，封装等面向对象特性。
 * @author      侯锋
 * @email       admin@xhou.net
 * @blog        http://www.houfeng.net
 */

/**
 * 核心辅助方法
 * @type {Object}
 */
$helper = {
    /**
     * 除去字符串两端的空格
     * @param  {String} str 源字符串
     * @return {String}     结果字符串
     */
    trim: function(str) {
        if (str && str.trim) return str.trim();
        else return str.replace(/(^[\\s]*)|([\\s]*$)/g, "");
    },
    /**
     * 验证一个对象是否为NULL
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isNull: function(obj) {
        return obj == null;
    },
    /**
     * 验证一个对象是否为Function
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isFunction: function(obj) {
        return typeof obj === "function";
    },
    /**
     * 验证一个对象是否为String
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isString: function(obj) {
        return typeof obj === 'string';
    },
    /**
     * 验证一个对象是否为Number
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isNumber: function(obj) {
        return typeof obj === 'number';
    },
    /**
     * 验证一个对象是否为HTML Element
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isElement: function(obj) {
        if (window.Element) return obj instanceof Element;
        else return (obj.tagName && obj.nodeType && obj.nodeName && obj.attributes && obj.ownerDocument);
    },
    /**
     * 验证一个对象是否为HTML Text Element
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isText: function(obj) {
        return obj instanceof Text;
    },
    /**
     * 验证一个对象是否为Object
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isObject: function(obj) {
        return typeof obj === "object";
    },
    /**
     * 验证一个对象是否为Array或伪Array
     * @param  {Object}  obj 要验证的对象
     * @return {Boolean}     结果
     */
    isArray: function(obj) {
        if (!obj) return false;
        var _isArray = ((obj instanceof Array) || (!this.isString(obj) && obj.length && this.isNumber(obj.length)));
        return _isArray;
    },
    /**
     * 遍历一个对像或数组
     * @param  {Object or Array}   obj  要遍历的数组或对象
     * @param  {Function} fn            处理函数
     * @return {void}                   无返回值
     */
    each: function(obj, fn) {
        if (this.isArray(obj)) {
            for (var i = 0; i < obj.length; i++)
            fn.call(obj[i], i);
        } else {
            for (var i in obj)
            if ($helper.isFunction(fn)) fn.call(obj[i], i);
        }
        return obj;
    },
    /**
     * 抛出一个异常
     * @param  {String} msg 异常信息
     * @return {void}       无返回值
     */
    throwError: function(msg) {
        //alert(msg);
    }
};

/**
 * 定义一个class(类)
 * @param  {Object} params 类的实现
 * @return {Class}         类型
 */

function $class(params) {
    /**
     * 类
     * @return {Object} 返回值
     */
    var newClass = function() {
            var me = this;
            //改变父类的作用域，判断父类类型的向个系统函数不能改变作用域
            if (me.$base) {
                for (var name in me.$base) {
                    if (name != "$is" && name != "$base" && name != "$type" && name != "$baseType" && $helper.isFunction(me.$base[name])) {
                        var func = me.$base[name];
                        me.$base[name] = function() {
                            return func.apply(me, arguments);
                        }
                    }
                }
            }
            //定义$type
            me.$type = newClass;
            /**
             * 判断实例是否是指定class(类)
             * @param  {Class} t   类型
             * @return {Boolern}   bool结果
             */
            me.$is = function(t) {
                return me.$type === t || me.$baseType === t || (me.$base != null && me.$base.$is != null && me.$base.$is(t));
            }
            //调用构造
            var rs = null;
            if (me.$init && $helper.isFunction(me.$init)) rs = me.$init.apply(me, arguments);
            //调用扩展构造（可以理解为初始化执行的函数）
            if (me.$initList) {
                for (var i in me.$initList)
                if (me.$initList[i] && $helper.isFunction(me.$initList[i])) me.$initList[i].apply(me, arguments);
            }
            //返回构造函数据的返回值
            return rs;
        };
    /**
     * 扩展实例功能，此方法可扩展类的实例功能
     * @param  {Object} fns       扩展对象，包含要添加到实例的成员
     * @param  {Boolern} internal 是否为内部调用
     * @param  {Boolern} keepfn   如果fns是函数，是否将Function本身作为扩展
     * @return {void}             无返回值
     */
    var _extend = function(fns, internal, keepfn) { //私有
            if ($helper.isFunction(fns) && !keepfn) {
                var _body = new fns();
                fns = _body;
            }
            if (!newClass.prototype.$initList) newClass.prototype.$initList = [];
            for (var name in fns) {
                if (!internal && name == "$init" && $helper.isFunction(fns[name])) newClass.prototype.$initList.push(fns[name]);
                else newClass.prototype[name] = fns[name];
            }
            return newClass;
        };
    /**
     * 扩展实例功能，此方法可扩展类的实例功能
     * @param  {Object} fns     扩展对象，包含要添加到实例的成员
     * @param  {Boolern} keepfn 如果fns是函数，是否将Function本身作为扩展
     * @return {void}           无返回值
     */
    newClass.$extend = function(fns, keepfn) {
        _extend(fns, false, keepfn);
    };
    /**
     * 扩展类功能，此方法可扩展类的静态方法
     * @param  {Object} fns     扩展对象，包含要添加到类的成员
     * @param  {Boolern} keepfn 如果fns是函数，是否将Function本身作为扩展
     * @return {void}           无返回值
     */
    newClass.$static = function(fns, keepfn) {
        if ($helper.isFunction(fns) && !keepfn) {
            var _body = new fns();
            fns = _body;
        }
        for (var name in fns) {
            newClass[name] = fns[name];
            if (name == "$init" && $helper.isFunction(fns[name])) newClass[name].apply(newClass);
        }
        return newClass;
    };
    /**
     * 将成员附加到当前类中
     */
    if (params.$base) {
        var base = params.$base;
        params.$baseType = base;
        params.$base = new base();
        //添加
        _extend(params.$base, true); //添加父类成员
        _extend(params, true); //添加当前类成员
        newClass.$static(params.$baseType, true); //添加静态成员
    } else {
        _extend(params, true);
    }
    //返回新类型
    return newClass;
};

/**
 * 为对象定义一个事件
 * @param  {Object} src      要添加事件的对象
 * @param  {String} name     事件名称
 * @param  {$event.bindType} bindType 事件绑定类型
 * @return {Event}           定义的事件
 */

function $event(src, name, bindType) {
    //默认为当前对象，如果没有在一个自定义对象中使用，this指向的是window
    var me = this;
    //默契第一个参数据事件名，第二个为对象
    if (src && $helper.isString(name)) me = src;
    //为了支持第一个参数为对象，第二个参为事件名的写法
    if (name && $helper.isString(src)) {
        me = name;
        name = src;
    }
    //事件存放列表
    if (!me._eventList) me._eventList = {};
    //如果事件不存则添加
    if (!me._eventList[name]) {
        me._eventList[name] = [];
        //用以支持系统对象的系统事件
        me.addEventListener = me.addEventListener ||
        function(name, fn) {
            if (me.attachEvent) me.attachEvent("on" + name, fn);
        };
        me.removeEventListener = me.removeEventListener ||
        function(name, fn) {
            if (me.detachEvent) me.detachEvent("on" + name, fn);
        };
        //处理绑定类型
        if (bindType == null && bindType != 0) {
            if ($helper.isArray(me) && !$helper.isElement(me)) bindType = $event.bindType.child;
            else bindType = $event.bindType.self;
        }
        //实现对数组批量支持(支持数组及伪数组),迭代器
        me._each = function(fn, _bindType) {
            if ($helper.isArray(me) && !$helper.isElement(me) && $event.bindType.self != _bindType && me[0]) {
                $helper.each(me, fn);
            }
            return me;
        }
        //如果指定的事件已经定义过，则将原有定义转存$+name形式备用
        if (me[name]) me["$" + name] = me[name];
        /**
         * 添加一个事件处理或触事件
         * @param  {Function} fn  事件处理函数
         * @param  {Object}   obj 处理函数据的作用域对象
         * @return {void}         无返回值
         */
        me[name] = function(fn, obj) {
            if (fn && $helper.isFunction(fn)) me[name].bind(fn, obj);
            else me[name].tigger.apply(me[name], arguments);
            return me;
        };
        /**
         * 清空事件处理函数
         * @return {void} 无返回值
         */
        me[name].clear = function() {
            //如果是数组或伪数组
            me._each(function() {
                $event(name, this).clear();
            }, bindType);
            //
            me._eventList[name] = [];
            return me;
        };
        /**
         * 验证一个处理函数是否已经添加
         * @param  {Function} fn 处理函数
         * @return {Boolean}     Bool值
         */
        me[name].has = function(fn) {
            var list = me._eventList[name];
            for (var i = 0; i < list.length; i++) {
                if (list[i] == fn) return true;
            }
        };
        /**
         * 添加（绑定）一个事件处理函数
         * @param  {Function} fn  处理函数
         * @param  {Object}   obj 处理函数作用对象
         * @return {void}         无运回值
         */
        me[name].add = me[name].bind = function(fn, obj) {
            //如果是数组或伪数组
            me._each(function() {
                $event(name, this).add(fn, obj);
            }, bindType);
            //
            if (me[name].has(fn) || $event.bindType.child == bindType) return me;
            fn._src = obj;
            me._eventList[name].push(fn);
            //如果为系统对象支持系统事件
            if (me.addEventListener && me.removeEventListener) {
                fn.$invoke = function(event) {
                    var rs = fn.apply(me, arguments);
                    if (rs === false) { //阻止事件冒泡
                        if (event.cancelBubble) event.cancelBubble = true;
                        if (event.preventDefault) event.preventDefault();
                        if (event.stopPropagation) event.stopPropagation();
                    }
                }
                me.addEventListener(name, fn.$invoke);
            }
            return me;
        };
        /**
         * 移除（解绑）一个事件处理函数
         * @param  {Function} fn 处理函数
         * @return {void}     无返回值
         */
        me[name].remove = me[name].unbind = function(fn) {
            //如果是数组或伪数组
            me._each(function() {
                $event(name, this).remove(fn);
            }, bindType);
            //
            if ($event.bindType.child == bindType) return me;
            //
            if (me.addEventListener && me.removeEventListener) {
                me.removeEventListener(name, fn.$invoke);
            }
            //
            for (var i in me._eventList[name]) {
                if (me._eventList[name][i] = fn) me._eventList[name][i] = null;
            }
            return me;
        };
        /**
         * 触发一个事件
         * @return {void} 无返回值
         */
        me[name].tigger = me[name].fire = function() {
            /// <summary>触发</summary>
            var args = arguments;
            //如果是数组或伪数组
            me._each(function() {
                $event(name, this).tigger.apply(this[name], args);
            }, bindType);
            //  
            if (me["$" + name]) {
                me["$" + name].apply(me, args);
                return;
            }
            //
            for (var i in me._eventList[name]) {
                if (me._eventList[name][i] != null) {
                    var src = me._eventList[name][i]._src;
                    if (src == null) src = me;
                    if (src) me._eventList[name][i].apply(src, args);
                }
            }
            return me;
        };
    }
    //返回事件
    return me[name];
};

/**
 * 事件绑定类型
 * @type {Object}
 */
$event.bindType = {
    self: 0,
    child: 1,
    all: 2
};

/**
 * 定义一个命名空间
 * @param  {String} _namespace 命名空间名称
 * @param  {Object} _class     包含命名空间下的类定义
 * @return {Namespace}         返回定义的命名空间
 */

function $namespace(_namespace, _class) {
    var createNamespace = function(_name, _parentObject) {
            _parentObject = _parentObject || window;
            if (_parentObject[_name] == null) _parentObject[_name] = {};
            return _parentObject[_name];
        };
    var parentObject = window;
    if (_namespace && $helper.isString(_namespace)) {
        var nameList = _namespace.split('.');
        $helper.each(nameList, function() {
            parentObject = createNamespace(this, parentObject);
        });
    } else if (_namespace) parentObject = _namespace;
    //----
    if (_class) {
        $helper.each(_class, function(className) {
            if (!parentObject[className]) parentObject[className] = this;
            else $helper.throwError("'" + className + "' already exists");
        });
    }
    return parentObject;
};

/**
 * 引入一个命名空间
 * @param  {String} _namespace 命名空间完成名称
 * @param  {String} _shortName 短名称
 * @return {Namespace}         引入的命名空间
 */

function $using(_namespace, _shortName) {
    return $namespace(_shortName, $namespace(_namespace));
}

/**
 * 引入一个外部脚本
 * @param  {Array or String}   urlList  一个或多个外部脚本
 * @param  {Function} callback 引入成功回调
 * @return {void}              无返回值
 */

function $import(urlList, callback) {
    if (typeof urlList === "string") urlList = [urlList];
    var readyCount = 0;
    $helper.each(urlList, function() {
        var _url = this;
        if ($import.cache[_url]) {
            if (callback) $import.cache[_url].callbackList.push(callback);
            if ($import.cache[_url].ready) $import.cache[_url].load();
            return;
        }
        var _script = document.createElement('script');
        _script.src = _url;
        _script.callbackList = [];
        if (callback) _script.callbackList.push(callback);
        _script.load = _script.onload || _script.onreadystatechange;
        _script.load = $event(_script, 'load');
        _script.load(function() {
            var _state = this.readyState || "loaded";
            if (_state == "loaded" || _state == "interactive" || _state == "complete") {
                _script.ready = true;
                readyCount++;
                if (readyCount >= urlList.length) {
                    $helper.each(_script.callbackList, function(i) {
                        if (_script.callbackList[i]) _script.callbackList[i]();
                        _script.callbackList[i] = null;
                    });
                }
            }
        });
        $import.cache[_url] = _script;
        var container = document.getElementsByTagName('head');
        if (container && $helper.isArray(container)) container = container[0] || document.body;
        else container = document.body;
        //将script添加到页面
        container.appendChild(_script);
    });
};
/**
 * 引入缓存，用来防止重复引入
 * @type {Object}
 */
$import.cache = {};