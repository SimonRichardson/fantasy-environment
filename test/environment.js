'use strict';

const {constant} = require('fantasy-combinators');
const environment = require('../fantasy-environment');
    
const always = constant(true);
const never = constant(false); 

const lessThan = a => v => v < a;
const greaterThan = a => v => v > a;
const isEqualTo = a => b => a === b;

const error = x => () => { throw new Error(x); }

exports.environment = {
    'when testing property with a value should return correct value': function(test) {
        const a = Math.random();
        const env = environment().property('a', a);
        test.equal(env.a, a);
        test.done();
    },
    'when testing property with a value and overwriting should return correct value': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment().property('a', a);
        const env1 = env0.property('a', b);

        test.equal(env1.a, b);
        test.done();
    },
    'when testing method with a value should return correct value': function(test) {
        const a = Math.random();
        const env = environment().method('a', always, constant(a));

        test.equal(env.a(), a);
        test.done();
    },
    'when testing method with a value and overwriting should return the last correct value': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment().method('a', always, constant(a));
        const env1 = env0.method('a', always, constant(b));

        test.equal(env1.a(), a);
        test.done();
    },
    'when testing same method name, but different predicates should return low value': function(test) {
        const a = Math.random();
        const env0 = environment().method('a', isEqualTo('a'), error('Failed if called'));
        const env1 = env0.method('a', isEqualTo(a), constant(true));
        const env2 = env1.method('a', isEqualTo('b'), error('Failed if called'));

        test.equal(env2.a(a), true);
        test.done();
    },
    'when testing same method name, but different predicate should return low value': function(test) {
        const env0 = environment().method('a', lessThan(5), constant('low'));
        const env1 = env0.method('a', greaterThan(5), constant('high'));

        test.equal(env1.a(4), 'low');
        test.done();
    },
    'when testing same method name, but different predicate should return high value': function(test) {
        const env0 = environment().method('a', lessThan(5), constant('low'));
        const env1 = env0.method('a', greaterThan(5), constant('high'));

        test.equal(env1.a(6), 'high');
        test.done();
    },
    'when testing adding a property with an already set method should throw correct value': function(test) {
        const a = Math.random();
        const env0 = environment().method(a, always, constant(true));

        let msg = '';

        try {
            const env1 = env0.property(a, 1);
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Property `' + a + '` is already in environment.');
        test.done();
    },
    'when testing adding a method with an already set property should throw correct value': function(test) {
        const a = Math.random();
        const env0 = environment().property(a, 1);

        let msg = '';

        try {
            const env1 = env0.method(a, always, constant(true));
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Method `' + a + '` is already in environment.');
        test.done();
    },
    'when testing retrieving a unknown item should throw correct value': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment().method(a, never, constant(true));

        let msg = '';

        try {
            const env1 = env0[a](b);
        } catch (e) {
            msg = e.message;
        }

        test.equal(msg, 'Method `' + a + '` not implemented for this input');
        test.done();
    },
    'when testing envAppend with properties should return correct value when calling a': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment().property('a', a);
        const env1 = environment().property('a', b);
        const env2 = env0.envAppend(env1);

        test.equal(env2.a, a);
        test.done();
    },
    'when testing envAppend with methods should return correct value when calling a': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment().method('a', always, constant(a));
        const env1 = environment().method('a', always, constant(b));
        const env2 = env0.envAppend(env1);

        test.equal(env2.a(), b);
        test.done();
    },
    'when testing envAppend with more methods should return correct value when calling a': function(test) {
        const a = Math.random();
        const b = Math.random();
        const env0 = environment()
                .method('a', always, constant(a))
                .method('b', always, error('Failed if called'));
        const env1 = environment().method('a', always, constant(b));
        const env2 = env0.envAppend(env1);

        test.equal(env2.a(), b);
        test.done();
    }
};

