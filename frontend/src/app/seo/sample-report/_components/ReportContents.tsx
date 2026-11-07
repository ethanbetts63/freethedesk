'use client';

import { useEffect, useRef, useState } from 'react';

import type { ContentsSection } from '../_lib/contents';

/**
 * The contents, as compose.contents writes them and the engine's page script works them (render._PAGE_SCRIPT):
 * on a desktop a menu beside the report, stuck in view, that follows the reader. The section being read is the
 * last whose heading has passed the upper third of the screen, as the site's guides reckon it; its lines unfold and
 * the others fold, sliding. A chevron at the title's end folds the whole list. Below 1024 pixels the contents are
 * the page they always were, every line showing, and the heights set here are cleared.
 *
 * The follow logic is the engine's script, line for line where React allows, so the sample behaves as the
 * delivered page does. The fold button the script injects is rendered here instead.
 */
export function ReportContents({ sections }: { sections: readonly ContentsSection[] }) {
  const nav = useRef<HTMLElement>(null);
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    const root = nav.current;
    if (!root) return;
    type Entry = { link: HTMLAnchorElement; target: HTMLElement; section: HTMLElement | null };
    const entries: Entry[] = [];
    root.querySelectorAll<HTMLAnchorElement>('a.contents__line').forEach((link) => {
      const target = document.getElementById((link.getAttribute('href') || '').slice(1));
      if (target) entries.push({ link, target, section: link.closest('.contents__section') });
    });
    if (!entries.length) return;
    const parts = Array.from(root.querySelectorAll<HTMLElement>('.contents__section'));
    const wide = window.matchMedia('(min-width: 1024px)');
    let opened: HTMLElement | null = null;
    let started = false;

    function slide(section: HTMLElement, open: boolean) {
      const topics = section.querySelector<HTMLElement>('.contents__topics');
      section.classList.toggle('contents__section--open', open);
      if (!topics) return;
      if (!wide.matches) {
        topics.style.height = '';
        return;
      }
      const from = topics.getBoundingClientRect().height;
      topics.style.height = `${from}px`;
      const to = open ? topics.scrollHeight : 0;
      if (!started || from === to) {
        topics.style.height = open ? 'auto' : '0px';
        return;
      }
      void topics.offsetHeight;
      topics.style.height = `${to}px`;
      if (open) {
        topics.addEventListener('transitionend', function done() {
          topics.removeEventListener('transitionend', done);
          if (section.classList.contains('contents__section--open')) topics.style.height = 'auto';
        });
      }
    }

    let queued = false;
    function update() {
      queued = false;
      const line = window.innerHeight / 3;
      let current = entries[0];
      entries.forEach((entry) => {
        if (entry.target.getBoundingClientRect().top <= line) current = entry;
      });
      entries.forEach((entry) => {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
      if (current.section !== opened || !started) {
        parts.forEach((section) => slide(section, section === current.section));
        opened = current.section;
        started = true;
      }
    }
    function queue() {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(update);
      }
    }
    function resized() {
      started = false;
      queue();
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resized);
    update();
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resized);
    };
  }, []);

  return (
    <nav
      ref={nav}
      className={folded ? 'contents contents--folded' : 'contents'}
      aria-label="Contents"
    >
      <h2 className="contents__title">
        Contents
        <button
          type="button"
          className="contents__fold"
          aria-controls="contents-list"
          aria-expanded={!folded}
          aria-label={folded ? 'Unfold the contents' : 'Fold the contents'}
          onClick={() => setFolded((value) => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>
      <ol className="contents__list" id="contents-list">
        {sections.map((section) => (
          <li key={section.anchor} className="contents__section">
            <a className="contents__line contents__line--section" href={`#${section.anchor}`}>
              {section.num && <span className="contents__num">{section.num}</span>}
              <span className="contents__label">{section.label}</span>
              <span className="contents__page" data-for={section.anchor} />
            </a>
            {section.topics && section.topics.length > 0 && (
              <ol className="contents__topics">
                {section.topics.map((topic) => (
                  <li key={topic.anchor}>
                    <a className="contents__line contents__line--topic" href={`#${topic.anchor}`}>
                      <span className="contents__label">{topic.label}</span>
                      <span className="contents__page" data-for={topic.anchor} />
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
