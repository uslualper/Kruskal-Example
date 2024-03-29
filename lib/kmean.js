var kmean = {

    data: getterSetter([], function (arrayOfArrays) {
        var n = arrayOfArrays[0].length;
        return (arrayOfArrays.map(function (array) {
            return array.length == n;
        }).reduce(function (boolA, boolB) {
            return (boolA & boolB)
        }, true));
    }),

    clusters: function () {
        var pointsAndCentroids = kmeans(this.data(), {
            k: this.k(),
            iterations: this.iterations()
        });
        var points = pointsAndCentroids.points;
        var centroids = pointsAndCentroids.centroids;

        return centroids.map(function (centroid) {
            return {
                centroid: centroid.location(),
                points: points.filter(function (point) {
                    return point.label() == centroid.label()
                }).map(function (point) {
                    return point.location()
                }),
            };
        });
    },

    k: getterSetter(undefined, function (value) {
        return ((value % 1 == 0) & (value > 0))
    }),

    iterations: getterSetter(Math.pow(10, 3), function (value) {
        return ((value % 1 == 0) & (value > 0))
    }),

};

function kmeans(data, config) {
    // default k
    var k = config.k || Math.round(Math.sqrt(data.length / 2));
    var iterations = config.iterations;

    // initialize point objects with data
    var points = data.map(function (vector) {
        return new Point(vector)
    });

    // intialize centroids randomly
    var centroids = [];
    for (var i = 0; i < k; i++) {
        centroids.push(new Centroid(points[i % points.length].location(), i));
    };

    // update labels and centroid locations until convergence
    for (var iter = 0; iter < iterations; iter++) {
        points.forEach(function (point) {
            point.updateLabel(centroids)
        });
        centroids.forEach(function (centroid) {
            centroid.updateLocation(points)
        });
    };

    // return points and centroids
    return {
        points: points,
        centroids: centroids
    };

};

// objects
function Point(location) {
    var self = this;
    this.location = getterSetter(location);
    this.label = getterSetter();
    this.updateLabel = function (centroids) {
        var distancesSquared = centroids.map(function (centroid) {
            return sumOfSquareDiffs(self.location(), centroid.location());
        });
        self.label(mindex(distancesSquared));
    };
};

function Centroid(initialLocation, label) {
    var self = this;
    this.location = getterSetter(initialLocation);
    this.label = getterSetter(label);
    this.updateLocation = function (points) {
        var pointsWithThisCentroid = points.filter(function (point) {
            return point.label() == self.label()
        });
        if (pointsWithThisCentroid.length > 0) self.location(averageLocation(pointsWithThisCentroid));
    };
};

// convenience functions
function getterSetter(initialValue, validator) {
    var thingToGetSet = initialValue;
    var isValid = validator || function (val) {
        return true
    };
    return function (newValue) {
        if (typeof newValue === 'undefined') return thingToGetSet;
        if (isValid(newValue)) thingToGetSet = newValue;
    };
};

function sumOfSquareDiffs(oneVector, anotherVector) {
    var squareDiffs = oneVector.map(function (component, i) {
        return Math.pow(component - anotherVector[i], 2);
    });
    return squareDiffs.reduce(function (a, b) {
        return a + b
    }, 0);
};

function mindex(array) {
    var min = array.reduce(function (a, b) {
        return Math.min(a, b);
    });
    return array.indexOf(min);
};

function sumVectors(a, b) {
    return a.map(function (val, i) {
        return val + b[i]
    });
};

function averageLocation(points) {
    var zeroVector = points[0].location().map(function () {
        return 0
    });
    var locations = points.map(function (point) {
        return point.location()
    });
    var vectorSum = locations.reduce(function (a, b) {
        return sumVectors(a, b)
    }, zeroVector);
    return vectorSum.map(function (val) {
        return val / points.length
    });
};


var colors = ['red', 'green', 'blue', 'orange', 'yellow', 'blueviolet', 'goldenrod', 'aqua', 'hotpink'];
var names = ['kirmizi', 'yeşil', 'mavi', 'turuncu', 'sari', 'mor', 'altin', 'turkuaz', 'pembe'];

var clusterMaker = kmean;
var data = [];

function setup() { //kümeleme fonksiyonu

    data = [];

    var mean = $('#input-mean').val();
    if (mean < 1 || mean > 20 || !mean) {
        alert('Kume Sayısı Hatalı!');
        return false;
    }
    clusterMaker.k(mean);
    clusterMaker.iterations(500);

    $('.stars').remove();

    var count = $(".circle").length;

    $(".circle").each(function (i) {
        var roteX = $(this).css('left');
        var roteY = $(this).css('bottom');
        roteX = parseInt(roteX.replace("px", ""));
        roteY = parseInt(roteY.replace("px", ""));
        data.push([roteX, roteY]);

        if (i + 1 === count) { //döngü bitince çalışır  
            $('.circle').remove();
            $('#console p').remove();
            clusterMaker.data(data);
            var kmeansStar = clusterMaker.clusters();
            //console.log(kmeansStar);
            for (i = 0; i < kmeansStar.length; i++) {

                var el = $('#paint').append('<div class="circle stars" style="left:' + kmeansStar[i]['centroid'][0] + 'px;bottom:' + kmeansStar[i]['centroid'][1] + 'px;color:' + colors[i] + ';"><i class="fa fa-star" aria-hidden="true"></i></div>').children("div:last-child");
                $(el).draggable({
                    containment: "#paint"
                });

                $('#console').append('<p style="color:'+ colors[i]+'">' + names[i] + ' -> nokta sayısı ' + kmeansStar[i]['points'].length + '</p>');
                $('#console').append('<p> ->  orta noktası ' + parseInt(kmeansStar[i]['centroid'][0]) + ',' + parseInt(kmeansStar[i]['centroid'][1]) + '</p>');

                for (j = 0; j < kmeansStar[i]['points'].length; j++) {
                    var el = $('#paint').append('<div class="circle" style="left:' + kmeansStar[i]['points'][j][0] + 'px;bottom:' + kmeansStar[i]['points'][j][1] + 'px;background:' + colors[i] + ';"></div>').children("div:last-child");;
                    $(el).draggable({
                        containment: "#paint"
                    });

                }

            }

            //console.log(data);
        }
    });


}
