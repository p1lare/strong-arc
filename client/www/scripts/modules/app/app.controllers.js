// Copyright StrongLoop 2014
app.controller('StudioController', [
  '$scope',
  '$state',
  '$http',
  'IAService',
  'DatasourceService',
  'ExplorerService',
  '$location',
  '$timeout',
  'ModelService',
  'DiscoveryService',
  function($scope, $state, $http, IAService, DatasourceService, ExplorerService, $location, $timeout, ModelService, DiscoveryService) {

    /*
     *
     * Base Instance Collections
     *
     * */
    $scope.mainNavDatasources = []; // initialized further down
    $scope.mainNavModels = [];  // initialized further down
    $scope.instanceType = 'model';
    /*
    *
    * Transient Data
    *
    * */
    // new
    /*
    *
    * list of open instances (models/datasources)
    * collection of light-weight objects to keep UI context
    * - name
    * - type
    * - ?
    *
    * needs full IAService implementation (CRUD / utilities)
    * aim to replace currentOpenModelNames and currentOpenDatasourceNames
    *
    * */
    $scope.openInstanceRefs = IAService.getOpenInstanceRefs();

    // legacy
    $scope.currentOpenDatasourceNames = IAService.getOpenDatasourceNames();
    $scope.currentSelectedCollection = IAService.clearInstanceSelections();
    $scope.latestExplorerEndPointResponses = []; // array of named responses for explorer endpoints to hold latest server responses
    $scope.explorerViewXPos = IAService.getExplorerViewXPos();  // for when the user controls it
    //$scope.editorViewXPos = IAService.getEditorViewXPos();
    /*
    *
    * Dirty Flags
    *
    * */
    $scope.apiModelsChanged = false;  // dirty flag
    $scope.activeModelPropertiesChanged = false;  // dirty flag
    $scope.explorerDataModelChanged = false; // dirty toggle for triggering renders on the react components

    /*
    *
    * MAIN UI STATE
    *
    *
    * this is where the surgery needs to be most deep
    *
    * merge the notion of an active datasource instance and an active
    *
    * */
    // new
    // temporarily assign to model for dev work
    $scope.activeInstance = IAService.getActiveInstance();  // TODO

    // legacy
    $scope.previewInstance = IAService.clearPreviewInstance();


    /*
    *
    *
    *
    *
    * MODEL and DATASOURCE collections
    *
    *
    *
    *
    *
    * */
    var loadModels = function() {
      $scope.mainNavModels = ModelService.getAllModels();
      $scope.mainNavModels.
        then(function (result) {



          $scope.mainNavModels = result;
          $scope.apiModelsChanged = !$scope.apiModelsChanged;
        }
      );
    };
    loadModels();

    /*
     *
     *
     * Datasources
     *
     *
     * */
    //$scope.mainNavDatasources = [];
    $scope.mainNavDatasources = DatasourceService.getAllDatasources();
    $scope.mainNavDatasources.$promise.
      then(function (result) {

        var core = result[0];

        var log = [];
        var datasources = [];
        angular.forEach(core, function(value, key){
          //this.push(key + ': ' + value);
          datasources.push({name:key,children:value});
        }, log);
        $scope.mainNavDatasources = datasources;


      });
    /*
    *
    * API Explorer View
    *
    * */
    $scope.explorerResources = ExplorerService.getEResources().then(function(result) {
      $scope.explorerResources = result;
    });


    /*
    *
    * METHODS
    *
    * */
    $scope.selectModel = function(name) {
      $scope.currentModelSelections = IAService.addToCurrentModelSelections(name);
    };
    $scope.selectDatasource = function(name) {
      $scope.currentModelSelections = IAService.addToCurrentModelSelections(name);
    };
    $scope.clearSelectedInstances = function() {
      $scope.instanceSelections = IAService.clearInstanceSelections();
    };
    $scope.clearSelectedDatasources = function() {
      $scope.currentDatasourceSelections = IAService.clearSelectedDatasourceNames();
    };
    $scope.setApiModelsDirty = function() {
      $scope.apiModelsChanged = !$scope.apiModelsChanged;
    };


    // new schema event
    $scope.$on('newSchemaModelsEvent', function(event, message){
      $scope.openInstanceRefs = IAService.getOpenInstanceRefs();
      $scope.activeInstance = IAService.getActiveInstance();

      // note that the handler is passed the problem domain parameters
      loadModels();
      $scope.setApiModelsDirty();
      IAService.showInstanceView();

    });
    // toggle instance view
    $scope.toggleInstanceContainer = function() {
      IAService.toggleInstanceView();
    };

    /*
     *
     *  NAV CLICK EVENTS
     *
     *
     *
     *    DOUBLE CLICK
     *
     *
     *   An item has been double clicked.
     *
     *   - clear any preview
     *   - add item to currently active instances
     *   - set item as the currently active instance
     *
     * */
    $scope.navTreeItemDblClicked = function(type, target) {
      console.log('dbl clicked!!: ' + target);
    //  jQuery('[data-id="CanvasApiContainer"]').transition({ x: 1000 });
      switch(type) {

        case 'model':

//          $scope.activeInstance = IAService.setActiveInstance(target, 'model');
          $scope.activeInstance = IAService.activateInstanceByName(target, 'model');

          $scope.currentOpenModelNames = IAService.getOpenModelNames();
          $scope.clearSelectedInstances();
          $scope.instanceType = 'model';

          break;

        case 'datasource':
          //$scope.activeDatasourceInstance = IAService.setActiveInstance(target, 'datasource');
          $scope.activeInstance = IAService.activateInstanceByName(target, 'datasource');

          $scope.currentOpenDatasourceNames = IAService.getOpenDatasourceNames();
          $scope.clearSelectedInstances();
          $scope.instanceType = 'datasource';

          break;
        default:

      }

      IAService.showInstanceView();
    };

    /*
     * branch clicked
     * */
    $scope.navTreeBranchClicked = function(type) {
      console.log('Tree Branch Clicked');
      // change the z-index on the main content to bring the
      // canvas to the fore
      // get reference to the following:
      /*
       [data-id="ModelEditorMainContainer"]
       [data-id="CanvasApiContainer"]
       [data-id="PreviewInstanceContainer"]
       *
       * */
      IAService.showCanvasView();



      $scope.clearSelectedInstances();

    };

    /*

    SINGLE CLICK



     an element on the nav tree has been single left clicked
     could be:
     - the app root
     -- show the 'canvas' view
     - a 'branch' (datasources or models)
     -- show filtered canvas view
     - a 'node' - conceptually a leaf in v1 but could become branch or leaf in future
     -- show instance property editor view

     control key may be pressed or not
     -- if pressed, add to current selection collection
     -- if not then clear current selected collection

     */
    $scope.navTreeItemClicked = function(type, targetName, multiSelect) {

      switch (type){

        case 'model':
          /*
           * cases:
           * - item is not open: open preview view of item
           * - item is open and active: do nothing
           * - item is open but not active: activate item
           *
           * */

          //jQuery('[data-id="CanvasApiContainer"]').transition({ x: 1000 });
          var openModelNames = IAService.getOpenModelNames();
          var targetModel = ModelService.getModelByName(targetName);

          // check for preview mode

          if (openModelNames && (openModelNames.indexOf(targetName) === -1)) {
            // mode is not open so preview it
            $scope.previewInstance = targetModel;
            $scope.previewInstance.type = 'model';
            $scope.instanceType = 'model';

          }
          else {
            // model is open
            // make sure it isn't currently active
            if ($scope.activeInstance.name !== targetName) {
              $scope.activeInstance = IAService.activateInstanceByName(targetName, 'model');
              $scope.activeInstance.type = 'model';
              $scope.instanceType = 'model';
              $scope.clearSelectedInstances();
            }
            else {
              // active model instance was clicked
              // if the model editor view is open > close it
              IAService.showInstanceView();
              // if the model editor view is closed > open it
            }


          }


          break;
        case 'datasource':
          //$scope.previewInstance = DatasourceService.getDatasourceByName(target);
          /*
           * cases:
           * - item is not open: open preview view of item
           * - item is open and active: do nothing
           * - item is open but not active: activate item
           *
           * */

          var openDatasourceNames = IAService.getOpenDatasourceNames();
          var targetDS = DatasourceService.getDatasourceByName(targetName);

          // check for preview mode

          if (openDatasourceNames && (openDatasourceNames.indexOf(targetName) === -1)) {
            // mode is not open so preview it
            $scope.previewInstance = targetDS;
            $scope.previewInstance.type = 'datasource';

          }
          else {
            // ds is open
            // make sure it isn't currently active
            if ($scope.activeInstance.name !== targetName) {
              $scope.activeInstance = IAService.activateInstanceByName(targetName, 'datasource');
              $scope.activeInstance.type = 'datasource';
              $scope.instanceType = 'datasource';
              $scope.clearSelectedInstances();
            }
            else {
              // active model instance was clicked
              // if the model editor view is open > close it
              IAService.showInstanceView();
              // if the model editor view is closed > open it
            }


          }

          break;

        default:


      }


      // control key is pressed
      if (multiSelect) {
        $scope.currentSelectedCollection.push($scope.previewInstance);
      }
      else{
        // in preview mode load up the instance in case
        // the user gives it focus (wants to edit it)
        $scope.currentSelectedCollection = [$scope.previewInstance];
      }

    };
























    /*
    *
    * CONTENT EDIT TABS CLICK EVENTS
    *
    * */
    $scope.instanceTabItemClicked = function(name) {
      var openInstanceRefs = IAService.getOpenInstanceRefs();
      // defensive check to make sure the component is initialized
      if (openInstanceRefs && openInstanceRefs.length > 0){
        // only if the model isn't currently active
        $scope.activeInstance = IAService.activateInstanceByName(name);
        $scope.instanceType = $scope.activeInstance.type;
      }
      $scope.clearSelectedInstances();
    };

    $scope.instanceTabItemCloseClicked = function(name) {

      $scope.openInstanceRefs = IAService.closeInstanceByName(name);
      // reset the active instance and reset tabs and nav
      if ($scope.activeInstance.name === name) {
        if ($scope.openInstanceRefs.length === 0) {
          $scope.activeInstance = {};
        }
        else {

          // active the first instance by default
          $scope.activeInstance = IAService.activateInstanceByName($scope.openInstanceRefs[0].name);
          $scope.activeInstance = IAService.activateInstanceByName($scope.openInstanceRefs[0].name);
        }
      }
      $scope.clearSelectedInstances();
    };






    /*
     *
     * get the list of current active instances
     *
     * check for a current active instance
     *
     * render instance editor view
     *
     * */
    $scope.openInstances = function() {

    };
    $scope.openSelectedModels = function() {
      var selectedModels = IAService.getCurrentInstanceSelections();
      if (selectedModels) {
        for (var i = 0; i < selectedModels.length;i++) {
          $scope.activeInstance = IAService.activateInstanceByName(selectedModels[i]);

        }
        $scope.currentOpenModelNames = IAService.getOpenModelNames();

        //jQuery('[data-id="CanvasApiContainer"]').transition({ x: 1000 });
        $scope.clearSelectedInstances();
      }
    };


    function getRandomNumber() {
      return Math.floor((Math.random() * 100) + 1);
    }


    $scope.createModelViewRequest = function() {

      $scope.activeInstance = ModelService.createNewModelInstance();

      $scope.clearSelectedInstances();
      IAService.showInstanceView();
    };



    /*
    *
    *   New Model Name Input Processing
    *
    * */
    $scope.processModelNameInput = function(input) {
      $scope.newModelInstance = {};
      $scope.newModelInstance.name = input;
      var modelCount = $scope.mainNavModels.length;
      $scope.newModelInstance.isUnique = true;
      for (var i = 0;i < modelCount;i++) {
        var modelInstance = $scope.mainNavModels[i];
        var compString = modelInstance.name.substr(0, input.length);
        if (compString === input) {
          $scope.newModelInstance.isUnique = false;
          break;
        }
      }

    };




    /*
    *
    * Datasouce discovery flow kickoff
    *
    * */
    $scope.createModelsFromDS = function(name) {

      // open a modal window and trigger the discovery flow
      var modalConfig = DiscoveryService.getDiscoveryModalConfig(name);
      var modalInstance = IAService.openModal(modalConfig);
      modalInstance.opened.then(function() {
        window.setUI();
      });

    };

    /*
    *
    * Update Model Detail Property Value
    *
    * */
    $scope.updateModelDetailProperty = function(name, value) {
      if (name && value) {
        $scope.activeInstance[name] = value;
        if (name === 'name') {
          $scope.activeInstance['plural'] = value + 's';
        }
        ModelService.updateModelInstance($scope.activeInstance);
        $scope.activeInstance = IAService.activateInstanceByName($scope.activeInstance.name);
      }
    };
    $scope.createNewProperty = function() {
      console.log('create new property');
      var xModel = $scope.activeInstance;
      if (!xModel.properties){
        xModel.properties = [];
      }
      xModel.properties.push({name:'property-name', props: { type:'string'}});

      xModel.type = 'model';
      $scope.activeInstance = xModel;



      $scope.activeModelPropertiesChanged = !$scope.activeModelPropertiesChanged;
    };




    $scope.showExplorerViewRequest = function() {
      IAService.showExplorerView();
    };


    function isPayloadTypeRequest(rObj) {
      if ((rObj.method === 'POST') || (rObj.method === 'PUT')) {
        return true;
      }
      return false;
    }


    // TODO - refactor this into a service
    $scope.explorerApiRequest = function(requestObj) {
      console.log('explorer api request:  ' + JSON.stringify(requestObj));
      var config = {
        method: requestObj.method,
        url: '/api' + requestObj.path
      };
      if (requestObj.path.indexOf('{id}') !== -1) {

        if (requestObj.data.id) {

          config.url = '/api' + requestObj.path.replace('{id}', requestObj.data.id);
        }

      }
      if (isPayloadTypeRequest(requestObj)) {
        config.data = requestObj.data;
      }



      $http(config).
        success( function(response) {
          $scope.latestExplorerEndPointResponses[requestObj.endPoint] = response;
          $scope.explorerDataModelChanged = !$scope.explorerDataModelChanged;
        }).
        error(function(response) {
          $scope.latestExplorerEndPointResponses[requestObj.endPoint] = response;
          $scope.explorerDataModelChanged = !$scope.explorerDataModelChanged;
        });
    };


  }
]);


app.controller('HomeMainController',[
  '$scope',
  '$location',
  'ComponentDefinition',
  function($scope, $location, ComponentDefinition){
    var viewModel = {};
    viewModel.message = 'StrongLoop API Studio';
    $scope.viewModel = viewModel;

    $scope.wsComps = ComponentDefinition.query({});
    $scope.wsComps.$promise.
      then(function(result) {

          console.log('Component DEFINITION GET WORKED: ' + JSON.stringify(result) );
        $scope.wsComps = result;
        var x = $scope.wsComps;
      }
    );


  }
]);
/*
*
* */
app.controller('GlobalNavController',[
  '$scope',
  'ProfileService',
  '$location',
  function($scope, ProfileService, $location) {
    $scope.isAuthUser = function(){
      return ProfileService.getCurrentUserId();
    };
  }
]);
/*
*
* Need to confirm if this is used in the canvas view
*
* */
app.controller('DragDropCtrl', function($scope) {
  $scope.handleDrop = function() {
    console.log('Item has been dropped');
  }
});

