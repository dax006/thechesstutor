// from http://www.mymessedupmind.co.uk/wp-content/uploads/2010/04/kmeans.js
function kmeans(arrayToProcess, Clusters) {
    var Groups = [];
    var Centroids = [];
    var oldCentroids = [];
    var changed = false;
    // order the input array
    arrayToProcess.sort(function(a, b) { return a - b })
    // initialise group arrays
    for (initGroups = 0; initGroups < Clusters; initGroups++) {
        Groups[initGroups] = new Array();
    }
    // pick initial centroids
    initialCentroids = Math.round(arrayToProcess.length / (Clusters + 1));
    for (i = 0; i < Clusters; i++) {
        Centroids[i] = arrayToProcess[(initialCentroids * (i + 1))];
    }
    do {
        for (j = 0; j < Clusters; j++) {
            Groups[j] = [];
        }
        changed = false;
        for (i = 0; i < arrayToProcess.length; i++) {
            Distance = -1;
            oldDistance = -1
            //var newGroup;
            for (j = 0; j < Clusters; j++) {
                distance = Math.abs(Centroids[j] - arrayToProcess[i]);
                if (oldDistance == -1) {
                    oldDistance = distance;
                    newGroup = j;
                } else if (distance <= oldDistance) {
                    newGroup = j;
                    oldDistance = distance;
                }
            }
            Groups[newGroup].push(arrayToProcess[i]);
        }
        oldCentroids = Centroids;
        for (j = 0; j < Clusters; j++) {
            total = 0;
            newCentroid = 0;
            for (i = 0; i < Groups[j].length; i++) {
                total += Groups[j][i];
            }
            newCentroid = total / Groups[newGroup].length;
            Centroids[j] = newCentroid;
        }
        for (j = 0; j < Clusters; j++) {
            if (Centroids[j] != oldCentroids[j]) {
                changed = true;
            }
        }
    }
    while (changed == true);
    return Groups;
}