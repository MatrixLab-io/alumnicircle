import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const REPO = 'MatrixLab-io/alumnicircle';
const SEEN_KEY = 'whatsNewSeenVersion';

function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: [...listItems] });
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }

    if (line.startsWith('### ')) {
      flushList();
      blocks.push({ type: 'h3', text: line.slice(4) });
    } else if (line.startsWith('## ')) {
      flushList();
      blocks.push({ type: 'h2', text: line.slice(3) });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      blocks.push({ type: 'p', text: line });
    }
  }
  flushList();
  return blocks;
}

function ReleaseNotes({ body }) {
  const blocks = parseMarkdown(body);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        if (block.type === 'h2') return (
          <h4 key={i} className="text-sm font-bold text-gray-900 dark:text-white pt-2 first:pt-0">
            {block.text}
          </h4>
        );
        if (block.type === 'h3') return (
          <h5 key={i} className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
            {block.text}
          </h5>
        );
        if (block.type === 'list') return (
          <ul key={i} className="space-y-1.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
        if (block.type === 'p') return (
          <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{block.text}</p>
        );
        return null;
      })}
    </div>
  );
}

export default function WhatsNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [releases, setReleases] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=3`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReleases(data);
          const seen = localStorage.getItem(SEEN_KEY);
          if (seen !== data[0].tag_name) setHasNew(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (releases[0]?.tag_name) {
      localStorage.setItem(SEEN_KEY, releases[0].tag_name);
      setHasNew(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="What's New"
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <SparklesIcon className="h-5 w-5" />
        {hasNew && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
          </span>
        )}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl transition-all overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-base font-bold text-gray-900 dark:text-white">
                          What's New
                        </Dialog.Title>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Latest 3 releases
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Releases list */}
                  <div className="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-4">
                    {releases.length > 0 ? (
                      releases.map((release, index) => (
                        <div key={release.id} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                          {/* Release header */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                              {release.name || release.tag_name}
                              {index === 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-primary-500 text-white text-[10px] font-bold">
                                  LATEST
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(release.published_at)}
                            </span>
                          </div>
                          {/* Release notes */}
                          {release.body ? (
                            <ReleaseNotes body={release.body} />
                          ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                              No release notes.
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center py-6">
                        <div className="h-5 w-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
