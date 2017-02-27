if (!window.altspace || !window.altspace.inClient) document.write('<h3>Hey foo, getcho self AltspaceVR! <a href="http://altvr.com"> AltspaceVR </a></h3>');

var sim = altspace.utilities.Simulation();
sim.scene.position.set(-5.683, 4.145, -1.320);

var userId;
var displayName;
var sceneSync;
var animateTick = 0;
var poolDonutBasePosition = [-6.2, -2.635, -12];
var duckyBasePosition = [-5.5, -2.636, 1.349];
var sceneloaded = false;
var repeats = 0;
var frame = 0;
var on = 3.9782;
var off = -1000;
var tailSpeed = 50;
var shotsLoop = new Howl({
	src: ['assets/shots.ogg'],
	volume: 0.05
});
var waterMat;
var loadRequest;
var mobile = /mobile/i.test(navigator.userAgent);

function main(){
	altspace.getEnclosure().then(function(enclosure) {
		enclosure.requestFullspace().then(function() {
			altspace.getEnclosure().then(function(enclosure) {
				ppm = enclosure.pixelsPerMeter;
				sim.scene.scale.set(ppm, ppm, ppm);
				altspace.getUser().then(function(result) {
					userId = result.userId;
					displayName = result.displayName;
					load();
				});
			});
		});
	})
}

function load(){
	loadSky();
	loadPictures();
	loadCollada();
	loadObj();
}

function loadCollada(){
	//Load chair and whine bottles
	var colladaLoader = new THREE.ColladaLoader();

	colladaLoader.load('./assets/chair.dae', function(result) {
		var throne = result.scene.children[0];
		//Weird hacky thing that I'm required to do to get the chair rotated correctly
		throne.rotation.z = THREE.Math.degToRad(0);
		throne.rotation.y = THREE.Math.degToRad(-90);
		throne.rotation.x = THREE.Math.degToRad(0);
		throne.scale.set(0.5, 0.5, 0.5);
		throne.position.set(15.9, -2.6, -15.1);
		var throne_parent = new THREE.Object3D();
		throne.rotation.y = THREE.Math.degToRad(-45)
		throne_parent.add(throne);
		sim.scene.add(throne_parent);
	});

	colladaLoader.load('./assets/Wine_Bottle_Red.dae', function(result) {
		var wine1 = result.scene.children[0];
		wine1.children[2].children[0].material.transparent = true;
		wine1.scale.set(0.06, 0.06, 0.2142);
		wine1.rotation.x = THREE.Math.degToRad(-90);
		wine1.position.set(1, -1.5, 2.6);
		sim.scene.add(wine1);
	});

	colladaLoader.load('./assets/Wine_Bottle_White.dae', function(result) {
		var wine2 = result.scene.children[0];
		wine2.children[2].children[0].material.transparent = true;
		wine2.scale.set(0.034, 0.034, 0.005);
		wine2.rotation.x = THREE.Math.degToRad(-90);
		wine2.position.set(-1, -1.5, 2.6);
		sim.scene.add(wine2);
	});
}

function loadObj(){
	var multiloader = altspace.utilities.multiloader;
	multiloader.init({
		baseUrl: "assets/models"
	});
	loadRequest = new multiloader.LoadRequest();
	["water2", "flooring", "litterbox", "litter", "flooringcap", "stairs",
	"htfloorbedroom", "pooldonut", "shots", "curtain1", "curtain2", "kraken", "krakenglass", "krakendarkglass", "krakencap", "mcbed", "christmaslights", "poop", "bar4", "barcenter4", "bardoor4", "ropes",
	].forEach(function(name) {
		loadRequest.objUrls.push(name + ".obj");
		loadRequest.mtlUrls.push(name + ".mtl");
	});
	multiloader.load(loadRequest, onLoaded);
}

function loadSky(){
	var skyGeo = new THREE.SphereGeometry(400, 8, 8);
	var skyMat = new THREE.MeshBasicMaterial({
		map: LoadTexture("assets/sky4.jpg"),
		side: THREE.BackSide
	});
	var skyMesh = new THREE.Mesh(skyGeo, skyMat);
	skyMesh.rotation.y = -110;
	sim.scene.add(skyMesh);
}

