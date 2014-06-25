'use strict';

angular.module('databases')
.directive('piechart',
           function(){
             var directive = {};
             directive.restrict = 'E';
             directive.scope = {
               info: "=info"
             };
             directive.transclude = true;
             directive.link = function (scope, element, attrs) {
               scope.$watch( function(){
                 var r = Raphael(10,80,600,500);
                 r.piechart(100,100,100, scope.info); //, scope.info.db1.keys]);
               });
             }

             return directive;

           }
          );
