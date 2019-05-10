angular.module('hubApp', ['angular.filter', 'ngRoute', 'HubTemplates', 'ngFileUpload', 'ngImgCrop'])
.config(function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    
    // PORTOBELLO
    $routeProvider.when('/portobello', {
        controller: 'Home',
        templateUrl: 'pages/home/home.html',
        activetab: "home",
        activeBrand: "portobello"
    });

    $routeProvider.when('/portobello/mashup/:id', {
        controller: 'Mashup',
        templateUrl: 'pages/mashup/mashup.html',
        activetab: "mashup",
        activeBrand: "portobello"
    });
    
    $routeProvider.when('/portobello/support', {
        controller: 'Support',
        templateUrl: 'pages/support/support.html',
        activetab: "support",
        activeBrand: "portobello"
    });

    $routeProvider.when('/portobello/qvf/:id', {
        controller: 'Qvf',
        templateUrl: 'pages/qvf/qvf.html',
        activetab: "qvf",
        reloadOnSearch: false,
        activeBrand: "portobello"
    });

    $routeProvider.when('/portobello/url/:url', {
        controller: 'Url',
        templateUrl: 'pages/url/url.html',
        activetab: "url",
        reloadOnSearch: false,
        activeBrand: "portobello"
    });

    // END PORTOBELLO

    // POINTER
    $routeProvider.when('/pointer', {
        controller: 'Home',
        templateUrl: 'pages/home/home.html',
        activetab: "home",
        activeBrand: "pointer"
    });

    $routeProvider.when('/pointer/mashup/:id', {
        controller: 'Mashup',
        templateUrl: 'pages/mashup/mashup.html',
        activetab: "mashup",
        activeBrand: "pointer"
    });
    
    $routeProvider.when('/pointer/support', {
        controller: 'Support',
        templateUrl: 'pages/support/support.html',
        activetab: "support",
        activeBrand: "pointer"
    });

    $routeProvider.when('/pointer/qvf/:id', {
        controller: 'Qvf',
        templateUrl: 'pages/qvf/qvf.html',
        activetab: "qvf",
        reloadOnSearch: false,
        activeBrand: "pointer"
    });

    $routeProvider.when('/pointer/url/:url', {
        controller: 'Url',
        templateUrl: 'pages/url/url.html',
        activetab: "url",
        reloadOnSearch: false,
        activeBrand: "pointer"
    });
    

    $routeProvider.otherwise({redirectTo: '/portobello'});
    
}).run(['$rootScope', '$http', '$route', function($rootScope, $http){
    
    $rootScope.activityActive = true;
    $rootScope.menuActive = true;
    $rootScope.editPhoto = false;
    $rootScope.searchActive = false;
    $rootScope.isMobile = false;
    $rootScope.activeHref = window.location.hash;
    $rootScope.config = {};
    $rootScope.externalApps = [];

    // PORTOBELLO
    $rootScope.userConfig = {};
    
    qlik.setOnError(function(error) {
        if(error.message == 'Forbidden') {
            return;
        }
        
        switch(error.method) {
            case "OnEngineWebsocketFailed":
                $rootScope.logout();
                break;
            case "OnLicenseAccessDenied":
                // $rootScope.logoutByError();
                break;
            case "OnNoEngineAvailable":
                $rootScope.errorMessage = error.message;
                var element = document.querySelector("#modal-center");
                UIkit.modal(element).show();
                $rootScope.errorHandler(error);
                break;
            case "OnNoDataPrepServiceAvailable":
                $rootScope.errorMessage = error.message;
                var element = document.querySelector("#modal-center");
                UIkit.modal(element).show();
                // $rootScope.errorHandler(error);
                break;
            case "OnDataPrepServiceWebsocketFailed":
                $rootScope.errorHandler(error);
                break;
            case "OnSessionTimedOut":
                $rootScope.logout();
                break;
        }

        if(error.method == 'OnLicenseAccessDenied') {
            $rootScope.hasQlikToken = false;
            return;
        }
        
    },
    function(warning){
        
    });
    
    $rootScope.logoutByError = function () {
        $rootScope.logout();
    }
    
    function windowSize(){
        var w = window.innerWidth;
        if (w < 1024){
            $rootScope.activityActive = false;
            $rootScope.menuActive = false;
            $rootScope.isMobile = true;
        }
    }

    $rootScope.errorHandler = function (error) {
        if (error.refreshButton == true) {
            window.location.reload();
            
        }
    }
    
    $rootScope.inputSearchDown = function(event) {
        if (event.key == "Escape"){
            $rootScope.searchActive = false;
        }
    }
    
    $rootScope.openEdit = function openEdit(){
        $rootScope.editPhoto = true;
    }
    
    $rootScope.closeEdit = function closeEdit(){
        $rootScope.editPhoto = false;
        $rootScope.modalAvatarVisibility = false;
    }

    $http.get("hub.config.json")
    .then(function(response) {
        $rootScope.config = response.data;
        
        if($rootScope.config.activityBar.enabled == false) {
            $rootScope.activityActive = false;
        }
        
        if($rootScope.config.home && $rootScope.config.home.featuredCards) {
            $rootScope.featuredCards = $rootScope.config.home.featuredCards;
        }
        
        if($rootScope.config.support && $rootScope.config.support.enabled) {
            $rootScope.supportActive = true;
        }
    });
    
    windowSize();
    
}]);



