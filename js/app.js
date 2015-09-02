app = angular.module('AbcForm', ['ngRoute', 'pikaday', 'angular-bootstrap-select', 'angular-bootstrap-select.extra', 'ngMessages']);

app.controller("AbcCtrl", function ($scope, $http, $filter, $location) {

    $scope.moveSizes = [
        {value: '1', label: 'Studio'},
        {value: '2', label: '1 bedroom'},
        {value: '5', label: '2 bedroom'},
        {value: '8', label: '3 bedrooms'},
        {value: '10', label: '4 bedrooms'},
        {value: '11', label: '4+ bedrooms'},
        {value: '3', label: 'Small office'},
        {value: '6', label: 'Medium office'},
        {value: '12', label: 'Large office'},
        {value: '4', label: 'Small storage (5x5, 5x8, 5x10)'},
        {value: '7', label: 'Medium storage (10x10, 10x15)'},
        {value: '9', label: 'Large storage (10x20)'}
    ];

    $scope.onDateFocus = function () {
        if (typeof(movingFromZip) == "undefined") {
            $scope.zipNotSelected = true;
        } else {
            $scope.zipNotSelected = false;
        }
    }

    $scope.onMoveDaySelect = function onMoveDaySelect(pikaday) {

        $http({
            method: 'POST',
            url: 'http://ab.davidm.club/calendar/get_availability',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: serializeData({
                date: $filter('date')(pikaday.getDate(), 'yyyy-MM-dd'),
                zip_or_city: movingFromZip
            })
        }).success(function (data, status, headers, config) {
                if (data.pm_trucks > 0 && data.pm_movers > 1 && data.am_trucks > 0 && data.am_movers > 1) {
                    $scope.dateResult = 0;
                } else {
                    if (data.am_trucks > 0 && data.am_movers > 1) {
                        $scope.dateResult = 1;
                    } else if (data.pm_trucks > 0 && data.pm_movers > 1) {
                        $scope.dateResult = 2;
                    } else {
                        $scope.dateResult = 3;
                    }
                }
            }
        ).error(function (data, status, headers, config) {
                alert('error');
                console.log(headers);
            });

    };

    $scope.getRates = function () {
        requestData =
        {
            'zip_or_city': movingFromZip,
            'date': this.moveDate,
            'bedrooms': this.moveSizeValue
        }

        $scope.moveFrom = this.moveFrom;
        $scope.moveSize = this.moveSizeValue;


        $http({
            method: 'POST',
            url: 'http://ab.davidm.club/get_rates',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: serializeData(requestData)
        }).success(function (data, status, headers, config) {
                console.log(angular.toJson(data));
                $scope.rates = data;
                $location.path('/rates');
            }
        ).error(function (data, status, headers, config) {
                alert('error');
                console.log(headers);
            });
    };

    $scope.pmSwitch = 'am';

    $scope.selectRate = function (selectedDate, selectedTime, selectedPrice, selectedMovers, selectedHours) {
        $location.path('/info');
        $scope.moveDate = selectedDate;
        $scope.moveTime = selectedTime;
        $scope.movePrice = selectedPrice;
        $scope.moveMovers = selectedMovers;
        $scope.moveHours = selectedHours;
    }

    $scope.toCheckout = function () {
        $location.path('/payment');
        $scope.moveFrom2 = this.moveFrom2;
        $scope.moveTo = this.moveTo;
        $scope.moveTo2 = this.moveTo2;
        $scope.firstName = this.firstName;
        $scope.lastName = this.lastName;
        $scope.email = this.email;
        $scope.phone = this.phone;
        $scope.phone2 = this.phone2;
        $scope.notes = this.notes;

    }

    $scope.extraTruck = false;
    $scope.heavyItems = false;


    $scope.submitReservation = function () {


        moveInfo =
        {
            first_name: $scope.firstName,
            last_name: $scope.lastName,
            email: $scope.email,
            phone: $scope.phone,
            phone2: $scope.phone2,
            notes: $scope.notes,
            date_of_move: $scope.moveDate,
            part_of_day: $scope.moveTime,
            bedrooms: $scope.moveSize,
            movers_quantity: $scope.moveMovers,
            price_per_hour: '$' + $scope.movePrice + '/$' + ( $scope.movePrice - 5),
            minimum_hours: $scope.moveHours,
            zip_from: movingFromZip,
            address_from: $scope.moveFrom,
            address2_from: $scope.moveFrom2,
            address_from2: '',
            address2_from2: '',
            address_to: $scope.moveTo,
            address2_to: $scope.moveTo2,
            address_to2: '',
            address2_to2: '',
            ddt: $ddt,
            packing_supplies_price: '',
            fuel: $fuel,
            extra_truck: this.extraTruck,
            heavy_items: this.heavyItems,
            source: this.source,
            card_name: this.cardName,
            card_number: this.cardNumber,
            exp_month: this.cardMonth,
            exp_year: this.cardYear,
            card_cvv: this.cardCvv,
            total_charge: 60,
            card_zip: 90028
        };

        $http({
            method: 'POST',
            url: 'http://ab.davidm.club/submit_reservation',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: serializeData(moveInfo)
        }).success(function (data, status, headers, config) {
                alert('success');
            }
        ).error(function (data, status, headers, config) {
                alert('error');
            });
    };


});


function serializeData(data) {
    // If this is not an object, defer to native stringification.
    if (!angular.isObject(data)) {
        return ( ( data == null ) ? "" : data.toString() );
    }

    var buffer = [];

    // Serialize each key in the object.
    for (var name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }

        var value = data[name];

        buffer.push(
            encodeURIComponent(name) + "=" + encodeURIComponent(( value == null ) ? "" : value)
        );
    }

    // Serialize the buffer and clean it up for transportation.
    var source = buffer.join("&").replace(/%20/g, "+");
    return ( source );
}

var PHONE_REGEXP = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;