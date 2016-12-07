
var prop = function (key, value) {
  return function (obj) {
    obj[key] = value;
    return obj;
  };
};

export { prop };
