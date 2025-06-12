import { QueryCriteria, Record } from './in-memory.types';

export class InMemoryStorage {
  private readonly MAX_SIZE = 10_000;
  private readonly records: Record[] = [];

  add(record: Record): void {
    if (this.records.length >= this.MAX_SIZE) {
      throw new Error(`Storage limit of ${this.MAX_SIZE} records exceeded`);
    }

    if (this.records.find((r) => r.id === record.id)) {
      throw new Error(`Record with ID "${record.id}" already exists`);
    }

    this.records.push({
      id: record.id,
      tags: [...record.tags],
    });
  }

  query(criteria?: QueryCriteria): Record[] {
    const results = this.records.filter((record) => {
      if (!criteria || Object.keys(criteria).length === 0) return true;

      if (criteria.id && record.id !== criteria.id) return false;

      if (criteria.tags && criteria.tags.length > 0) {
        return criteria.tags.every((tag) => record.tags.includes(tag));
      }

      return true;
    });

    // Defensive copy to avoid external mutations
    return results.map((record) => ({
      id: record.id,
      tags: [...record.tags],
    }));
  }

  size(): number {
    return this.records.length;
  }

  clear(): void {
    this.records.length = 0;
  }
}
