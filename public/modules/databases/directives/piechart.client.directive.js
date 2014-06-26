'use strict';

angular.module('databases')
.directive('piechart',
	function(){
		var directive = {};
		directive.restrict = 'E';
		directive.scope = {
			info: '=info'
		}
		var a=100; 
		directive.link = function (scope, element, attrs) {
			element = Raphael(200,300,800,800);
			scope.$watch( function(){
				element.piechart(100,100,a,scope.info); //, scope.info.db1.keys]);
			});
			scope.$on('$destroy',function(){
				element.remove();
			});	
		}

		return directive;

	}
);
