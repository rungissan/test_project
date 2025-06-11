import { QueryCriteria, Record } from './in-memory.types';

export class InMemoryStorage {
  private records: WeakMap<object, Record> = new WeakMap();
  private recordKeys: Set<object> = new Set();
  private idToKey: Map<string, object> = new Map();

  add(record: Record): void {
    if (this.idToKey.has(record.id)) {
      throw new Error(`Record with ID "${record.id}" already exists`);
    }

    if (this.recordKeys.size >= 10000) {
      throw new Error('Storage limit of 10,000 records exceeded');
    }

    const key = {};
    this.records.set(key, { ...record });
    this.recordKeys.add(key);
    this.idToKey.set(record.id, key);
  }

  query(criteria?: QueryCriteria): Record[] {
    if (!criteria || Object.keys(criteria).length === 0) {
      return this.getAllRecords();
    }

    const { id, tags } = criteria;

    // If no ID or tags are specified, return all records
    if (tags && Array.isArray(tags) && tags.length === 0) {
      return this.getAllRecords();
    }

    const result: Record[] = [];

    for (const key of this.recordKeys) {
      const record = this.records.get(key);
      if (!record) continue;

      // Check by ID - if specified, the record must match
      if (id && record.id !== id) {
        continue;
      }

      // Check by tags - if specified, the record must contain all specified tags
      if (tags && tags.length > 0) {
        const hasAllTags = tags.every(tag => record.tags.includes(tag));
        if (!hasAllTags) {
          continue;
        }
      }

      result.push({ ...record });
    }

    return result;
  }

  private getAllRecords(): Record[] {
    const result: Record[] = [];
    for (const key of this.recordKeys) {
      const record = this.records.get(key);
      if (record) {
        result.push({ ...record });
      }
    }
    return result;
  }

  // Clearing the storage
  clear(): void {
    this.records = new WeakMap();
    this.recordKeys.clear();
    this.idToKey.clear();
  }

  // Getting the size of the storage
  size(): number {
    return this.recordKeys.size;
  }
}

