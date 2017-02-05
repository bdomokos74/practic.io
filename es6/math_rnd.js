var rnd = {
    getRandomIntInclusive : function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomBool : function() {
        return Math.random()>0.5;
    }
}
module.exports = rnd;
