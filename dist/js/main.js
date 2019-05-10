var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/extensions") + 1);
var config = {
  host: window.location.hostname,
  prefix: prefix,
  port: window.location.port,
  isSecure: window.location.protocol === "https:"
};


require.config({
  baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
  paths: {
    hubApp: "./js/bundle",
    HubTemplates: "./js/views",
    uiRouter: "https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/1.0.20/angular-ui-router.min"
  }
});


require(["js/qlik"], function (qlik) {
  window.qlik = qlik;
  require(["angular", "uiRouter"], function (angular, uiRouter) {
    angular.bootstrap(document, ["hubApp", "HubTemplates", "qlik-angular"]);
  });
});