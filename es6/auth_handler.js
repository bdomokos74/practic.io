
var AWS = require('aws-sdk');
function AuthHandler() {
    this.identity= new $.Deferred();
    this.poolId= 'eu-central-1:f628cc78-2e40-4d11-82a2-696f8a5b5e30';
    this.region= 'eu-central-1';
}
module.exports = AuthHandler;

AuthHandler.prototype.googleSignIn= function(googleUser) {
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
            prompt: 'login'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            var newToken = userUpdate.getAuthResponse().id_token;
            creds.params.Logins['accounts.google.com'] = newToken;
            return self.awsRefresh();
        });
    }

    awsRefresh().then(function(id) {
        console.log("awsRefresh resolved");
        self.identity.resolve({
            id: id,
            email: googleUser.getBasicProfile().getEmail(),
            refresh: refreshGoogleToken
        });
    });
};

AuthHandler.prototype.sendAwsRequest = function(req, retry) {
    var self = this;
    var promise = $.Deferred();
    req.on('error', function(error) {
        if(error.code === 'CredentialsError') {
            console.log("Credentials error");
            self.identity.then(function(identity) {
                return identity.refreshGoogleToken().then(function() {
                    return retry();
                }, function() {
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
    return promise;
};

