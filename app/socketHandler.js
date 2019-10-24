module.exports = function(io, streams) {

  io.on('connection', function(client) {
    console.log('-- ' + client.id + ' joined --');
    client.emit('id', client.id);

    var otherClients = io.sockets.connected;
    for (var key in otherClients) {
      otherClients[key].emit('message', { type: 'join', payload: { mode: 'initial', id: client.id } });
    }

    client.on('message', function (details) {
      console.log('-- ' + client.id + ' wants to message -- ' + details.to + ' with ' + JSON.stringify(details));
      var otherClient = io.sockets.connected[details.to];

      if (!otherClient) {
        return;
      }
      delete details.to;
      details.from = client.id;
      otherClient.emit('message', details);
    });

    client.on('login', function(options) {
      if (options.name !== undefined) {
        console.log('-- ' + client.id + ' is online as ' + options.name);

        streams.addStream(client.id, options.name);

        client.emit('message', { type: 'login', payload: { mode: 'accepted' } });

        var otherClients = io.sockets.connected;
        for (var key in otherClients) {
          otherClients[key].emit('message', { type: 'join', payload: { mode: 'complete', id: client.id, name: options.name } });
        }

      } else {
        console.log('-- ' + client.id + ' is trying to go online as ' + options.name);
      }
    });

    client.on('update', function(options) {
      console.log('-- ' + client.id + ' updates as ' + options.name);

      streams.update(client.id, options.name);

      client.emit('message', { type: 'update', payload: { mode: 'accepted' } });
    });

    function leave() {
      console.log('-- ' + client.id + ' left --');
      streams.removeStream(client.id);

      var otherClients = io.sockets.connected;
      for (var key in otherClients) {
        otherClients[key].emit('message', { type: 'leave', payload: { id: client.id, name: client.name } });
      }
    }

    client.on('disconnect', leave);
    client.on('leave', leave);
  });
};
