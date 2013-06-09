$.fn.raty.defaults.path = "js/libs/raty/img";

App = Ember.Application.create();

App.Router.map(function() {
    this.route("index", { path: "/" });
    this.route("day", { path: "/day/:year/:month/:day" });
    this.route("appointments", {path: "/appointments/:year/:month/:day"});
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

App.AppointmentsRoute = Ember.Route.extend({
    model: function(params){
        return getDayModel(params.year, params.month, params.day)
    }
});

App.AppointmentsController = Ember.Controller.extend({
    addAppointment: function(){
        addAppointment(this, {date: new Date()})
        
        window.location.reload();
    },
    gotoDayView: function(){
        switchView("day")
    },
    save: function(){
        saveModel(this.get("model"))
    }
});

function switchView(viewName){
    window.location.hash="/" + viewName + "/" + document.location.hash.split("/").splice(2).join("/")
}

function addAppointment(controller, data){
        var obj = JSON.parse(JSON.stringify(controller.get("model")));
        obj.appointments.push(data)
        saveModel(App.DayModel.create(obj));

}

App.AppointmentsView = Ember.View.extend({
    didInsertElement: function(){
        var view = this;
        updateHeader(view.get("controller.model.date"))
       
    }
});

App.DayController = Ember.Controller.extend({
    save: function(){
        var model = this.get("model");

        saveModel(model);
    },
    gotoAppointmentsView: function(){
        switchView("appointments")
    }
});

function saveModel(model){
    var data = JSON.parse(JSON.stringify(model));
    var date = model.get("date")
    data.date = getUrlDate(date.getFullYear(), date.getMonth(), date.getDate());
    console.log(data)
    data.mood = data.moodRating;
    data.mood_detail = data.moodDescription;
    console.log(data)
    $.ajax({
        url: window.apiRoot + "editDay",
        type: "post",
        data: data
    })
    var json = JSON.stringify(data);
    //localStorage.setItem(new Date(model.get("date")).toISOString().split("T")[0], json)
}

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
    food: "",
    health: "",
    fatigue: 0,
    concerns: "",
    appointments: []
});

App.AppointmentModel =  Ember.Object.extend({
    date: null,
    name: "",
    details: "",
    notes: ""
});

window.apiRoot = "http://localhost:10098/"

function getUrlDate(year, month, day){
    var dayString = "" + day;
    if (day < 10){
        dayString = "0" + dayString;
    }
    var monthString = "" + month;
    if (month < 10){
        monthString = "0" + monthString;
    }

    return dayString + "/" + monthString + "/" + year;
}


function getDayModel(year, month, day){

    var ajaxRet = null;
    $.ajax({

         url:    window.apiRoot + "viewDay?day=" + getUrlDate(year, month, day),
         success: function(result) {
                      ajaxRet = result;
                  },
         async:   false
    });          
    ajaxRet = (ajaxRet !== "None") ? ajaxRet : "[{}]"

    var data = JSON.parse(ajaxRet)[0]
    data.moodRating = data.mood;
data.date = new Date(year,month, day)
    return App.DayModel.create(data);


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
    page = location.hash.split("/")[1];
    window.location.hash = "/" + page + "/" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    document.location.reload()

}

function updateHeader(date){
    console.log("updating header with", date)
    var html = $("#header-template").html();
    $("#header").html(html);
    date = new Date(date);
    var dateString = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()] + " " + date.getDate() + " " + date.getFullYear()
    $("#header").find("h1").text(dateString);
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


Ember.Handlebars.registerBoundHelper('myHelper', 
    function(value, options) {
        return value.toUpperCase();
    }
);
