/**
 * Utility per la gestione dei colori nell'applicazione
 */
import { COLOR_MAP } from './colors';

// Schema colori principale dell'applicazione
export const COLORS = {
    primary: {
        light: "from-blue-500 to-blue-700",
        DEFAULT: "from-blue-600 to-indigo-800",
        dark: "from-blue-700 to-indigo-900",
    },
    secondary: {
        light: "from-indigo-500 to-purple-700",
        DEFAULT: "from-indigo-600 to-purple-800",
        dark: "from-indigo-700 to-purple-900",
    },
    success: {
        light: "from-green-500 to-emerald-700",
        DEFAULT: "from-emerald-600 to-teal-800",
        dark: "from-emerald-700 to-teal-900",
    },
    warning: {
        light: "from-amber-500 to-orange-700",
        DEFAULT: "from-amber-600 to-orange-800",
        dark: "from-amber-700 to-orange-900",
    },
    error: {
        light: "from-rose-500 to-pink-700",
        DEFAULT: "from-rose-600 to-pink-800",
        dark: "from-rose-700 to-pink-900",
    },
    info: {
        light: "from-cyan-500 to-blue-700",
        DEFAULT: "from-cyan-600 to-blue-800",
        dark: "from-cyan-700 to-blue-900",
    },
};

// Utilizziamo la mappatura colori standardizzata
export const STATUS_CLASSES = COLOR_MAP;

/**
 * Restituisce le classi CSS per lo stato specificato
 * @param {string} status - Lo stato per cui recuperare le classi
 * @param {string} type - Il tipo di classi da recuperare (combined, bg, text, border, gradient)
 * @returns {string} Le classi CSS appropriate
 */
export function getStatusClasses(status, type = "combined") {
    const statusConfig = STATUS_CLASSES[status] || STATUS_CLASSES.default;

    switch (type) {
        case "bg":
            return statusConfig.bg;
        case "text":
            return statusConfig.text;
        case "border":
            return statusConfig.border;
        case "gradient":
            return statusConfig.gradient;
        case "combined":
        default:
            return `${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`;
    }
}

/**
 * Ottiene una classe per il badge di stato
 * @param {string} status - Lo stato dell'entità
 * @returns {string} La classe CSS per il badge
 */
export function getStatusBadgeClass(status) {
    return `${getStatusClasses(status)} px-3 py-1 rounded-full text-xs font-medium`;
}

/**
 * Genera classi CSS per bottoni con colori diversi
 * @param {string} variant - Variante del bottone (primary, secondary, success, etc.)
 * @param {string} size - Dimensione del bottone (sm, md, lg)
 * @returns {string} Classi CSS per il bottone
 */
export function getButtonClasses(variant = "primary", size = "md") {
    // Base classes
    const baseClasses = "rounded-lg font-medium transition-all";

    // Size classes
    const sizeClasses = {
        sm: "px-4 py-1 text-sm",
        md: "px-5 py-2",
        lg: "px-6 py-3 text-lg",
    };

    // Variant classes
    const variantClasses = {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg hover:from-blue-700",
        secondary: "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:shadow-lg",
        success: "bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:shadow-lg",
        warning: "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg",
        danger: "bg-gradient-to-r from-rose-600 to-pink-700 text-white hover:shadow-lg",
        outline: "bg-transparent border border-blue-600 text-blue-700 hover:bg-blue-50",
        ghost: "bg-transparent text-blue-700 hover:bg-blue-50",
    };

    return `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary}`;
}
