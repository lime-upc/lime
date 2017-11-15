// Create client 
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSQ9WzBTaM49moFFEbw41jERSh-LYsyf0'
});

//Write to the file system
const fs = require('fs');

//Place types array
var placeTypes = ["bakery", "bar", "cafe", "meal_takeaway", "restaurant"];
var resultsString = "";


function retrieveData() 
{
  for (j = 0; j < placeTypes.length; j++) { 

  var currentType = placeTypes[j];

  googleMapsClient.placesNearby({location: '41.3807524,2.1716016', radius: 50000, type: currentType, language: 'en'}, 
      function(err, response) {
      if (!err) {

        //JSON response cleanup 1/2
      	delete response.json.html_attributions;
      	delete response.json.next_page_token;
      	delete response.json.status;

    for(var i=0;i<response.json.results.length;i++){
        delete response.json.results[i].photos;
        delete response.json.results[i].reference;
        delete response.json.results[i].scope;
        delete response.json.results[i].geometry.viewport;
        delete response.json.results[i].opening_hours;
        delete response.json.results[i].id;
        delete response.json.results[i].reference;
        delete response.json.results[i].icon;


    //anti-duplicates mechanism: do not append if the result is already in the results string
    if (!resultsString.includes(response.json.results[i].place_id))
    	resultsString = resultsString+JSON.stringify(response.json.results[i], null, 4)+",";
    }


      }
  });

  }

}

function saveResults(){
  var returnValue = retrieveData();

  resultsString=resultsString.substring(0,resultsString.length-1);
  var date = new Date();
  fs.appendFile('outputFile.json', '{"download_timestamp" : "'+ date.toUTCString() +'", "results" : ['+resultsString+']}', (err) => {
    if (err) throw err;
  });  
  console.log("Places sucessfully retrieved on "+date.toUTCString() + " and written to JSON file!");
}



//TODO Properly mange callback and remove timer 

retrieveData();
setTimeout(function() { 
  saveResults();
}, 6000);



//TODO Extend in order to retrieve all the result pages for each query with next_page_token (Now 20*5 results are retrieved) >> maybe next Sprint, not now
