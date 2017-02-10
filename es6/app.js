"use strict";

const LearnJS = require('./learnjs');
const AuthHandler = require('./auth_handler');

var auth = new AuthHandler();
window.googleSignin = function(id) {
    auth.googleSignin(id);
}
var learnjs = new LearnJS(auth);
$(window).ready(function() {
    learnjs.appOnReady();
});

