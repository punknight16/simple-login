function initializeCognito(){

  var poolData = {
      UserPoolId : 'us-west-2_Q2jEhB2TV', // your user pool id here
      ClientId : '6pu3v68tm36o84lff6tpdujufv' // your app client id here
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  function doRegister(emailInput, passwordInput, cb){
  	var cognitoUser;
    var attributeList = [];

  	userPool.signUp(emailInput, passwordInput, attributeList, null, function(err, result){
  	    if (err) {
  	        console.log(err);
  	        return cb(err.message);
  	    }
  	    cognitoUser = result.user;
  	    console.log('user name is ' + cognitoUser.getUsername());
  	    return cb(null, cognitoUser);
  	});
  }

  function doConfirm(emailInput, confirmInput, cb){
    var userData = {
        Username : emailInput,
        Pool : userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmInput, true, function(err, result) {
        if (err) {
            console.log(err.message || JSON.stringify(err));
            return cb(err.message);
        }
        return cb(null, result);
    });
  }

  function doLogin(emailInput, passwordInput, cb){
  	var userData = {
        Username : emailInput,
        Pool : userPool
    };
  	var authenticationData = {
        Username : emailInput, // your username here
        Password : passwordInput, // your password here
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
        		//console.log('success: ', result)
            var accessToken = result.getAccessToken().getJwtToken();
            return cb(null, accessToken);
        },

        onFailure: function(err) {
            console.log('error: ', err);
            return cb(err.message);
        },
        mfaRequired: function(codeDeliveryDetails) {
            console.log('this should not happen');
            var verificationCode = prompt('Please input verification code' ,'');
            cognitoUser.sendMFACode(verificationCode, this);
        }
    });
  }

  function doReset(resetEmailInput, resetCodeInput, resetPasswordInput, cb){
    console.log('do reset fired');
    var userData = {
        Username : resetEmailInput,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(resetCodeInput, resetPasswordInput, {
        onSuccess() {
          return cb(null, 'Password change confirmed!');
        },
        onFailure(err) {
          console.log(err);

          return cb(err.message);
        }
      })
  }

  function doForgot(forgotEmailInput, cb){
    var userData = {
        Username : forgotEmailInput,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
      onSuccess: function (data) {
         return cb(null, data);
      },
      onFailure: function(err) {
        console.log(err)
        return cb(err.message);
      }
    })
  }

  function doRefresh(cb){
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser === null) {
        return cb('unauthenticated');
    } else {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.log(JSON.stringify(err.message) || JSON.stringify(err));
          return;
        }
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId : "us-west-2:fdc144f1-6278-4fba-9af5-b3150a5ef6c7", // your identity pool id here 
          Logins : {
                'cognito-idp.us-west-2.amazonaws.com/us-west-2_Q2jEhB2TV' :   
                session.getIdToken().getJwtToken()
          }
                 }, {
          region: "us-west-2"
        });

      });
    } 
    AWS.config.credentials.refresh(function(err){
      if(err) console.log(err);
      else {
        console.log("creds: ", AWS.config.credentials);
        return cb(null, cognitoUser);
      }
    });
  }


  window.doRegister = doRegister;
  window.doConfirm = doConfirm;
  window.doLogin = doLogin;
  window.doRefresh = doRefresh;
};