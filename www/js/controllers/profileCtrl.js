var app = angular.module('starter.controllers');

app.controller('ProfileCtrl', function($scope, DBService) {
  $scope.chartAmount = {
    options: {
      chart: {
        type: 'column'
      },
      xAxis: {
        categories: ["Mån","Tis","Ons","Tors","Fre","Lör","Sön"],
        title: {
          text: ''
        },
        labels: {
          rotation: 0,
          style: {
            fontSize: '12px',
          }
        }
      },

      yAxis: {
        min: 0,
        title: {
          text: 'Antal varor',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      colors: [
        '#ED1176',
        '#87E752'
      ],
    },
    // series: [{
    //   name: 'Download',
    //   data: [50,60,0,50,60,70,20],
    // },{
    //   name: 'Upload',
    //   data: [40,30,60,50,60,70,40],
    // }],
    series: [{
      name: 'Köpta varor',
      data: [0,0,0,0,0,0,0]
    }],    
    title: {
      text: 'Mina antal köp den här veckan'
    },
    credits: {
      enabled: false
    },
    loading: false
  }

  $scope.chartDebt = {
    options: {
      chart: {
        type: 'column'
      },
      xAxis: {
        categories: ["Mån","Tis","Ons","Tors","Fre","Lör","Sön"],
        title: {
          text: ''
        },
        labels: {
          rotation: 0,
          style: {
            fontSize: '12px',
          }
        }
      },

      yAxis: {
        min: 0,
        title: {
          text: 'Kronor',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      colors: [
        '#87E752'
      ],
    },
    series: [{
      name: 'Kostnad',
      data: [0,0,0,0,0,0,0]
    }],    
    title: {
      text: 'Min kostnad den här veckan'
    },
    credits: {
      enabled: false
    },
    loading: false
  }

  $scope.chartLobare = {
    options: {
      chart: {
        type: 'line'
      },
      xAxis: {
        categories: ["Mån","Tis","Ons","Tors","Fre","Lör","Sön"],
        title: {
          text: ''
        },
        labels: {
          rotation: 0,
          style: {
            fontSize: '12px',
          }
        }
      },

      yAxis: {
        min: 0,
        title: {
          text: 'Kronor',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      colors: [
        '#ED1176',
        '#87E752',
        '#FF773D',
        '#D0E37F',
        '#07A0C3',
        '#92DCE5',
        '#7FB800'
      ],
    },
    series: [],    
    title: {
      text: 'Veckans highscore sittande LoB'
    },
    credits: {
      enabled: false
    },
    loading: false
  }  

  $scope.chartPie = {
    options: {
      chart: {
        type: 'pie'
      },
      colors: [
        '#ED1176',
        '#FF773D',
        '#D0E37F',
        '#2E86AB',
        '#A23B72',
        '#086788',
        '#07A0C3',
        '#92DCE5',
        '#54494B',
        '#F1F7ED',
        '#7FB800'
      ],
    },
    series: [{
      data: [
        // ['Download', 100],
        // ['Upload', 500]
      ],
      name: ' ',
      dataLabels: {
        rotation: 0,
        enabled: true,
        format: ''
      }
    }],
    title: {
      text: 'Mina köp'
    },
    credits: {
      enabled: false
    },
    loading: false
  }

  $scope.week = function(year,month,day) {
      function serial(days) { return 86400000*days; }
      function dateserial(year,month,day) { return (new Date(year,month-1,day).valueOf()); }
      function weekday(date) { return (new Date(date)).getDay()+1; }
      function yearserial(date) { return (new Date(date)).getFullYear(); }
      var date = year instanceof Date ? year.valueOf() : typeof year === "string" ? new Date(year).valueOf() : dateserial(year,month,day), 
          date2 = dateserial(yearserial(date - serial(weekday(date-serial(1))) + serial(4)),1,3);
      return ~~((date - date2 + serial(weekday(date2) + 5))/ serial(7));
  }

  //$scope.lobScore = [];  

  $scope.doRefresh = function() {
    var sendData = {'tag':'getLobareWeekData', 'week':$scope.week(new Date())};
    console.log(sendData);
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.lobare = promise.data.result; 
        console.log($scope.lobare);

        var keyArray = [];
        var objArray = {};

        for (var i = 0; i < $scope.lobare.length; i++) {
          if (keyArray.indexOf($scope.lobare[i].firstname) === -1) {
            // Add unique key
            keyArray[keyArray.length] = $scope.lobare[i].firstname;            
            // Initially set all debts to 0 where each index represents a day, e.g. index 0 = Monday
            objArray[$scope.lobare[i].firstname] = [0,0,0,0,0,0,0];            
          }
        }

        for (var i = 0; i < $scope.lobare.length; i++) {
          // Go through the whole list from the db, and add the debt to the responding day (index)
          // use the first name as key to the whole week array, e.g. {"Jimmy": [0,0,0,0,0,0,0]}
          objArray[$scope.lobare[i].firstname][parseInt($scope.lobare[i].day)] = parseInt($scope.lobare[i].debt);
        }

        for (var i = 0; i < keyArray.length; i++) {
          var length = $scope.chartLobare.series.length;
          $scope.chartLobare.series[length] = {data: objArray[keyArray[i]], name: keyArray[i]};

          // var weekSum = 0;
          // for (var j = 0; j < objArray[keyArray[i]].length; j++) {
          //   weekSum += objArray[keyArray[i]][j];
          // }
          // $scope.lobScore[$scope.lobScore.length] = {name: keyArray[i], debt: weekSum};
        }
        //console.log($scope.lobScore);
      }
    });

    var sendData = {'tag':'getWeekData', 'user_id': window.localStorage['user_id'], 'week':$scope.week(new Date())};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.week = promise.data.days; 
        console.log($scope.week);

        var tempArray = [];

        for (var i = 0; i < $scope.week.length; i++) {
          var index = parseInt($scope.week[i].day);
          var amountValue = parseInt($scope.week[i].amount);
          var debtValue = parseInt($scope.week[i].debt);

          $scope.chartAmount.series[0].data[index] = amountValue;
          $scope.chartDebt.series[0].data[index] = debtValue;
        }
      }
    });  

    var sendData = {'tag':'getProfile', 'user_id': window.localStorage['user_id']};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.profile = promise.data.profile; 
        // console.log($scope.profile);

        var tempArray = [];

        for (var i = 0; i < $scope.profile.length; i++) {
          // Create tuples
          tempArray[i] = [$scope.profile[i].name, parseInt($scope.profile[i].sum)];
        }

        //console.log(tempArray);
        $scope.chartPie.series[0].data = tempArray;
        $scope.chartPie.series[0].name = $scope.profile[0].firstname + " " + $scope.profile[0].lastname;
      }
    });  
  }  

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.doRefresh();
  });
});