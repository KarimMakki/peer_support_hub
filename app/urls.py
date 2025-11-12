from django.urls import path
from . import views

urlpatterns = [
    path('', views.learners_directory, name='learners-directory'),
    path('api/give-kudos/', views.give_kudos, name='give-kudos'),
    path('resources/', views.resources_directory, name='resources-directory'),
]