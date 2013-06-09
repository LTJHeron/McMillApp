import os, sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from google.appengine.dist import use_library
use_library('django', '1.3')
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import cgi

from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.ext.db import djangoforms
from google.appengine.ext.webapp.util import login_required
import json
import urlparse
import urllib
from datetime import date
#from flask import jsonify
#from Models import *

class Treatment(db.Model):
    name =db.StringProperty()
    details =db.StringProperty()
    notes =db.StringProperty()
    
class Medication(db.Model):
    name = db.StringProperty()
    reason = db.StringProperty()
    instructions = db.StringProperty()
    dosage = db.StringProperty()
    repeat_prescription = db.BooleanProperty()

class Activity(db.Model):
    name = db.StringProperty()
    duration = db.IntegerProperty()
    intensity = db.StringProperty()
    notes = db.StringProperty()
class Day(db.Model):
    date = db.StringProperty()
    fatigue = db.IntegerProperty()
    treatments = db.ReferenceProperty(Treatment)
    mood = db.IntegerProperty()
    mood_detail = db.StringProperty()
    medication = db.ListProperty(db.Key)
    food = db.StringProperty()
    symptoms = db.StringProperty()
    concerns = db.StringProperty()
    activity = db.ReferenceProperty(Activity)
class CalendarEntry(djangoforms.ModelForm):
    class Meta:
        model = Day
        exclude = ['treatments', 'medication']
        
class MakeCalendarEntry(webapp.RequestHandler):
    def get(self):
        self.response.out.write('<html><body>'
                                '<form method="POST" '
                                'action="/editDay">'
                                '<table>')
        self.response.out.write(CalendarEntry())
        self.response.out.write('</table>''<br>'
                                '<input type="submit">'
                                '</form></body></html>')

    def post(self):
        url = self.request.url
        o=urlparse.urlparse(url)
        #dates = urlparse.parse_qs(o.query)['day']
        #cal_date = dates.pop(0)
        data = CalendarEntry(data=self.request.POST)
        if data.is_valid():
            entity =data.save(commit=True)
            #parts = cal_date.split('/')
            #entity.date = cal_date #date(parts[2],parts[1], parts[0])
            #entity.put()
            
        else:
            print "Error:"
  
class ViewCalendarEntry(webapp.RequestHandler):
    def get(self):
        url = self.request.url
        o=urlparse.urlparse(url)
        dates = urlparse.parse_qs(o.query)['day']
        cal_date = dates.pop(0)
        #for key, value in date.iteritems():
        #self.response.out.write("cal: " + cal_date)
        #date = self.request.get('da.y')
        #day = Day.all()
        #q = day.get()
        #self.response.out.write(q.date)
        day = db.GqlQuery("SELECT * FROM Day WHERE date = :1", cal_date)
        query_result = {}
        index =0
        for q in day.run():
            json_out = json.JSONEncoder().encode([dict(fatigue=q.fatigue, mood = q.mood, moodDescription=q.mood_detail, date=q.date, food=q.food, health=q.health, concerns=q.concerns])
            #self.response.out.write(json_out)
            query_result[index] = json_out
            index = index+1
        self.response.out.write(json_out)
        #return self.redirect('view.html?%s'% urllib.urlencode(query_result))
        
class MainPage(webapp.RequestHandler):
    
    
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('A Cancer Diary')


app = webapp.WSGIApplication([('/editDay', MakeCalendarEntry),
                                       ('/viewDay', ViewCalendarEntry),], debug=True)


def main():
    ##application = django.core.handlers.wsgi.WSGIHandler()

  # Run the WSGI CGI handler with that application.
    #util.run_wsgi_app(application)
    run_wsgi_app(app)

if __name__ == "__main__":
    main()