angular.module('hubApp').controller('activityBar' , ['$scope', '$rootScope', 'qlikService', function($scope, $rootScope, qlikService){

    $scope.activity = {
        title: 'Ultimas atualizações',
        description: 'Estas atualizações consideram aplicações publicadas, propriedades alteradas e dados recarregados.',
        showUserImg: true,
        orderBy: '-originalModifiedDate',
    }

    $scope.showEmptyMessage = false;
    $scope.emptyMessage = 'Não há atualizações.';
    
    $scope.toggleActivity = function(){
        $rootScope.activityActive = !$rootScope.activityActive;
    }

    $scope.toggleMenu = function(){
        $rootScope.menuActive = !$rootScope.menuActive;
    }

    $rootScope.$watch('apps', function(newApps, oldApps) {
        if(newApps) {
            if(newApps.length > 0) {
                $scope.showEmptyMessage = false;
                qlikService.getLastUpdates().then((updateList) => {
                    $rootScope.updateList = updateList;
                    $rootScope.$apply();
                });
            } else if(newApps.length == 0) {
                $scope.showEmptyMessage = true;
            }
        }
        
    }, true);

}]);
angular.module('hubApp').controller('modal' , ['$scope', '$rootScope', 'qlikService',  function($scope, $window, $rootScope, qlikService){
    
    
    
    
}]);
angular.module('hubApp').controller('UploadCtrl', ['$rootScope', '$scope', 'Upload', function ($rootScope, $scope, Upload) {
    $scope.element = document.querySelector('#modal-avatar');
    $scope.upload = function(dataUrl, name) {
        var file = Upload.dataUrltoBlob(dataUrl, name);
        $rootScope.f = file;
        $rootScope.imageToCrop = file;
        if (file) {
            file.name = 'user-'+$rootScope.user.userId;
            $rootScope.imageLoading = true;
            qlik.callRepository('/qrs/contentlibrary/newhub-img-user/uploadFile?externalpath=user-'+$rootScope.user.userId+'.jpg&overwrite=true', 'POST', file).success(function(image) {					
                $rootScope.user.image = '/content/newhub-img-user/'+image+'?'+new Date().getTime();
                $rootScope.imageLoading = false;
                $rootScope.imageToCrop = null;
                $scope.picFile = null;
                $rootScope.modalAvatarVisibility = false;
            })
        }   
    }
}]);
angular.module('hubApp').controller('navBar' , ['$scope', '$rootScope', 'qlikService', '$http', '$route', '$location', function($scope, $rootScope, qlikService, $http, $route, $location){
    
    var belesma = 1;

    
    // METHODS
    $scope.toggleActivity = function(){
        $rootScope.activityActive = !$rootScope.activityActive;
    }
    
    $scope.toggleMenu = function(){
        $rootScope.menuActive = !$rootScope.menuActive;
    }
    
    $scope.toggleSearchClosed = function toggleSearchClosed() {
        $rootScope.searchActive = false;
    }
    
    $rootScope.logout = function logout() {
        qlikService.logout();
    }
    
    $scope.openModalAvatar = function openModalAvatar() {
        $rootScope.modalAvatarVisibility = true;
    };
    
    $scope.activeHref = window.location.hash;
    var carrito = 0;
    
    $rootScope.navbarClosed = function(){
        $rootScope.menuActive = false;
        
    }
    $rootScope.activityClosed = function(){
        $rootScope.activityActive = false;
    }

    $rootScope.changeContext = function(context){
        $rootScope.brandContext = context;
    }

    $rootScope.clearApps = function() {
        $rootScope.featuredApps = [];
        $rootScope.apps = [];
    }
    
    
    // INIT HUB
    $rootScope.$watch('brandContext', function(newValue, oldValue) {
        $rootScope.appLoaded = false;
        if(newValue != 'undefined' && newValue != oldValue) {
            $rootScope.initHub();
        }
    })

    $rootScope.initHub = function(){
        qlikService.getAuthUser().then(function(user){
            $rootScope.user = user;
            $rootScope.hasQlikToken = true;
            // PORTOBELLO
            $http({
                url: 'https://rest-prd.portobello.com.br/ords/aws/visao/acess_qview_user/'+$rootScope.user.userId,
                method: "GET",
                headers: {'Authorization': 'Basic dmluaWNpdXNnOkdVQXJhcHV2dTIwISE='}
            })
            .then(function(response) {
                $rootScope.brandContext = $route.current.$$route.activeBrand;
                $rootScope.userConfig = response.data.items[0];
                var externalApps = [];
                if(response.data.items.length > 0) {
                    for(var i = 0; i < response.data.items[0].aplicacoes.length; i++) {
                        var application = response.data.items[0].aplicacoes[i];
                        for(var j = 0; j < application.marca_app.length; j++) {
                            if(application.marca_app[j].value.toLowerCase() == $rootScope.brandContext) {
                                externalApps.push(application);
                            }
                        }
                    }
                }
                $rootScope.externalApps = externalApps;
                qlikService.isAuthUser().then(function(res){
                    qlikService.getQlikSenseLicense().then(function(license){
                        qlikService.validateQlikSenseUser(license, user).then(function(res){
                            var aut = res.data.autorizado ? belesma : carrito;
                            if(aut !== belesma) return;
                            qlikService.initApps(true).then((apps) => {
                                if($rootScope.externalApps.length > 0) {
                                    $rootScope.apps = apps.concat($rootScope.externalApps);
                                } else {
                                    $rootScope.apps = apps;
                                }

                                if($rootScope.apps.length == 0) {
                                    $rootScope.appLoaded = true;
                                    $rootScope.$apply();
                                    return;
                                }
                                

                                qlikService.getFeaturedApps().then((apps) => {
                                    let refSenseApps = $rootScope.externalApps.filter((item) => { return item.ref_sense.length > 0 });
                                    for(let i = 0; i < refSenseApps.length; i++) {
                                        for(let j = 0; j < apps.length; j++) {
                                            if(refSenseApps[i].id == apps[j].id) {
                                                apps[j].href = refSenseApps[i].url;
                                            }
                                        }
                                    }                 
                                    console.log($rootScope.externalApps);
                                    console.log($rootScope.apps);
                                    $rootScope.featuredApps = apps;
                                    
                                    for(var i = 0; i < $rootScope.featuredApps.length; i++) {
                                        if(!$rootScope.hasQlikToken) {
                                            $rootScope.featuredApps[i].showDescription = true;
                                            $rootScope.appLoaded = true;
                                            $rootScope.$apply();
                                        } else {
                                            qlikService.getMainKPIs($rootScope.featuredApps[i], i).then(function(res) {
                                                $rootScope.featuredApps[res.appIndex].mainKpis = res.KPIs;
                                                if(res.KPIs.length == 0) {
                                                    $rootScope.featuredApps[res.appIndex].showDescription = true;
                                                } else {
                                                    $rootScope.featuredApps[res.appIndex].showDescription = false;
                                                }
                                                $rootScope.activeHref = window.location.hash;    
                                                let element = document.querySelector('[href="'+$rootScope.activeHref+'"]');
                                                if(element) {
                                                    $rootScope.activeParentMenu = element.parentElement.parentElement.parentElement.getAttribute('group-id');
                                                } 
                                                $rootScope.appLoaded = true;
                                                $rootScope.$apply();
                                            })
                                        }
                                    };
                        
                                })
                            })
                        }, function(){
                            return;
                        })
                    })
                });     
            },
            function(response) { 
                console.log(response);
            });
        });
        
    }

    $rootScope.initHub();
   
}]);
angular.module('hubApp').controller('searchBar' , ['$scope', '$rootScope', function($scope, $rootScope){

    $scope.searchApp = "";

    $scope.toggleSearchOpen = function(){
        if ($scope.searchApp.length >= 3) {
            $rootScope.searchActive = true;
        } else {
            $rootScope.searchActive = false;
        }
    }
    
    $scope.clearField = function(){
        $scope.searchApp = "";
    }
    $scope.toggleSearchClosed = function(){
        $scope.searchApp = "";
        $rootScope.searchActive = false;
    }
}]);
angular.module('hubApp').service('qlikService', ['$http', '$rootScope', function ($http, $rootScope) {
    this.userStreams = null;
    this.apps = [];
    this.loadedKpis = [];

    this.getUserStreams = function getUserStreams() {
        return new Promise((resolve, reject) => {
            if (this.userStreams) {
                resolve(this.userStreams);
            } else {
                this.userStreams = {};
                qlik.callRepository('/qrs/stream/full').success((list) => {
                    for (var i = 0; i < list.length; i++) {
                        var stream = {};
                        stream.name = list[i].name;
                        stream.id = list[i].id;
                        stream.color = '';
                        stream.icon = '';
                        for (var j = 0; j < list[i].customProperties.length; j++) {
                            if (list[i].customProperties[j].definition.name.toUpperCase() == "NHSTREAMCOLOR") {
                                stream.color = list[i].customProperties[j].value;
                            }
                            
                            if (list[i].customProperties[j].definition.name.toUpperCase() == "NHSTREAMICON") {
                                stream.icon = list[i].customProperties[j].value;
                            }
                        }
                        this.userStreams[stream.name] = stream;
                    }
                    
                    resolve(this.userStreams);
                });
            }
        })
    };

    this.getAllApps = function getAllApps() {
        return this.apps;
    };

    this.timeSince = function timeSince(date) {

        var seconds = Math.floor((new Date() - date) / 1000);
      
        var interval = Math.floor(seconds / 31536000);
      
        if (interval > 1) {
          return interval + " anos atrás";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
          return interval + " meses atrás";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
          return interval + " dias atrás";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
          return interval + " horas atrás";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
          return interval + " minutos atrás";
        }
        return Math.floor(seconds) + " segundos atrás";
    };
    
    this.initApps = function initApps(forceRequest){
        return new Promise((resolve,reject) => {
            if(forceRequest) {
                this.apps = [];
            }
            if(this.apps.length > 0) {
                resolve(this.apps);
            }
            this.getUserStreams().then(()=>{
                this.getMashupsFromRoot().then((mashups)=>{
                    this.getQvfs().then((qvfs)=> {
                        var appList = mashups.concat(qvfs);
                        this.apps = appList;
                        resolve(this.apps);
                        console.log("Resolving those apps to the interface", this.apps);
                    })
                })
            })
        });        
    };
    
    // GETTING ALLS MASHUPS
    this.getMashupsFromRoot = function getMashupsFromRoot() {
        let mashupList = {};
        let skipCall = false;
        return new Promise((resolve, reject) => {
            qlik.getExtensionList((extList) => {
                if(skipCall == true) {
                    return;
                }

                skipCall = true;
                for (var i = 0; i < extList.length; i++) {
                    if (extList[i].data.type == 'mashup') {
                        var item = extList[i];
                        mashupList[item.id] = {
                            id: item.id,
                            name: item.data.name,
                            description: item.data.description,
                            author: item.data.author,
                            previewSrc: item.data.src,
                            version: item.data.version
                        };

                    }
                }

                this.filterValidMashups(mashupList).then((filteredMashupList) => {
                    resolve(filteredMashupList);
                })
            });
        })
    };
    
    // FILTERING VALID MASHUPS
    this.filterValidMashups = function filterValidMashups(mashupList) {
        let validMashups = [];
        return new Promise((resolve,reject) => {
            qlik.callRepository('/qrs/extension/full').success((extensionList) => {
                for(var i = 0; i < extensionList.length; i++){
                    var qrsItem = extensionList[i];
                    if(mashupList[qrsItem.name] && qrsItem.customProperties.length > 0){

                        mashupList[qrsItem.name].streamMashup = '';
                        //still neeed to check streams here. (mashups)
                        var foundReference = false;
                        for(var j = 0; j < qrsItem.references.length && !foundReference; j++) {
                            var reference = qrsItem.references[j];
                            if(reference.externalPath.indexOf('.html') != -1) {
                                mashupList[qrsItem.name].href = reference.externalPath;
                                foundReference = true;
                            }
                        }

                        var otherContext = true;

                        for(var j = 0; j < qrsItem.customProperties.length; j++) {
                            switch(qrsItem.customProperties[j].definition.name.toUpperCase()) {
                                case 'NHSTREAMMASHUP':
                                    mashupList[qrsItem.name].streamMashup = qrsItem.customProperties[j].value;
                                    break;
                                case 'NHAPPCOLOR':
                                    mashupList[qrsItem.name].appColor = qrsItem.customProperties[j].value;
                                    break;
                                case 'NHAPPTEXTCOLOR':
                                    mashupList[qrsItem.name].appTextColor = qrsItem.customProperties[j].value;
                                    break;
                                case 'NHFEATURED':
                                    mashupList[qrsItem.name].featuredApp = qrsItem.customProperties[j].value;
                                    break;
                                case 'NHGROUP':
                                    if(qrsItem.customProperties[j].value.indexOf('@') != -1) {
                                        mashupList[qrsItem.name].group = qrsItem.customProperties[j].value.split('@')[0];
                                        var param = qrsItem.customProperties[j].value.split('@')[1];
                                        if(param.split('=')[0] == 'icon') {
                                            mashupList[qrsItem.name].groupIcon = param.split('=')[1];
                                        }
                                    } else {
                                        mashupList[qrsItem.name].group = qrsItem.customProperties[j].value;
                                    }
                                    break;
                                case "NHPORTOBELLOCONTEXT":
                                    if($rootScope.brandContext.toLowerCase() == qrsItem.customProperties[j].value) {
                                        otherContext = false;
                                    };
                                    break;
                            }
                        }


                        if(!this.userStreams[mashupList[qrsItem.name].streamMashup] || !mashupList[qrsItem.name].group || otherContext == true) {
                            continue;
                        }

                        mashupList[qrsItem.name].modifiedDate = this.timeSince(new Date(qrsItem.modifiedDate));
                        mashupList[qrsItem.name].originalModifiedDate = new Date(qrsItem.modifiedDate);
                        mashupList[qrsItem.name].modifiedByUserName = qrsItem.modifiedByUserName;
                        mashupList[qrsItem.name].originalCreatedDate = new Date(qrsItem.createdDate);
                        mashupList[qrsItem.name].createdDate = this.timeSince(new Date(qrsItem.createdDate));
                        mashupList[qrsItem.name].type = 'mashup';                        
                        validMashups.push(mashupList[qrsItem.name]);
                    }
                };
                resolve(validMashups); 
            });
        })
    };
    
    // GETTING ALL QVFS
    this.getQvfs = function getQvfs(){
        var qvfs = [];
        return new Promise((resolve, reject) => {
            qlik.callRepository('/qrs/app/hublist/full').success((qvfList) => {
                for(var i = 0; i < qvfList.length; i++) {
                    var item = qvfList[i];

                    var streamValue = "";
                    if (item.stream && item.stream.name) {
                        streamValue = item.stream.name;
                        if (!this.userStreams[streamValue]) {
                            return;
                        }
                    }

                    var otherContext = true;
                   
                    for(var j = 0; j < item.customProperties.length; j++) {
                        switch(item.customProperties[j].definition.name.toUpperCase()) {
                            case "NHFEATURED":
                                if(item.customProperties[j].definition.name && item.customProperties[j].value == 'true') {
                                    item.featuredApp = true;
                                }
                                break;
                            case "NHGROUP":
                                if(item.customProperties[j].value.indexOf('@') != -1) {
                                    item.group = item.customProperties[j].value.split('@')[0];
                                    var param = item.customProperties[j].value.split('@')[1];
                                    if(param.split('=')[0] == 'icon') {
                                        item.groupIcon = param.split('=')[1];
                                    }
                                } else {
                                    item.group = item.customProperties[j].value;
                                }
                                break;
                            case "NHAPPCOLOR":
                                item.appColor = item.customProperties[j].value;
                                break;
                            case "NHAPPTEXTCOLOR":
                                item.appTextColor = item.customProperties[j].value;
                                break;
                            case "NHPORTOBELLOCONTEXT":
                                if($rootScope.brandContext.toLowerCase() == item.customProperties[j].value) {
                                    otherContext = false;
                                };
                                break;
                        }
                    }


                    if(!item.group || otherContext) {
                        continue;
                    }


                    item.publishTime =  this.timeSince(new Date(item.publishTime));
                    if(item.lastReloadTime == 0) {
                        item.lastReloadTime = 'Never loaded';
                    } else {
                        item.lastReloadTime = this.timeSince(new Date(item.lastReloadTime));
                    }
                    item.href = '#qvf/'+item.id;
                    item.thumbnail = item.thumbnail;
                    item.originalModifiedDate = new Date(item.modifiedDate);
                    item.modifiedDate = this.timeSince(new Date(item.modifiedDate));
                    item.originalCreatedDate = new Date(item.createdDate);
                    item.createdDate = this.timeSince(new Date(item.createdDate));
                    item.type = 'qvf';
                    qvfs.push(item);

                }

                resolve(qvfs);
            });
        })
    };
    
    this.getLastUpdates = function getLastUpdates() {
        return new Promise((resolve,reject) => {
            var tempApps = [];

            for(var i = 0; i < this.apps.length; i++) {
                var currApp = this.apps[i];

                if(!currApp.modifiedByUserName) {
                    continue;
                }

                if(currApp.modifiedByUserName.split('\\')[1] == 'sa_repository') {
                    continue;
                }

                var userImgUrl = '/content/newhub-img-user/user-'+currApp.modifiedByUserName.split('\\')[1]+'.jpg';

                var tempApp = {
                    id: currApp.id,
                    name: currApp.name,
                    href: currApp.href,
                    userModified: currApp.modifiedByUserName.split('\\')[1],
                    modifiedDate: currApp.modifiedDate,
                    originalModifiedDate: currApp.originalModifiedDate,
                    type: currApp.type,
                    userImage: userImgUrl
                }

                if(currApp.type == 'qvf') {
                    tempApp.lastReloadTime = currApp.lastReloadTime;
                    tempApp.publishTime = currApp.publishTime;
                }

                tempApps.push(tempApp);

            }
            
            resolve(tempApps);
        })
    };
    
    this.logout = function logout() {
        $.ajax({
            type: 'DELETE',
            url: 'https://' + config.host + config.prefix + 'qps/user',
            success: function (server_response) {
                window.location = '/';
            }
        })
    };
    
    this.getMainKPIs = function getMainKPIs(app, index) {
        console.log("Trying to get main KPIs");
        var KPIs = [];
        var promiseObj = {};
        this.loadedKpis = [];
        return new Promise((resolve, reject) => {
            if(app.type !== 'qvf') {
                promiseObj = {
                    KPIs: [],
                    appIndex: index
                };
                resolve(promiseObj);
                return;
            }
            var qlikApp = qlik.openApp(app.id, config);
            qlikApp.getAppObjectList('masterobject',  (obj) => {
                console.log(obj);
                if(this.loadedKpis.indexOf(index) != -1) {
                    return;
                } else {
                    this.loadedKpis.push(index);
                }
                this.loadedKpis.push(index);
                var list = obj.qAppObjectList.qItems;
                var objectIds = [];
                for (var i = 0; i < list.length; i++) {
                    var tags = [];
                    if(list[i].qMeta.tags) {
                        var appTags =  list[i].qMeta.tags;
                        for(var j = 0; j < appTags.length; j++) {
                            tags.push(appTags[j].toUpperCase());
                        }
                        if (tags && tags.indexOf('NHOBJECT') != -1) {
                            objectIds.push(list[i].qInfo.qId);
                        }
                    } else {
                        continue;
                    }
                }

                if(objectIds.length == 0) {
                    qlikApp.close();
                    promiseObj = {
                        KPIs: [],
                        appIndex: index
                    };
                    resolve(promiseObj);
                    return;
                }
                
                for (var i = 0; i < objectIds.length; i++) {
                    qlikApp.visualization.get(objectIds[i]).then( (obj) => {
                        console.log(obj);
                        if (obj.model.layout.visualization != 'kpi') {
                            console.log(obj.model.layout);
                        } else {
                            var mainKpi = {
                                title: obj.model.layout.qMeta.title,
                                value: obj.model.layout.qHyperCube.qDataPages["0"].qMatrix["0"]["0"].qText
                            }
    
                            KPIs.push(mainKpi);
                            
                            if (i == objectIds.length) {
                                qlikApp.close();
                                promiseObj = {
                                    KPIs: KPIs,
                                    appIndex: index
                                };
                                resolve(promiseObj);
                            }
                        }
                        
                    });

                }
    
            });
        })
       
    };
    
    this.getFeaturedApps = function getFeaturedApps() {
        return new Promise((resolve, reject) => {
            this.getFeaturedMashups().then((mashups) => {
                this.getFeaturedQvfs().then((qvfs) => {
                    resolve(this.apps);
                })
            })
        });
    };
    
    this.getFeaturedQvfs = function getFeaturedQvfs() {
        return new Promise((resolve, reject) => {
            resolve(this.apps);
        });
    };
    
    this.getFeaturedMashups = function getFeaturedMashups() {
        return new Promise((resolve, reject) => {
            resolve(this.apps);
        });
    };
    
    this.getUser = function getUser() {
        $.ajax({
            type: 'GET',
            url: '/qps/user',
            success: function (server_response) {
                var user = server_response;
                user.image = 'https://' + config.host + config.prefix + 'content/newhub-img-user/user-' + user.userId + '.jpg';
                return user;
            }
        });
    };

    this.getQlikSenseLicense = function(){
        return new Promise(function(resolve, reject) {
            qlik.callRepository('/qrs/engineservice/local').success(function(license) {
                resolve(license);
            });

        });
    };

    this.registerQlikSenseSite = function(license) {
        var data = {
            "nome": license.id,
        }
        return new Promise(function(resolve, reject) {
            $.ajax({
                type: 'POST',
                data: data,
                url: 'https://api-cluster-be.herokuapp.com/empresa',
                success: function (server_response) {
                    resolve(server_response);
                }
            });
        })
    };

    this.getAlocadorUrl = function getAlocadorUrl(url) {
        return new Promise((resolve, reject) => {

            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(this);
            }
            xhr.open("GET", url);
            xhr.responseType = "json";
            xhr.send();
            // $http({
            //     url: url,
            //     method: "GET"
            // })
            // .then(function(response) {
            //     resolve(response);
            // },
            // function(response) {
            //     reject(response);
            // });
        })
    }

    this.validateQlikSenseUser = function(license, user){
        return new Promise(function(resolve, reject) {
            resolve({ data : {autorizado: true} });
            // TODO: Comentado Carlos
            // var organizationHost = license.serverNodeConfiguration.hostName;
            // var data = {
            //     "qlik_user_id": user.userId,
            //     "empresa_nome": organizationHost,
            //     "empresa_qlik_token": license.id
            // };

            // var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
            // var theUrl = "https://api-cluster-be.herokuapp.com/valida-usuario/";
            // xmlhttp.open("POST", theUrl);
            // xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            // xmlhttp.onload  = function() {
            //     var jsonResponse = {
            //         data: JSON.parse(this.response)
            //     };
            //     if(!jsonResponse.data.autorizado) {
            //         document.body.innerHTML = 'User could not be verified.<br> Please contact the system administrator.';
            //         document.body.classList.add('noaccess');
            //         reject(jsonResponse);
            //     } else {
            //         resolve(jsonResponse);
            //     }
            // };

            // xmlhttp.onerror  = function() {
            //     var jsonResponse = JSON.parse(this.response);
            //     document.body.innerHTML = 'NewHub is under maintenance. Please contact your system administration for more information.';
            //     document.body.classList.add('noaccess');
            //     resolve(jsonResponse);
            // };
            // xmlhttp.send(JSON.stringify(data));
            // TODO: Comentado Carlos

            // $http({
            //     url: 'https://api-cluster-be.herokuapp.com/valida-usuario/',
            //     method: "POST",
            //     data: data
            // })
            // .then(function(response) {
            //     if(!response.data.autorizado) {
            //         document.body.innerHTML = 'User could not be verified.<br> Please contact the system administrator.';
            //         document.body.classList.add('noaccess');
            //         reject(response);
            //     } else {
            //         resolve(response);
            //     }
            // },
            // function(response) {
            //     document.body.innerHTML = 'NewHub is under maintenance. Please contact your system administration for more information.';
            //     document.body.classList.add('noaccess');
            //     resolve(res);
            // })
        })
    };

    this.isAuthUser = function(){
        return new Promise(function (resolve) {
            var global = qlik.getGlobal(config);
            resolve();
            // global.getAuthenticatedUser().then((res) => {
            //     resolve(res);
            // },
            // (res) => {
            //     resolve(res);
            // })
        });
    }

    this.getAuthUser = function getAuthUser() {
        return new Promise((resolve) => {
            $.ajax({
                type: 'GET',
                url: '/qps/user',
                success: function (server_response) {
                    var user = server_response;
                    user.image = 'https://' + config.host + config.prefix + 'content/newhub-img-user/user-' + user.userId + '.jpg';
                    resolve(user);
                }
            });
        });
    };
}]);
angular.module('hubApp').controller('Home' , ['$scope', '$rootScope', 'qlikService', '$route', function($scope, $rootScope, qlikService, $route){
    $rootScope.activeHref = window.location.hash;
    $rootScope.activeParentMenu = $rootScope.activeHref;
    $rootScope.searchActive = false;

    if($route.current.$$route.activeBrand != $rootScope.brandContext) {
        $rootScope.brandContext = $route.current.$$route.activeBrand;
    }
    
    // $scope.featuredApps = [];
    $scope.orderList = null;
    $scope.orderBtn = "Ordenar por";
    $scope.emptyMessage = 'Nenhuma aplicação marcada como "Featured"';
    $scope.showEmptyMessage = false;

    $scope.orderBy = function (order){
        $scope.orderList = order;
        switch ($scope.orderList) {
            case "name":
                $scope.orderBtn = "A - Z";
              break;
            case "stream":
                $scope.orderBtn = "Nome da stream";
              break;
            case "publish":
                $scope.orderBtn = "Mais antigos primeiro";
              break;
            case "lastReload":
                $scope.orderBtn = "Últimos carregados";
              break;
        }
    }


    $rootScope.appListener = $rootScope.$watch('apps', function(newApps, oldApps) {
        if(newApps) {
            if(newApps.length > 0) {
                $scope.showEmptyMessage = false;
            } else if(newApps.length == 0) {
                $scope.showEmptyMessage = true;
            }    
        }
    })

}]);
angular.module('hubApp').controller("Mashup" , ['$scope', '$routeParams','$rootScope', function ( $scope, $routeParams, $rootScope ){
    let iframe = document.querySelector('iframe');

    
    $rootScope.searchActive = false;
    $scope.iframeLoaded = false;
    $rootScope.activityActive = false;
    $rootScope.menuActive = false;
    $scope.appId = $routeParams.id;
    
    $rootScope.$watch('apps', function(newApps, oldApps) {
        if(newApps && newApps.length > 0) {
            $rootScope.activeHref = window.location.hash;
            $scope.baseUrl = window.location.origin+"/extensions/" + $scope.appId + '/app.html';
            iframe.src = $scope.baseUrl;

            let element = document.querySelector('[href="'+$rootScope.activeHref+'"]');
            if(element) {
                $rootScope.activeParentMenu = element.parentElement.parentElement.parentElement.getAttribute('group-id');
            }  

            iframe.addEventListener("load", function() {
                $scope.iframeLoaded = true;
                $scope.$apply();
            });
        }

    })

}]);
angular.module('hubApp').controller("Qvf" , ['$scope', '$routeParams','$rootScope', function ( $scope, $routeParams, $rootScope ){
    let iframe = document.querySelector('iframe');
    
    $rootScope.activeHref = window.location.hash;
    $rootScope.searchActive = false;
    $scope.iframeLoaded = false;
    $rootScope.activityActive = false;
    $rootScope.menuActive = false;

    $scope.baseUrl = window.location.origin+"/sense/app/";
    $scope.appId = $routeParams.id;
    iframe.src = $scope.baseUrl + $scope.appId;

    let element = document.querySelector('[href="'+$rootScope.activeHref+'"]');
    if(element) {
        $rootScope.activeParentMenu = element.parentElement.parentElement.parentElement.getAttribute('group-id'); 
    }

    iframe.addEventListener("load", function() {
        $scope.iframeLoaded = true;
        $scope.$apply();
    });
}]);
angular.module('hubApp').controller("Support" , ['$scope', '$rootScope', function ( $scope, $rootScope){
    $rootScope.activeHref = window.location.hash;
    $rootScope.activeParentMenu = $rootScope.activeHref; 
    $rootScope.searchActive = false;
}]);
angular.module('hubApp').controller("Url" , ['$scope', '$routeParams','$rootScope', '$http', 'qlikService', function ( $scope, $routeParams, $rootScope, $http, qlikService ){
    

    $rootScope.$watch('apps', function(newApps, oldApps) {
        if(newApps && newApps.length > 0) {
            let iframe = document.querySelector('iframe');
            
            $rootScope.activeHref = window.location.hash;
            $rootScope.searchActive = false;
            $scope.iframeLoaded = false;
            $rootScope.activityActive = false;
            $rootScope.menuActive = false;
            
            let element = document.querySelector('[href="'+$rootScope.activeHref+'"]');
            if(element) {
                $rootScope.activeParentMenu = element.parentElement.parentElement.parentElement.getAttribute('group-id'); 
            }

            //alocador
            var url = element.getAttribute('app-url');
            // iframe.src = url;

            qlikService.getAlocadorUrl(url).then(function(res){
                // console.log(res.response.d.Url);
                iframe.src = res.response.d.Url;
            });

            iframe.addEventListener("load", function() {
                $scope.iframeLoaded = true;
                $scope.$apply();
            });
        }

    })

}]);