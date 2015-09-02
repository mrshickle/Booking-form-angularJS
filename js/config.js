app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/form.html'
    }).when('/rates', {
        templateUrl: 'views/rates.html'
    }).when('/info', {
        templateUrl: 'views/info.html'
    }).when('/payment', {
        templateUrl: 'views/payment.html'
    })
        .otherwise({redirectTo: '/'});
}]);

app.config(['pikadayConfigProvider', function(pikaday) {
    pikaday.setConfig({
        format: "MM/DD/YYYY"
    });
}])