import { z } from 'zod';

export interface ActionSchema {
  name: string;
  description: string;
  schema: z.ZodType;
}

// --- Meta Actions ---

export const doneActionSchema: ActionSchema = {
  name: 'done',
  description: 'Complete the task. Call this when you have achieved the goal or extracted the requested data',
  schema: z.object({
    text: z.string().describe('The final answer, result summary, or extracted data to present to the user'),
    success: z.boolean().default(true).describe('Whether the task was successful'),
  }),
};

export const waitActionSchema: ActionSchema = {
  name: 'wait',
  description: 'Wait for a specific amount of time. Use this if the page is loading or processing',
  schema: z.object({
    intent: z.string().optional().describe('Reason for waiting'),
    seconds: z.number().int().default(3).describe('Duration to wait in seconds'),
  }),
};

export const cacheContentActionSchema: ActionSchema = {
  name: 'cache_content',
  description: 'Save specific text content to your memory for later use in the task',
  schema: z.object({
    intent: z.string().optional().describe('Why you are caching this'),
    content: z.string().describe('The content to store in memory'),
  }),
};

// --- Navigation Actions ---

export const searchGoogleActionSchema: ActionSchema = {
  name: 'search_google',
  description: 'Perform a Google search in the current tab',
  schema: z.object({
    intent: z.string().optional().describe('Why you are searching'),
    query: z.string().describe('The search query'),
  }),
};

export const goToUrlActionSchema: ActionSchema = {
  name: 'go_to_url',
  description: 'Navigate the current tab to a specific URL',
  schema: z.object({
    intent: z.string().optional().describe('Why you are navigating here'),
    url: z.string().url().describe('The full URL to navigate to'),
  }),
};

export const goBackActionSchema: ActionSchema = {
  name: 'go_back',
  description: 'Go back to the previous page in history',
  schema: z.object({
    intent: z.string().optional().describe('Reason for going back'),
  }),
};

// --- Interaction Actions ---

export const clickElementActionSchema: ActionSchema = {
  name: 'click_element',
  description: 'Click on a specific interactive element identified by its Index ID',
  schema: z.object({
    intent: z.string().optional().describe('Reason for clicking'),
    index: z.number().int().describe('The Index ID of the element to click (from the Browser State)'),
    xpath: z.string().optional().describe('Optional backup xpath if index fails'),
  }),
};

export const inputTextActionSchema: ActionSchema = {
  name: 'input_text',
  description: 'Type text into an input field identified by its Index ID',
  schema: z.object({
    intent: z.string().optional().describe('Reason for typing'),
    index: z.number().int().describe('The Index ID of the input element'),
    text: z.string().describe('The exact text to type'),
    xpath: z.string().optional().describe('Optional backup xpath'),
  }),
};

export const sendKeysActionSchema: ActionSchema = {
  name: 'send_keys',
  description: 'Send special keyboard keys (e.g. Enter, Backspace, ArrowDown)',
  schema: z.object({
    intent: z.string().optional().describe('Reason for sending keys'),
    keys: z.string().describe('The key string (e.g. "Enter", "Control+a", "Backspace")'),
  }),
};

export const selectDropdownOptionActionSchema: ActionSchema = {
  name: 'select_dropdown_option',
  description: 'Select an option from a native <select> dropdown by its text',
  schema: z.object({
    intent: z.string().optional().describe('Reason for selection'),
    index: z.number().int().describe('The Index ID of the <select> element'),
    text: z.string().describe('The visible text of the option to select'),
  }),
};

export const getDropdownOptionsActionSchema: ActionSchema = {
  name: 'get_dropdown_options',
  description: 'Retrieve all available options from a native <select> dropdown',
  schema: z.object({
    intent: z.string().optional().describe('Reason for inspection'),
    index: z.number().int().describe('The Index ID of the dropdown'),
  }),
};

// --- Scrolling Actions ---

export const scrollToTextActionSchema: ActionSchema = {
  name: 'scroll_to_text',
  description: 'Scroll the viewport until specific text is visible',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    text: z.string().describe('The text to find'),
    nth: z.number().int().default(1).describe('The occurrence number (1-based)'),
  }),
};

export const scrollToPercentActionSchema: ActionSchema = {
  name: 'scroll_to_percent',
  description: 'Scroll vertically to a specific percentage of the page',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    yPercent: z.number().int().min(0).max(100).describe('Percentage (0-100)'),
    index: z.number().int().optional().describe('Optional element index to scroll within'),
  }),
};

export const scrollToTopActionSchema: ActionSchema = {
  name: 'scroll_to_top',
  description: 'Scroll to the top of the page',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    index: z.number().int().optional().describe('Optional element index to scroll within'),
  }),
};

export const scrollToBottomActionSchema: ActionSchema = {
  name: 'scroll_to_bottom',
  description: 'Scroll to the bottom of the page',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    index: z.number().int().optional().describe('Optional element index to scroll within'),
  }),
};

export const previousPageActionSchema: ActionSchema = {
  name: 'previous_page',
  description: 'Scroll up by one viewport height (Page Up)',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    index: z.number().int().optional().describe('Optional element index to scroll within'),
  }),
};

export const nextPageActionSchema: ActionSchema = {
  name: 'next_page',
  description: 'Scroll down by one viewport height (Page Down)',
  schema: z.object({
    intent: z.string().optional().describe('Reason for scrolling'),
    index: z.number().int().optional().describe('Optional element index to scroll within'),
  }),
};

// --- Tab Management Actions ---

export const switchTabActionSchema: ActionSchema = {
  name: 'switch_tab',
  description: 'Switch focus to a different browser tab',
  schema: z.object({
    intent: z.string().optional().describe('Reason for switching'),
    tab_id: z.number().int().describe('The Chrome Tab ID to switch to'),
  }),
};

export const openTabActionSchema: ActionSchema = {
  name: 'open_tab',
  description: 'Open a new tab with a specific URL',
  schema: z.object({
    intent: z.string().optional().describe('Reason for opening tab'),
    url: z.string().url().describe('The URL to open'),
  }),
};

export const closeTabActionSchema: ActionSchema = {
  name: 'close_tab',
  description: 'Close a specific tab',
  schema: z.object({
    intent: z.string().optional().describe('Reason for closing tab'),
    tab_id: z.number().int().describe('The Chrome Tab ID to close'),
  }),
};