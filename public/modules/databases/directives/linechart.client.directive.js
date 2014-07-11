'use strict';

angular.module('databases')
.directive('linechart', [
  function() {
  var directive = {};
  directive.restrict = 'AE';
  directive.scope = {
    mem:'=mem',
    time:'=time',
    xmarking:'=xcord'
  };

  directive.link = function(scope, element, attrs){
    var timeArray;
    var memArray;
    var entry=true;
    scope.$watch( function(){
      var timeArray=scope.time;
      var memArray=scope.mem;
      if(timeArray&&memArray&&entry&&scope.xmarking){
        entry=false;
        var linePaper = Raphael(element[0]);
        linePaper.linechart(50,10,630,300, timeArray, memArray,{axis:'0 0 0 1', symbol: 'circle', smooth:false});
        Raphael.g.axis(60, 300, 610, null, null, timeArray.length-1, 0, scope.xmarking, linePaper);
      };
      scope.$on('$destroy', function(){
        linePaper.remove();
      });
    });
  };
  return directive;
}]);
