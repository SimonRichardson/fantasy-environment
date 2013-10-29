var environment = require('../environment'),
    constant = function(a) {
        return function() {
            return a;
        };
    },
    always = function() {
        return true;
    },
    never = function() {
        return false;
    },
    lessThan = function(a) {
        return function(v) {
            return v < a;
        };
    },
    greaterThan = function(a) {
        return function(v) {
            return v > a;
        };
    },
    isEqualTo = function(a) {
        return function(b) {
            return a === b;
        };
    },
    error = function(str) {
        return function() {
            throw new Error(str);
        };
    };

exports.environment = {
    'when testing property with a value should return correct value': function(test) {
        var a = Math.random();
            env = environment().property('a', a);
        test.equal(env.a, a);
        test.done();
    },
    'when testing property with a value and overwriting should return correct value': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment().property('a', a),
            env1 = env0.property('a', b);

        test.equal(env1.a, b);
        test.done();
    },
    'when testing method with a value should return correct value': function(test) {
        var a = Math.random(),
            env = environment().method('a', always, constant(a));

        test.equal(env.a(), a);
        test.done();
    },
    'when testing method with a value and overwriting should return the last correct value': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment().method('a', always, constant(a)),
            env1 = env0.method('a', always, constant(b));

        test.equal(env1.a(), a);
        test.done();
    },
    'when testing same method name, but different predicates should return low value': function(test) {
        var a = Math.random(),
            env0 = environment().method('a', isEqualTo('a'), error('Failed if called')),
            env1 = env0.method('a', isEqualTo(a), constant(true)),
            env2 = env1.method('a', isEqualTo('b'), error('Failed if called'));

        test.equal(env2.a(a), true);
        test.done();
    },
    'when testing same method name, but different predicate should return low value': function(test) {
        var env0 = environment().method('a', lessThan(5), constant('low')),
            env1 = env0.method('a', greaterThan(5), constant('high'));

        test.equal(env1.a(4), 'low');
        test.done();
    },
    'when testing same method name, but different predicate should return high value': function(test) {
        var env0 = environment().method('a', lessThan(5), constant('low')),
            env1 = env0.method('a', greaterThan(5), constant('high'));

        test.equal(env1.a(6), 'high');
        test.done();
    },
    'when testing adding a property with an already set method should throw correct value': function(test) {
        var a = Math.random(),
            env0 = environment().method(a, always, constant(true)),
            msg = '';

        try {
            env1 = env0.property(a, 1);
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Property `' + a + '` is already in environment.');
        test.done();
    },
    'when testing adding a method with an already set property should throw correct value': function(test) {
        var a = Math.random(),
            env0 = environment().property(a, 1),
            msg = '';

        try {
            env1 = env0.method(a, always, constant(true));
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Method `' + a + '` is already in environment.');
        test.done();
    },
    'when testing retrieving a unknown item should throw correct value': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment().method(a, never, constant(true)),
            msg = '';

        try {
            env1 = env0[a](b);
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Method `' + a + '` not implemented for this input');
        test.done();
    },
    'when testing envAppend with properties should return correct value when calling a': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment().property('a', a),
            env1 = environment().property('a', b),
            env2 = env0.envAppend(env1);

        test.equal(env2.a, a);
        test.done();
    },
    'when testing envAppend with methods should return correct value when calling a': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment().method('a', always, constant(a)),
            env1 = environment().method('a', always, constant(b)),
            env2 = env0.envAppend(env1);

        test.equal(env2.a(), b);
        test.done();
    },
    'when testing envAppend with more methods should return correct value when calling a': function(test) {
        var a = Math.random(),
            b = Math.random(),
            env0 = environment()
                .method('a', always, constant(a))
                .method('b', always, error('Failed if called')),
            env1 = environment().method('a', always, constant(b)),
            env2 = env0.envAppend(env1);

        test.equal(env2.a(), b);
        test.done();
    }
};

