'use strict';

angular.module('databases')
.directive('linechart', [
	function() {
    var directive = {};
    directive.restrict = 'E';
    directive.scope = {
      mem:'=mem',
      time:'=time'
    }

    directive.link = function(scope, element, attrs){
      scope.$watch( function(){
        var linePaper = Raphael(500, 500, 1000, 1000);
        linePaper.linechart(100,100,400,400, scope.time, scope.mem,{axis:"0 0 1 1", symbol: "circle", smooth:true});
        scope.$on('$destroy', function(){
          linePaper.remove();
        })
      });
    }
		return directive;
	}
]);
