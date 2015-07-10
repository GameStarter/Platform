Competitions = new Mongo.Collection("competitions");
Ideas = new Mongo.Collection("ideas");


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
    addComp: function(title,prize,brief){
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
        Competitions.insert({
            owner: Meteor.user(),
            title: title,
            slug: slugify(title),
            prize: prize,
            brief: brief,
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

        Meteor.call("addComp", title,prize,brief);

        event.target.title.value = "";
        event.target.prize.value = "";
        event.target.brief.value = "";
        // Prevent default form submit
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
