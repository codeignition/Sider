'use strict';

angular.module('databases')
.directive('piechart',
	function(){
		var directive = {};
		directive.restrict = 'E';
		directive.scope = {
			info: '=info',
      names:'=names'
		}
		var a=100;
		directive.link = function (scope, element, attrs) {
      console.log(scope.info);
      //x=x/2;
			scope.$watch( function(){
      var x = element.children(0)[0].clientWidth;
      var ele = Raphael(x/2,x/2,2*x,2*x);
				ele.piechart(x/4,x/4,x/4,scope.info,{ legend:scope.names}); //, scope.info.db1.keys]);
			});
			scope.$on('$destroy',function(){
				ele.remove();
			});
		}

		return directive;

	}
);
