if (Stream.find().count() !== 1) {
	Stream.remove({});
	Stream.insert({on: false});
}

if (!Milestones.findOne({current: true})) {
	Milestones.update({title: "Testing App"}, {$set: {current: true}});
}