"use strict";

var learnjs = require('./learnjs');
var uuid = require('uuid');

function googleSignIn(googleUser) {
    var resp = googleUser.getAuthResponse();
    console.log("google authresp:");
    console.log(resp);
    var id_token = resp.id_token;
    AWS.config.update({
        region: 'eu-central-1',
        credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: learnjs.poolId,
        Logins: {
            'accounts.google.com': id_token
            }
        })
    });
    function refresh() {
      return gapi.auth2.getAuthInstance().signIn({
          prompt: 'login'
        }).then(function(userUpdate) {
        var creds = AWS.config.credentials;
        var newToken = userUpdate.getAuthResponse().id_token;
        creds.params.Logins['accounts.google.com'] = newToken;
        return learnjs.awsRefresh();
      });
    }
    learnjs.awsRefresh().then(function(id) {
      learnjs.identity.resolve({
        id: id,
        email: googleUser.getBasicProfile().getEmail(),
        refresh: refresh
      });
    });
}

$(window).ready(learnjs.appOnReady);
console.log(uuid.v4());

