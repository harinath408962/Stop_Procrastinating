/**
 * Flattens a nested object into a single level object with dot notation keys.
 */
const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else if (Array.isArray(obj[k])) {
            acc[pre + k] = obj[k].join(';'); // Join arrays with semicolon
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

/**
 * Generates a CSV string from an array of event objects.
 * @param {Array} events 
 * @returns {string} CSV content
 */
export const generateEventCsv = (events) => {
    if (!events || events.length === 0) return '';

    // 1. Flatten all events
    const flatEvents = events.map(e => {
        // Separate payload to avoid deep nesting issues if possible, or just flatten everything
        // flattening { payload: { foo: bar } } -> "payload.foo"
        return flattenObject(e);
    });

    // 2. Get all unique headers
    const headers = Array.from(new Set(flatEvents.flatMap(Object.keys)));

    // Sort headers for consistency (timestamp first usually good)
    headers.sort((a, b) => {
        if (a === 'timestamp') return -1;
        if (b === 'timestamp') return 1;
        if (a === 'event_type') return -1;
        if (b === 'event_type') return 1;
        return a.localeCompare(b);
    });

    // 3. Create CSV rows
    const csvRows = [
        headers.join(','), // Header row
        ...flatEvents.map(row => {
            return headers.map(fieldName => {
                let data = row[fieldName] || '';
                // Escape quotes and wrap in quotes if contains comma or newline
                const dataString = String(data);
                if (dataString.includes(',') || dataString.includes('"') || dataString.includes('\n')) {
                    return `"${dataString.replace(/"/g, '""')}"`;
                }
                return dataString;
            }).join(',');
        })
    ];

    return csvRows.join('\n');
};

/**
 * Triggers a download of the CSV file.
 * @param {string} csvContent 
 * @param {string} filename 
 */
export const downloadCsv = (csvContent, filename = 'stop-procrastinating-data.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
