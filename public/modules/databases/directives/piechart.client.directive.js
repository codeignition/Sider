'use strict';

angular.module('databases')
.directive('piechart',
           function(){
             var directive = {};
             directive.restrict = 'E';
             directive.scope = {
               info: '=info'
             }
             
            directive.transclude = true;
             //directive.template='<p>here i am {{info}}</p>';
             //console.log(directive.scope.info);
             
             directive.link = function (scope, element, attrs) {
               scope.$watch( function(){
                 var r = Raphael(200,300,800,800);
               // console.log(scope.info);
                 r.piechart(100,100,100,scope.info); //, scope.info.db1.keys]);
               });
             }

             return directive;

           }
          );
