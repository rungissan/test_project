import { debounce } from '@/debounce/debounce';
import { InMemoryStorage } from '@/in-memory/in-memory';
import './style.css';

const store = new InMemoryStorage();

const addIdInput = document.getElementById('add-id') as HTMLInputElement;
const addTagsInput = document.getElementById('add-tags') as HTMLInputElement;
const btnAdd = document.getElementById('btn-add') as HTMLButtonElement;

const searchIdInput = document.getElementById('search-id') as HTMLInputElement;
const searchTagsInput = document.getElementById('search-tags') as HTMLInputElement;
const btnSearch = document.getElementById('btn-search') as HTMLButtonElement;

const resultsDiv = document.getElementById('results') as HTMLDivElement;

btnAdd.addEventListener('click', () => {
  const id = addIdInput.value.trim();
  const tagsRaw = addTagsInput.value.trim();

  if (!id) {
    alert('ID cannot be empty');
    return;
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  try {
    store.add({ id, tags });
    alert('Record added');
    addIdInput.value = '';
    addTagsInput.value = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    alert(err.message);
  }
});

btnSearch.addEventListener('click', () => {
  const id = searchIdInput.value.trim();
  const tagsRaw = searchTagsInput.value.trim();

  const criteria: { id?: string; tags?: string[] } = {};
  if (id) criteria.id = id;
  if (tagsRaw) {
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    criteria.tags = tags;
  }

  const results = store.query(criteria);

  if (results.length === 0) {
    resultsDiv.textContent = 'No results found';
  } else {
    resultsDiv.textContent = JSON.stringify(results, null, 2);
  }
});

const debounceInput = document.getElementById('debounce-input') as HTMLInputElement;
const btnForceNext = document.getElementById('btn-forceNext') as HTMLButtonElement;
const debounceLog = document.getElementById('debounce-log') as HTMLDivElement;

function onDebouncedInput(value: string) {
  const now = new Date().toLocaleTimeString();
  const logLine = `[${now}] Debounced input: ${value}`;
  console.log(logLine);

  const p = document.createElement('p');
  p.textContent = logLine;
  debounceLog.appendChild(p);

  debounceLog.scrollTop = debounceLog.scrollHeight;
}

const debouncedFn = debounce(onDebouncedInput, { wait: 1000 });

debounceInput.addEventListener('input', (e) => {
  debouncedFn((e.target as HTMLInputElement).value);
});

btnForceNext.addEventListener('click', () => {
  debouncedFn.forceNext();
  debouncedFn(debounceInput.value);
});
