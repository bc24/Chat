// Generated by CoffeeScript 1.7.1
(function() {
  if (localStorage["version"] == null) {
    localStorage["version"] = "google";
    window.location.reload();
  }

  foundry.angular.dependency = [];

  define('config', function() {
    var config;
    config = {};
    config.appName = 'Chat';
    config.plugins = {
      users: 'app/plugins/users',
      workspaces: 'app/plugins/workspaces',
      support: 'core/plugins/support',
      chat: 'app/plugins/chat'
    };
    return config;
  });

  foundry.load_plugins();

  Nimbus.Auth.setup({
    'GDrive': {
      'app_id' : '696230129324',
      'key': '696230129324-k4g89ugcu02k5obu9hs1u5tp3e54n02u.apps.googleusercontent.com',
      "scope": "openid https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/plus.me"
    },
    "Firebase": {
      key: 'amber-torch-4018',
      app_name: 'Foundry'
    },
    "app_name": "Foundry",
    'synchronous': true
  });

  Nimbus.Auth.authorized_callback = function() {
    if (Nimbus.Auth.authorized()) {
      return $("#login_buttons").addClass("redirect");
    }
  };

  foundry.plugin_load_completed = function(){
    foundry._plugins.workspaces.title = 'Manage Rooms';
  }

  foundry.ready(function() {
    if (Nimbus.Auth.authorized()) {
      foundry.init(function() {
        $('#loading').addClass('loaded');
        return $("#login_buttons").removeClass("redirect");
      });
    }
  });

  $(document).ready(function() {
    $('#firebase_login_btn').on('click', function(evt) {
      evt.preventDefault();
      // check email and password
      if(!$('.login-form input[name="email"]').val() || !$('.login-form input[name="passwd"]').val()){
        return false;
      }

      Nimbus.Auth.authorize('Firebase', {
        'email' : $('.login-form input[name="email"]').val(),
        'password': $('.login-form input[name="passwd"]').val(),
        'provider': 'password'
      });
      return false;
    });

    $('#firebase_register_btn').on('click', function(evt) {
      evt.preventDefault();

      if(!$('.login-form input[name="email"]').val() || !$('.login-form input[name="passwd"]').val()){
        return false;
      }

      // setup first
      Nimbus.Auth.sync_services.Firebase.service = 'Firebase';
      Nimbus.Auth.setup(JSON.stringify(Nimbus.Auth.sync_services.Firebase));

      // register
      (function(){
        var server = Nimbus.Firebase.server;
        server.createUser({
          'email' : $('.login-form input[name="email"]').val(),
          'password' : $('.login-form input[name="passwd"]').val()
        }, function(err){
          if (!err) {
            bootbox.alert('Your account has been created, you can sign in now.', function(){
              location.reload();
            });
          }else{
            bootbox.alert('Register Error: '+err.message);
          };
        });
      })()

    });
    $('.logout_btn').on('click', function(evt) {
      foundry.logout();
      return location.reload();
    });
  });

}).call(this);
