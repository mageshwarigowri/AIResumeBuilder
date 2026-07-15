from django.contrib import admin
from django.urls import include, path, re_path
from resume.views import frontend
urlpatterns = [path("admin/",admin.site.urls),path("api/",include("resume.urls")),re_path(r"^(?!api/|admin/|static/).*$",frontend)]
