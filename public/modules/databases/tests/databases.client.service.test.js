'use strict';

(function(){
  describe("Database Service Tests", function(){

    var DatabasesController,
    scope,
    $httpBackend,
    $stateParams,
    $location;

    beforeEach(function() {
      jasmine.addMatchers({
        toEqualData: function(util, customEqualityTesters) {
          return {
            compare: function(actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
      scope = $rootScope.$new();
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;

      DatabasesController = $controller('DatabasesController', {
        $scope: scope
      });

    }));


    var service;

    beforeEach(inject(function(getinfo){
      service = getinfo;
    }));

    describe("getinfo-info()", function(){
      xit("should redirect application to /databases/databaseid/info url", function(Databases){
        var sampleDatabase = new Databases({
          name: 'New DB',
          host: 'New Host',
          port: 'New Port'
        });

        $stateParams.databaseId = '525a8422f6d0f87f0e407a33';

        service.info();
        $httpBackend.flush();

        expect($location.path()).toBe('/databases/'+$stateParams.databaseId+'/info');


      });

      xit("should return server info as json object", function(Databases){

        var sampleDatabase = new Databases({
          name: 'New Database',
          host: 'New Host',
          port: 'New Port'
        });

        var sampleRedisinfoResponse =
          { redis_version: '2.2.12',
            db0: 'keys=1,expires=0',
            db1: 'keys=2,expires=0',
            versions: [ 2, 2, 12 ] };

            $stateParams.databaseId = '525a8422f6d0f87f0e407a33';

            $httpBackend.expectGET('/databases/525a8422f6d0f87f0e407a33/info').respond(sampleRedisinfoResponse);

            service.info();
            $httpBackend.flush();

            expect(scope.redisinfo).toEqualData(sampleRedisinfoResponse);

      });
    });
  });
})();
