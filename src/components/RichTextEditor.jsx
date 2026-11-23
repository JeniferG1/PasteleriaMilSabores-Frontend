import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export default function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sincroniza el editor si el valor cambia externamente (ej: al editar un producto o limpiar el formulario)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const agregarEnlace = () => {
    const url = window.prompt('Ingresa la URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-3 overflow-hidden bg-white">
      {/* Barra de Herramientas (Toolbar) */}
      <div className="bg-light border-bottom p-2 d-flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn btn-sm ${editor.isActive('bold') ? 'btn-dark' : 'btn-outline-secondary'}`}
          title="Negrita (Ideal para alérgenos)"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn btn-sm ${editor.isActive('italic') ? 'btn-dark' : 'btn-outline-secondary'}`}
          title="Cursiva"
        >
          <i>I</i>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`btn btn-sm ${editor.isActive('heading', { level: 3 }) ? 'btn-dark' : 'btn-outline-secondary'}`}
          title="Subtítulo"
        >
          H3
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-dark' : 'btn-outline-secondary'}`}
          title="Lista con viñetas"
        >
          • Lista
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-dark' : 'btn-outline-secondary'}`}
          title="Lista numerada"
        >
          1. Lista
        </button>

       
      </div>

      {/* Área Editable */}
      <div className="p-2" style={{ minHeight: '130px', cursor: 'text' }} onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}