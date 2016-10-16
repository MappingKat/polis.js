var express = require('express');
var fulcrumMiddleware = require('connect-fulcrum-webhook');
var request = require('request');
var PORT = process.env.PORT || 9000;
var app = express();

function payloadProcessor (payload, done) {
  if (payload.data.form_id){
    if (payload.data.form_id === "7989a430-3ef5-4fe4-94b9-c3f958c31db0") {
      if (payload.type === "record.create") {
        createNSWRecord();
      } else if (payload.type === "record.update") {
        updateNSWRecord();
      } else if (payload.type === "record.delete") {
        deleteNSWRecord();
      }
    } else if (payload.data.form_id === "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4") {
      if (payload.type === "record.create") {
        createFireRecord();
      } else if (payload.type === "record.update") {
        updateFireRecord();
      } else if (payload.type === "record.delete") {
        deleteFireRecord();
      }
    }
  }

  function createNSWRecord() {
    payload.record = payload.data;
    payload.record.form_id = "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4";
    //Make sure originating app has a `RECORDID()` calculated field and receiving has a TextField with dataname matching value after `WHERE` on line 50.
    //in the line after this, `record_id` field of receiving app = the one created in originating.
    payload.record.form_values["88d3"] = payload.record.form_values["ea7f"];
    delete payload.data;
    delete payload.record.id;
    console.log(payload.record)

    request.post({
      url: 'https://api.fulcrumapp.com/api/v2/records.json',
      form: payload.record
      headers: { 
        'Content-Type': 'application/json',
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      },
      json: true
    },
    function (err, httpResponse, body) {
      console.log(err, body);
      console.log(payload);
      console.log(body.typeof);
    });
  }

  function updateNSWRecord() {
    payload.record = payload.data;
    payload.record.form_id = "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4";
    payload.record.form_values["88d3"] = payload.record.form_values["ea7f"];
    delete payload.data;
    
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values["ea7f"] + "';");
    var url = "https://api.fulcrumapp.com/api/v2/query/?format=json&q=" + query;
    var options = {
      "method": "GET",
      "contentType": "application/json",
      "headers": {
        "X-ApiToken": "28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791"
      }
    };
    var json = request.get(url, options);
    var data = JSON.parse(json);
    
    delete payload.record.id;
    
    var url = "https://api.fulcrumapp.com/api/v2/records/" + data.rows[0].fulcrum_id + ".json";
    var options = {
      "method": "PUT",
      "contentType": "application/json",
      "dataType": "json",
      "payload": JSON.stringify(payload.record),
      "headers": {
        "X-ApiToken": "28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791"
      }
    };
    
    var recordJSON = request.put(url, options);
  }

  function deleteNSWRecord() {
    //make sure table name, dataname in receiving app, and form_values key are correct (next line).
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values["ea7f"] + "';");
    var url = "https://api.fulcrumapp.com/api/v2/query/?format=json&q=" + query;
    var options = {
      "method": "GET",
      "contentType": "application/json",
      "headers": {
        "X-ApiToken": "28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791"
      }
    };
    var json = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(json);
    
    var url = "https://api.fulcrumapp.com/api/v2/records/" + data.rows[0].fulcrum_id + ".json";
    var options = {
      "contentType": "application/json",
      "dataType": "json",
      "headers": {
        "X-ApiToken": "28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791"
      }
    };
    
    var recordJSON = request.delete(url, options);
  }

  function createFireRecord() {
    payload.record = payload.data;
    payload.record.form_id = "7989a430-3ef5-4fe4-94b9-c3f958c31db0";
    //Make sure originating app has a `RECORDID()` calculated field and receiving has a TextField with dataname matching value after `WHERE` on line 50.
    //in the line after this, `record_id` field of receiving app = the one created in originating.
    payload.record.form_values["88d3"] = payload.record.form_values["05e2"];
    delete payload.data;
    delete payload.record.id;
    
    var url = "https://api.fulcrumapp.com/api/v2/records.json";
    var options = {
      "contentType": "application/json",
      "dataType": "json",
      "payload": JSON.stringify(payload.record),
      "headers": {
        "X-ApiToken": "1def20f914c43b058ceb04affa255ae587c93047d7908161537513cda3f5d4d611154b41b997b73e"
      }
    };
    
    var recordJSON = reuest.post(url, options);
  }

  function updateFireRecord() {
    payload.record = payload.data;
    payload.record.form_id = "7989a430-3ef5-4fe4-94b9-c3f958c31db0";
    payload.record.form_values["88d3"] = payload.record.form_values["05e2"];
    delete payload.data;
    
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE nsw_record_id = '" + payload.record.form_values["05e2"] + "';");
    var url = "https://api.fulcrumapp.com/api/v2/query/?format=json&q=" + query;
    var options = {
      "method": "GET",
      "contentType": "application/json",
      "headers": {
        "X-ApiToken": "1def20f914c43b058ceb04affa255ae587c93047d7908161537513cda3f5d4d611154b41b997b73e"
      }
    };
    var json = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(json);
    
    delete payload.record.id;
    
    var url = "https://api.fulcrumapp.com/api/v2/records/" + data.rows[0].fulcrum_id + ".json";
    var options = {
      "method": "PUT",
      "contentType": "application/json",
      "dataType": "json",
      "payload": JSON.stringify(payload.record),
      "headers": {
        "X-ApiToken": "1def20f914c43b058ceb04affa255ae587c93047d7908161537513cda3f5d4d611154b41b997b73e"
      }
    };
    
    var recordJSON = UrlFetchApp.fetch(url, options);
  }

  function deleteFireRecord() {
    //make sure table name, dataname in receiving app, and form_values key are correct (next line).
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE nsw_record_id = '" + payload.record.form_values["05e2"] + "';");
    var url = "https://api.fulcrumapp.com/api/v2/query/?format=json&q=" + query;
    var options = {
      "method": "GET",
      "contentType": "application/json",
      "headers": {
        "X-ApiToken": "1def20f914c43b058ceb04affa255ae587c93047d7908161537513cda3f5d4d611154b41b997b73e"
      }
    };
    var json = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(json);
    
    var url = "https://api.fulcrumapp.com/api/v2/records/" + data.rows[0].fulcrum_id + ".json";
    var options = {
      "method": "DELETE",
      "contentType": "application/json",
      "dataType": "json",
      "headers": {
        "X-ApiToken": "1def20f914c43b058ceb04affa255ae587c93047d7908161537513cda3f5d4d611154b41b997b73e"
      }
    };
    
    var recordJSON = UrlFetchApp.fetch(url, options);
  }
 
  console.log('Payload:');
  console.log(payload);
  done()
}

var fulcrumMiddlewareConfig = {
  actions: ['record.create', 'record.update', 'record.delete'],
  processor: payloadProcessor
};

app.use('/', fulcrumMiddleware(fulcrumMiddlewareConfig));

app.get('/', function (req, res) {
  res.send('<html><head><title>NSW Public</title></head><body><h2>Fire Rescue</h2><p>going</p></body></html>');
})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
