		function Dimension(width, height) {
			this.width = width;
			this.height = height;
		}
		
		function Rectangle(x,y,width,height) {
			const that = this;
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			
			this.onTopOf = function(other) {
				return ((that.x >= other.getX() && that.x <= other.getX() + other.getWidth()) || 
					(that.x+that.width >= other.getX() && that.x+that.width <= other.getX()+other.getWidth())) 
					&& (Math.ceil(that.y + that.height) >= other.getY() && (Math.ceil(that.y + that.height) <= other.getY() + other.getHeight()));	 
			}
			
			this.onTopOfOthers = function(others) {
				for(var i = 0; i < others.length; ++i) {
					var other = others[i];
				    if(that.onTopOf(other)) {
						return true;
					}
				}
				
				return false;
			}
			
		}
		
	    Rectangle.prototype.getX = function() {
			return this.x;	
		} 
		
		Rectangle.prototype.getY = function() {
			return this.y;	
		}
		
		Rectangle.prototype.getWidth = function() {
			return this.width;	
		}
		
		Rectangle.prototype.getHeight = function() {
			return this.height;	
		}
		
		function Flake(width, windProvider) {
			this.rect = new Rectangle();
			this.rect.x = Math.random()*width;
			this.rect.y = 0;	
			this.rect.width = 1;
			this.rect.height = 1;
			this.waveMultiplier = Math.random()*2.0
			this.life = 60000;
			this.created = new Date().valueOf();
			this.velocity = 1 + Math.random();
			this.windProvider = windProvider;
		}
		
		Flake.prototype.descend = function() {
			this.rect.y += this.velocity;
			this.rect.x += this.waveMultiplier*Math.sin(0.09*this.rect.y) + this.windProvider();	
		}
		
		Flake.prototype.hasMelted = function() {
			return new Date().valueOf() - this.created > this.life;	
		}
		
		Flake.prototype.onTopOfOthers = function(others) {
			   for(var i = 0; i < others.length; ++i) {
					var other = others[i];
				    if(this.rect.onTopOf(other)) {
						return true;
					}
				}
				
				return false;
		}
		
		Flake.prototype.getX = function() {
			return this.rect.x;	
		} 
		
		Flake.prototype.getY = function() {
			return this.rect.y;	
		}
		
		Flake.prototype.getWidth = function() {
			return this.rect.width;	
		}
		
		Flake.prototype.getHeight = function() {
			return this.rect.height;	
		}
		
		Flake.prototype.setVelocity = function(velocity) {
			this.velocity = velocity;	
		}
		
		function Snow() {
			var that = this;
			this.fps = 32;	
			this.fallingFlakes = [];
			this.fallenFlakes = [];
			this.staticObjectRects = [];
			this.view = new View();
			this.dimension = new Dimension();
			this.wind = 1;
			this.generationInterval = 5;
			
			const collisionMap = new SweepMap();
			
			const generateSnow = function() {
				if(new Date().getMilliseconds() % (30-that.generationInterval) === 0) {
						const windProvider = function() {
							return that.wind-1;	
						}
						
						that.fallingFlakes.push(new Flake(that.dimension.width, windProvider));	
				}
			}
			
			const testCollision = function(flake) {
				var targets = collisionMap.query(flake);
				return flake.onTopOfOthers(targets);
			}
			
			this.letItSnow = function() {
				generateSnow();
				
				that.fallingFlakes.forEach(function(flake, i) {
						if(flake.hasMelted()) {
							that.fallingFlakes.splice(i,1);
						}else if(testCollision(flake)) {
							that.fallenFlakes.push(flake);
							that.fallingFlakes.splice(i,1);
							collisionMap.add(flake);
						} else {
							flake.descend();
							if(flake.rect.y > that.dimension.height || flake.rect.x < 0 || flake.rect.x > that.dimension.width) {
								that.fallingFlakes.splice(i,1);
							}
						}
				});
				
				that.fallenFlakes.forEach(function(flake, i) {
					if(flake.hasMelted()) {
						that.fallenFlakes.splice(i,1);	
						collisionMap.remove(flake);
					} else if(!testCollision(flake)) {
						collisionMap.remove(flake);
						that.fallingFlakes.push(flake);
						flake.setVelocity(0.5);
					}
				});
				
				that.view.draw(that.fallingFlakes.concat(that.fallenFlakes));
				setTimeout(function() { that.letItSnow(); }, 1000/this.fps);
			}
			
			this.setDimension = function(dimension) {
				this.dimension = dimension;	
				this.view.setDimension(dimension);
				collisionMap.setWidth($(document).width()); //fixme
			}
			
			this.setStaticObjectRects = function(rects) {
				that.staticObjectRects = rects;
				collisionMap.update(that.fallenFlakes.concat(that.staticObjectRects));
			}
			
		}
		
		function View() {
			const canvas = document.getElementById('drawArea');
			const ctx = canvas.getContext('2d');
			const buffer = document.createElement('canvas');
			const flakeWidth = 6;
			const flakeHeight = 6;
			buffer.width = flakeWidth;
			buffer.height= flakeHeight;
			
			const drawFlake = function(surface) {
				surface.fillStyle = "rgb(255,255,255)";
				surface.beginPath();
				surface.arc(3,3,3,0,2*Math.PI, true);
				surface.arc(3,3,3,0,2*Math.PI, true);
				surface.closePath();
				surface.fill();
			};
			
			const bufferCanvas = buffer.getContext('2d');
			drawFlake(bufferCanvas);
			const sprite = bufferCanvas.getImageData(0,0,6,6);
			
			this.draw = function(flakes) {
				ctx.clearRect(0,0,canvas.width, canvas.height);
				flakes.forEach(function(flake) {
					ctx.drawImage(buffer, 0, 0, 6, 6, flake.rect.x-3, flake.rect.y-3, 6, 6);
				});
			};
			
			this.setDimension = function(dimension) {
				ctx.canvas.width = dimension.width;
				ctx.canvas.height = dimension.height;
				ctx.fillStyle = "rgb(255,255,255)";
				ctx.strokeStyle = "rgb(255,255,255)";	
			};
		}