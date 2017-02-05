'use strict';

var rnd = require('./math_rnd');

var generator = {
    rnd: rnd,
    generate_exercise : function() {
        var res = [];
        for(var i = 0; i<10; i++) {
            var a = this.rnd.getRandomIntInclusive(1, 9);
            var b = this.rnd.getRandomIntInclusive(1, 9);
            var c;
            var op_str;
            if( a>b) {
                op_str = '-';
                c = a -b;
            } else {
                op_str = '+';
                c = b-a;
            }
            var side = this.rnd.getRandomBool();

            var obj = {
                mp_num1: null,
                mp_var1: null,
                mp_op1 : null,
                mp_num2: null,
                mp_var2: null,
                mp_num3: null,
                mp_var3: null,
                mp_op2 : null,
                mp_num4: null,
                mp_var4: null
            }
            var n1, n2, n3;
            if(side) { //left
                obj['mp_op1'] = op_str;
                if(op_str==='-') {
                    n1 = a;
                    n2 = b;
                    n3 = c;
                } else {
                    n1 = c;
                    n2 = a;
                    n3 = b;
                }
                var nvar = this.rnd.getRandomIntInclusive(1, 3);
                if(nvar===1) {
                    obj['mp_var1'] = n1;
                    obj['mp_num2'] = n2;
                    obj['mp_num3'] = n3;
                } else if(nvar===2) {
                    obj['mp_num1'] = n1;
                    obj['mp_var2'] = n2;
                    obj['mp_num3'] = n3;
                } else if(nvar===3) {
                    obj['mp_num1'] = n1;
                    obj['mp_num2'] = n2;
                    obj['mp_var3'] = n3;
                }
            } else {
                obj['mp_op2'] = op_str;
                if(op_str==='-') {
                    n1 = c;
                    n2 = a;
                    n3 = b;
                } else {
                    n1 = b;
                    n2 = a;
                    n3 = c;
                }
                var nvar = this.rnd.getRandomIntInclusive(1, 3);
                if(nvar===1) {
                    obj['mp_var2'] = n1;
                    obj['mp_num3'] = n2;
                    obj['mp_num4'] = n3;
                } else if(nvar===2) {
                    obj['mp_num2'] = n1;
                    obj['mp_var3'] = n2;
                    obj['mp_num4'] = n3;
                } else if(nvar===3) {
                    obj['mp_num2'] = n1;
                    obj['mp_num3'] = n2;
                    obj['mp_var4'] = n3;
                }
            }
            res.push(obj);
        }
        return res;
    }
}
module.exports = generator;

