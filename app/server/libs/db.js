var members = require('../config/members.json');
var _ = require('lodash');

module.exports = {
	members: {
		index: membersIndex,
		get: membersGet
	}
}

function membersIndex() {
	return members;
}
function membersGet(key, value) {
	return _.find(members, function(member) {
		return (getRec(member, key) === value);
	});
}
function getRec(collection, key) {
	var keys = key.split('.'); var result = collection;
	_.forEach(keys, function(_key) {
		result = result[_key];
	});
	return result;
}