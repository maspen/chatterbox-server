var app = {
  init: function() {
    // this.server = 'http://parse.sfm8.hackreactor.com';
    this.server = 'http://127.0.0.1:3000';
    this.friends = {};
    this.rooms = { 'lobby':[] }; // { roomName1:[], roomName2: []} 
    $('#send .submit').on('click', function(event) {
      event.preventDefault();

      var newMessageObj = {};
      newMessageObj.text = $('#inputMessage').val();
      newMessageObj.username = window.location.search.replace(/[?]username=/, '');
      newMessageObj.roomname = $('#roomSelect').attr('data-currentroom');
      // Need to find a way to do it directly from option?
      app.handleSubmit(newMessageObj);
    });

    $(document).on('click', '.username', function(event){
    console.log(event.target)   
   });

    $(document).on('change', '#roomSelect', function(event) {
      var theRoom = $(event.target).val();
      $('#roomSelect').attr('data-currentroom', theRoom)
      app.fetch( theRoom );
    });

    $(document).on('change', '#roomSelect', function() {
console.log('888888888' + $('#roomSelect').val());
    });
    // // need to toggle spinner 'off'
    this.fetch();
  },
  send: function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server + '/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      // data: { posted_data: JSON.stringify(message) },
      contentType: 'application/json',
      success: function (data) {
        // on success, need to add to div #chats AND rooms
        console.log('chatterbox: Message sent' + data);
        // toggel spinner
        $('.spinner').toggle();
        // refresh msg area
        app.fetch(message.roomname);
        
      },
      error: function (message) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', message);
      }
    });
  },
  // ??? needs to be called when the page loads & populates the 'rooms' pull down
  fetch: function(roomname) {
    $.ajax({
      // http://parse.CAMPUS.hackreactor.com/chatterbox/classes/messages
      // sfm8
      url: this.server + '/classes/messages',
      type: 'GET',
      // data: {limit: 300, order: '-createdAt'},
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent received from GET', data);
        console.log('chatterbox: Message sent received from GET', data.results);

        app.parseFetchedMessageArray(data.results);
        app.populatePage(roomname);

        return data.results;
      },
      error: function () {
        // // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send GET');
        return null;
      }
    });
  },
  parseFetchedMessageArray: function(array) {
    // clear rooms object
    app.rooms = { 'lobby': [] };

    array.forEach(function(message) {
      var messageDiv = app.constructMessageDivForMessage(message);

      if (message.roomname && message.roomname !== null && message.roomname !== 'undefined') {
        message.roomname = message.roomname.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (!app.rooms.hasOwnProperty(message.roomname)) {
          app.rooms[message.roomname] = [];
        }
        app.rooms[message.roomname].push(messageDiv);
      } else {
        app.rooms['lobby'].push(messageDiv);
      }
    });   
  },
  clearMessages: function() {
    // clear chat messages
    $('#chats').empty();
    // clear the room selector
    $('#roomSelect').empty();
  },
  constructMessageDivForMessage: function(message) {
    if(message.text) {
      var $messageContainer = $('<div>').addClass('message');
      var $usernameTag = $('<a href="#">').addClass('username').text(message.username);
      // TODO: parse out anything malicious in message.text
      var $messageTag = $('<div>').addClass('message-text').text(message.text);
      $messageContainer.append($usernameTag);
      $messageContainer.append($messageTag);
      // $messageContainer.attr('data-room', `${message.roomname}`)

      $messageContainer.on('click', function() {
        app.handleUsernameClick($(this));
      });

      return $messageContainer;
    }
  },
  renderMessage: function(messageDiv) {
    $('#chats').append(messageDiv);

  // Check the roomname and see if it's a property in this.rooms
  },
  renderRoom: function(room) {
    $('#roomSelect').append('<option class="selectedRoom" value=\"' + room + '\">' + room + '</option>');
  },
  handleUsernameClick: function(domObject) {
    // what else should happen when an user is clicked?
    var userName = domObject.attr('data-username');
    this.friends[userName] = userName;
  },
  handleSubmit: function(inputMessage) {
console.log('handle submit ....');
    var currentRoom = inputMessage.roomname;
    // 0. toggle class="spinner" to 'on' - when page loads
    //    its toggled 'off'
    $('.spinner').toggle();
    // 1. need to contact the server and send the message
    app.send(inputMessage);
    // 2. when response comes back as 'ok', add message text
    //    and author to div id="chats"
    // app.fetch(currentRoom);
    // 3. toggle spinner 'off'
    $('.spinner').toggle();  
  },
  populatePage(roomName = 'lobby') {
    app.clearMessages();
    // populate Room selections
    // $('#roomSelect').attr('data-currentRoom', roomName);
    for(var key in app.rooms) {
      this.renderRoom(key);
    }

    app.rooms[roomName].forEach(function(message) {
      app.renderMessage(message);
    });
    // TOGGLE OFF spinner
    $( '.spinner').toggle();
  }
};
