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
  Code, Undo, Redo, Save, Trash2, StickyNote, AlignLeft, Download
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
        placeholder: '포스트잇 메모 내용을 입력하세요...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 text-amber-950 leading-relaxed font-sans',
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

  // Auto-save on title or content change
  useEffect(() => {
    if (!memo || saved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, saved, handleSave, memo]);

  const handleDelete = () => {
    if (!memo) return;
    if (confirm(`"${memo.title}" 메모를 삭제하시겠습니까?`)) {
      onDelete(memo.id);
    }
  };

  const handleExportHTML = () => {
    if (!memo || !editor) return;
    const safeTitle = (memo.title || '메모').replace(/[\\/:*?"<>|]/g, '_');
    const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${memo.title || '제목 없음'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 36px;
      background: #fefce8;
      color: #451a03;
      line-height: 1.7;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
      border: 1px solid #fef08a;
    }
    h1.doc-title {
      font-size: 26px;
      margin-top: 0;
      color: #78350f;
      border-bottom: 2px solid #fde047;
      padding-bottom: 12px;
    }
    .meta-bar {
      font-size: 13px;
      color: #92400e;
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #fde047;
    }
    .content h1 { font-size: 22px; color: #78350f; margin-top: 24px; margin-bottom: 10px; }
    .content h2 { font-size: 19px; color: #92400e; margin-top: 20px; margin-bottom: 8px; }
    .content h3 { font-size: 16px; color: #b45309; margin-top: 16px; margin-bottom: 6px; }
    .content p { margin: 8px 0; font-size: 15px; }
    .content blockquote {
      border-left: 4px solid #facc15;
      padding-left: 16px;
      margin: 16px 0;
      color: #78350f;
      font-style: italic;
    }
    .content code {
      background: #fef08a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
    .content ul { list-style-type: disc; margin-left: 24px; }
    .content ol { list-style-type: decimal; margin-left: 24px; }
    .content li { margin: 4px 0; }
  </style>
</head>
<body>
  <h1 class="doc-title">${memo.title || '제목 없음'}</h1>
  <div class="meta-bar">
    작성일: ${memo.createdAt ? new Date(memo.createdAt).toLocaleString('ko-KR') : '-'} &nbsp;|&nbsp;
    최종 수정: ${memo.updatedAt ? new Date(memo.updatedAt).toLocaleString('ko-KR') : '-'}
  </div>
  <div class="content">
    ${editor.getHTML()}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!memo) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#FFFDF0] text-amber-800/60 p-6">
        <StickyNote size={52} className="mb-4 text-amber-300 fill-amber-100 opacity-60" />
        <p className="text-sm font-semibold text-amber-900">메모를 선택하거나 새로 만들어보세요</p>
        <p className="text-xs mt-1 text-amber-800/60">왼쪽 메모 목록에서 메모를 클릭하면 내용을 바로 편집할 수 있습니다</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FFFDF0] shadow-inner">
      {/* Top Bar */}
      <div className="px-5 py-3 border-b border-[#FDE047]/80 bg-[#FEF9C3]/80 flex items-center justify-between gap-3 shadow-xs">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          placeholder="메모 제목을 입력하세요"
          className="flex-1 text-base font-bold text-amber-950 bg-transparent border-none focus:outline-none placeholder:text-amber-800/40 truncate"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${saved ? 'text-emerald-700 bg-emerald-100/80' : 'text-amber-800 bg-amber-200'}`}>
            {saved ? '저장됨' : '저장 중...'}
          </span>
          <button
            onClick={handleExportHTML}
            title="HTML로 내보내기 (다운로드)"
            className="flex items-center gap-1 text-xs bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-medium px-2.5 py-1.5 rounded-lg border border-amber-300 transition shadow-xs"
          >
            <Download size={13} />
            HTML 내보내기
          </button>
          <button
            onClick={handleSave}
            title="저장"
            className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            <Save size={13} />
            저장
          </button>
          <button
            onClick={handleDelete}
            title="삭제"
            className="p-1.5 text-amber-800 hover:text-red-600 hover:bg-red-100/70 rounded-lg transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-amber-200/60 bg-[#FEFCE8] text-amber-950">
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
          <div className="w-px h-4 bg-amber-300/80 mx-1" />
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
          <div className="w-px h-4 bg-amber-300/80 mx-1" />
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
          <div className="w-px h-4 bg-amber-300/80 mx-1" />
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
          <span className="text-[11px] text-amber-800/70 font-mono">{charCount.toLocaleString()} 자</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto bg-[#FFFDF0]">
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
      className={`p-1.5 rounded-md transition text-xs
        ${active
          ? 'bg-amber-300 text-amber-950 font-bold shadow-xs'
          : 'text-amber-900/80 hover:bg-amber-200/60 hover:text-amber-950'
        }`}
    >
      {children}
    </button>
  );
}
