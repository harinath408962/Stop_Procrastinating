import { useState, useEffect } from 'react';
import { Cloud, Check, AlertCircle, RefreshCw } from 'lucide-react';

const SyncStatus = () => {
    const [status, setStatus] = useState('idle'); // idle, syncing, success, error

    useEffect(() => {
        let timeout;

        const handleStart = () => {
            setStatus('syncing');
            clearTimeout(timeout);
        };

        const handleSuccess = () => {
            setStatus('success');
            // Revert to idle after 3 seconds
            timeout = setTimeout(() => {
                setStatus('idle');
            }, 3000);
        };

        const handleError = () => {
            setStatus('error');
        };

        window.addEventListener('sp-sync-start', handleStart);
        window.addEventListener('sp-sync-success', handleSuccess);
        window.addEventListener('sp-sync-error', handleError);

        return () => {
            window.removeEventListener('sp-sync-start', handleStart);
            window.removeEventListener('sp-sync-success', handleSuccess);
            window.removeEventListener('sp-sync-error', handleError);
            clearTimeout(timeout);
        };
    }, []);

    // if (status === 'idle') return null;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '2rem',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            ...getStatusStyle(status)
        }}>
            {getStatusIcon(status)}
            <span>{getStatusText(status)}</span>
        </div>
    );
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'syncing':
            return { background: '#ebf8ff', color: '#0369a1' };
        case 'success':
            return { background: '#f0fdf4', color: '#166534' };
        case 'error':
            return { background: '#fef2f2', color: '#991b1b' };
        default:
            return {};
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'syncing':
            return <RefreshCw size={14} className="spin" />; // Ensure specific CSS for spin exists or rely on simple static for now
        case 'success':
            return <Check size={14} />;
        case 'error':
            return <AlertCircle size={14} />;
        default:
            return <Cloud size={14} />;
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'syncing': return 'Syncing...';
        case 'success': return 'Saved';
        case 'error': return 'Sync Failed';
        default: return 'Sync Ready';
    }
};

export default SyncStatus;
