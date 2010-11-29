require.paths.unshift('../build/default');

var assert = require('assert');
var sys = require('sys');

var ZK = require ("zookeeper").ZooKeeper;

onmessage = function(msg) {
	postMessage({ echo : msg });
    	assert.ok(msg.data.numnodes && msg.data.numnodes > 0);
	var N = msg.data.numnodes;
	var connectport = (msg.data.connect || 'localhost:2181');
	var my_worker_index = msg.data.your_index;
	var counter = 0;
	var oncreate = function (rc, path, error)  {
		if (rc != 0) sys.debug ("node create error: " + rc + ", path=" + path);
		if (++counter >= N) {
			postMessage({ done : counter });
			process.nextTick(function () {
				zk.close ();
			});
		}
	};
	
	var zk = new ZK;
	//zk.init ({connect:"localhost:2181,localhost:2182,localhost:2183", timeout:20000, debug_level:ZK.ZOO_LOG_LEVEL_WARNING, host_order_deterministic:false});
	zk.init ({connect:connect, timeout:20000, debug_level:ZK.ZOO_LOG_LEVEL_WARNING, host_order_deterministic:false});
	zk.on (ZK.on_connected, function (zk) {
		sys.debug ("[from worker #" + my_worker_index + "]session connected");
		for (var i = 0; i < N; i ++) {
			zk.a_create ("/node.js1", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, oncreate);
		}
	});

};

