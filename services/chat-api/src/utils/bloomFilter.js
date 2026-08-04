/**
 * Server-side Bloom Filter manager for Chat API usernames.
 */
class BloomFilter {
  constructor(size = 2048, hashFunctions = 3) {
    this.size = size;
    this.hashFunctions = hashFunctions;
    this.bits = new Array(size).fill(0);
  }

  _hash(string, seed) {
    let hash = 5381 + seed;
    const str = string.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash % this.size);
  }

  add(item) {
    if (!item) return;
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
    return true;
  }

  getBitArray() {
    return this.bits;
  }
}

// Global server singleton instance
const globalBloomFilter = new BloomFilter(2048, 3);

module.exports = {
  BloomFilter,
  globalBloomFilter
};
