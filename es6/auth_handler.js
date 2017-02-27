var AWS = require('aws-sdk');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function AuthHandler() {
    this.identity= new $.Deferred();
    this.poolId= 'eu-central-1:f628cc78-2e40-4d11-82a2-696f8a5b5e30';
    this.region= 'eu-central-1';
}

util.inherits(AuthHandler, EventEmitter);
module.exports = AuthHandler;

AuthHandler.prototype.logout = function() {
    var self = this;
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        self.identity = new $.Deferred();
        self.emit('signout');
    });
}

AuthHandler.prototype.googleSignIn = function(googleUser) {
    console.log("google authresp:");
    var self = this;
    var resp = googleUser.getAuthResponse();
    console.log(resp);
    var id_token = resp.id_token;
    AWS.config.update({
        region: this.region,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: this.poolId,
            Logins: {
                'accounts.google.com': id_token
            }
        })
    });

    function awsRefresh() {
        var deferred = new $.Deferred();
        AWS.config.credentials.refresh(function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(AWS.config.credentials.identityId);
            }
        });
        return deferred.promise();
    };

    function refreshGoogleToken() {
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'select_account'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            var newToken = userUpdate.getAuthResponse().id_token;
            creds.params.Logins['accounts.google.com'] = newToken;
            return self.awsRefresh();
        });
    }

    awsRefresh().then(function(id) {
        console.log("awsRefresh resolved");
        var identityObj = {
            id: id,
            email: googleUser.getBasicProfile().getEmail(),
            refreshGoogleToken: refreshGoogleToken
        }
        self.identity.resolve(identityObj);
        console.log('emitting signin');
        self.emit('signin', identityObj)
    });
};

AuthHandler.prototype.sendAwsRequest = function(reqFactory, retry) {
    var self = this;
    var promise = $.Deferred();

//    if(gapi && gapi.auth2){
//        var auth2 = gapi.auth2.getAuthInstance();
//        console.log("google issigneding? "+auth2.isSignedIn.get());
//        if(!auth2.isSignedIn.get()) {
//            promise.reject("logged out");
//            return promise;
//        }
//    } else {
//        console.log("gapi undefined");
//        promise.reject("logged out");
//        return promise;
//    }
    
    this.identity.then(function(awsIdentity) {
        var req = reqFactory(awsIdentity);
        req.on('error', function(error) {
            if(error.code === 'CredentialsError') {
                console.log("Credentials error");
                self.identity.then(function(identity) {
                    return identity.refreshGoogleToken().then(function() {
                        console.log("calling retry cb, google token expired"+err);
                        return retry();
                    }, function(resp) {
                        promise.reject(resp);
                    });
                });
            } else {
                promise.reject(error);
            }
        });
        req.on('success', function(resp) {
            promise.resolve(resp.data);
        });

        req.send();
    }, function() {
        promise.reject("Not logged in");
    });
    return promise;
};

