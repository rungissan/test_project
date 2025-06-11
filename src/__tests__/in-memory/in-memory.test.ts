import { InMemoryStorage, Record } from '@/in-memory';
import { beforeEach, describe, expect, test } from 'vitest';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('add method', () => {
    test('should add record successfully (happy path)', () => {
      const record: Record = { id: '1', tags: ['tag1', 'tag2'] };

      expect(() => storage.add(record)).not.toThrow();
      expect(storage.size()).toBe(1);

      const results = storage.query({ id: '1' });
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(record);
    });

    test('should throw error when adding duplicate id', () => {
      const record1: Record = { id: '1', tags: ['tag1'] };
      const record2: Record = { id: '1', tags: ['tag2'] };

      storage.add(record1);

      expect(() => storage.add(record2)).toThrow('Record with ID "1" already exists');
      expect(storage.size()).toBe(1);
    });

    test('should throw error when storage limit exceeded', () => {
      for (let i = 0; i < 10000; i++) {
        storage.add({ id: `id_${i}`, tags: [`tag_${i}`] });
      }

      expect(storage.size()).toBe(10000);

      expect(() => storage.add({ id: 'overflow', tags: ['overflow'] })).toThrow(
        'Storage limit of 10000 records exceeded'
      );
    });
  });

  describe('query method', () => {
    beforeEach(() => {
      storage.add({ id: '1', tags: ['javascript', 'frontend'] });
      storage.add({ id: '2', tags: ['typescript', 'backend'] });
      storage.add({ id: '3', tags: ['javascript', 'typescript', 'fullstack'] });
      storage.add({ id: '4', tags: ['python', 'backend'] });
    });

    test('should return all records when criteria is undefined', () => {
      const results = storage.query();
      expect(results).toHaveLength(4);
    });

    test('should return all records when criteria is empty object', () => {
      const results = storage.query({});
      expect(results).toHaveLength(4);
    });

    test('should return all records when tags is empty array', () => {
      const results = storage.query({ tags: [] });
      expect(results).toHaveLength(4);
    });

    test('should find record by id', () => {
      const results = storage.query({ id: '2' });
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: '2', tags: ['typescript', 'backend'] });
    });

    test('should find records by single tag', () => {
      const results = storage.query({ tags: ['javascript'] });
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id).sort()).toEqual(['1', '3']);
    });

    test('should find records by multiple tags (all must be present)', () => {
      const results = storage.query({ tags: ['javascript', 'typescript'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    test('should return empty array when no records match criteria', () => {
      const results = storage.query({ tags: ['nonexistent'] });
      expect(results).toHaveLength(0);
    });

    test('should find records by id and tags combined', () => {
      const results = storage.query({ id: '3', tags: ['javascript'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    test('should return empty array when id matches but tags do not', () => {
      const results = storage.query({ id: '1', tags: ['python'] });
      expect(results).toHaveLength(0);
    });

    test('should be case-sensitive for tags', () => {
      const results = storage.query({ tags: ['JavaScript'] });
      expect(results).toHaveLength(0);
    });

    test('should return copies of records, not references', () => {
      const results = storage.query({ id: '1' });
      const originalRecord = results[0];

      originalRecord.tags.push('modified');

      const resultsAfterModification = storage.query({ id: '1' });
      expect(resultsAfterModification[0].tags).not.toContain('modified');
      expect(resultsAfterModification[0].tags).toEqual(['javascript', 'frontend']);
    });
  });

  describe('edge cases', () => {
    test('should handle records with empty tags array', () => {
      const record: Record = { id: '1', tags: [] };
      storage.add(record);

      const results = storage.query({ id: '1' });
      expect(results).toHaveLength(1);
      expect(results[0].tags).toEqual([]);
    });

    test('should handle special characters in id and tags', () => {
      const record: Record = {
        id: 'special!@#$%^&*()',
        tags: ['tag-with-dash', 'tag_with_underscore', 'tag.with.dots'],
      };
      storage.add(record);

      const results = storage.query({ id: 'special!@#$%^&*()' });
      expect(results).toHaveLength(1);

      const tagResults = storage.query({ tags: ['tag-with-dash'] });
      expect(tagResults).toHaveLength(1);
    });
  });
});
