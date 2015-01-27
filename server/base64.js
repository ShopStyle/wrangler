// from http://stackoverflow.com/questions/18469255/how-can-i-encode-a-string-in-base64-using-meteor

if (Meteor.isServer) {
  Meteor.methods({
    'base64Encode':function(unencoded) {
      return new Buffer(unencoded || '').toString('base64');
    },

    'base64Decode':function(encoded) {
      return new Buffer(encoded || '', 'base64').toString('utf8');
    },

    'base64UrlEncode':function(unencoded) {
      var encoded = Meteor.call('base64Encode',unencoded);
      return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },

    'base64UrlDecode':function(encoded) {
      encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
      while (encoded.length % 4)
        encoded += '=';
        return Meteor.call('base64Decode',encoded);
    }
  });
}
