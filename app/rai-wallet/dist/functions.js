'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// general functions

var blake = require('blakejs');
var nanoBase32 = require('nano-base32');

var stringFromHex = exports.stringFromHex = function stringFromHex(hex) {
  var hex = hex.toString(); //force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }return str;
};

var stringToHex = exports.stringToHex = function stringToHex(str) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
};

var accountFromHexKey = exports.accountFromHexKey = function accountFromHexKey(hex) {
  var key_bytes = hex_uint8(hex);
  var checksum_bytes = reverse_obj(blake.blake2b(key_bytes, null, 5));
  var checksum = nanoBase32.encode(checksum_bytes);
  var c_account = nanoBase32.encode(key_bytes);
  return 'xrb_' + c_account + checksum;
};

var reverse_obj = exports.reverse_obj = function reverse_obj(obj) {
  var temp = [];
  Object.keys(obj).map(function(k,i){
    temp.push(obj[k]);
  });
  temp = temp.reverse();
  return new Uint8Array(temp);
};

var parseXRBAccount = exports.parseXRBAccount = function parseXRBAccount(str) {
  var i = str.indexOf('xrb_');
  if (i != -1) {
    var acc = str.slice(i, i + 64);
    try {
      keyFromAccount(acc);
      return acc;
    } catch (e) {
      return false;
    }
  }
  return false;
};

var dec2hex = exports.dec2hex = function dec2hex(str) {
  var bytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var dec = str.toString().split(''),
      sum = [],
      hex = [],
      i,
      s;
  while (dec.length) {
    s = 1 * dec.shift();
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10;
      sum[i] = s % 16;
      s = (s - sum[i]) / 16;
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16));
  }

  hex = hex.join('');

  if (hex.length % 2 != 0) hex = "0" + hex;

  if (bytes > hex.length / 2) {
    var diff = bytes - hex.length / 2;
    for (var i = 0; i < diff; i++) {
      hex = "00" + hex;
    }
  }

  return hex;
};

var hex2dec = exports.hex2dec = function hex2dec(s) {

  function add(x, y) {
    var c = 0,
        r = [];
    var x = x.split('').map(Number);
    var y = y.split('').map(Number);
    while (x.length || y.length) {
      var s = (x.pop() || 0) + (y.pop() || 0) + c;
      r.unshift(s < 10 ? s : s - 10);
      c = s < 10 ? 0 : 1;
    }
    if (c) r.unshift(c);
    return r.join('');
  }

  var dec = '0';
  s.split('').forEach(function (chr) {
    var n = parseInt(chr, 16);
    for (var t = 8; t; t >>= 1) {
      dec = add(dec, dec);
      if (n & t) dec = add(dec, '1');
    }
  });
  return dec;
};

var hex_uint8 = exports.hex_uint8 = function hex_uint8(hex) {
  var length = hex.length / 2 | 0;
  var uint8 = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    uint8[i] = parseInt(hex.substr(i * 2, 2), 16);
  }return uint8;
};

var uint8_hex = exports.uint8_hex = function uint8_hex(uint8) {
  var hex = "";
  var aux = void 0;
  for (var i = 0; i < uint8.length; i++) {
    aux = uint8[i].toString(16).toUpperCase();
    if (aux.length == 1) aux = '0' + aux;
    hex += aux;
    aux = '';
  }
  return hex;
};

var uint4_hex = exports.uint4_hex = function uint4_hex(uint4) {
  var hex = "";
  for (var i = 0; i < uint4.length; i++) {
    hex += uint4[i].toString(16).toUpperCase();
  }return hex;
};

function equal_arrays(array1, array2) {
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] != array2[i]) return false;
  }
  return true;
}

var keyFromAccount = exports.keyFromAccount = function keyFromAccount(account) {
  if ((account.startsWith('xrb_1') || account.startsWith('xrb_3')) && account.length == 64) {
    var account_crop = account.substring(4, 64);
    var isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(account_crop);
    if (isValid) {
      var key_bytes = nanoBase32.decode(account_crop.substring(0, 52));
      var hash_bytes = nanoBase32.decode(account_crop.substring(52, 60));
      var blake_hash = reverse_obj(blake.blake2b(key_bytes, null, 5));
      if (equal_arrays(hash_bytes, blake_hash)) {
        var key = uint8_hex(key_bytes).toUpperCase();
        return key;
      } else throw "Checksum incorrect.";
    } else throw "Invalid XRB account.";
  }
  throw "Invalid XRB account.";
};