function onLoaded() {

	loadShots();

	sim.scene.add(water2 = loadRequest.objects[0]);
	water2.traverse(function(obj) {
		if (obj.material && obj.material.map) {
			waterMat = obj.material;
		}
	});
	waterMat.map.repeat = new THREE.Vector2(4, 4);
	waterMat.opacity = 0.99;
	waterMat.transparent = true;

	watercaustics = water2.clone();
	sim.scene.add(watercaustics);
	watercaustics.position.set(0, -0.9, 0);
	watercausticsMat = new THREE.MeshBasicMaterial({
		map: LoadTexture("assets/waterbottom.png"),
		transparent: true,
		opacity: 0.8
	});
	watercausticsMat.map.wrapT = THREE.RepeatWrapping;
	watercausticsMat.map.wrapS = THREE.RepeatWrapping;
	watercausticsMat.map.repeat = new THREE.Vector2(4, 4);
	watercaustics.children[0].material = watercausticsMat;

	sim.scene.add(flooring = loadRequest.objects[1]);
	flooring.children[0].material.map.repeat.height = 3;
	flooring.children[0].material.map.repeat.width = 3;

	sim.scene.add(litterbox = loadRequest.objects[2]);
	litterbox.position.set(13.607, -2.621, 12.891);
	litterbox.rotation.y = THREE.Math.degToRad(90);
	sim.scene.add(litter = loadRequest.objects[4]);
	litter.position.set(13.607, -2.621, 12.891);
	litter.rotation.y = THREE.Math.degToRad(90);
	sim.scene.add(poop = loadRequest.objects[19]);
	poop.position.set(13.581, -2.528, 12.82);
	poop.rotation.y = THREE.Math.degToRad(75);

	sim.scene.add(flooringcap = loadRequest.objects[4]);

	sim.scene.add(stairs = loadRequest.objects[5]);
	stairs.children[0].material.map.repeat.height = 2;
	stairs.children[0].material.map.repeat.width = 2;

	sim.scene.add(htfloorbedroom = loadRequest.objects[6]);
	htfloorbedroom.position.set(0, -0.005, 0);

	sim.scene.add(pooldonut = loadRequest.objects[7]);
	pooldonut.position.set(poolDonutBasePosition[0], poolDonutBasePosition[1], poolDonutBasePosition[2]);

	curtain1 = loadRequest.objects[9];
	curtain1.add(curtain2 = loadRequest.objects[10]);
	sim.scene.add(curtain1);

	kraken = loadRequest.objects[11];
	kraken.add(krakenglass = loadRequest.objects[12]);
	kraken.add(krakendarkglass = loadRequest.objects[13]);
	kraken.add(krakencap = loadRequest.objects[14]);
	sim.scene.add(kraken);
	var kraken2 = kraken.clone();
	kraken2.scale.set(0.2, 0.2, 0.2);
	kraken2.position.y = -1.48;
	kraken2.position.x = 2;
	kraken2.position.z = 2;
	sim.scene.add(kraken2);
	var kraken3 = kraken.clone();
	kraken3.scale.set(0.2, 0.2, 0.2);
	kraken3.position.y = -0.9;
	kraken3.position.x = 0.25;
	kraken3.position.z = 0.25;
	kraken3.rotation.y = THREE.Math.degToRad(30);
	sim.scene.add(kraken3);
	var kraken4 = kraken.clone();
	kraken4.scale.set(0.2, 0.2, 0.2);
	kraken4.position.y = -0.9;
	kraken4.position.x = -0.3;
	kraken4.position.z = 0.2;
	kraken4.rotation.y = THREE.Math.degToRad(-75);
	sim.scene.add(kraken4);
	var kraken5 = kraken.clone();
	kraken5.scale.set(0.2, 0.2, 0.2);
	kraken5.position.y = -0.9;
	kraken5.position.x = -0.3;
	kraken5.position.z = -0.1;
	kraken5.rotation.y = THREE.Math.degToRad(-120);
	sim.scene.add(kraken5);
	var kraken6 = kraken.clone();
	kraken6.scale.set(0.2, 0.2, 0.2);
	kraken6.position.y = -1.5;
	kraken6.position.z = -0.4;
	kraken6.rotation.y = THREE.Math.degToRad(-200);
	sim.scene.add(kraken6);

	mcbed = loadRequest.objects[15];
	sim.scene.add(mcbed);
	mcbed.position.set(7.371, -3.621, -10.396);

	christmaslights = loadRequest.objects[16];
	christmaslightsMat = new THREE.MeshBasicMaterial({
		map: LoadTexture("assets/christmaslights.png"),
		transparent: true
	});
	christmaslightsMat.map.wrapT = THREE.RepeatWrapping;
	christmaslightsMat.map.wrapS = THREE.RepeatWrapping;
	sim.scene.add(christmaslights);
	christmaslights.children[0].material = christmaslightsMat;
	christmaslights.children[0].material.map.repeat.width = 12;

	var barCollision = new NativeComponent('n-mesh-collider', {type: "environment", convex: false}, loadRequest.objects[18]);
	sim.scene.add(bar4 = loadRequest.objects[18]);
	var barCenter = new NativeComponent('n-mesh-collider', {type: "environment", convex: false}, loadRequest.objects[19]);
	sim.scene.add(barcenter4 = loadRequest.objects[19]);
	sim.scene.add(bardoor4 = loadRequest.objects[20]);

	sim.scene.add(ropes = loadRequest.objects[21]);

	sim.scene.traverse( function(child) {
		child.userData.altspace = {collider: {enabled: false}};
	});

	sceneloaded = true;

	function animate() {
		animateTick++;
		if (sceneloaded == true) {
			pooldonut.rotation.x = (Math.sin(animateTick / 10) * 0.0125);
			pooldonut.rotation.z = (Math.cos(animateTick / 10) * 0.0125);
			pooldonut.position.x = (poolDonutBasePosition[0] + (Math.sin(animateTick / 200) * -0.1));
			pooldonut.position.y = (poolDonutBasePosition[1] + (Math.sin(animateTick / 8) * 0.0125));
			pooldonut.position.z = (poolDonutBasePosition[2] + (Math.sin(animateTick / 200) * 0.2));
			waterMat.map.offset.x = Math.sin(animateTick / 200) * 0.1;
			waterMat.map.offset.y = Math.sin(animateTick / 239) * 0.1;
			watercausticsMat.map.offset.x = Math.sin(animateTick / 220) * -0.2;
			watercausticsMat.map.offset.y = Math.sin(animateTick / 200) * -0.2;
			kraken.rotation.y = (animateTick / 150);
		};
		setTimeout( function() {

        requestAnimationFrame(animate);

    }, 1000 / ((mobile) ? 30 : 60) );
	};

	animate();
}

