/**
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} number         - "01", "02" etc. for display
 * @property {string} title
 * @property {string} subtitle
 * @property {string} readTime       - "4 min read"
 * @property {string} icon           - Lucide icon name
 * @property {string} accent         - Color for this chapter
 * @property {Section[]} sections
 */

/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {"prose"|"callout"|"timeline"|"quiz"|"evm"} type
 * @property {string} [title]
 * @property {string} [body]          - Markdown body text
 * @property {string} [calloutType]   - "fact"|"warning"|"tip"
 * @property {TimelineItem[]} [items] - For timeline sections
 * @property {QuizQuestion} [question] - For quiz sections
 */

/**
 * @typedef {Object} TimelineItem
 * @property {string} year
 * @property {string} event
 * @property {string} [detail]
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} question
 * @property {string[]} options
 * @property {number} correct         - 0-indexed
 * @property {string} explanation
 */

export {};
