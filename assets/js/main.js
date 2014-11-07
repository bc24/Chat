
// Generated by CoffeeScript 1.8.0
(function() {
  var define_controller;

  define('chat', function() {
    return {
      title: 'Chat Room',
      icon: 'icon-comment',
      type: 'plugin',
      anchor: '#/chat',
      init: function() {
        var attrs, self;
        self = this;
        attrs = ['userId', 'userName', 'ts', 'image', 'content', 'file', 'avatar', 'local'];
        foundry.model('Message', attrs, function(model) {
          return foundry.initialized('chat');
        });
        return define_controller();
      },
      inited: function() {
        return console.log('end');
      }
    };
  });

  define_controller = function() {
    angular.module('foundry').controller('ChatController', [
      '$scope', '$filter', '$timeout', function($scope, $filter, $timeout) {
        var loadUser, messageModel, sync_collaborators;
        $scope.messages = [];
        $scope.message = '';
        $scope.collaborators = [];
        messageModel = foundry._models['Message'];
        messageModel.onUpdate(function(mode, obj, isLocal) {
          $scope.load();
          return $scope.$apply();
        });
        sync_collaborators = function() {
          return Nimbus.realtime.getCollaborators(function(users) {
            return $scope.collaborators = users;
          });
        };
        $scope.load = function() {
          var messages;
          messages = $filter('orderBy')(messageModel.all(), 'local', false);
          $scope.messages = messages;
          $scope.me = null;
          Nimbus.realtime.getCollaborators(function(users) {
            var user, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = users.length; _i < _len; _i++) {
              user = users[_i];
              if (user.isMe) {
                $scope.me = user;
                break;
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          });
          sync_collaborators();
        };
        $scope.send = function() {
          var data, now;
          console.log('send this');
          if (!$scope.message) {
            return;
          }
          now = new Date();
          data = {
            userId: foundry._current_user.id,
            userName: foundry._current_user.name || foundry._current_user.displayName,
            content: $scope.message,
            ts: now.getTime() + now.getTimezoneOffset() * 60000,
            avatar: $scope.me.photoUrl || 'https://raw.githubusercontent.com/NimbusFoundry/Chat/firebase/assets/img/photo.jpg',
            local: now.getTime()
          };
          messageModel.create(data);
          $scope.message = '';
          return $scope.load();
        };
        $scope.is_mine_message = function(message) {
          return message.userId === foundry._current_user.id;
        };
        loadUser = function(evt) {
          console.log(evt.type);
          sync_collaborators();
          return $scope.$apply();
        };
        $scope.get_gravatar = function(uid) {
          var user;
          user = foundry._user_list[uid];
          if (user) {
            return 'http://www.gravatar.com/avatar/' + md5(user.email) + '?d=mm';
          } else {
            return 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm';
          }
        };
        return $scope.load();
      }
    ]);
    return angular.module('foundry').run([
      '$templateCache', function($templateCache) {
        var html;
        html = '<div ng-controller="ChatController"> <div class="breadcrumb absolute"> <h1>Chat Room</h1> </div> <div class="container-fluid chat-plugin"> <div class="row-fluid"> <div class="chat-list span8"> <div class="list"> <div ng-repeat="message in messages" class="msg" ng-class="{mine:is_mine_message(message)}"> <div class="avatar"> <img ng-src="{{get_gravatar(message.userId)}}" alt=""> </div> <div class="message-content"> <p ng-bind="message.content" class="content" ng-if="message.content"> </p> <p ng-if="message.image"> </p> <p ng-if="message.file"> </p> <p class="muted"> <strong ng-bind="message.userName" class="bold"></strong> • <span ng-bind="message.local|date:' + "'MM-dd HH:mm:ss'" + '"></span> </p> </div> </div> </div> <div class="send-box"> <div class="send-container"> <textarea ng-model="message"> </textarea> <button type="button" ng-click="send()" value="Send">Send</button> </div> </div> </div> <div class="user-list span4" style="margin-top: 10px;"> <ul style="list-style:none;"> <p style="font-weight: bold; color: #777;">Current people: </p> <li ng-repeat="user in collaborators|orderBy:' + "'displayName'" + '"> <!-- user list template --> <img ng-src="{{user.photoUrl}}" alt="" style="max-width: 50px;"> <span ng-bind="user.displayName"></span> </li> </ul> </div> </div> </div> </div>';
        return $templateCache.put('app/plugins/chat/index.html', html);
      }
    ]);
  };

}).call(this);

// Generated by CoffeeScript 1.8.0
(function() {
  var inject_controller;

  define('users', ['require', 'core/analytic'], function(require, analytic) {
    var user_plugin;
    return user_plugin = {
      _models: {},
      title: 'Users',
      type: 'plugin',
      order: -12,
      icon: 'icon-user',
      init: function() {
        var attributes, name, self;
        console.log('-------------loading the overrided user plugin------------');
        self = this;
        name = 'User';
        attributes = ['pid', 'name', 'role', 'email', 'pic', 'not_first_login', 'initied', 'rated', 'last_login_time'];
        this._models['user'] = {};
        foundry.model(name, attributes, function(model) {
          self._models['user'] = model;
          foundry.initialized('users');
        });
      },
      inited: function() {
        var id, self, user, user_model, _ref;
        analytic.init();
        this.check_users();
        self = this;
        user_model = foundry._models['User'];
        _ref = foundry._user_list;
        for (id in _ref) {
          user = _ref[id];
          if (user.id === Nimbus.realtime.c_file.owners[0].permissionId) {
            foundry._current_owner = user;
          }
        }
        return inject_controller();
      },
      check_users: function() {
        var data, one, pid, user, user_model, _i, _len, _ref, _ref1;
        user_model = foundry._models['User'];
        console.log('user list total :' + Object.keys(foundry._user_list).length + ', user model total: ' + user_model.all().length);
        _ref = user_model.all();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          user = _ref[_i];
          if (!user.email) {
            user.destroy();
          }
        }
        _ref1 = foundry._user_list;
        for (pid in _ref1) {
          user = _ref1[pid];
          one = user_model.findByAttribute('pid', pid);
          if (one) {
            if (one.email) {
              user.email = one.email;
              user.roleName = one.role;
            }
          }
          if (one && !one.pic) {
            one.pic = user.pic;
            one.save();
          } else if (!one) {
            data = {
              'pid': pid,
              'name': user.name,
              'pic': user.pic
            };
            if (user.email) {
              data.email = user.email;
            }
            if (Nimbus.realtime.c_file.owners[0].permissionId === pid) {
              data.role = 'Admin';
            } else {
              data.role = 'Viewer';
            }
            if (pid === foundry._current_user.id) {
              data.email = foundry._current_user.email;
            }
            user_model.create(data);
            user.roleName = data.role;
          }
          one = user_model.findByAttribute('pid', pid);
          if (pid === foundry._current_user.id) {
            if (!one.not_first_login) {
              one.not_first_login = 1;
              one.save();
            }
          }
        }
      },
      all_user: function() {
        return this._models['user'].all();
      },
      add_user: function(data, callback) {
        var model, user;
        if (!data.role) {
          data.role = 'Viewer';
        }
        model = this._models['user'];
        user = model.findByAttribute('email', data.email);
        if (!user) {
          user = model.create(data);
        }
        user.role = data.role;
        user.save();
        this.add_share(user, function(data) {
          if (callback) {
            return callback(data);
          }
        });
        return analytic.user({
          email: foundry._current_user.email,
          user: data.email,
          id: foundry._current_user.id
        });
      },
      add_share: function(user, callback) {
        var model;
        model = this._models['user'];
        if (user.email) {
          return Nimbus.Share.add_share_user_real(user.email, function(u) {
            var server, t;
            if (u.name) {
              t = model.findByAttribute('email', user.email);
              t.name = u.name;
              t.pid = u.id;
              t.pic = u.pic;
              t.save();
            }
            foundry._user_list[u.id] = {
              name: u.name,
              pic: u.pic,
              roleName: user.role,
              email: user.email,
              id: u.id,
              role: u.role
            };
            if (Nimbus.Auth.service = 'Firebase') {
              server = Nimbus.Firebase.server;
              server.createUser({
                email: user.email,
                password: 'freethecloud'
              }, function(err) {
                return console.log(err);
              });
            }
            if (callback) {
              callback(u);
              return angular.element(document).scope().$apply();
            }
          });
        }
      },
      remove_share: function(user) {
        Nimbus.Share.remove_share_user_real(user.id, function(res) {});
      },
      save_user: function(id, data) {
        var user;
        user = foundry._user_list[id];
        user.roleName = data.role;
        user = this._models['user'].findByAttribute('pid', id);
        if (user) {
          user.role = data.role;
          return user.save();
        }
      },
      del_user: function(user, callback) {
        var id;
        id = user.id;
        this.remove_share(user);
        if (callback) {
          return callback();
        }
      },
      mail_list: function() {
        var i, id, recipients, user, _ref;
        recipients = '';
        i = 0;
        _ref = foundry._user_list;
        for (id in _ref) {
          user = _ref[id];
          if (user.email === foundry._current_user.email) {
            continue;
          }
          if ((foundry.get_setting_all(id, "email") != null) && foundry.get_setting_all(id, "email") === false) {
            continue;
          }
          if (i === 0 && user.email) {
            recipients += user.name + ' <' + user.email + '>';
          } else if (user.email) {
            recipients += ',' + user.name + ' <' + user.email + '>';
          }
          i++;
        }
        return recipients;
      }
    };
  });

  inject_controller = function() {
    angular.module('foundry').controller('UserListController', [
      '$scope', '$rootScope', '$parse', function($scope, $rootScope, $parse) {
        var current_user, update_current_user_permission, user_model;
        user_model = foundry.load('users');
        $scope.users = foundry._user_list;

        /*
        			basic settings
         */
        $rootScope.breadcum = 'Users';
        $rootScope.shortcut_name = 'Add User';
        current_user = foundry._current_user;
        $scope.user_permission = 'Viewer';
        update_current_user_permission = function() {
          var current_user_in_model;
          current_user_in_model = foundry._models.User.findByAttribute('pid', current_user.id);
          if (current_user_in_model) {
            return $scope.user_permission = current_user_in_model.role;
          }
        };
        update_current_user_permission();
        $scope.add_shortcut = function() {
          $scope.form_mode = 'create';
          $('.form').modal();
        };
        $scope.form_mode = 'create';
        $scope.usermodel = {
          fields: {
            email: {
              type: 'input',
              label: 'Email'
            },
            role: {
              type: 'select',
              label: 'Role',
              options: {
                Admin: 'Admin',
                Viewer: 'Viewer'
              }
            }
          },
          create: 'submit()',
          update: 'update()'
        };
        $scope.userEditModel = {
          fields: {
            role: {
              type: 'select',
              label: 'Role',
              options: {
                Admin: 'Admin',
                Viewer: 'Viewer'
              }
            }
          },
          create: 'submit()',
          update: 'update()'
        };
        $scope.user_data = {
          name: '',
          email: ''
        };

        /*
        			user CURD
         */
        $scope.edit_user = function(id) {
          $scope.form_mode = 'edit';
          $scope.user_data = angular.copy($scope.users[id]);
          $scope.user_data.role = $scope.user_data.roleName;
          $('.update_form').modal();
        };
        $scope.update = function() {
          user_model.save_user($scope.user_data.id, $scope.user_data);
          update_current_user_permission();
          $('.modal').modal('hide');
          $scope.user_data = {};
        };
        $scope.del_user = function(id) {
          user_model.del_user($scope.users[id]);
          return delete foundry._user_list[id];
        };
        $scope.creating_user = false;
        $scope.submit = function() {
          var reset;
          if ($scope.creating_user) {
            return;
          }
          $scope.creating_user = true;
          reset = function() {
            $scope.user_data = {};
            $('.form').modal('hide');
            $('.create_button').removeClass('disabled');
            return $scope.creating_user = false;
          };
          $('.create_button').addClass('disabled');
          user_model.add_user($scope.user_data, function() {
            return reset();
          });
        };
        $scope.user_info = {};
        $scope.show_user = function(id) {
          var user;
          user = $scope.users[id];
          $scope.user_info = {
            'name': user.name,
            'email': user.email
          };
          $('.userinfo').modal();
        };
        $scope.is_owner = function(user) {
          return user.id === foundry._current_owner.id;
        };
        $scope.clear = function() {
          $('.modal').modal('hide');
          $scope.user_data = {};
        };
      }
    ]);
    return angular.module('foundry').run([
      '$templateCache', function($templateCache) {
        var html;
        html = '<div ng-controller="UserListController"> <div class="breadcrumb"> <h1 ng-bind="breadcum"></h1> <div class="pull-right"> <a class="btn outline" ng-click="add_shortcut()">Add User</a> </div> </div> <div class="container-fluid"> <div class="row-fluid"> <div class="well-content"> <div> <table class="table"> <thead> <tr> <th>Current Users</th> </tr> </thead> <tbody> <tr ng-repeat="user in users"> <td> <div class="user_listing"> <img class="pic" ng-src="{{user.pic || ' + "' https://raw.githubusercontent.com/NimbusFoundry/Chat/firebase/assets/img/photo.jpg'" + '}}" /> <span class="name">{{user.name}}</span><span class="pill">{{user.roleName || ' + "'Viewer'" + '}}</span> <span class="badge badge-info" ng-if="is_owner(user)" style="border-radius: 5px;padding: 3px 5px;position: relative;top: -2px;text-transform: uppercase;">Owner</span> <div class="pull-right list_menu"> <a class="btn outline narrow" ng-click="edit_user(user.id)" ng-show="user_permission==' + "'Admin'" + '">edit</a> <a class="btn outline narrow" ng-click="show_user(user.id)">show</a> <a class="btn outline narrow" confirm on-confirm="del_user(user.id)" ng-show="user_permission==' + "'Admin'" + '"><i class="icon-trash" ></i></a> </div> </div> </td> </tr> </tbody> </table> </div> <div class="form modal fade nimbus_form_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" aria-hidden="true" ng-click="clear()">&times;</button> <h4 class="modal-title">User Form</h4> </div> <div class="modal-body"> <model-form model-name="usermodel" form-mode="form_mode" instance-name="user_data" on-create="submit()" on-update="update()"></model-form> </div> </div> </div> </div> <div class="update_form modal fade nimbus_form_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" aria-hidden="true" ng-click="clear()">&times;</button> <h4 class="modal-title">User Form</h4> </div> <div class="modal-body"> <model-form model-name="userEditModel" form-mode="form_mode" instance-name="user_data" on-create="submit()" on-update="update()"></model-form> </div> </div> </div> </div> <div class="modal fade userinfo"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" aria-hidden="true" ng-click="clear()">&times;</button> <h4 class="modal-title" >User Info</h4> </div> <div class="modal-body"> <dl class="dl-horizontal" id="user_form"> <dt>Name :<dt> <dd>{{user_info.name}}</dd> <dt>Email : </dt><dd>{{user_info.email}}</dd> </dl> </div> </div> </div> </div> </div> </div> </div> </div>';
        return $templateCache.put('app/plugins/users/index.html', html);
      }
    ]);
  };

}).call(this);

