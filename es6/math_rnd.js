var MathRnd = function() {
}
module.exports = MathRnd;

MathRnd.prototype.getRandomIntInclusive = function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
};
MathRnd.prototype.getRandomBool = function() {
        return Math.random()>0.5;
}

