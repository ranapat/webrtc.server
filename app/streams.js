module.exports = function () {
  /**
   * available streams
   * the id value is considered unique (provided by socket.io)
   */
  var streamList = [];

  var addStream = function (id, name) {
    removeStream(id);

    var stream = new Stream(id, name);
    streamList.push(stream);
  };

  var removeStream = function (id) {
    var index = 0;
    while(index < streamList.length && streamList[index].id != id){
      ++index;
    }
    streamList.splice(index, 1);
  };

  var update = function (id, name) {
    var stream = streamList.find(function(element, i, array) {
      return element.id == id;
    });

    stream.name = name;
  };

  /**
   * Stream object
   */
  var Stream = function (id, name) {
    this.name = name;
    this.id = id;
  }

  return {
    addStream : addStream,
    removeStream : removeStream,
    update : update,

    getStreams : function () {
      return streamList;
    }
  }
};
