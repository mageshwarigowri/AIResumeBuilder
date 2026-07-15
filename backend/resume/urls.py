from django.urls import path
from .views import generate_resume, health
urlpatterns = [path("health/",health),path("generate/",generate_resume)]
