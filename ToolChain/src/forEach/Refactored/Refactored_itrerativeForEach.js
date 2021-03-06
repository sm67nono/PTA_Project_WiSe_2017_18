module.exports = function (args, opts) {
    if (!opts)
        opts = {};
    var flags = {
        bools: {},
        strings: {},
        unknownFn: null
    };
    if (typeof opts['unknown'] === 'function') {
        flags.unknownFn = opts['unknown'];
    }
    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
        flags.allBools = true;
    } else {
        ;
        var arrayUsingItr = [].concat(opts['boolean']).filter(Boolean);
        var newArray = [];
        for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
            var key = arrayUsingItr[i];
            flags.bools[key] = true;
            newArray[counter] = arrayUsingItr[i];
            counter++;
        }
    }
    var aliases = {};
    var arrayUsingItr = Object.keys(opts.alias || {});
    var newArray = [];
    var arrayUsingItr = aliases[key];
    var newArray = [];
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var x = arrayUsingItr[i];
        aliases[x] = [key].concat(aliases[key].filter(function (y) {
            return x !== y;
        }));
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key] = newArray;
        ;
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    ;
    var arrayUsingItr = [].concat(opts.string).filter(Boolean);
    var newArray = [];
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        flags.strings[key] = true;
        if (aliases[key]) {
            flags.strings[aliases[key]] = true;
        }
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    ;
    var defaults = opts['default'] || {};
    var argv = { _: [] };
    var arrayUsingItr = Object.keys(flags.bools);
    var newArray = [];
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    ;
    var notFlags = [];
    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
    }
    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || flags.strings[key] || flags.bools[key] || aliases[key];
    }
    function setArg(key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false)
                return;
        }
        var value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split('.'), value);
        (aliases[key] || []).forEach(function (x) {
            setKey(argv, x.split('.'), value);
        });
    }
    function setKey(obj, keys, value) {
        var o = obj;
        var arrayUsingItr = keys.slice(0, -1);
        var newArray = [];
        for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
            var key = arrayUsingItr[i];
            if (o[key] === undefined)
                o[key] = {};
            o = o[key];
            newArray[counter] = arrayUsingItr[i];
            counter++;
        }
        ;
        var key = keys[keys.length - 1];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
            o[key] = value;
        } else if (Array.isArray(o[key])) {
            o[key].push(value);
        } else {
            o[key] = [
                o[key],
                value
            ];
        }
    }
    function aliasIsBoolean(key) {
        return aliases[key].some(function (x) {
            return flags.bools[x];
        });
    }
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (/^--.+=/.test(arg)) {
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            var key = m[1];
            var value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        } else if (/^--no-.+/.test(arg)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        } else if (/^--.+/.test(arg)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !/^-/.test(next) && !flags.bools[key] && !flags.allBools && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            } else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            var letters = arg.slice(1, -1).split('');
            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j + 2);
                if (next === '-') {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }
            var key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !flags.bools[key] && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i + 1], arg);
                    i++;
                } else if (args[i + 1] && /true|false/.test(args[i + 1])) {
                    setArg(key, args[i + 1] === 'true', arg);
                    i++;
                } else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings['_'] || !isNumber(arg) ? arg : Number(arg));
            }
            if (opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
    }
    var arrayUsingItr = Object.keys(defaults);
    var newArray = [];
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            (aliases[key] || []).forEach(function (x) {
                setKey(argv, x.split('.'), defaults[key]);
            });
        }
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    ;
    if (opts['--']) {
        argv['--'] = new Array();
        notFlags = newArray;
        ;
    } else {
        notFlags.forEach(function (key) {
            argv._.push(key);
        });
        var arrayUsingItr = notFlags;
        var newArray = [];
        for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
            var key = arrayUsingItr[i];
            argv['--'].push(key);
            newArray[counter] = arrayUsingItr[i];
            counter++;
        }
    }
    return argv;
};
function hasKey(obj, keys) {
    var o = obj;
    var arrayUsingItr = keys.slice(0, -1);
    var newArray = [];
    for (var i = 0, counter = 0; i < arrayUsingItr.length; i++) {
        var key = arrayUsingItr[i];
        o = o[key] || {};
        newArray[counter] = arrayUsingItr[i];
        counter++;
    }
    ;
    var key = keys[keys.length - 1];
    return key in o;
}
function isNumber(x) {
    if (typeof x === 'number')
        return true;
    if (/^0x[0-9a-f]+$/i.test(x))
        return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}