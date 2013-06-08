$.fn.raty.defaults.path = "js/libs/raty/img";

App = Ember.Application.create();

App.Router.map(function() {
    this.route("index", { path: "/" });
    this.route("day", { path: "/day/:year/:month/:day" });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    var today = new Date();
    window.location.hash  = "/day/" + today.getFullYear() + "/" + today.getMonth() + "/" + today.getDate();
  }
});

App.DayRoute = Ember.Route.extend({
  model: function(params) {
    console.log(params)
    return getDayModel(params.year, params.month, params.day)
  }
});

App.DayController = Ember.Controller.extend({
    save: function(){
        var model = this.get("model");
        var json = JSON.stringify(model);
        localStorage.setItem(model.get("date").toISOString().split("T")[0], json)
    }
});

App.DayView = Ember.View.extend({
    didInsertElement: function(){
        var view = this;
        setHeaderDate(view.get("controller.model.date"))
        $(".star-rating-editable").each(function(){
            $(this).raty({
                score: $(this).data("score"),
                click: function(score){
                    view.get("controller.model").set($(this).data("model-name"), score);
                }
            });
        });
    }
});

App.DayModel = Ember.Object.extend({
    date: null,
    moodRating: 0,
    moodDescription: "",
    medication: [],
    food: "",
    health: "",
    fatigue: "",
    activities: [],
    concerns: "",
    appointments: [],
    treatments: []
});

function getDayModel(year, month, day){
    var json = localStorage.getItem(new Date(year, month, day).toISOString().split("T")[0]);
    var data = json !== null ? JSON.parse(json) : {date: new Date(year, month, day)};
    return App.DayModel.create(data);
}

function setHeaderDate(date){
    console.log(date)
}