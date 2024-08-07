export const watchedObject =  (object, callback)=> {
  return new Proxy(object, {
    set: function (obj, prop, value) {
      obj[prop] = value;
      callback(obj)
      return true
    }
  })
}
