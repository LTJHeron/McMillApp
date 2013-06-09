$.fn.raty.defaults.path = "js/libs/raty/img";

App = Ember.Application.create();

App.Router.map(function() {
    this.route("index", { path: "/" });
    this.route("day", { path: "/day/:year/:month/:day" });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    var today = new Date();
    //App.Router.router.transitionTo("day", [2011])
    gotoDay(today);
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
        localStorage.setItem(new Date(model.get("date")).toISOString().split("T")[0], json)
    }
});

App.DayView = Ember.View.extend({
    didInsertElement: function(){
        var view = this;
        updateHeader(view.get("controller.model.date"))
        $(".star-rating-editable").each(function(){
            $(this).raty({
                score: $(this).data("score"),
                click: function(score){
                    view.get("controller.model").set($(this).data("model-name"), score);
                }
            });
        });
        $(".star-rating-editable").width(200)
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
    appointments: []
});

function getDayModel(year, month, day){
    console.log("getDayModel", year, month, day)
    var json = localStorage.getItem(new Date(year, month, day).toISOString().split("T")[0]);
    var data = json !== null ? JSON.parse(json) : {date: new Date(year, month, day)};

    data.appointments = data.appointments || [];
    for (var i=0;i<data.appointments.length;i++){
        data.appointments[i].id=i;
    }
    return App.DayModel.create(data);
}

function gotoDay(date){
    window.location.hash = "/day/" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();document.location.reload()
}

function updateHeader(date){
    console.log("updating header with", date)
    var html = $("#header-template").html();
    $("#header").html(html);
    $("#header").find("h1").text(new Date(date).toString());
    $("#header .prev").click(function(){
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1)
        gotoDay(newDate)
    })
    $("#header .next").click(function(){
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1)
        gotoDay(newDate)
    });
}