function loadPictures(){

	function DrawPic(file, wd, ht, posX, posY, posZ, deg) {
		var pic = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), new THREE.MeshBasicMaterial({ map: LoadTexture("assets/images/" + file + ".jpg") }));
		pic.position.set(posX, posY, posZ);
		pic.rotation.y = THREE.Math.degToRad(deg);
		sim.scene.add(pic);
	};

	DrawPic("Crystal2016-07-18_21-50-42", 2.27, 0.76, 8.20, 0.56, 3.98, 90);
	DrawPic("Crystal2016-08-05_22-23-55", 1.19, 0.68, -0.25, -2.00, -11.10, -90);
	DrawPic("Crystal2016-07-01_21-11-33", 1.19, 0.68, -0.25, -2.00, -8.84, -90);
	DrawPic("Crystal2016-07-09_11-39-12", 1.40, 0.79, 10.84, 0.28, -7.82, 41.03);
	DrawPic("Crystal2016-05-28_03-19-45", 1.40, 0.79, 10.84, -0.81, -7.82, 41.03);
	DrawPic("Crystal2016-06-08_19-04-58", 2.20, 1.24, 16.34, -0.46, 0.34, 90);
	DrawPic("Crystal2016-07-29_22-01-42", 1.19, 0.67, 14.58, -1.18, 6.45, -90);
	DrawPic("Crystal2016-07-23_18-16-44", 1.19, 0.67, 14.58, -1.18, 8.02, -90);
	DrawPic("Crystal2016-07-11_19-36-02", 1.19, 0.67, 14.58, -1.18, 9.59, -90);
	DrawPic("collage4", 3.7, 2.28, 16.56, -0.35, -8.932, -90)
	DrawPic("collage3", 1.9, 1.425, 15.88, 0.33, 0.797, -90);
	DrawPic("collage5", 2.558, 2.23, 12, -0.35, -10.565, 90);
	DrawPic("collage1", 3, 2, 14.58, 0.24, 8.02, -90);
	DrawPic("collage2", 2.5, 1.375, 5.7, -0.92, -12.45, -180);
}

