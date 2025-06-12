import { debounce } from '@/debounce/debounce';
import { InMemoryStorage } from '@/in-memory/in-memory';
import './style.css';

const store = new InMemoryStorage();

function renderDemo(): void {
  const appElement = document.querySelector<HTMLDivElement>('#app');
  if (!appElement) return;

  try {
    appElement.innerHTML = `
      <h3>InMemoryStore + Debounce Demo</h3>

      <section>
        <h2>InMemoryStore</h2>

        <label for="add-id">Add record</label>
        <input type="text" id="add-id" placeholder="ID" />
        <input type="text" id="add-tags" placeholder="Tags (comma separated)" />
        <button id="btn-add">Add</button>

        <label for="search-id">Search records</label>
        <input type="text" id="search-id" placeholder="ID (optional)" />
        <input
          type="text"
          id="search-tags"
          placeholder="Tags (comma separated, optional)"
        />
        <button id="btn-search">Search</button>

        <div id="results">Search results will appear here</div>
      </section>

      <hr />

      <section>
        <h2>Debounce (input with delay)</h2>

        <input
          type="text"
          id="debounce-input"
          placeholder="Type something..."
        />
        <button id="btn-forceNext">forceNext</button>

        <div id="debounce-log"></div>
      </section>
    `;
    addDebounceDemo();
    addInMemoryDemo();
  } catch (error) {
    console.error('Error:', error);
    appElement.innerHTML = `
      <div>
        <h1>Vite + TypeScript + In-Memory Storage + Debounce</h1>
        <p style="color: red;">Something went wrong: ${error}</p>
      </div>
    `;
  }
}
function addInMemoryDemo(): void {
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
    } catch (err: unknown) {
      return err instanceof Error ? alert(err.message) : alert('An unknown error occurred');
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
}

function addDebounceDemo(): void {
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
}

document.addEventListener('DOMContentLoaded', renderDemo);
