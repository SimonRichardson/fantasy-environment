'use strict';

const {extend, singleton, getInstance} = require('fantasy-helpers');

//   # Environment
//
//   An environment holds methods and properties.
//
//   Methods are implemented as multi-methods, which allow a form of
//   *ad-hoc polymorphism*. Duck typing is another example of ad-hoc
//   polymorphism, but only allows a single implementation at a time, via
//   prototype mutation.
//
//   A method instance is a product of a name, a predicate and an
//   implementation:
//
//       var env = fantasy.environment()
//           .method(
//               // Name
//               'negate',
//               // Predicate
//               function(n) {
//                   return typeof n == 'number';
//               },
//               // Implementation
//               function(n) {
//                   return -n;
//               }
//           );
//
//       env.negate(100) == -100;
//
//   We can now override the environment with Some more implementations:
//
//       var env2 = env
//           .method(
//               'negate',
//               function(b) {
//                   return typeof b == 'boolean';
//               },
//               function(b) {
//                   return !b;
//               }
//           );
//
//       env2.negate(100) == -100;
//       env2.negate(true) == false;
//
//   Environments are immutable; references to `env` won't see an
//   implementation for boolean. The `env2` environment could have
//   overwritten the implementation for number and code relying on `env`
//   would still work.
//
//   Properties can be accessed without dispatching on arguments. They
//   can almost be thought of as methods with predicates that always
//   return true:
//
//       var env = fantasy.environment()
//           .property('name', 'Squishy');
//
//       env.name === 'Squishy';
//
function findRegistered(name, registrations, args) {
    for(let i = 0, total = registrations.length; i < total; i++) {
        if(registrations[i].predicate.apply(this, args))
            return registrations[i].f;
    }

    throw new Error('Method `' + name + '` not implemented for this input');
}

function makeMethod(name, registrations) {
    return function() {
        const args = [].slice.call(arguments);
        return findRegistered(name, registrations, args).apply(this, args);
    };
}

//
//   ## environment(methods, properties)
//
//   * `method(name, predicate, f)` - adds an multimethod implementation
//   * `property(name, value)` - sets a property to value
//   * `envConcat(extraMethods, extraProperties)` - adds methods + properties
//   * `envAppend(e)` - combines two environments, biased to `e`
//
function environment(methods, properties) {
    const self = this instanceof environment && !this.method && !this.property ? this : Object.create(environment.prototype);

    let methodsʹ = methods || {};
    let propertiesʹ = properties || {};

    self.method = function(name, predicate, f) {
        if(propertiesʹ[name]) throw new Error("Method `" + name + "` is already in environment.");

        const newMethods = extend(methodsʹ, singleton(name, (methodsʹ[name] || []).concat({
            predicate: predicate,
            f: f
        })));
        return environment(newMethods, propertiesʹ);
    };

    self.property = function(name, value) {
        const newProperties = extend(propertiesʹ, singleton(name, value));
        return environment(methodsʹ, newProperties);
    };

    self.envConcat = function(extraMethods, extraProperties) {
        const newMethods = {};
            
        for(let i in methodsʹ) {
            let possibleMethods = extraMethods[i] || [];
            newMethods[i] = methodsʹ[i].concat(possibleMethods);
        }
        for(let j in extraMethods) {
            if(j in newMethods) continue;
            newMethods[j] = extraMethods[j];
        }

        return environment(
            newMethods,
            extend(propertiesʹ, extraProperties)
        );
    };

    self.envAppend = function(e) {
        return e.envConcat(methodsʹ, propertiesʹ);
    };

    for(let i in methodsʹ) {
        /* Make sure the methods are names */
        let method = makeMethod(i, methodsʹ[i]);
        method._name = i;
        self[i] = method;
    }

    for(let j in propertiesʹ) {
        if(self[j]) throw new Error("Property `" + j + "` is already in environment.");
        else self[j] = propertiesʹ[j];
    }

    return self;
}

exports = module.exports = environment;
