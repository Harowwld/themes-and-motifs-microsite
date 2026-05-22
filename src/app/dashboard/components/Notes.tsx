"use client";

import { useState } from "react";
import { Plus, FileText, BookOpen, Trash2, ChevronRight } from "lucide-react";
import { NoteItem } from "../types";

interface NotesProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, "id" | "date">) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

const TEMPLATES = [
  {
    name: "Caterer Questions",
    title: "Caterer Interview Questions",
    content: `1. Is food tasting free for the couple?
2. Are tables, chairs, and styling included in the pax price?
3. How many servers will be present per table?
4. What is the fee for bringing in outside alcohol / corkage?
5. How do you handle dietary restrictions (vegetarian/allergies)?`,
  },
  {
    name: "Bride Vows",
    title: "Draft: Bride Vows Outline",
    content: `- Start with a sweet memory of when we first met.
- What I love most about you (your patience, kindness, cooking!).
- My promises to you (to laugh with you, support your dreams, never go to bed angry).
- Looking forward to our future together.`,
  },
  {
    name: "Ceremony Flow",
    title: "Ceremony Flow Outline",
    content: `1. Processional (Entourage entry)
2. Entrance of the Bride
3. Opening Prayer & Welcoming by Officiant
4. Scripture Reading / Homily
5. Exchange of Vows & Rings
6. Unity Candle / Sand Ceremony
7. Marriage Declaration & First Kiss
8. Recessional (Exit of the Bride & Groom)`,
  },
];

export default function Notes({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleCreateEmpty = () => {
    onAddNote({
      title: "Untitled Note",
      content: "",
    });
  };

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    onAddNote({
      title: tpl.title,
      content: tpl.content,
    });
  };

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        {/* Left Side: Note List & Templates */}
        <div className="w-full lg:w-[320px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between self-start">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-b-black/[0.04]">
              <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                Wedding Notes
              </h3>
              <button
                onClick={handleCreateEmpty}
                className="h-8 px-2.5 bg-[#a68b6a] text-white hover:bg-[#957a5c] text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                New Note
              </button>
            </div>

            {/* Note Quick Selector */}
            {notes.length === 0 ? (
              <p className="text-[12px] text-neutral-400 text-center py-8">No notes yet. Create one above.</p>
            ) : (
              <div className="space-y-2 mb-6 max-h-52 overflow-y-auto pr-1">
                {notes.map((n) => {
                  const isSelected = selectedNoteId === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`p-3 rounded-lg border cursor-pointer select-none text-[12px] font-medium transition-all ${
                        isSelected
                          ? "bg-[#a68b6a]/5 border-[#a68b6a] font-bold text-neutral-800"
                          : "bg-[#fafafa]/50 border-black/[0.04] hover:border-neutral-200 hover:bg-white"
                      }`}
                    >
                      <div className="truncate text-neutral-800">{n.title}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        {new Date(n.date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planning Templates */}
          <div className="border-t border-black/[0.04] pt-4">
            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
              Quick Templates
            </h4>
            <div className="space-y-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#fafafa]/50 hover:bg-[#a68b6a]/5 border border-black/[0.04] hover:border-[#a68b6a]/30 transition-all text-[11px] font-medium text-neutral-600 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={12} className="text-[#a68b6a]" />
                    <span>{tpl.name}</span>
                  </div>
                  <ChevronRight size={11} className="text-[#a68b6a]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Note Editor Workspace */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between">
          {activeNote ? (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-black/[0.04] pb-3">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => onUpdateNote(activeNote.id, e.target.value, activeNote.content)}
                  className="text-[16px] sm:text-[18px] font-semibold text-[#2c2c2c] bg-transparent outline-none border-b border-transparent focus:border-neutral-300 font-[family-name:var(--font-noto-serif)] w-full"
                />
                
                <button
                  onClick={() => {
                    onDeleteNote(activeNote.id);
                    setSelectedNoteId(null);
                  }}
                  className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-neutral-50 cursor-pointer flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                  title="Delete note"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>

              <textarea
                value={activeNote.content}
                onChange={(e) => onUpdateNote(activeNote.id, activeNote.title, e.target.value)}
                placeholder="Type your plans, agreements, or drafts here. Auto-saves instantly!"
                rows={12}
                className="w-full flex-1 resize-none bg-transparent text-[13px] sm:text-[14px] leading-relaxed text-neutral-700 outline-none placeholder:text-neutral-300 font-[family-name:var(--font-plus-jakarta)]"
              />

              <div className="text-[10px] text-neutral-400 font-semibold border-t border-black/[0.04] pt-3 text-right">
                Last updated: {new Date(activeNote.date).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="h-12 w-12 rounded-full bg-[#a68b6a]/5 flex items-center justify-center text-[#a68b6a] mb-3">
                <BookOpen size={20} />
              </div>
              <h4 className="font-semibold text-neutral-700 font-[family-name:var(--font-noto-serif)] text-[14px]">
                Wedding Workspace Notebook
              </h4>
              <p className="text-[12px] text-neutral-400 max-w-xs mt-1 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                Select an existing note from the notebook list or use a quick template to start editing your notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
