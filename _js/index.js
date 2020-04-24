window.onload = function(){
	initializeCognito();
	doRefresh(function(err, cognitoUser){
		if(err) {
			alert('you are not logged in');
		} else {
	    
			cognitoUser.getUserAttributes(function(err, result) {
	  		console.log('result: ', result);
	      console.log('err: ', err);
	      var sub = result[0].getValue();
	      var email = result[result.length-1].getValue();
	  		
			});	
		}
	});	
}
