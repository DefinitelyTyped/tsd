var tsdApp = angular.module('tsdApp', []);

tsdApp.controller('TSDListCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
	var data = null;

	// init
	$scope.sortingOrder = sortingOrder;
	$scope.reverse = false;
	$scope.filteredItems = [];
	$scope.groupedItems = [];
	$scope.itemsPerPage = 20;
	$scope.maxPaged = 9;
	$scope.pagedItems = [];
	$scope.currentPage = 0;
	$scope.items = [];

	var searchMatch = function (haystack, needle) {
		if (!needle) {
			return true;
		}
		return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
	};

	// init the filtered items
	$scope.search = function () {
		$scope.filteredItems = $filter('filter')($scope.items, function (item) {
			for (var attr in item) {
				if (attr === 'name') {
					if (searchMatch(item[attr], $scope.query))
						return true;
				}
			}
			return false;
		});
		// take care of the sorting order
		if ($scope.sortingOrder !== '') {
			$scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
		}
		$scope.currentPage = 0;
		// now group by pages
		$scope.groupToPages();
	};

	// calculate page in place
	$scope.groupToPages = function () {
		$scope.pagedItems = [];

		for (var i = 0; i < $scope.filteredItems.length; i++) {
			if (i % $scope.itemsPerPage === 0) {
				$scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
			} else {
				$scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
			}
		}
	};

	$scope.range = function (start, current, end) {
		var ret = [];

		var offset = Math.ceil(($scope.maxPaged - 1) / 2);

		var maxPages = Math.ceil($scope.items.length / $scope.itemsPerPage);
		start = Math.max(0, current - offset);
		end = Math.min(maxPages, current + offset + 1);

		for (var i = start; i < end; i++) {
			ret.push(i);
		}

		return ret;
	};

	$scope.prevPage = function () {
		if ($scope.currentPage > 0) {
			$scope.currentPage--;
		}
	};

	$scope.nextPage = function () {
		if ($scope.currentPage < $scope.pagedItems.length - 1) {
			$scope.currentPage++;
		}
	};

	$scope.setPage = function () {
		$scope.currentPage = this.n;
	};

	// change sorting order
	$scope.sort_by = function (newSortingOrder) {
		if ($scope.sortingOrder === newSortingOrder) {
			$scope.reverse = !$scope.reverse;
		}
		$scope.sortingOrder = newSortingOrder;
		$scope.search();
	};

	$http.get('data/repository.json').success(function (res) {
		// keep reference
		data = res;

		// enrich
		function getDefURL(path) {
			return res.urls.def.replace('{path}', path);
		}
		data.content.forEach(function (def) {
			def.url = getDefURL(def.path);
		});

		//use it
		$scope.items = data.content;
		// apply
		$scope.search();
	});
}]);
