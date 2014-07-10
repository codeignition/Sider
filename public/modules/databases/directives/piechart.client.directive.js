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
                 var ele = Raphael('pie', 360, 205);
                 entry=false;
                 ele.piechart(100,100,100,infoArray,{ legend:namesArray, legendothers:'Others', maxSlices:10});
                 }
                 scope.$on('$destroy',function(){
                   ele.remove();
                 });
               });
             };
             return directive;
           });