function loadShots(){
	function drawNeon(file, wd, ht, x, y, z, deg, opa) {
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), new THREE.MeshBasicMaterial({
			opacity: opa,
			transparent: true
		}));
		plane.name = file;
		plane.position.set(x, y, z);
		plane.rotation.y = THREE.Math.degToRad(deg);
		sim.scene.add(plane);
		plane.material.map = LoadTexture("assets/" + file + ".png");
		return plane;
	};

	var neonOrange = drawNeon("neonOrange", 2.1767, 0.5272, 7.20, 1.1211, 3.9782, -90, 0.3);
	var orangeGlow = drawNeon("orangeGlow", 2.1767, 0.5272, 7.23, 1.1211, 3.9782, -90, 1);
	var neonPurple = drawNeon("neonPurple", 2.1767, 0.5272, 7.20, 0.5939, 3.9782, -90, 0.3);
	var purpleGlow = drawNeon("purpleGlow", 2.1767, 0.5272, 7.23, 0.5939, 3.9782, -90, 1);
	var neonGreen = drawNeon("neonGreen", 2.1767, 0.5272, 7.20, 0.0666, 3.9782, -90, 0.3);
	var greenGlow =  drawNeon("greenGlow", 2.1767, 0.5272, 7.23, 0.0666, 3.9782, -90, 1);
	var neonTube1 = drawNeon("neonTube1", 2.1767, 0.5272, 7.20, 1.1211, -1000, -90, 0.1);
	var shadow1 = drawNeon("shadow1", 2.1767, 0.5272, 7.23, 1.1211, -1000, -90, 1);
	var neonTube2 = drawNeon("neonTube2", 2.1767, 0.5272, 7.20, 0.5939, -1000, -90, 0.1);
	var shadow2 = drawNeon("shadow2", 2.1767, 0.5272, 7.23, 0.5939, -1000, -90, 1);
	var neonTube3 = drawNeon("neonTube3", 2.1767, 0.5272, 7.20, 0.0666, -1000, -90, 0.1);
	var shadow3 = drawNeon("shadow3", 2.1767, 0.5272, 7.23, 0.0666, -1000, -90, 1);

	sync();

	function sync() {
		var config = {
			authorId: "WACOMalt",
			appId: "Crystal",
			baseRefUrl: "https://altspacesdk-crystals-corner.firebaseio.com/"
		};
		altspace.utilities.sync.connect(config).then(function(connection) {
			sceneSync = altspace.utilities.behaviors.SceneSync(connection.instance, {
				instantiators: {
					'ShotModel': loadShotModel
				},
				ready: ready
			});
			sim.scene.addBehavior(sceneSync);
		});
	};

	function loadShotModel() {
		var shots = loadRequest.objects[8];
		shots.addBehaviors(altspace.utilities.behaviors.Object3DSync(), shotsBehavior);
		sim.scene.add(shots);
		return shots;
	};

	function ready(firstInstance) {
		if (firstInstance) {
			sceneSync.instantiate("ShotModel")
		};
	};

	var shotsBehavior = {
		awake: function(object3d) {
			var sync = object3d.getBehaviorByType('Object3DSync');
			clickRef = sync.dataRef.child('activate');

			function turnOff() {
				clickRef.set("stop")
			};
			clickRef.on('value', function(snapshot) {
				value = snapshot.val();
				if (!value) return;
				if (value == "playWithSound") {
					shotsLoop.play();
					doShots();
					setTimeout(turnOff, 8000);
				};
				if (value == "play") {
					doShots();
					setTimeout(turnOff, 8000);
				};
			});
			object3d.addEventListener('cursordown', function() {
				if (!value || value == "stop") {
					if (displayName == "Crystal" || displayName == "Jacob") clickRef.set("playWithSound")
						else clickRef.set("play");

				};
			});
		}
	};

	function doShots() {
		timer = Date.now();
		if (frame == 0) {
			loopstart = Date.now();
			frame = 1;
		};
		if (frame == 1) {
			onOrOff = [off, on, on, on, off, off];
			if (timer >= loopstart + 380) frame = 2;
		} else if (frame == 2) {
			onOrOff = [on, on, on, off, off, off];
			if (timer >= loopstart + 480) frame = 3;
		} else if (frame == 3) {
			onOrOff = [on, off, on, off, on, off];
			if (timer >= loopstart + 850) frame = 4;
		} else if (frame == 4) {
			onOrOff = [on, on, on, off, off, off];
			if (timer >= loopstart + 950) frame = 5;
		} else if (frame == 5) {
			onOrOff = [on, on, off, off, off, on];
			if (timer >= loopstart + 1200) frame = 6;
		} else if (frame == 6) {
			onOrOff = [on, on, on, off, off, off];
			if (timer >= loopstart + 1300) frame = 7;
		} else if (frame == 7) {
			onOrOff = [off, off, off, on, on, on];
			if (timer >= loopstart + 1552) frame = 8;
		} else if (frame == 8) {
			onOrOff = [on, on, on, off, off, off];
			if (timer >= loopstart + 1652) frame = 9;
		} else if (frame == 9) {
			onOrOff = [off, off, off, on, on, on];
			if (timer >= loopstart + 1767) frame = 10;
		} else if (frame == 10) {
			onOrOff = [on, on, on, off, off, off];
			if (timer >= loopstart + 1867) frame = 11;
		} else if (frame == 11) {
			frame = 0;
			repeats++;
		};
		if (repeats < 3) requestAnimationFrame(doShots);
		else {
			repeats = 0;
			onOrOff = [off, off, off, on, on, on];
		};
		neonTube1.position.z = onOrOff[0];
		shadow1.position.z = onOrOff[0];
		neonTube2.position.z = onOrOff[1];
		shadow2.position.z = onOrOff[1];
		neonTube3.position.z = onOrOff[2];
		shadow3.position.z = onOrOff[2];
		neonOrange.position.z = onOrOff[3];
		orangeGlow.position.z = onOrOff[3];
		neonPurple.position.z = onOrOff[4];
		purpleGlow.position.z = onOrOff[4];
		neonGreen.position.z = onOrOff[5];
		greenGlow.position.z = onOrOff[5];
		if (repeats == 0) return;
	};
}

THREE.Loader.Handlers.add(/jpe?g|png|gif|tga|bmp|dds/i, {
	load: function(url) {
		if(url && !url.startsWith('http') && !url.startsWith('//')) {
			if(url.startsWith('/')) {
				url = location.origin + url;
			}
			else {
				var currPath = location.pathname;
				if(!location.pathname.endsWith('/')) currPath = location.pathname.split('/').slice(0, -1).join('/') + '/';
				url = location.origin + currPath + url;
			}
		}
		return new THREE.Texture({ src: url });
	}
});

function LoadTexture(url) {
	if(url && !url.startsWith('http') && !url.startsWith('//')) {
		if(url.startsWith('/')) {
			url = location.origin + url;
		}
		else {
			var currPath = location.pathname;
			if(!location.pathname.endsWith('/')) currPath = location.pathname.split('/').slice(0, -1).join('/') + '/';
			url = location.origin + currPath + url;
		}
	}

	return new THREE.Texture({ src: url });
};

main();
