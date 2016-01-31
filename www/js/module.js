/* global angular, document, window */
'use strict';

var app = angular.module('starter.controllers', ['angularMoment', 'ngCordova']);

// Angular directive for searcfield submission
app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});