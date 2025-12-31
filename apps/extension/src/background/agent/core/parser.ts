import { type ParsedStreamEventType, type ParsedStreamEvent, type StreamEventCallback } from './types';

interface BlockState {
    type: ParsedStreamEventType | null;
    content: string;
    isOpen: boolean;
}

const TAG_MAP: Record<string, ParsedStreamEventType> = {
    'INITIAL_RESPONSE': 'initial_response',
    'THINKING': 'thinking',
    'ACTION': 'action',
    'QUESTION': 'question',
    'FINAL_RESPONSE': 'final_response',
};

export class StreamParser {
    private buffer: string = '';
    private currentBlock: BlockState = { type: null, content: '', isOpen: false };
    private callback: StreamEventCallback;
    private rawContent: string = '';

    constructor(callback: StreamEventCallback) {
        this.callback = callback;
    }

    processChunk(chunk: string): void {
        this.buffer += chunk;
        this.rawContent += chunk;
        this.parseBuffer();
    }

    end(): void {
        // If we have an open block at the end of the stream, close it forcefully
        if (this.currentBlock.isOpen && this.currentBlock.type) {
            this.emitBlockEvent(this.currentBlock.type, this.currentBlock.content, true);
            this.emitLifecycleEvent('block_end', this.currentBlock.type);
        } else if (this.buffer.trim()) {
            // Any remaining text in buffer not inside a block is treated as a token (likely chat)
            this.callback({
                type: 'token',
                content: this.buffer,
                delta: this.buffer
            });
        }
        this.reset();
    }

    getRawContent(): string {
        return this.rawContent;
    }

    private reset(): void {
        this.buffer = '';
        this.currentBlock = { type: null, content: '', isOpen: false };
        this.rawContent = '';
    }

    private parseBuffer(): void {
        while (this.buffer.length > 0) {
            if (this.currentBlock.isOpen) {
                // We are inside a block (e.g., [THINKING]... )
                // Look for the specific closing tag for this block type
                const tagName = this.getTagName(this.currentBlock.type!);
                const closeTag = `[/${tagName}]`;
                const closeIndex = this.buffer.indexOf(closeTag);

                if (closeIndex !== -1) {
                    // Found closing tag
                    const delta = this.buffer.substring(0, closeIndex);
                    this.currentBlock.content += delta;

                    // Emit the content within
                    this.emitBlockEvent(this.currentBlock.type!, this.currentBlock.content, true, delta);

                    // Emit UI event closing the block
                    this.emitLifecycleEvent('block_end', this.currentBlock.type!);

                    // Advance buffer past the closing tag
                    this.buffer = this.buffer.substring(closeIndex + closeTag.length);
                    this.currentBlock = { type: null, content: '', isOpen: false };
                } else {
                    // No closing tag found yet.
                    // IMPORTANT: We must be careful not to emit a partial closing tag as content.
                    // e.g. buffer ends with "[/THI"

                    // Heuristic: Keep the last X characters in buffer if they look like the start of a tag
                    const partialTagMatch = this.buffer.match(/\[\/[A-Z_]*$/);

                    if (partialTagMatch) {
                        // We might be in the middle of a closing tag. 
                        // Emit everything UP TO the match, keep match in buffer.
                        const safeDelta = this.buffer.substring(0, partialTagMatch.index);
                        const remaining = this.buffer.substring(partialTagMatch.index!);

                        if (safeDelta) {
                            this.currentBlock.content += safeDelta;
                            this.emitBlockEvent(this.currentBlock.type!, this.currentBlock.content, false, safeDelta);
                        }
                        this.buffer = remaining;
                        break; // Stop parsing, wait for more chunks
                    } else {
                        // Safe to emit whole buffer
                        const delta = this.buffer;
                        this.currentBlock.content += delta;
                        this.emitBlockEvent(this.currentBlock.type!, this.currentBlock.content, false, delta);
                        this.buffer = '';
                    }
                }
            } else {
                // We are NOT inside a block. Look for an opening tag.
                const openResult = this.findOpeningTag();

                if (openResult) {
                    const { tag, startIndex, endIndex } = openResult;

                    // 1. Handle text BEFORE the tag (Conversation/Chat)
                    if (startIndex > 0) {
                        const beforeText = this.buffer.substring(0, startIndex);
                        // Emit as generic token
                        this.callback({
                            type: 'token',
                            content: beforeText,
                            delta: beforeText
                        });
                    }

                    // 2. Start new block
                    const eventType = TAG_MAP[tag];
                    this.currentBlock = { type: eventType, content: '', isOpen: true };

                    this.emitLifecycleEvent('block_start', eventType);

                    // 3. Advance buffer
                    this.buffer = this.buffer.substring(endIndex);
                } else {
                    // No opening tag found.
                    // Check for partial opening tag at end of buffer (e.g. "[ACT")
                    const partialIndex = this.findPartialTag();

                    if (partialIndex !== -1) {
                        // Emit everything before the partial tag
                        if (partialIndex > 0) {
                            const safeText = this.buffer.substring(0, partialIndex);
                            this.callback({
                                type: 'token',
                                content: safeText,
                                delta: safeText
                            });
                        }
                        // Keep the partial tag in buffer
                        this.buffer = this.buffer.substring(partialIndex);
                        break;
                    } else {
                        // Just regular text/tokens
                        if (this.buffer) {
                            this.callback({
                                type: 'token',
                                content: this.buffer,
                                delta: this.buffer
                            });
                            this.buffer = '';
                        }
                    }
                }
            }
        }
    }

    private findOpeningTag(): { tag: string; startIndex: number; endIndex: number } | null {
        // Find the earliest occurrence of any known tag
        let firstIndex = Infinity;
        let foundTag = null;

        for (const tag of Object.keys(TAG_MAP)) {
            const openTag = `[${tag}]`;
            const index = this.buffer.indexOf(openTag);
            if (index !== -1 && index < firstIndex) {
                firstIndex = index;
                foundTag = tag;
            }
        }

        if (foundTag !== null) {
            return {
                tag: foundTag,
                startIndex: firstIndex,
                endIndex: firstIndex + foundTag.length + 2 // +2 for brackets
            };
        }
        return null;
    }

    private findPartialTag(): number {
        // Regex looks for [ followed by uppercase letters at end of string
        const match = this.buffer.match(/\[[A-Z_]*$/);
        return match ? match.index! : -1;
    }

    private getTagName(type: ParsedStreamEventType): string {
        return Object.keys(TAG_MAP).find(key => TAG_MAP[key] === type) || '';
    }

    private emitBlockEvent(type: ParsedStreamEventType, content: string, isComplete: boolean, delta?: string): void {
        this.callback({
            type,
            content: content.trim(),
            isComplete,
            delta
        });
    }

    private emitLifecycleEvent(eventType: 'block_start' | 'block_end', blockType: ParsedStreamEventType): void {
        this.callback({
            type: eventType,
            content: '',
            block: blockType
        });
    }
}