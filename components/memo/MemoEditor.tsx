'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Memo } from '@/types/memo';
import { useEffect, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Code, Undo, Redo, Save, Trash2, FileText, AlignLeft
} from 'lucide-react';

interface MemoEditorProps {
  memo: Memo | null;
  onSave: (id: string, title: string, content: string, plainText: string) => void;
  onDelete: (id: string) => void;
}

export default function MemoEditor({ memo, onSave, onDelete }: MemoEditorProps) {
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(true);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: '메모 내용을 입력하세요...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-gray-800 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      setSaved(false);
      setCharCount(editor.getText().length);
    },
    immediatelyRender: false,
  });

  // Load memo content into editor
  useEffect(() => {
    if (memo && editor) {
      setTitle(memo.title);
      editor.commands.setContent(memo.content || '');
      setCharCount(editor.getText().length);
      setSaved(true);
    } else if (!memo && editor) {
      setTitle('');
      editor.commands.setContent('');
      setCharCount(0);
      setSaved(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memo?.id, editor]);

  const handleSave = useCallback(() => {
    if (!memo || !editor) return;
    const content = editor.getHTML();
    const plainText = editor.getText().slice(0, 100);
    onSave(memo.id, title, content, plainText);
    setSaved(true);
  }, [memo, editor, title, onSave]);

  // Auto-save on title change
  useEffect(() => {
    if (!memo || saved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, saved, handleSave, memo]);

  const handleDelete = () => {
    if (!memo) return;
    if (confirm(`"${memo.title}" 메모를 삭제하시겠습니까?`)) {
      onDelete(memo.id);
    }
  };

  if (!memo) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white text-gray-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium text-gray-500">메모를 선택하거나 새로 만드세요</p>
        <p className="text-xs mt-1 text-gray-400">왼쪽 패널에서 메모를 선택하면 내용이 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          placeholder="메모 제목"
          className="flex-1 text-base font-bold text-gray-800 bg-transparent border-none focus:outline-none placeholder:text-gray-300 truncate"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${saved ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
            {saved ? '저장됨' : '미저장'}
          </span>
          <button
            onClick={handleSave}
            title="저장 (Ctrl+S)"
            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
          >
            <Save size={13} />
            저장
          </button>
          <button
            onClick={handleDelete}
            title="삭제"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="제목1 (H1)"
          >
            <Heading1 size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="제목2 (H2)"
          >
            <Heading2 size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="제목3 (H3)"
          >
            <Heading3 size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
            title="본문"
          >
            <AlignLeft size={14} />
          </ToolBtn>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="굵게 (Ctrl+B)"
          >
            <Bold size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="기울임 (Ctrl+I)"
          >
            <Italic size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="밑줄 (Ctrl+U)"
          >
            <UnderlineIcon size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="취소선"
          >
            <Strikethrough size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="인라인 코드"
          >
            <Code size={14} />
          </ToolBtn>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="글머리 기호 목록"
          >
            <List size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="번호 목록"
          >
            <ListOrdered size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="인용구"
          >
            <Quote size={14} />
          </ToolBtn>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <ToolBtn
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo size={14} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo size={14} />
          </ToolBtn>
          <div className="flex-1" />
          <span className="text-[11px] text-gray-400">{charCount.toLocaleString()} 자</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition text-sm
        ${active
          ? 'bg-blue-100 text-blue-700 font-bold'
          : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }`}
    >
      {children}
    </button>
  );
}
