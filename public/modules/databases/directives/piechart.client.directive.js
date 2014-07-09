'use strict';

angular.module('databases')
.directive('piechart',
           function(){
             var directive = {};
             directive.restrict = 'E';
             directive.scope = {
               info: '=info',
               names:'=names'
             };
             directive.link = function (scope, element, attrs) {
               var infoArray = scope.info;
               var namesArray = scope.names;
               var entry = true;
               scope.$watch( function(){
                 if(infoArray.length && namesArray.length && entry ){
                 var ele = Raphael('pie');
                 entry=false;
                 ele.piechart(100,100,100,infoArray,{ legend:namesArray});
                 }
                 scope.$on('$destroy',function(){
                   ele.remove();
                 });
               });
             };
             return directive;
           });
