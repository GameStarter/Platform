UI.registerHelper('equals', function(a, b) {
  return a == b; // == intentional
});



Settings = new Mongo.Collection("settings");

// The Gamestarter Competitions and ideas collections

Competitions = new Mongo.Collection("competitions");
Ideas = new Mongo.Collection("ideas");

// The Gamestarter Quest collections
Heroes = new Mongo.Collection("heroes");
Quests = new Mongo.Collection("quests");
Store = new Mongo.Collection("store");
StoreCategories = new Mongo.Collection("storeCategories");
Prizes = new Mongo.Collection("prizes");



// We have a main competition!
var main_comp = 'Moscow Metro Dogs';
var competition_id;
Router.route('/', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: 'Gamestarter'
    }
  });
  this.render('home');
});

Router.route('/admin/settings', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: ' Admin',
      settings: function () {
        return Settings.find().fetch();
      }
    }
  });
  this.render('adminSettings');
});

Router.route('/admin/competitions', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: ' Admin',
      competitions: function () {
        return Competitions.find().fetch();
      }
    }
  });
  this.render('adminCompetitions');
});

Router.route('/admin/store', function () {
  var dollarValue = Settings.findOne({slug: 'dollar-value'});
  var prizes = Prizes.find().fetch();
  for(i=0;i<prizes.length;i++){
    prizes[i].points = prizes[i].value * dollarValue.value;
  }
  console.log(prizes);
  this.layout('ApplicationLayout', {
    data: {
      title: ' Admin',
      prizes: function () {
        return prizes;
      }
    }
  });
  this.render('adminStore');
});

Router.route('/admin/users', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: ' Admin',
      users: function () {
        return Meteor.users.find().fetch();
      }
    }
  });
  this.render('adminUsers');
});


Router.route('/login', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: 'Login'
    }
  });
  this.render('login');
});

Router.route('/register', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: 'Register'
    }
  });
  this.render('register');
});

Router.route('/quests', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: 'Quests'
    }
  });
  this.render('quests');
});

Router.route('/about', function () {
  title = 'About';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('about');
});

Router.route('/about/competitions', function () {
  title = 'Competitions';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutCompetitions');
});

Router.route('/about/tokens', function () {
  title = 'GameStarter Tokens';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutTokens');
});

Router.route('/about/heropoints', function () {
  title = 'Hero Points';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutHeroPoints');
});

Router.route('/about/Winning', function () {
  title = 'Winning';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutWinning');
});

Router.route('/about/Team', function () {
  title = 'The Team';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutTeam');
});

Router.route('/about/Create', function () {
  title = 'Host a Competition';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('aboutCreate');
});

Router.route('/store', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: 'Store'
    }
  });
  this.render('store');
});

Router.route('/profile', function () {
  title = 'Profile';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('profile');
});

Router.route('/profile/tokens', function () {
  title = 'Tokens';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('tokens');
});

Router.route('/profile/settings', function () {
  title = 'Settings';
  this.layout('ApplicationLayout', {
    data: {
      title: title,
      slug: slugify(title)
    }
  });
  this.render('settings');
});

Router.route('/admin', function () {
  this.layout('ApplicationLayout', {
    data: {
      title: ' Admin'
    }
  });
  this.render('adminDashboard');
});


Router.route('/:competition/entries', function () {

  var competition = Competitions.findOne({slug: this.params.competition});
  var ideas = Ideas.find({competition: competition._id}).fetch();
  for(i=0;i<ideas.length;i++){
    ideas[i].competition = competition.slug;
  }
  competition_id = competition._id;
  this.layout('ApplicationLayout', {
    data: {
      competition: competition,
      ideas: ideas,
      title: 'Gamestarter'
    }
  });
  this.render('entries');
});

Router.route('/:competition/:idea', function () {

  var competition = Competitions.findOne({slug: this.params.competition});
  var idea = Ideas.findOne({_id: this.params.idea});
  competition_id = competition._id;
  this.layout('ApplicationLayout', {
    data: {
      competition: competition,
      idea: idea,
      title: 'Gamestarter'
    }
  });
  this.render('idea');
});

Router.route('/:competition', function () {

  var competition = Competitions.findOne({slug: this.params.competition});
  var ideas = Ideas.find({competition: competition._id});
  competition_id = competition._id;
  this.layout('ApplicationLayout', {
    data: {
      competition: competition,
      ideas: ideas,
      title: 'Gamestarter'
    }
  });
  this.render('competition');
});

