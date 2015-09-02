app.factory('citiesList', function ($http) {
    return {
        getCities: function () {
            return $http({
                url: 'http://ab.davidm.club/get_cities',
                method: 'GET'
            })
        }
    }
});

app.directive('googleplace', function (citiesList) {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '='
        },
        link: function (scope, element, attrs, model) {
            //scope.details = false;
            var options = {
                types: ['address'],
                componentRestrictions: {country: "us"}
            };
            gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(gPlace, 'place_changed', function () {

                addressDetails = gPlace.getPlace();

                for (var i = 0; i < addressDetails.address_components.length; i++) {
                    var addressType = addressDetails.address_components[i].types[0];

                    if (addressType == 'postal_code') {
                        movingFromZip = addressDetails.address_components[i].short_name;

                        citiesList.getCities().success(function (data) {
                            scope.details = true;
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].zip == movingFromZip) {
                                    scope.details = false;
                                }
                            }
                        });

                    }
                    if (addressType == 'administrative_area_level_1') {
                        movingFromState = addressDetails.address_components[i].short_name;
                    }
                }

                movingFromAddress = addressDetails.formatted_address;

                scope.$apply(
                    function () {
                        zipNotSelected = false;
                        model.$setViewValue(element.val());
                    }
                );
            });
        }
    };
});

app.directive('googleplace2', function () {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '='
        },
        controllerAs: 'AbcCtrl',
        link: function (scope, element, attrs, model) {
            //scope.details = false;
            var options = {
                types: ['address'],
                componentRestrictions: {country: "us"}
            };
            gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(gPlace, 'place_changed', function () {

                addressDetails = gPlace.getPlace();

                var request = {
                    origin: movingFromAddress,
                    destination: addressDetails.formatted_address,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        $distance = 0;
                        //directionsDisplay.setDirections(response);
                        $responcee = response;
                        for (var i = 0; i < response.routes[0].legs.length; i++) {
                            $miles = response.routes[0].legs[0].distance.value;
                            $distance += $miles;
                        }
                        $distanceTotal = $distance / 1609.34;
                        $distanceTotal = $distanceTotal.toFixed(1);
                        //$('.distanceTotal').fadeIn().find('span').text($distanceTotal + ' miles');
                        $fuel = 0;
                        if (movingFromState == 'OR') {
                            $ddt = 0;
                            if ($distanceTotal < 30) {
                                $fuel = 45;
                            } else if (30 <= $distanceTotal < 60) {
                                $fuel = 90;
                            } else if (60 <= $distanceTotal < 90) {
                                $fuel = 135;
                            } else if (90 <= $distanceTotal) {
                                $fuel = 180;
                            }
                        } else {
                            if ($distanceTotal >= 15) {
                                $ddt = 1;
                            } else {
                                $ddt = 0;
                            }
                        }
                    }
                });

                scope.$apply(
                    function () {
                        model.$setViewValue(element.val());
                    }
                );
            });
        }
    };
});

app.directive('phone', function() {
    return {
        restrice: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            angular.element(element).bind('blur', function() {
                var value = this.value;
                if(PHONE_REGEXP.test(value)) {
                    // Valid input
                    console.log("valid phone number");
                    angular.element(this).next().next().css('display','none');
                } else {
                    // Invalid input
                    console.log("invalid phone number");
                    angular.element(this).next().next().css('display','block');
                    /*
                     Looks like at this point ctrl is not available,
                     so I can't user the following method to display the error node:
                     ctrl.$setValidity('currencyField', false);
                     */
                }
            });
        }
    }
});

directionsService = new google.maps.DirectionsService();
