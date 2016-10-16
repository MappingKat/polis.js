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

    request({
      method: 'POST',
      url: 'https://api.fulcrumapp.com/api/v2/records.json',
      json: payload.record,
      headers: {
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      }
    },
    function (err, httpResponse, body) {
      console.log(err, body);
    });
  }

  function updateNSWRecord() {
    payload.record = payload.data;
    payload.record.form_id = "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4";
    payload.record.form_values["88d3"] = payload.record.form_values["ea7f"];
    delete payload.data;
    
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values["ea7f"] + "';");
    console.log(query);

    request({
      method: 'GET',
      url: 'https://api.fulcrumapp.com/api/v2/query/?format=json&q=' + query,
      json: payload.record,
      headers: {
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      }
    },
    function (err, httpResponse, body) {
      console.log(err, body);
    });
    
    var data = JSON.parse(json);
    
    delete payload.record.id;
    
    request({
      method: 'PUT',
      url: 'https://api.fulcrumapp.com/api/v2/records/' + data.rows[0].fulcrum_id + '.json',
      json: payload.record,
      headers: {
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      }
    },
    function (err, httpResponse, body) {
      console.log(err, body);
      console.log(body.typeof);
    });
  }

  function deleteNSWRecord() {
    //make sure table name, dataname in receiving app, and form_values key are correct (next line).
    var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values["ea7f"] + "';");
    
    request({
      method: 'GET',
      url: 'https://api.fulcrumapp.com/api/v2/query/?format=json&q=' + query,
      json: payload.record,
      headers: {
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      }
    },
    function (err, httpResponse, body) {
      console.log(err, body);
    });
    var json = request.fetch(url, options);
    var data = JSON.parse(json);

    request({
      method: 'DELETE',
      url: 'https://api.fulcrumapp.com/api/v2/records/' + data.rows[0].fulcrum_id + '.json',
      json: payload.record,
      headers: {
        'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791'
      }
    },
    function (err, httpResponse, body) {
      console.log(err, body);
    });
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
