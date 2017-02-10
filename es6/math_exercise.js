'use strict';

var rnd = require('./math_rnd');

var generator = {
    rnd: rnd,
    generate_exercise : function() {
        let res_max = 0;
        if(arguments.length>0) {
            res_max = Number(arguments[0]);
        }
        var gen = function(rnd) {
            var res = "";
            var a = rnd.getRandomIntInclusive(1, 9);
            var b = rnd.getRandomIntInclusive(1, 9);
            var var_on_left = rnd.getRandomBool();
            var op_on_left = rnd.getRandomBool();
            var op_plus = rnd.getRandomBool();

            if(op_plus) {
                if(var_on_left) {
                    if(op_on_left) {
                        var var_on_left_of_op = rnd.getRandomBool();
                        if(a>b) [a,b] = [b,a];
                        if(var_on_left_of_op) {
                            res = "_+"+a+"="+b; 
                        } else {
                            res = a+ "+_="+b; 
                        }
                    } else {
                        res = "_="+a+"+"+b;
                    }
                } else {
                    if(op_on_left) {
                        res = a+"+"+b+"=_";
                    } else {
                        var var_on_left_of_op = rnd.getRandomBool();
                        if(a<b) [a,b] = [b,a];
                        if(var_on_left_of_op) {
                            res = a+"=_+"+b; 
                        } else {
                            res = a+"="+b+"+_"; 
                        }
                    }
                }
            } else {
                // op minus
                if (var_on_left) {
                    if (op_on_left) {
                        var var_on_left_of_op = rnd.getRandomBool();
                        if(var_on_left_of_op) {
                            res = "_-"+a+"="+b; 
                        } else {
                            if(a<b) [a,b] = [b,a];
                            res = a+"-_="+b; 
                        }
                    } else {
                        if(b>a) [a,b]= [b,a];
                        res = a+"-"+b+"=_";
                    }
                } else {
                    if(op_on_left) {
                        if(a<b) [a,b] = [b,a];
                        res = a+"-"+b+"=_";
                    } else {
                        var var_on_left_of_op = rnd.getRandomBool();
                        if(var_on_left_of_op) {
                            res = a+"=_-"+b;
                        } else {
                            if(b<a) [a,b] = [b,a];
                            res = a+"="+b+"-_"
                        }
                    }
                }
            }
            return res;
        }

        var chk_res = gen(this.rnd);
        if(res_max>0) {
            var ii = 0;
            while(this.solve(chk_res)>res_max) {
                console.log(chk_res+" -> _="+this.solve(chk_res));
                chk_res = gen(this.rnd);
                ii = ii+1;
                if(ii>10) break;
            }
        }
        return chk_res;
    },

    getCoeffs: function(tokens) {
        var coeffs = [0, 0];
        var sign = (tokens[1]==='-')?-1:1;
        
        if(tokens.length==3) {
            if(tokens[0]==='_') {
                coeffs[1] = 1;
                coeffs[0] = Number(tokens[2]);
                coeffs[0] = coeffs[0]*sign;
            } else if(tokens[2]==='_') {
                coeffs[1] = 1;
                coeffs[0] = Number(tokens[0]);
                coeffs[1] = coeffs[1]*sign;
            } else {
               coeffs[0] = Number(tokens[0])+sign*Number(tokens[2]); 
            }
        } else {
            coeffs = (tokens[0]==='_')?[0, 1]:[Number(tokens[0]), 0];
        }
        return coeffs;
    },

    solve: function(eq) {
        var sides = eq.split("=");
        var left_tokens = sides[0].split("");
        var right_tokens = sides[1].split("");
        var left_coeffs = this.getCoeffs(left_tokens);
        var right_coeffs = this.getCoeffs(right_tokens);
        right_coeffs[0] -= left_coeffs[0];
        right_coeffs[1] -= left_coeffs[1];

        if(right_coeffs[1]===1) {
            return -right_coeffs[0];
        }
        return right_coeffs[0];
    },

    toObject:  function(str, elem) {
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
                };
        var sides = str.split("=");
        var left = sides[0].split("");
        var right = sides[1].split("");
        var result = this.solve(str);
        
        if(left.length===3) {
            var op = left[1];
            obj.mp_op1 = left[1];
            if(left[0]==='_') {
                obj.mp_num2 = Number(left[2]);
                obj.mp_num3 = Number(right[0]);
                obj.mp_var1 = result;
            } else if(left[2]==='_') {
                obj.mp_num1 = Number(left[0]);
                obj.mp_num3 = Number(right[0]);
                obj.mp_var2 = result;
            } else {
                obj.mp_num1 = Number(left[0]);
                obj.mp_num2 = Number(left[2]);
                obj.mp_var3 = result;
            }
        } else {
            var op = right[1];
            obj.mp_op2 = right[1];
            if(right[0]==='_') {
                obj.mp_num2 = Number(left[0]);
                obj.mp_num4 = Number(right[2]);
                obj.mp_var3 = result;
            } else if(right[2]==='_') {
                obj.mp_num2 = Number(left[0]);
                obj.mp_num3 = Number(right[0]);
                obj.mp_var4 = result;
            } else {
                obj.mp_num3 = Number(right[0]);
                obj.mp_num4 = Number(right[2]);
                obj.mp_var2 = result;
            }
        }
        return obj;
    }
}

module.exports = generator;