Meteor.methods({
    addComp: function(title,prize,type,brief){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
        Competitions.insert({
            owner: Meteor.user(),
            title: title,
            slug: slugify(title),
            prize: prize,
            brief: brief,
            type: type,
            createdAt: new Date()
        });
    },
    addIdea: function(competition,title,description){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Ideas.insert({
            competition: competition,
            owner: Meteor.user(),
            title: title,
            slug: slugify(title),
            description: description,
            points: 0,
            createdAt: new Date(),
            voters: []
        });
      //$('ul.tabs').tabs('select_tab', 'submissions');

    },
    addSetting: function(title,description,type){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Settings.insert({
            owner: Meteor.user(),
            title: title,
            slug: slugify(title),
            description: description,
            type: type,
            createdAt: new Date(),
            value: null
        });
      //$('ul.tabs').tabs('select_tab', 'submissions');

    },
    setSetting: function(slug,value){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Settings.update({slug: slug},{$set: {value: value}});
      //$('ul.tabs').tabs('select_tab', 'submissions');

    },
    addPrize: function(category,title,value,description,digital){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Prizes.insert({
            competition: competition,
            digital: digital,
            category: category,
            owner: Meteor.user(),
            title: title,
            slug: slugify(title),
            value: value,
            description: description,
            createdAt: new Date()
        });
      //$('ul.tabs').tabs('select_tab', 'submissions');

    },
    upvoteIdea: function(idea){
      idea = Ideas.findOne({_id: idea});
      var found = false;
      for(i=0;i<idea.voters.length;i++){
        if(idea.voters[i] == Meteor.userId()){
          found = true;
          break;
        }
      }
      if(found){
        idea.voters.splice(i,1);
        idea.points--;
      }else{
        if (! Meteor.userId()) {
          // TODO:
          // APPEND IP ADDRESS
        }else{
          idea.voters.push(Meteor.userId());
          idea.points++; 
        }
      }


      Ideas.update({_id: idea._id},{$set: {points: idea.points, voters: idea.voters}});

    }
});

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Template.home.onRendered(function(){
    this.$('ul.tabs').tabs();
    this.$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });

});
Template.ideasTemp.onRendered(function(){
    this.$('ul.tabs').tabs();
    this.$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });

});

Template.dropdownMenu.onRendered(function(){
    this.$(".dropdown-button").dropdown();
});


Template.home.helpers({
  competitions: function () {
    return Competitions.find();
  },
    ideas: function () {
      competition = Competitions.findOne({slug: slugify(main_comp)});
      ideas = {
        recent: Ideas.find({competition: competition._id}, {sort: {createdAt: -1}}).fetch(),
        best: Ideas.find({competition: competition._id}, {sort: {points: -1}}).fetch(),
        trending: Ideas.find({competition: competition._id}, {sort: {points: -1}}).fetch()
      }
    return ideas;
  },
});
    Template.adminCompetitions.events({
    'submit .createComp': function (event) {
      // increment the counter when button is clicked

          var title = event.target.title.value;

          var prize = event.target.prize.value;

          var brief = event.target.brief.value;

          var type = event.target.type.value;

        Meteor.call("addComp", title,prize,type,brief);

        event.target.title.value = "";
        event.target.prize.value = "";
        event.target.brief.value = "";
        event.target.type.value = "";
        // Prevent default form submit
    return false;
    }
  });

    Template.adminStore.events({
    'submit .createPrize': function (event) {
      // increment the counter when button is clicked

          var category = null;

          var title = event.target.title.value;

          var value = event.target.value.value;

          var description = event.target.description.value;

          var digital = event.target.digital.value;

        Meteor.call("addPrize", category,title,value,description,digital);

        event.target.title.value = "";
        event.target.value.value = "";
        event.target.description.value = "";
        event.target.digital.value = "";
        // Prevent default form submit
    return false;
    }
  });

    Template.adminSettings.events({
    'submit .createSetting': function (event) {
      // increment the counter when button is clicked

          var title = event.target.title.value;

          var description = event.target.description.value;

          var type = event.target.type.value;

        Meteor.call("addSetting",title,description,type);

        event.target.title.value = "";
        event.target.value.value = "";
        event.target.description.value = "";
        event.target.digital.value = "";
        // Prevent default form submit
    return false;
    },
    'change .settingValue': function (event) {
          Meteor.call("setSetting",event.target.id,event.target.value);
        event.target.value = "";
      return false;
    }
  });


  Template.competition.events({
    'submit .createIdea': function (event) {

          var title = event.target.title.value;

          var description = event.target.description.value;
        Meteor.call("addIdea", competition_id,title,description);

        event.target.title.value = "";
        event.target.description.value = "";
        // Prevent default form submit
        return false;
    },
    'click .upvote': function (event) {
          var idea = event.target.className.split(" ");
          idea = idea[1].split('_');
          idea = idea[1];
          Meteor.call("upvoteIdea", idea);

        // Prevent default form submit
        event.preventDefault();
    }
  });
    Template.ApplicationLayout.events({
    'submit .register': function (event) {
      // increment the counter when button is clicked
      if(event.target.email.value && event.target.password.value){
        Accounts.createUser({
            email: event.target.email.value,
            password: event.target.password.value,
            profile: {
                admin: 1
            }
        });
      }
        // Prevent default form submit
    return false;
    },
    'submit .login': function (event) {
      // increment the counter when button is clicked
      if(event.target.email.value && event.target.password.value){
        Meteor.loginWithPassword(event.target.email.value, event.target.password.value, function(error){
            console.log(error.reason);

        });
      }
        // Prevent default form submit
    return false;
    },
    'click .logout': function (event) {
        Meteor.logout();
        event.preventDefault();
    }
  });
        Template.login.events({
    'submit .login': function (event) {
      // increment the counter when button is clicked
      if(event.target.email.value && event.target.password.value){
        Meteor.loginWithPassword(event.target.email.value, event.target.password.value, function(error){
            if(!error){
              Router.go('/');
            }
            console.log(error.reason);
        });
      }
        // Prevent default form submit
    return false;
    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    // Create admin account
    admin = Meteor.users.find({"emails.address": 'admin@gamestarter.io'}).fetch();

    if(admin.length<=0){
        adminProfile = [];
        Accounts.createUser({
            email: 'admin@gamestarter.io',
            password: 'theMan',
            profile: {
                admin: 1
            }
        });
    }
    competition = Competitions.findOne({slug: slugify(main_comp)});
    if(!competition){
      Competitions.insert({
            title: main_comp,
            slug: slugify(main_comp),
            prize: '300',
            brief: 'None yet',
            createdAt: new Date()
        });
    }
  });
}
