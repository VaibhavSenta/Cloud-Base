/**
 * A simple Bloom Filter implementation for client-side use.
 */
class BloomFilter {
  constructor(size = 1000, hashFunctions = 3) {
    this.size = size;
    this.bits = new Array(size).fill(0);
    this.hashFunctions = hashFunctions;
  }

  // A simple hash function (DJB2 style)
  _hash(string, seed) {
    let hash = 5381 + seed;
    for (let i = 0; i < string.length; i++) {
      hash = (hash * 33) ^ string.charCodeAt(i);
    }
    return Math.abs(hash % this.size);
  }

  add(item) {
    for (let i = 0; i < this.hashFunctions; i++) {
      const position = this._hash(item, i);
      this.bits[position] = 1;
    }
  }

  has(item) {
    if (!item) return false;
    for (let i = 0; i < this.hashFunctions; i++) {
      const position = this._hash(item, i);
      if (this.bits[position] === 0) {
        return false;
      }
    }
    return true; // Probable match
  }
}

export default BloomFilter;
