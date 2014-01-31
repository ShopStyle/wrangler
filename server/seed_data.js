if (Stream.find().count() !== 1) {
	Stream.remove({});
	Stream.insert({on: false});
}