// Generated by CoffeeScript 1.8.0
(function() {
  var define_controller;

  define('workspaces', ['require', 'core/analytic'], function(require, analytic) {
    var c_file, doc_plugin;
    c_file = Nimbus.realtime.c_file;
    return doc_plugin = {
      type: 'plugin',
      order: -13,
      icon: 'icon-folder-close',
      _app_files: [],
      _app_folders: [],
      init: function() {
        var self;
        self = this;
        if (localStorage['last_opened_workspace'] && (localStorage['last_opened_workspace'] !== Nimbus.realtime.c_file.id)) {
          this.open({
            id: localStorage['last_opened_workspace']
          });
        } else {
          localStorage['last_opened_workspace'] = Nimbus.realtime.c_file.id;
          foundry.shared_users(function(users) {
            var _users;
            _users = users;
            return foundry.current_user(function(me) {
              var user, _i, _len;
              for (_i = 0, _len = _users.length; _i < _len; _i++) {
                user = _users[_i];
                if (user.id === me.id) {
                  foundry._current_user.role = user.role;
                }
              }
              if (!foundry._current_user.email) {
                foundry._current_user.email = Nimbus.Share.get_user_email();
              }
              console.log(_users);
              return foundry.initialized('workspaces');
            });
          });
        }
        return define_controller();
      },
      inited: function() {
        log('inited');
        if (this.switch_callback) {
          this.switch_callback();
        }
        return console.log(analytic);
      },
      switch_callback: null,
      all_doc: function() {
        this._app_files = Nimbus.realtime.app_files;
        return this._app_files;
      },
      open: function(doc, callback) {
        localStorage['last_opened_workspace'] = doc.id;
        Nimbus.Share.switch_to_app_file_real(doc.id, function() {
          if (callback) {
            callback();
          }
          angular.element(document).scope().$apply();
          ga('set', 'dimension2', Nimbus.realtime.c_file.title);
          ga('set', 'dimension3', Nimbus.realtime.c_file.owners[0].emailAddress + ':' + Nimbus.realtime.c_file.owners[0].displayName);
          ga('set', 'dimension4', foundry._models.User.all());
        });
      },
      create: function(name, callback) {
        var self;
        if (!name) {
          console.log('name required');
        }
        self = this;
        Nimbus.Share.create_workspace(name, function(data) {
          if (callback) {
            callback(data);
          }
          angular.element(document).scope().$apply();
        });
        analytic.owner({
          id: foundry._current_user.id,
          email: foundry._current_user.email,
          date: new Date().getTime(),
          'name': name
        });
      },
      current: function() {
        return Nimbus.realtime.c_file;
      },
      is_current: function(doc) {
        return doc.id === Nimbus.realtime.c_file.id;
      },
      rename: function(doc, name, cb) {
        var id, old_name, param, request, self;
        self = this;
        id = doc.id;
        old_name = doc.title;
        param = {
          path: "/drive/v2/files/" + id,
          method: "PATCH",
          params: {
            key: Nimbus.Auth.key,
            fileId: id
          },
          body: {
            title: name
          },
          callback: function(file) {
            var apply_changes, folder, index, query, rename_folder, _file, _ref;
            _ref = Nimbus.realtime.app_files;
            for (index in _ref) {
              _file = _ref[index];
              if (doc.id === _file.id) {
                file.title = name;
              }
            }
            folder = Nimbus.realtime.folder.binary_files;
            apply_changes = function(changed_file) {
              if (cb) {
                cb(changed_file);
              }
              return angular.element(document).scope().$apply();
            };
            rename_folder = function(target, replace) {
              return self.rename_folder(target, name + ' files', function(f) {
                if (replace) {
                  window.folder.binary_files = f;
                }
                return apply_changes(file);
              });
            };
            if (c_file.id !== id) {
              query = "mimeType = 'application/vnd.google-apps.folder' and title = '" + old_name + " files' and properties has { key='space' and value='" + id + "' and visibility='PRIVATE' }";
              Nimbus.Client.GDrive.getMetadataList(query, function(data) {
                if (!data.error) {
                  if (data.items.length >= 1) {
                    folder = data.items[0];
                    return rename_folder(folder);
                  } else {
                    return apply_changes();
                  }
                } else {
                  return apply_changes();
                }
              });
            } else {
              rename_folder(folder, true);
            }
          }
        };
        request = gapi.client.request(param);
      },
      rename_folder: function(folder, name, cb) {
        var id, param, request;
        log('rename the folder');
        id = folder.id;
        param = {
          path: "/drive/v2/files/" + id,
          method: "PATCH",
          params: {
            key: Nimbus.Auth.key,
            fileId: id
          },
          body: {
            title: name
          },
          callback: function(file) {
            if (cb) {
              cb(file);
            }
            return angular.element(document).scope().$apply();
          }
        };
        request = gapi.client.request(param);
      },
      del_doc: function(doc, callback) {
        if (doc.id === Nimbus.realtime.c_file.id) {
          return;
        }
        if (Nimbus.Share.deleteFile) {
          Nimbus.Share.deleteFile(doc.id);
        }
        this._app_files = Nimbus.realtime.app_files;
        if (callback) {
          callback();
        }
      }
    };
  });

  define_controller = function() {
    angular.module('foundry').controller('ProjectController', [
      '$scope', '$rootScope', 'ngDialog', '$foundry', function($scope, $rootScope, ngDialog, $foundry) {
        var docModule;
        docModule = foundry.load('workspaces');
        $rootScope.breadcum = 'Workspace';
        $scope.filename = '';
        $scope.current_edit = -1;
        $scope.load = function() {
          return $scope.projects = docModule.all_doc();
        };
        $scope.is_loaded = function(doc) {
          return docModule.is_current(doc);
        };
        $scope.add_document = function() {
          $scope.filename = '';
          ngDialog.open({
            template: 'newfile',
            controller: this,
            scope: $scope
          });
        };
        $scope.create_doc = function() {
          var spinner;
          ngDialog.close();
          spinner = $foundry.spinner({
            type: 'loading',
            text: 'Creating ' + $scope.filename + '...'
          });
          docModule.create($scope.filename, function(file) {
            var index, project, _ref;
            if (file.title === $scope.filename) {
              $scope.load();
              spinner.hide();
              _ref = $scope.projects;
              for (index in _ref) {
                project = _ref[index];
                if (file.id === project.id) {
                  $scope["switch"](index);
                  return;
                }
              }
            }
          });
        };
        $scope.edit = function(index) {
          var doc;
          doc = $scope.projects[index];
          $scope.current_edit = index;
          $scope.newname = doc.title;
          ngDialog.open({
            template: 'rename',
            scope: $scope
          });
        };
        $scope["switch"] = function(index) {
          var doc, spinner;
          $scope.current_doc = doc = $scope.projects[index];
          spinner = $foundry.spinner({
            type: 'loading',
            text: 'Switching...'
          });
          docModule.open(doc, function() {
            $scope.load();
            return spinner.hide();
          });
        };
        $scope.rename = function() {
          var doc, spinner;
          doc = $scope.projects[$scope.current_edit];
          spinner = $foundry.spinner({
            type: 'loading',
            text: 'Renaming...'
          });
          ngDialog.close();
          docModule.rename(doc, $scope.newname, function(file) {
            console.log(file);
            $scope.load();
            return spinner.hide();
          });
        };
        $scope.delet_doc = function(index) {
          var doc;
          doc = $scope.projects[index];
          docModule.del_doc(doc);
        };
        $scope.load();
      }
    ]);
    return angular.module('foundry').run([
      '$templateCache', function($templateCache) {
        var html;
        html = '<div ng-controller="ProjectController"> <div class="breadcrumb"> <h1 ng-bind="breadcum"></h1> <div class="pull-right"> <a class="btn outline" ng-click="add_document()">Add Workspace</a> </div> </div> <div class="container-fluid"> <div class="row-fluid"> <div class="well-content"> <table class="table"> <thead> <tr> <th>Current Workspaces</th> </tr> </thead> <tbody> <tr ng-repeat="project in projects"> <td> <div class="user_listing"> <i class="icon-folder-open colored-icon" ></i> <span class="name">{{project.title}}</span> <span class="pill" ng-show="is_loaded(project)">Loaded</span> <div class="pull-right list_menu"> <a class="btn outline narrow" ng-click="switch($index)">switch</a> <a class="btn outline narrow" ng-click="edit($index)">edit</a> <a class="btn outline narrow" confirm on-confirm="delet_doc($index)" ng-hide="is_loaded(project)"><i class="icon-trash" ></i></a> </div> </div> </td> </tr> </tbody> </table> </div> </div> <script type="text/ng-template" id="newfile"> <div class="nimbus_form_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <h4 class="modal-title">Add Document</h4> </div> <div class="modal-body"> <form method="get" accept-charset="utf-8"> <div class="nimb_form input" style="height:70px;"> <label>Name</label> <input type="text" ng-model="filename" placeholder="Type in document name" style="height:30px;margin-top:0px"> </div> </form> <button type="button" class="btn btn-primary" ng-click="create_doc()">Create</button> </div> </div> </div> </div> </script> <script type="text/ng-template" id="rename"> <div class="nimbus_form_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <h4 class="modal-title">Rename Document</h4> </div> <div class="modal-body"> <form method="get" accept-charset="utf-8"> <div class="nimb_form input" style="height:70px;"> <label>Name</label> <input type="text" ng-model="newname" placeholder="Type in document name" style="height:30px;margin-top:0px"> </div> </form> <button type="button" class="btn btn-primary" ng-click="rename()">Rename</button> </div> </div> </div> </div> </script> <script type="text/ng-template" id="swithing"> <div class="title"> swtiching to <span class="label label-success">{{current_doc.title}}</span>...</div> </script> </div> </div>';
        return $templateCache.put('app/plugins/workspaces/index.html', html);
      }
    ]);
  };

}).call(this);

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
