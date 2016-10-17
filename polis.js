var express = require('express');
var fulcrumMiddleware = require('connect-fulcrum-webhook');
var request = require('request');
var PORT = process.env.PORT || 9000;
var app = express();

function payloadProcessor (payload, done) {
  if (payload.data.form_id && payload.data.form_id === "7989a430-3ef5-4fe4-94b9-c3f958c31db0"){
    if (payload.type === "record.create") {
      createNSWRecord(payload, done);
    } else if (payload.type === "record.update") {
      updateNSWRecord(payload, done);
    } else if (payload.type === "record.delete") {
      deleteNSWRecord(payload, done);
    }
  }
}

function createNSWRecord(payload, done) {
  payload.record = payload.data;
  payload.record.form_id = "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4";
  payload.record.form_values['ea7f'] = payload.record.form_values['88d3'];
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
  console.log('create',payload);
  done();
}

function updateNSWRecord(payload, done) {
  payload.record = payload.data;
  payload.record.form_id = 'c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4';
  payload.record.form_values['ea7f'] = payload.record.form_values['88d3'];
  delete payload.data;
  console.log('update', payload);
  console.log(payload.record.form_values['ea7f']);
  var data;

  var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values['ea7f'] + "';");
  console.log(query);

  request({
    method: 'GET',
    url: 'https://api.fulcrumapp.com/api/v2/query/?format=json&q=' + query,
    headers: {
      'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791',
      'User-Agent': 'request'
    }
  },
  function (err, httpResponse, body) {
    console.log(err, body);
    var data = body;
    return data;
  });
  console.log('DATA', data);
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
  done();
}

function deleteNSWRecord(payload, done) {
  payload.record = payload.data;
  payload.record.form_id = "c7e35d8e-7bb9-4ee7-a24f-0dcf35b8a6d4";
  payload.record.form_values['ea7f'] = payload.record.form_values['88d3'];
  delete payload.data;
  console.log('delete',payload);
  console.log(payload.record.form_values['ea7f']);
  var data;
  
  var query = encodeURIComponent("SELECT _record_id AS fulcrum_id FROM \"Damage Assessment SYNC\" WHERE fire_rescue_record_id = '" + payload.record.form_values['ea7f'] + "';");
    
  request({
    method: 'GET',
    url: 'https://api.fulcrumapp.com/api/v2/query/?format=json&q=' + query,
    headers: {
      'X-ApiToken': '28203c5d15427563dcd0add301508eb4071b46e7c80eb3e7bed72f5d7beb5ad1fa888df0d1ed7791',
      'User-Agent': 'request'
    }
  },
  function (err, httpResponse, body) {
    console.log(err, body);
    var data = JSON.parse(body);
    return data;
  });
  console.log('DATA', data)

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
  done();
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
