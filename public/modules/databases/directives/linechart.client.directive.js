'use strict';

angular.module('databases')
.directive('linechart', [
  function() {
  var directive = {};
  directive.restrict = 'E';
  directive.scope = {
    mem:'=mem',
    time:'=time'
  };

  directive.link = function(scope, element, attrs){
    var timeArray;
    var memArray;
    var entry=true;
    scope.$watch( function(){
      var timeArray=scope.time;
      var memArray=scope.mem;
      if(timeArray&&memArray&&entry){
        entry=false;
        var linePaper = Raphael('line');
        linePaper.linechart(50,10,300,300, timeArray, memArray,{axis:'0 0 1 1', symbol: 'circle', smooth:false});
      };
      scope.$on('$destroy', function(){
        linePaper.remove();
      });
    });
  };
  return directive;
}]);
