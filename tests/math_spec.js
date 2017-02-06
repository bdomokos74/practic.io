"use sctrict";

var generator = require('../es6/math_exercise.js');

var rgen = function(arr) {
    var i = 0;
    var inner = function() {
        let retval = arr[i];
        i = (i+1)%arr.length;
        return retval;
    }
    return inner;
}
var var_on_left = function(b) {
    return function() {return b;};
}

describe('math_exercise', function() {
    it('can generate a simple addition, var left', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen([1,3]),
            getRandomBool: var_on_left(true)
        }
        var ex = generator.generate_exercise(1);
        console.log(ex);
        expect(ex).toEqual("1+_=3");
    })    
    
    it('can generate a simple addition, var right', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen([1,3]),
            getRandomBool: var_on_left(false, false)
        }
        var ex = generator.generate_exercise(1);
        console.log(ex);
        expect(ex).toEqual("1+_=_");
    })    
})
