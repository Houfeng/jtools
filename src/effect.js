/// <reference path="class.js" />
/// <reference path="tween.js" />

/*动画效果类*/
var Effect = $class({
    $init: function (els, styles, dur, callback, tween) {
        this.els = els;
        this.styles = styles;
        this.dur = dur >= Effect.pluse ? dur : Effect.pluse;
        this.callback = callback;
        if (tween)
            this.tween = tween;
        else
            this.tween = Effect.tween.defaultTween;
        //
        this.fxList = [];
        this.stepPos = 0;
        this.stepLength = this.dur / Effect.pluse;
        this.createFxs();
        this.step();
    },
    createFxs: function () {
        var me = this;
        $helper.each(me.els, function () {
            var el = this;
            $helper.each(me.styles, function (n) {
                var fx = new Effect.Fx(el, n, this, me.tween);
                me.fxList.push(fx);
            });
        });
    },
    timerId: null,
    fxList: [],
    stepLength: 0,
    stepPos: 0,
    step: function (stepPos, stepLength) {
        if (stepPos <= stepLength) {
            $helper.each(this.fxList, function () {
                this.step(stepPos, stepLength);
            });
            return true;
        }
        else
            return false;
    },
    start: function () {
        var me = this;
        me.stop();
        me.timerId = setInterval(function () {
            if (me.step(me.stepPos, me.stepLength))
                me.stepPos++;
            else
                me.stop();
        }, Effect.pluse);
    },
    pause: function () {
        if (this.timerId)
            clearInterval(this.timerId);
        this.timerId = null;
    },
    stop: function (_backStart) {
        this.pause();
        this.step(_backStart ? 0 : this.stepLength, this.stepLength);
        if (this.callback)
            this.callback();
    }
});
Effect.$static({
    pluse: 13,
    rfxnum: /^([+-]=)?([\d+-.]+)(.*)$/,
    tween: {
        defaultTween: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
    },
    $init: function () {
        if (window.Tween) {
            var _defaultTween = this.tween.defaultTween;
            this.tween = window.Tween.tween;
            this.tween.defaultTween = _defaultTween;
        }
    }
});

Effect.Fx = $class({
    $init: function (el, nam, val, tween) {
        this.el = el;
        this.nam = nam;
        this.val = val;
        this.tween = tween;
        //
        var parts = Effect.rfxnum.exec(val);
        this.start = parseFloat(el.style[nam]); //获得属性初始状态
        this.end = parseFloat(parts[2]);
        this.range = this.end - this.start;
        this.unit = nam == "opacity" ? "" : parts[3] || "px";
    },
    step: function (stepPos, stepLength) {
        if (stepPos <= stepLength) {
            this.el.style[this.nam] = this.tween(stepPos, this.start, this.range, stepLength) + this.unit;
            return true;
        }
        else
            return false;
    }
});