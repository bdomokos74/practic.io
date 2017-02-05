"use sctrict";

var generator = require('../es6/math_exercise.js');
describe('math_exercise', function() {
    it('can generate a simple addition', function() {
        //generator.rnd = jasmine.createSpyObj("rnd", 'getRandomIntInclusive', 'getRandomBool');
        var fn = function() {
            var i = 0;
            var arr=[1,2,3,4,5,6,7];
            var inner = function() {
                let retval = arr[i];
                i = (i+1)%arr.length;
                return retval;
            }
            return inner;
        }
        var fb = function() {return false;}
        generator.rnd = {
            getRandomIntInclusive: fn(),
            getRandomBool: fb
        }
        //var ff = fn();
        //for(var i = 0; i<5; i++) {
        //    console.log(ff());
        //}
        console.log(generator.generate_exercise());
    })    
    
})
