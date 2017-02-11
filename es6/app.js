"use strict";

const LearnJS = require('./learnjs');
const AuthHandler = require('./auth_handler');

var auth = new AuthHandler();
window.googleSignIn = function(id) {
    auth.googleSignIn(id);
}
var learnjs = new LearnJS(auth);
$(window).ready(function() {
    learnjs.appOnReady();
});

