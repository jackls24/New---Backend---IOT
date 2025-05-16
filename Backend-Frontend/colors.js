/**
 * Sistema di gestione colori per l'applicazione
 */

// Palette principale
export const PALETTE = {
    primary: {
        50: '#e6f0ff',
        100: '#bdd9ff',
        200: '#94c2ff',
        300: '#6baafe',
        400: '#4293fe',
        500: '#1a7cfd',
        600: '#0062e3',
        700: '#004dc6',
        800: '#003ba9',
        900: '#00298d',
    },
    secondary: {
        50: '#eeeaff',
        100: '#d4caff',
        200: '#b9a9ff',
        300: '#9d87fe',
        400: '#8666fd',
        500: '#6e44fc',
        600: '#5a33e1',
        700: '#4726c5',
        800: '#351aa9',
        900: '#230d8d',
    },
    success: {
        50: '#e7f9f0',
        100: '#c3f0d9',
        200: '#9de6c2',
        300: '#74dcaa',
        400: '#4bd293',
        500: '#22c87c',
        600: '#1bb36d',
        700: '#159e5e',
        800: '#0f894f',
        900: '#097440',
    },
    warning: {
        50: '#fef5e7',
        100: '#fde5bf',
        200: '#fbd595',
        300: '#f9c46a',
        400: '#f7b33f',
        500: '#f5a215',
        600: '#e08e0e',
        700: '#ca7a0a',
        800: '#b46706',
        900: '#9e5403',
    },
    error: {
        50: '#feeaef',
        100: '#fcc8d5',
        200: '#faa5ba',
        300: '#f8839e',
        400: '#f66082',
        500: '#f33d67',
        600: '#de2b53',
        700: '#c91c42',
        800: '#b30d31',
        900: '#9c001f',
    },
    neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },
};

// Colori di stato (usa i valori della palette)
export const STATUS_COLORS = {
    attivo: {
        bg: PALETTE.success[50],
        text: PALETTE.success[800],
        border: PALETTE.success[200],
        gradient: `from-${PALETTE.success[500]} to-${PALETTE.success[700]}`,
    },
    movimento: {
        bg: PALETTE.warning[50],
        text: PALETTE.warning[800],
        border: PALETTE.warning[200],
        gradient: `from-${PALETTE.warning[500]} to-${PALETTE.warning[700]}`,
    },
    non_disponibile: {
        bg: PALETTE.error[50],
        text: PALETTE.error[800],
        border: PALETTE.error[200],
        gradient: `from-${PALETTE.error[500]} to-${PALETTE.error[700]}`,
    },
    ormeggiata: {
        bg: PALETTE.success[50],
        text: PALETTE.success[800],
        border: PALETTE.success[200],
        gradient: `from-${PALETTE.success[500]} to-${PALETTE.success[700]}`,
    },
    rubata: {
        bg: PALETTE.error[50],
        text: PALETTE.error[800],
        border: PALETTE.error[200],
        gradient: `from-${PALETTE.error[500]} to-${PALETTE.error[700]}`,
    },
    default: {
        bg: PALETTE.neutral[100],
        text: PALETTE.neutral[800],
        border: PALETTE.neutral[200],
        gradient: `from-${PALETTE.neutral[500]} to-${PALETTE.neutral[600]}`,
    },
};

// Mappatura classi Tailwind
export const COLOR_MAP = {
    attivo: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
        gradient: "from-emerald-500 to-emerald-700",
    },
    movimento: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-200",
        gradient: "from-amber-500 to-orange-600",
    },
    non_disponibile: {
        bg: "bg-rose-100",
        text: "text-rose-800",
        border: "border-rose-200",
        gradient: "from-rose-500 to-pink-600",
    },
    ormeggiata: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
        gradient: "from-emerald-500 to-green-600",
    },
    rubata: {
        bg: "bg-rose-100",
        text: "text-rose-800",
        border: "border-rose-200",
        gradient: "from-rose-500 to-pink-600",
    },
    default: {
        bg: "bg-slate-100",
        text: "text-slate-800",
        border: "border-slate-200",
        gradient: "from-slate-500 to-gray-600",
    },
};

// Funzioni helper
export const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
};

export const getStatusClass = (status, type = "bg") => {
    return COLOR_MAP[status]?.[type] || COLOR_MAP.default[type];
};
