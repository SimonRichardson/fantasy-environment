# Fantasy Environment

![](https://raw.github.com/puffnfresh/fantasy-land/master/logo.png)

An environment holds methods and properties.

Methods are implemented as multi-methods, which allow a form of
*ad-hoc polymorphism*. Duck typing is another example of ad-hoc
polymorphism, but only allows a single implementation at a time, via
prototype mutation.

A method instance is a product of a name, a predicate and an
implementation:

```javascript
   var env = environment()
       .method(
           // Name
           'negate',
           // Predicate
           function(n) {
               return typeof n == 'number';
           },
           // Implementation
           function(n) {
               return -n;
           }
       );

   env.negate(100) == -100;
```

We can now override the environment with Some more implementations:

```javascript
   var env2 = env
       .method(
           'negate',
           function(b) {
               return typeof b == 'boolean';
           },
           function(b) {
               return !b;
           }
       );

   env2.negate(100) == -100;
   env2.negate(true) == false;
```

Environments are immutable; references to `env` won't see an
implementation for boolean. The `env2` environment could have
overwritten the implementation for number and code relying on `env`
would still work.

Properties can be accessed without dispatching on arguments. They
can almost be thought of as methods with predicates that always
return true:

```javascript
   var env = fantasy.environment()
       .property('name', 'Fantasy');

   env.name === 'Fantasy';
```
## Testing

### Library

Fantasy Environment uses [nodeunit](https://github.com/caolan/nodeunit) 
for all the tests and because of this there is currently an existing 
[adapter](test/lib/test.js) in the library to help with integration 
between nodeunit and Fantasy Environment.

### Coverage

Currently Fantasy Environment is using [Istanbul](https://github.com/gotwarlost/istanbul) 
for code coverage analysis; you can run the coverage via the following
command:

_This assumes that you have istanbul installed correctly._

```
istanbul cover nodeunit -- test/*.js
```

It should report that the total coverage is at 100% (branches at 80.95%) 
for the whole lib.
