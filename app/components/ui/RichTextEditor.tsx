'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Strikethrough, Heading1, Heading2, Quote, Redo, Undo } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

// Since I don't know if Toggle exists, I'll use Button with variant="ghost" and active state styling.
// I'll check for `cn` utility visibility first.

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/20">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn("h-8 w-8", editor.isActive('bold') ? "bg-muted text-primary" : "")}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8", editor.isActive('italic') ? "bg-muted text-primary" : "")}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={cn("h-8 w-8", editor.isActive('strike') ? "bg-muted text-primary" : "")}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 self-center" />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) ? "bg-muted text-primary" : "")}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) ? "bg-muted text-primary" : "")}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8", editor.isActive('bulletList') ? "bg-muted text-primary" : "")}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8", editor.isActive('orderedList') ? "bg-muted text-primary" : "")}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn("h-8 w-8", editor.isActive('blockquote') ? "bg-muted text-primary" : "")}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 self-center" />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="h-8 w-8"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="h-8 w-8"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3] // Limit headings to h2, h3 to avoid conflict with page title
                }
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
        ],
        content: value, // Initial content
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
                    className
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        // Important: If content changes externally (e.g. initial load), we need to update.
        // But `content` prop in useEditor is initial only.
        // We need a useEffect to update if value changes externally?
        // Actually for controlled input, it's tricky with Tiptap.
        // Usually better to let Tiptap manage state and only push out.
        // If `value` prop changes and is different from editor content, we update.
        // But typing triggers onChange -> updates value -> triggers useEffect -> updates editor -> loop/cursor jump?
        // We only update if content is significantly different.
    })

    // Sync external value changes (e.g. form reset or initial load async)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Compare text content to avoid HTML formatting drift loops?
            // Or just check if editor is empty and value is not.
            // For now, only update if editor is empty to avoid overwriting user valid input.
            if (editor.isEmpty && value) {
                editor.commands.setContent(value)
            }
        }
    }, [value, editor])

    return (
        <div className="border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor
