"use sctrict";

var generator = require('../es6/math_exercise.js');

var rgen_mock = function(arr) {
    var i = 0;
    var inner = function() {
        let retval = arr[i];
        i = (i+1)%arr.length;
        return retval;
    }
    return inner;
}

describe('math_exercise', function() {
    it('can generate a simple addition, var left', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([true, false, true]) // var_on_left, op_on_left,  op_plus, var_left_of_op
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("_=1+3");
    });

    it('can generate a simple addition, var right', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([false, true, true])
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("1+3=_");
    });

    it('can generate a simple addition, var left', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([true, true, true, true])
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("_+1=3");
    });

    it('can generate a simple addition, var left, right of op', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([true, true, true, false])
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("1+_=3");
    });
    
    it('can generate a simple addition, var left, right of op, swap', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([3,1]),
            getRandomBool: rgen_mock([true, true, true, false])
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("1+_=3");
    });

    it('can generate a simple subtraction, var right, swap if needed', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([false, true, false]) // var_on_left, op_on_left,  op_plus, var_left_of_op
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("3-1=_");
    });

    it('can generate a simple subtraction, var right, swap if needed', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([1,3]),
            getRandomBool: rgen_mock([true, true, false, true]) // var_on_left, op_on_left,  op_plus, var_left_of_op
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("_-1=3");
    });

    it('can generate a simple subtraction, var right, swap if needed', function() {
        generator.rnd = {
            getRandomIntInclusive: rgen_mock([3,1]),
            getRandomBool: rgen_mock([true, true, false, false]) // var_on_left, op_on_left,  op_plus, var_left_of_op
        }
        var ex = generator.generate_exercise(1);
        expect(ex).toEqual("3-_=1");
    });

    it('can solve an equation', function() {
        expect(generator.solve("3-_=1")).toEqual(2);
    });

    it('can solve an equation 2', function() {
        expect(generator.solve("9-3=_")).toEqual(6);
    });

    it('can convert exercise str to object', function() {
        var obj = generator.toObject('3=9-_');
    });

    it('can get coefficients 1', function() {
        expect(generator.getCoeffs('9-_')).toEqual([9, -1]);
    });

    it('can get coefficients 2', function() {
        expect(generator.getCoeffs('_-3')).toEqual([-3, 1]);
    });

    it('can get coefficients 3', function() {
        expect(generator.getCoeffs('_')).toEqual([0, 1]);
    });

    it('can get coefficients 4', function() {
        expect(generator.getCoeffs('9')).toEqual([9, 0]);
    });
})
