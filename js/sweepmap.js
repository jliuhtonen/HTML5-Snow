function SweepMap() {
	const that = this;
	var collisionMap = [];
	const sliceSize = 5;
	var width = 0;
			
	const buildCollisionMap = function() {
		if(collisionMap.length > 0) {
			collisionMap = [];	
		}
				
		for(var i = 0; i < Math.floor(width / sliceSize) + 1; ++i) {
				collisionMap.push([]);
		}
	} 
			
	const getLowIndex = function(obj) {
		return 	Math.floor(obj.getX() / sliceSize);
	}
			
	const getHighIndex = function(obj) {
		const hi = Math.floor((obj.getX() + obj.getWidth()) / sliceSize);
		if(hi > collisionMap.length-1) {
			return collisionMap.length-1;
		} else if(hi < 0) {
			return 0;
		} else {
			return hi;	
		}
	}
			
	this.update = function(objs) {
		buildCollisionMap();
		objs.forEach(function(obj, ii) {
			that.add(obj);
		});
	}
			
	this.add = function(obj) {
		const lowIndex = getLowIndex(obj);
		const highIndex = getHighIndex(obj);
						
		for(var i = lowIndex; i < highIndex + 1; ++i) {
			collisionMap[i].push(obj);	
		}	
	}
			
	this.remove = function(obj) {
		for(var i = getLowIndex(obj); i < getHighIndex(obj) + 1; ++i) {
			const arr = collisionMap[i];
			const index = $.inArray(obj, arr);
			if(index === -1) {
				return;
			}
			arr.splice(index, 1);	
			//console.log("removed obj " + index + " from array with new length of " + arr.length + "items");
		}	
	}
			
	this.query = function(obj) {
		const lowIndex = getLowIndex(obj);
		const highIndex = getHighIndex(obj);
		var resultList = [];
				
	//	console.log("low: " + lowIndex + " hi: " + highIndex);
				
		for(var i = lowIndex; i < highIndex + 1; ++i) {
			resultList = resultList.concat(collisionMap[i]);	
		}
				
	//	console.log("resultlist: " + resultList);
				
		return resultList;
	}	
			
	this.setWidth = function(w) {
		width = w;
	}
}