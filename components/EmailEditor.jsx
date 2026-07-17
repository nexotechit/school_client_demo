'use client';
import { useRef, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function EmailEditor({ value, onChange, placeholder = 'Enter your email message here...' }) {
    const editorRef = useRef(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertLink = () => {
        Swal.fire({
            title: 'Add Link',
            input: 'text',
            inputPlaceholder: 'Enter URL (e.g., https://example.com)',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Add Link',
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#ef4444',
            customClass: {
                container: 'swal-high-z-index'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a URL!';
                }
                // Simple URL validation
                try {
                    new URL(value);
                } catch (error) {
                    return 'Please enter a valid URL!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                applyFormat('createLink', result.value);
                handleInput();
                Swal.fire({
                    icon: 'success',
                    title: 'Link Added!',
                    text: result.value,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-high-z-index'
                    }
                });
            }
        });
    };

    const insertImage = () => {
        Swal.fire({
            title: 'Add Image',
            input: 'text',
            inputPlaceholder: 'Enter image URL (e.g., https://example.com/image.jpg)',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Add Image',
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#ef4444',
            customClass: {
                container: 'swal-high-z-index'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter an image URL!';
                }
                // Simple URL validation
                try {
                    new URL(value);
                } catch (error) {
                    return 'Please enter a valid URL!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                applyFormat('insertImage', result.value);
                handleInput();
                Swal.fire({
                    icon: 'success',
                    title: 'Image Added!',
                    imageUrl: result.value,
                    imageWidth: 200,
                    imageHeight: 150,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-high-z-index'
                    }
                });
            }
        });
    };

    const handleEditorClick = (e) => {
        const target = e.target;

        // Handle link clicks
        if (target.tagName === 'A') {
            e.preventDefault();
            const currentUrl = target.href;
            
            Swal.fire({
                title: 'Edit Link',
                input: 'text',
                inputValue: currentUrl,
                inputPlaceholder: 'Enter new URL',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Update Link',
                cancelButtonText: 'Delete Link',
                confirmButtonColor: '#7c3aed',
                cancelButtonColor: '#ef4444',
                customClass: {
                    container: 'swal-high-z-index'
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'Please enter a URL!';
                    }
                    try {
                        new URL(value);
                    } catch (error) {
                        return 'Please enter a valid URL!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    // Update link URL
                    target.href = result.value;
                    handleInput();
                    Swal.fire({
                        icon: 'success',
                        title: 'Link Updated!',
                        timer: 1000,
                        showConfirmButton: false,
                        customClass: {
                            container: 'swal-high-z-index'
                        }
                    });
                } else if (result.dismiss === Swal.DismissReason.cancelButton) {
                    // Delete link
                    const newHtml = editorRef.current.innerHTML.replace(
                        target.outerHTML,
                        target.textContent
                    );
                    editorRef.current.innerHTML = newHtml;
                    handleInput();
                    Swal.fire({
                        icon: 'success',
                        title: 'Link Deleted!',
                        timer: 1000,
                        showConfirmButton: false,
                        customClass: {
                            container: 'swal-high-z-index'
                        }
                    });
                }
            });
        }

        // Handle image clicks
        if (target.tagName === 'IMG') {
            e.preventDefault();
            const currentSrc = target.src;
            
            Swal.fire({
                title: 'Edit Image',
                input: 'text',
                inputValue: currentSrc,
                inputPlaceholder: 'Enter new image URL',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                imageUrl: currentSrc,
                imageWidth: 200,
                imageHeight: 150,
                showCancelButton: true,
                confirmButtonText: 'Update Image',
                cancelButtonText: 'Delete Image',
                confirmButtonColor: '#7c3aed',
                cancelButtonColor: '#ef4444',
                customClass: {
                    container: 'swal-high-z-index'
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'Please enter an image URL!';
                    }
                    try {
                        new URL(value);
                    } catch (error) {
                        return 'Please enter a valid URL!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    // Update image src
                    target.src = result.value;
                    handleInput();
                    Swal.fire({
                        icon: 'success',
                        title: 'Image Updated!',
                        timer: 1000,
                        showConfirmButton: false,
                        customClass: {
                            container: 'swal-high-z-index'
                        }
                    });
                } else if (result.dismiss === Swal.DismissReason.cancelButton) {
                    // Delete image
                    target.remove();
                    handleInput();
                    Swal.fire({
                        icon: 'success',
                        title: 'Image Deleted!',
                        timer: 1000,
                        showConfirmButton: false,
                        customClass: {
                            container: 'swal-high-z-index'
                        }
                    });
                }
            });
        }
    };

    useEffect(() => {
        if (editorRef.current && isClient) {
            editorRef.current.innerHTML = value || '';
        }
    }, [isClient]);

    if (!isClient) {
        return (
            <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 h-48 flex items-center justify-center">
                <span>Loading editor...</span>
            </div>
        );
    }

    return (
        <div className="email-editor border border-gray-300 rounded-lg overflow-hidden">
            <style>{`
                .swal-high-z-index {
                    z-index: 99999 !important;
                }
                .email-editor {
                    background-color: #ffffff;
                }
                .email-editor-toolbar {
                    background-color: #f9fafb;
                    border-bottom: 1px solid #d1d5db;
                    padding: 0.35rem 0.5rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.15rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                .email-editor-toolbar button {
                    padding: 0.35rem 0.5rem;
                    border: 1px solid #d1d5db;
                    background-color: #ffffff;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.75rem;
                    transition: all 0.2s;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 0.15rem;
                    white-space: nowrap;
                    min-height: 28px;
                    line-height: 1;
                }
                .email-editor-toolbar button:hover {
                    background-color: #f3f4f6;
                    border-color: #7c3aed;
                    color: #7c3aed;
                }
                .email-editor-toolbar button.active {
                    background-color: #7c3aed;
                    color: #ffffff;
                    border-color: #7c3aed;
                }
                .email-editor-toolbar select {
                    padding: 0.35rem 0.4rem;
                    border: 1px solid #d1d5db;
                    background-color: #ffffff;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.75rem;
                    color: #374151;
                    min-height: 28px;
                }
                .email-editor-toolbar select:hover {
                    border-color: #7c3aed;
                }
                .email-editor-separator {
                    width: 1px;
                    background-color: #e5e7eb;
                    margin: 0 0.1rem;
                }
                .email-editor-content {
                    padding: 0.5rem;
                    min-height: 120px;
                    max-height: 250px;
                    overflow-y: auto;
                    font-family: inherit;
                    font-size: 0.8rem;
                    line-height: 1.5;
                    color: #333;
                }
                .email-editor-content:focus {
                    outline: none;
                    box-shadow: inset 0 0 0 2px rgba(124, 58, 237, 0.1);
                }
                .email-editor-content[contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                }
                .email-editor-content h1 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin: 0.3rem 0;
                    color: #1e3a8a;
                }
                .email-editor-content h2 {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin: 0.25rem 0;
                    color: #1e3a8a;
                }
                .email-editor-content h3 {
                    font-size: 1rem;
                    font-weight: bold;
                    margin: 0.2rem 0;
                    color: #1e3a8a;
                }
                .email-editor-content strong {
                    font-weight: bold;
                }
                .email-editor-content em {
                    font-style: italic;
                }
                .email-editor-content u {
                    text-decoration: underline;
                }
                .email-editor-content ul {
                    margin-left: 1.2rem;
                    list-style-type: disc;
                    margin: 0.3rem 0 0.3rem 1.2rem;
                }
                .email-editor-content ol {
                    margin-left: 1.2rem;
                    list-style-type: decimal;
                    margin: 0.3rem 0 0.3rem 1.2rem;
                }
                .email-editor-content li {
                    margin-bottom: 0.1rem;
                }
                .email-editor-content blockquote {
                    border-left: 3px solid #3b82f6;
                    padding-left: 0.5rem;
                    margin: 0.3rem 0;
                    color: #6b7280;
                    font-style: italic;
                    font-size: 0.9rem;
                }
                .email-editor-content a {
                    color: #3b82f6;
                    text-decoration: underline;
                    cursor: pointer;
                }
                .email-editor-content img {
                    max-width: 100%;
                    border-radius: 0.25rem;
                    margin: 0.3rem 0;
                }
                @media (max-width: 640px) {
                    .email-editor-toolbar {
                        padding: 0.25rem 0.35rem;
                        gap: 0.1rem;
                    }
                    .email-editor-toolbar button {
                        padding: 0.25rem 0.35rem;
                        font-size: 0.65rem;
                        min-height: 24px;
                    }
                    .email-editor-toolbar select {
                        padding: 0.25rem 0.3rem;
                        font-size: 0.65rem;
                        min-height: 24px;
                    }
                    .email-editor-content {
                        padding: 0.35rem;
                        min-height: 100px;
                        max-height: 180px;
                        font-size: 0.75rem;
                    }
                }
            `}</style>

            {/* Toolbar */}
            <div className="email-editor-toolbar">
                <select onChange={(e) => {
                    if (e.target.value) applyFormat('formatBlock', `<${e.target.value}>`);
                    e.target.value = '';
                }} className="mr-1">
                    <option value="">Heading</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="p">Normal</option>
                </select>

                <div className="email-editor-separator" />

                <button onClick={() => applyFormat('bold')} title="Bold (Ctrl+B)">
                    <strong>B</strong>
                </button>
                <button onClick={() => applyFormat('italic')} title="Italic (Ctrl+I)">
                    <em>I</em>
                </button>
                <button onClick={() => applyFormat('underline')} title="Underline (Ctrl+U)">
                    <u>U</u>
                </button>
                <button onClick={() => applyFormat('strikethrough')} title="Strikethrough">
                    <s>S</s>
                </button>

                <div className="email-editor-separator" />

                <button onClick={() => applyFormat('insertUnorderedList')} title="Bullet List">
                    • List
                </button>
                <button onClick={() => applyFormat('insertOrderedList')} title="Numbered List">
                    1. List
                </button>

                <div className="email-editor-separator" />

                <button onClick={() => applyFormat('indent')} title="Increase Indent">
                    →
                </button>
                <button onClick={() => applyFormat('outdent')} title="Decrease Indent">
                    ←
                </button>

                <div className="email-editor-separator" />

                <button onClick={() => applyFormat('formatBlock', '<blockquote>')} title="Quote">
                    ❝
                </button>

                <div className="email-editor-separator" />

                <select onChange={(e) => {
                    if (e.target.value) applyFormat('justifyLeft' + (e.target.value === 'center' ? '' : e.target.value === 'right' ? '' : ''), '');
                    if (e.target.value === 'center') applyFormat('justifyCenter');
                    if (e.target.value === 'right') applyFormat('justifyRight');
                    e.target.value = '';
                }} className="mr-1">
                    <option value="">Align</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>

                <div className="email-editor-separator" />

                <button onClick={insertLink} title="Add Link">
                    🔗 Link
                </button>
                <button onClick={insertImage} title="Add Image">
                    🖼️ Image
                </button>

                <div className="email-editor-separator" />

                <button onClick={() => applyFormat('removeFormat')} title="Clear Formatting">
                    ✕ Clear
                </button>
            </div>

            {/* Content Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                onClick={handleEditorClick}
                data-placeholder={placeholder}
                className="email-editor-content"
                suppressContentEditableWarning
            />
        </div>
    );
}
