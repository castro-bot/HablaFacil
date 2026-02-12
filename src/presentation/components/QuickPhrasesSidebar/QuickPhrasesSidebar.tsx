import React, { useState, useCallback } from 'react';
import type { Word } from '../../../domain/entities';
import type { QuickPhraseSection } from '../../../domain/entities';
import { CATEGORY_ICONS, FALLBACK_ICON } from '../../utils/categoryIcons';
import { User, PersonStanding, HandHelping, Heart, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Map sidebar sections to Lucide icons
const SECTION_ICONS: Record<QuickPhraseSection, LucideIcon> = {
  personas: User,
  acciones: PersonStanding,
  social: HandHelping,
  sentir: Heart,
  preguntas: HelpCircle,
};

interface ResolvedGroup {
  section: string;
  label: string;
  icon: string;
  wordIds: string[];
  words: Word[];
}

interface QuickPhrasesSidebarProps {
  groups: ResolvedGroup[];
  onWordClick: (word: Word) => void;
}

const SidebarWordButton = React.memo(function SidebarWordButton({
  word,
  onClick,
}: {
  word: Word;
  onClick: (w: Word) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const IconComponent = CATEGORY_ICONS[word.category] ?? FALLBACK_ICON;
  const showImage = word.symbolUrl && !imageError;

  return (
    <button
      onClick={() => onClick(word)}
      className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-blue-50 active:scale-95 transition-all min-h-[56px] w-full"
      aria-label={word.spanish}
    >
      {showImage ? (
        <img
          src={word.symbolUrl}
          alt={word.spanish}
          className="w-10 h-10 object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <IconComponent className="w-7 h-7 text-gray-500" />
      )}
      <span className="text-[9px] font-bold text-gray-700 leading-tight text-center truncate w-full mt-0.5">
        {word.spanish}
      </span>
    </button>
  );
});

const MobileSidebarChip = React.memo(function MobileSidebarChip({
  word,
  onClick,
}: {
  word: Word;
  onClick: (w: Word) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const IconComponent = CATEGORY_ICONS[word.category] ?? FALLBACK_ICON;
  const showImage = word.symbolUrl && !imageError;

  return (
    <button
      onClick={() => onClick(word)}
      className="shrink-0 flex flex-col items-center justify-center px-2 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-blue-50 active:scale-95 transition-all min-w-[56px] shadow-sm"
      aria-label={word.spanish}
    >
      {showImage ? (
        <img
          src={word.symbolUrl}
          alt={word.spanish}
          className="w-8 h-8 object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <IconComponent className="w-6 h-6 text-gray-500" />
      )}
      <span className="text-[8px] font-bold text-gray-700 leading-tight text-center truncate w-full">
        {word.spanish}
      </span>
    </button>
  );
});

export const QuickPhrasesSidebar = React.memo(function QuickPhrasesSidebar({
  groups,
  onWordClick,
}: QuickPhrasesSidebarProps) {
  const handleClick = useCallback(
    (word: Word) => {
      onWordClick(word);
    },
    [onWordClick]
  );

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside className="hidden md:flex flex-col w-[88px] lg:w-24 shrink-0 bg-white/90 backdrop-blur-sm border-r border-gray-200 overflow-y-auto custom-scrollbar">
        {groups.map((group) => (
          <div key={group.section} className="py-1.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-0.5">
              {(() => {
                const SectionIcon = SECTION_ICONS[group.section as QuickPhraseSection];
                return SectionIcon ? <SectionIcon className="w-3 h-3" /> : null;
              })()}
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              {group.words.map((word) => (
                <SidebarWordButton
                  key={word.id}
                  word={word}
                  onClick={handleClick}
                />
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Mobile: horizontal scrollable strip */}
      <div className="md:hidden shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1.5 px-3 py-2" style={{ scrollbarWidth: 'none' }}>
          {groups.map((group) => (
            <React.Fragment key={group.section}>
              <div className="shrink-0 flex items-center px-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                {(() => {
                  const SectionIcon = SECTION_ICONS[group.section as QuickPhraseSection];
                  return SectionIcon ? <SectionIcon className="w-3 h-3" /> : null;
                })()}
                </span>
              </div>
              {group.words.map((word) => (
                <MobileSidebarChip
                  key={word.id}
                  word={word}
                  onClick={handleClick}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
});
