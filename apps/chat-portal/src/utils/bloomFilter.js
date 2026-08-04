/**
 * Bloom Filter Data Structure for Instant O(1) Client-side Username Availability Checking.
 * No False Negatives: If has(item) returns false, the item is GUARANTEED available!
 */
class BloomFilter {
  constructor(size = 2048, hashFunctions = 3, bitArray = null) {
    this.size = size;
    this.hashFunctions = hashFunctions;
    this.bits = bitArray || new Array(size).fill(0);
  }

  // DJB2 Hash function with seed variant
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
        return false; // 100% Guaranteed NOT present in DB (Available!)
      }
    }
    return true; // Might be taken (Probable match)
  }

  // Load bitArray state from backend API response
  loadBitArray(bitArray, size = 2048, hashFunctions = 3) {
    this.size = size;
    this.hashFunctions = hashFunctions;
    this.bits = bitArray;
  }
}

export default BloomFilter;
