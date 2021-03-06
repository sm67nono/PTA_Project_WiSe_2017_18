var path = require('path');
var minimist = require('minimist');
var wordwrap = require('wordwrap');
var inst = Argv(process.argv.slice(2));
Object.keys(inst).forEach(function (key) {
    Argv[key] = typeof inst[key] == 'function' ? inst[key].bind(inst) : inst[key];
});
var exports = module.exports = Argv;
function Argv(processArgs, cwd) {
    var self = {};
    if (!cwd)
        cwd = process.cwd();
    self.$0 = process.argv.slice(0, 2).map(function (x) {
        var b = rebase(cwd, x);
        return x.match(/^\//) && b.length < x.length ? b : x;
    }).join(' ');
    if (process.env._ != undefined && process.argv[1] == process.env._) {
        self.$0 = process.env._.replace(path.dirname(process.execPath) + '/', '');
    }
    var options = {
        boolean: [],
        string: [],
        alias: {},
        default: []
    };
    self.boolean = function (bools) {
        options.boolean.push.apply(options.boolean, [].concat(bools));
        return self;
    };
    self.string = function (strings) {
        options.string.push.apply(options.string, [].concat(strings));
        return self;
    };
    self.default = function (key, value) {
        if (typeof key === 'object') {
			var counter = 0;
            var arg = null;
            var newArray = [];
            var arrayUsingItr = Object.keys(key);
            for (var i = 0; i < arrayUsingItr.length; i++) {
                var k = arrayUsingItr[i];
                self.default(k, key[k]);
                newArray[counter] = arrayUsingItr[i];
                counter++;
            }
           
        } else {
            options.default[key] = value;
        }
        return self;
    };
    self.alias = function (x, y) {
        if (typeof x === 'object') {
			var counter = 0;
            var arg = null;
            var newArray = [];
            var arrayUsingItr = Object.keys(x);
            for (var i = 0; i < arrayUsingItr.length; i++) {
                var key = arrayUsingItr[i];
                self.alias(key, x[key]);
                newArray[counter] = arrayUsingItr[i];
                counter++;
            }
            
        } else {
            options.alias[x] = (options.alias[x] || []).concat(y);
        }
        return self;
    };
     var demanded = {};
    self.demand = function (keys) {
        if (typeof keys == 'number') {
            if (!demanded._) demanded._ = 0;
            demanded._ += keys;
        }
        else if (Array.isArray(keys)) {
            keys.forEach(function (key) {
                self.demand(key);
            });
        }
        else {
            demanded[keys] = true;
        }
        
        return self;
    };
    
    var usage;
    self.usage = function (msg, opts) {
        if (!opts && typeof msg === 'object') {
            opts = msg;
            msg = null;
        }
        usage = msg;
        if (opts)
            self.options(opts);
        return self;
    };
    function fail(msg) {
        self.showHelp();
        if (msg)
            console.error(msg);
        process.exit(1);
    }
    var checks = [];
    self.check = function (f) {
        checks.push(f);
        return self;
    };
    var descriptions = {};
    self.describe = function (key, desc) {
        if (typeof key === 'object') {
			var counter = 0;
            var arg = null;
            var newArray = [];
            var arrayUsingItr = Object.keys(key);
            for (var i = 0; i < arrayUsingItr.length; i++) {
                var k = arrayUsingItr[i];
                self.describe(k, key[k]);
                newArray[counter] = arrayUsingItr[i];
                counter++;
            }
        } else {
            descriptions[key] = desc;
        }
        return self;
    };
    self.parse = function (args) {
        return parseArgs(args);
    };
    self.option = self.options = function (key, opt) {
        if (typeof key === 'object') {
			var counter = 0;
            var arg = null;
            var newArray = [];
            var arrayUsingItr = Object.keys(key);
            for (var i = 0; i < arrayUsingItr.length; i++) {
                var k = arrayUsingItr[i];
                self.options(k, key[k]);
                newArray[counter] = arrayUsingItr[i];
                counter++;
            }
            
        } else {
            if (opt.alias)
                self.alias(key, opt.alias);
            if (opt.demand)
                self.demand(key);
            if (typeof opt.default !== 'undefined') {
                self.default(key, opt.default);
            }
            if (opt.boolean || opt.type === 'boolean') {
                self.boolean(key);
            }
            if (opt.string || opt.type === 'string') {
                self.string(key);
            }
            var desc = opt.describe || opt.description || opt.desc;
            if (desc) {
                self.describe(key, desc);
            }
        }
        return self;
    };
    var wrap = null;
    self.wrap = function (cols) {
        wrap = cols;
        return self;
    };
    self.showHelp = function (fn) {
        if (!fn)
            fn = console.error;
        fn(self.help());
    };
    self.help = function () {
        var keys = Object.keys(Object.keys(descriptions).concat(Object.keys(demanded)).concat(Object.keys(options.default)).reduce(function (acc, key) {
            if (key !== '_')
                acc[key] = true;
            return acc;
        }, {}));
        var help = keys.length ? ['Options:'] : [];
        if (usage) {
            help.unshift(usage.replace(/\$0/g, self.$0), '');
        }
        var switches = keys.reduce(function (acc, key) {
            acc[key] = [key].concat(options.alias[key] || []).map(function (sw) {
                return (sw.length > 1 ? '--' : '-') + sw;
            }).join(', ');
            return acc;
        }, {});
        var switchlen = longest(Object.keys(switches).map(function (s) {
            return switches[s] || '';
        }));
        var desclen = longest(Object.keys(descriptions).map(function (d) {
            return descriptions[d] || '';
        }));
        var arrayUsingItr = keys;
        var newArray = [];
        var arg = null;
        var counter = 0;
        for (var i = 0; i < arrayUsingItr.length; i++) {
            var key = arrayUsingItr[i];
            var kswitch = switches[key];
            var desc = descriptions[key] || '';
            if (wrap) {
                desc = wordwrap(switchlen + 4, wrap)(desc).slice(switchlen + 4);
            }
            var spadding = new Array(Math.max(switchlen - kswitch.length + 3, 0)).join(' ');
            var dpadding = new Array(Math.max(desclen - desc.length + 1, 0)).join(' ');
            var type = null;
            if (options.boolean[key])
                type = '[boolean]';
            if (options.string[key])
                type = '[string]';
            if (!wrap && dpadding.length > 0) {
                desc += dpadding;
            }
            var prelude = '  ' + kswitch + spadding;
            var extra = [
                type,
                demanded[key] ? '[required]' : null,
                options.default[key] !== undefined ? '[default: ' + JSON.stringify(options.default[key]) + ']' : null
            ].filter(Boolean).join('  ');
            var body = [
                desc,
                extra
            ].filter(Boolean).join('  ');
            if (wrap) {
                var dlines = desc.split('\n');
                var dlen = dlines.slice(-1)[0].length + (dlines.length === 1 ? prelude.length : 0);
                body = desc + (dlen + extra.length > wrap - 2 ? '\n' + new Array(wrap - extra.length + 1).join(' ') + extra : new Array(wrap - extra.length - dlen + 1).join(' ') + extra);
            }
            help.push(prelude + body);
            newArray[counter] = arrayUsingItr[i];
            counter++;
        }
        help.push('');
        return help.join('\n');
    };
    Object.defineProperty(self, 'argv', {
        get: function () {
            return parseArgs(processArgs);
        },
        enumerable: true
    });
   
    function parseArgs(args) {
        var argv = minimist(args, options);
        argv.$0 = self.$0;
        if (demanded._ && argv._.length < demanded._) {
            fail('Not enough non-option arguments: got ' + argv._.length + ', need at least ' + demanded._);
        }
        var missing = [];
		 var arrayUsingItr = Object.keys(demanded);
		var newArray = [];
		var arg = null;
		var counter = 0;
		for (var i = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        if (!argv[key])
            missing.push(key);
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
     if (missing.length) {
            fail('Missing required arguments: ' + missing.join(', '));
        }
		var arrayUsingItr = checks;
		var newArray = [];
		var arg = null;
		var counter = 0;
		for (var i = 0; i < arrayUsingItr.length; i++) {
        var f = arrayUsingItr[i];
        try {
            if (f(argv) === false) {
                fail('Argument check failed: ' + f.toString());
            }
        } catch (err) {
            fail(err);
        }
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
        
        return argv;
    }
    function longest(xs) {
        return Math.max.apply(null, xs.map(function (x) {
            return x.length;
        }));
    }
    return self;
}
;
exports.rebase = rebase;
function rebase(base, dir) {
    var ds = path.normalize(dir).split('/').slice(1);
    var bs = path.normalize(base).split('/').slice(1);
    for (var i = 0; ds[i] && ds[i] == bs[i]; i++);
    ds.splice(0, i);
    bs.splice(0, i);
    var p = path.normalize(bs.map(function () {
        return '..';
    }).concat(ds).join('/')).replace(/\/$/, '').replace(/^$/, '.');
    return p.match(/^[.\/]/) ? p : './' + p;
}
;