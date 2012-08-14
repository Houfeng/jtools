/// <reference path="qunit/qunit.js" />
/// <reference path="../lib/joop.js" />

module("OOP模块");
$import('../lib/joop.js', function () {
    test("引入文件 ( $import )", function () {
        ok(true, "第一次载入 '../lib/joop.js'成功");
    });
    test("命名空间 ( $namespace , $using )", function () {
        var ns1 = $namespace("demo.test", {
            Class1: $class({}),
            Class2: $class({})
        });
        var ns2 = $namespace("demo.test.abc", {
            Class3: $class({})
        });
        notEqual(ns1, null, "将命名空间作为返回值返回");
        notEqual(demo, null, "命名空间的第一节创已创建");
        notEqual(demo.test, null, "命名空间第二节已创建");
        notEqual(demo.test.Class1, null, "命名空间下的类Class1已创建");
        notEqual(demo.test.Class1, null, "命名空间下的类Class2已创建");
        $using("demo.test");
        notEqual(Class1, null, "$using (demo.test) 成功");
        $using("demo.test", 'demo');
        notEqual(Class1, null, "$using (demo.test -> demo) 成功");
    });
    test("类型及事件 ( $class )", function () {
        var Class1 = $class({
            $init: function () {
                ok(true, "执行类" + this.name + "的构造函数");
            },
            name: "Class1",
            say: function () {
                ok(true, "调用" + this.name + "的say方法");
                return this.name;
            }
        });
        notEqual(Class1, null, "创建类Class1");
        var class1 = new Class1();
        notEqual(class1, null, "创建类Class1的实例class1");
        equal(class1.say(), "Class1", "调用Class1的say方法完成");
        var Class2 = $class({
            $base: Class1,
            name: "Class2",
            $init: function () {
                this.$base.$init();
                this.onSay = $event(this, "onSay");
            },
            say: function () {
                var rs = this.$base.say();
                this.onSay();
                return rs;
            }
        });
        notEqual(Class2, null, "继承Class1创建类Class2");
        var class2 = new Class2();
        notEqual(class2, null, "创建类Class2的实例class2");
        class2.onSay(function () {
            ok(true, "class2的onSay事件触发");
        });
        equal(class2.say(), "Class2", "调用Class2的say方法完成");
    });
});
$import('../lib/joop.js', function () {
    test("引入文件 ( $import )", function () {
        ok(true, "第二次载入 '../lib/joop.js'成功");
    });
});
