<template>
    <div class="keys-container">
        <h3>
            <span>Keys in "{{ selectedDs || '...' }}"</span>
            <span v-if="keys.length" class="count-badge">
                {{ keys.length }}
            </span>
        </h3>

        <!-- Search Box -->
        <div v-if="selectedDs" class="search-box">
            <input :value="keySearchQuery" @input="$emit('update:keySearchQuery', $event.target.value)" type="text"
                placeholder="🔍 ค้นหา Key (Prefix)..." class="search-input">
            <button v-if="keySearchQuery" @click="$emit('update:keySearchQuery', '')" class="btn-clear"
                title="ล้างคำค้นหา">✕</button>
        </div>

        <div class="keys-body">
            <!-- Skeleton Loader when loading keys -->
            <div v-if="loadingKeys" class="skeleton-list">
                <div v-for="i in Math.min(limit, 8)" :key="i" class="skeleton-item">
                    <div class="skeleton-bar skeleton-key-name"></div>
                    <div class="skeleton-bar skeleton-btn"></div>
                </div>
            </div>

            <!-- Keys List -->
            <ul v-else-if="keys.length">
                <li v-for="k in keys" :key="k.key" :class="{ active: selectedKey === k.key, disabled: loadingData }"
                    @click="handleSelect(k.key)">
                    <div class="key-item-content">
                        <span v-html="highlightMatch(k.key, keySearchQuery)"></span>
                        <span v-if="selectedKey === k.key && loadingData" class="spinner-sm"
                            title="Loading data..."></span>
                    </div>
                    <button @click.stop="$emit('delete-key', k.key)" class="btn-small btn-danger" title="Delete Key"
                        :disabled="loadingData">🗑️</button>
                </li>
            </ul>
            <div v-else-if="!selectedDs" class="empty-state">Select a DataStore first</div>
            <div v-else-if="keySearchQuery && !keys.length" class="empty-state">
                ไม่พบ Key ที่มี prefix "{{ keySearchQuery }}"
            </div>
            <div v-else class="empty-state">No keys found.</div>
        </div>

        <!-- Pagination Controls Bar using Roblox API nextPageToken / Cursor -->
        <div v-if="selectedDs && (keys.length > 0 || hasPrevPage || nextPageToken)" class="pagination-bar">
            <div class="pagination-info">
                <span>Page {{ pageNumber }}</span>
                <select :value="limit" @change="$emit('update:limit', Number($event.target.value))"
                    class="select-per-page">
                    <option :value="5">5/page</option>
                    <option :value="10">10/page</option>
                    <option :value="20">20/page</option>
                    <option :value="50">50/page</option>
                    <option :value="100">100/page</option>
                </select>
            </div>
            <div class="pagination-controls">
                <button class="btn-page" :disabled="!hasPrevPage || loadingKeys" @click="$emit('prevPage')"
                    title="Previous Page">◀ Prev</button>
                <button class="btn-page" :disabled="!nextPageToken || loadingKeys" @click="$emit('nextPage')"
                    title="Next Page (nextPageToken)">Next ▶</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    selectedDs: {
        type: String,
        default: ''
    },
    keys: {
        type: Array,
        default: () => []
    },
    loadingKeys: {
        type: Boolean,
        default: false
    },
    loadingData: {
        type: Boolean,
        default: false
    },
    selectedKey: {
        type: String,
        default: ''
    },
    keySearchQuery: {
        type: String,
        default: ''
    },
    limit: {
        type: Number,
        default: 10
    },
    nextPageToken: {
        type: String,
        default: null
    },
    hasPrevPage: {
        type: Boolean,
        default: false
    },
    pageNumber: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits([
    'update:keySearchQuery',
    'select-key',
    'delete-key',
    'update:limit',
    'nextPage',
    'prevPage'
]);

const highlightMatch = (text, query) => {
    if (!query || !query.trim()) return text;
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="highlight-text">$1</mark>');
};

const handleSelect = (keyName) => {
    if (props.loadingData) return;
    emit('select-key', keyName);
};
</script>

<style scoped>
.keys-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
}

h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 14px;
    color: #0f172a;
    font-weight: 700;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.count-badge {
    background: #e2e8f0;
    color: #475569;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-weight: 500;
}

.search-box {
    position: relative;
    margin-bottom: 8px;
    flex-shrink: 0;
}

.search-input {
    width: 100%;
    padding: 6px 30px 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 13px;
    box-sizing: border-box;
}

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-clear {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 50%;
}

.btn-clear:hover {
    color: #475569;
    background: #f1f5f9;
}

.keys-body {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Skeleton Loading Animation */
.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0;
}

.skeleton-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f8fafc;
    border-radius: 4px;
    border: 1px solid #f1f5f9;
}

.skeleton-bar {
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 400px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 4px;
}

.skeleton-key-name {
    width: 65%;
    height: 14px;
}

.skeleton-btn {
    width: 24px;
    height: 20px;
}

@keyframes shimmer {
    0% {
        background-position: -200px 0;
    }

    100% {
        background-position: 200px 0;
    }
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex: 1;
}

li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 2px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
}

li:hover:not(.disabled) {
    background: #f8fafc;
}

li.active {
    border-color: #3b82f6;
    background: #eff6ff;
    font-weight: 600;
    color: #2563eb;
    border-left: 3px solid #2563eb;
}

li.disabled {
    cursor: not-allowed;
    opacity: 0.8;
}

.key-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    word-break: break-all;
}

.btn-small {
    padding: 3px 6px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-danger:hover:not(:disabled) {
    background: #fca5a5;
}

.btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-state,
.empty-state {
    color: #94a3b8;
    font-size: 13px;
    text-align: center;
    padding: 20px 0;
}

.spinner-sm {
    width: 12px;
    height: 12px;
    border: 2px solid #cbd5e1;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

:deep(.highlight-text) {
    background-color: #fef08a;
    color: #854d0e;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
}

/* Pagination Bar Styles */
.pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    margin-top: 6px;
    border-top: 1px solid #e2e8f0;
    font-size: 11px;
    color: #64748b;
    flex-shrink: 0;
}

.pagination-info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.select-per-page {
    font-size: 11px;
    padding: 2px 4px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: white;
    color: #334155;
    cursor: pointer;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 4px;
}

.btn-page {
    padding: 3px 8px;
    font-size: 11px;
    border: 1px solid #cbd5e1;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #334155;
    font-weight: 500;
    transition: all 0.15s ease;
}

.btn-page:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #94a3b8;
}

.btn-page:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
