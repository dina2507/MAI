/**
 * @typedef {Object} Journey
 * @property {string} id              - URL-safe identifier (e.g. "first-time-voter")
 * @property {string} title           - Display title
 * @property {string} subtitle        - One-line description
 * @property {string} icon            - Lucide icon name
 * @property {string} accent          - Color hex for journey theming
 * @property {string} estimatedTime   - "5 min", "10 min" etc.
 * @property {string} startStepId     - First step to load
 * @property {Object<string, Step>} steps  - All steps keyed by id
 */

/**
 * @typedef {Object} Step
 * @property {string} id              - Unique step id within journey
 * @property {"info"|"choice"|"checklist"|"action"|"completion"} type
 * @property {string} title           - Step title (large editorial)
 * @property {string} [body]          - Optional markdown body
 * @property {string} [eyebrow]       - Small label above title
 *
 * // For "info" type
 * @property {string} [nextStepId]    - Auto-next step
 *
 * // For "choice" type
 * @property {Choice[]} [choices]     - Array of branching options
 *
 * // For "checklist" type
 * @property {ChecklistItem[]} [items]
 * @property {string} [continueStepId]
 *
 * // For "action" type
 * @property {Action} [action]        - External action (link, calendar)
 * @property {string} [continueStepId]
 *
 * // For "completion" type
 * @property {string} [summary]       - Final message
 * @property {NextAction[]} [nextActions]
 */

/**
 * @typedef {Object} Choice
 * @property {string} label
 * @property {string} sublabel
 * @property {string} nextStepId
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} label
 * @property {string} [hint]
 * @property {boolean} [required]
 */

/**
 * @typedef {Object} Action
 * @property {"link"|"calendar"|"phone"|"copy"} type
 * @property {string} label
 * @property {string} [url]
 * @property {string} [phone]
 * @property {Object} [calendar]  - { title, date, description }
 */

/**
 * @typedef {Object} NextAction
 * @property {string} label
 * @property {"journey"|"link"|"close"} type
 * @property {string} [target]
 */

export {}; // empty export to make it a module
