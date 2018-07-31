var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

var pulls = {
	'0x7dddf3bc31dd30526fc72d0c73e99528c1a4a011': 0, // token sales
	'0xa77273cba38b587c05defac6ac564f910472900e': 3, // reserve
	'0x2df67b4d71b4cfca4b90cc048641c36102602937': 3, // team
	'0xabc463fad37a01ac6d9752ed99fdef80f7316faf': 0, // advisors
	'0x973a0d5a68081497769e4794e58ca64b020dc164': 3, // bounty
	'0xcf2a0f05e94058155d836d07556ad7f4be24b461': 1, // advisor 1
	'0x079b671d1b65c5be3c47f028031f52e7d91cbb6f': 1, // advisor 2
	'0xef2f5bd8f54159d29d89f2f6f01574dd721f4ff2': 1, // advisor 3
	'0xdf63a620fdc1d0c05417de76e425e8809129b32a': 1, // advisor 4
}

var contractAbi= [{"constant":true,"inputs":[{"name":"_addr","type":"address"},{"name":"_index","type":"uint256"}],"name":"getFreezing","outputs":[{"name":"_release","type":"uint64"},{"name":"_balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"freezingCount","outputs":[{"name":"count","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

var deployedContract = new web3.eth.Contract( contractAbi, "0x96b0bf939d9460095c15251f71fda11e41dcbddb");

async function getHolds() {

	let promises = [];
	for( let addr in pulls ) {
		for( var i = 0; i < pulls[ addr ]; i ++) {
			let p = deployedContract.methods.getFreezing( addr, i ).call({from: addr});
			p.addr = addr;
			promises.push(p);
		}
	}

	let holds = [];
	for (let i = 0; i < promises.length; i++) {
		let result = await promises[i];
		if (result._release > 0) {
			let hold = { addr: promises[i].addr, dt: new Date(result._release * 1000), balance: Math.round(result._balance/1000000000000000000, 0) };
			holds.push(hold);
		}
	}

	return holds;
}

var prev = '';
var dates = {};

console.log('Sharpay token freezing:');
console.log('');

getHolds().then((holds) => {
	holds.forEach((h) => {
		let fd = h.dt.getFullYear() + '-' + ('0' + (h.dt.getMonth() + 1)).slice(-2) + '-' + ('0' + h.dt.getDate()).slice(-2);
		
		if( prev != h.addr ) {
			if( prev != '' ) {
				console.log('');
			}
			console.log( h.addr );
			prev = h.addr;
		}
		
		console.log(fd, '->', h.balance);
		
		if( dates[ fd ] ) {
			dates[ fd ] = parseInt( h.balance ) + dates[ fd ];
		} else {
			dates[ fd ] = parseInt( h.balance );
		}
		
	});
	
	console.log('');
	console.log('Sharpay token release:');
	for( var d in dates ) {
		console.log(d, '->', dates[d]);
	}
});
