<template>
    <div class="datastores-container" :class="{ collapsed: isCollapsed }">
        <div class="datastores-header">
            <div class="header-title">
                <button class="btn-icon btn-collapse" @click="$emit('toggleCollapse')"
                    :title="isCollapsed ? 'Expand DataStores' : 'Collapse DataStores'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        :class="{ 'rotate-icon': isCollapsed }">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>
                <h3>DataStores</h3>
            </div>
            <button v-if="!isCollapsed" @click="$emit('refresh')" class="btn-small"
                :disabled="loadingDs || loadingKeys">
                <span v-if="loadingDs" class="spinner-sm"></span>
                <span v-else>รีเฟรช</span>
            </button>
        </div>

        <div v-if="!isCollapsed" class="datastores-body">
            <ul v-if="datastores.length">
                <li v-for="ds in datastores" :key="ds.name"
                    :class="{ active: selectedDs === ds.name, disabled: loadingKeys }" @click="handleSelect(ds.name)">
                    <div class="ds-item-content">
                        <span class="ds-name-label">{{ ds.name }}</span>
                        <span v-if="selectedDs === ds.name && loadingKeys" class="spinner-sm"
                            title="Loading keys..."></span>
                    </div>
                    <button @click.stop="$emit('deleteDataStore', ds.name)" class="btn-small btn-danger"
                        title="Delete DataStore" :disabled="loadingKeys">🗑️</button>
                </li>
            </ul>
            <div v-else-if="loadingDs" class="loading-state">
                <div class="spinner"></div>
                <span>Loading DataStores...</span>
            </div>
            <div v-else class="empty-state">No DataStores found.</div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    datastores: { type: Array, default: () => [] },
    selectedDs: { type: String, default: '' },
    loadingDs: { type: Boolean, default: false },
    loadingKeys: { type: Boolean, default: false },
    isCollapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['refresh', 'selectDataStore', 'deleteDataStore', 'toggleCollapse']);

const handleSelect = (dsName) => {
    if (props.loadingKeys || props.loadingDs) return; // Spam protection
    emit('selectDataStore', dsName);
};
</script>

<style scoped>
.datastores-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
}

.datastores-container.collapsed {
    height: auto !important;
    padding-bottom: 8px;
}

.datastores-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 2px solid #3b82f6;
    margin-bottom: 8px;
    flex-shrink: 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 6px;
}

.header-title h3 {
    margin: 0;
    font-size: 14px;
    color: #0f172a;
    font-weight: 700;
}

.btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 2px 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}

.btn-icon:hover {
    color: #0f172a;
    background: #f1f5f9;
}

.rotate-icon {
    transform: rotate(-90deg);
}

.datastores-body {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
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
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s ease;
}

li:hover:not(.disabled) {
    background: #f8fafc;
}

li.active {
    background: #eff6ff;
    font-weight: 600;
    color: #2563eb;
    border-left: 3px solid #2563eb;
}

li.disabled {
    cursor: not-allowed;
    opacity: 0.8;
}

.ds-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.ds-name-label {
    word-break: break-all;
}

.btn-small {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    background: #e2e8f0;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.btn-small:hover:not(:disabled) {
    background: #cbd5e1;
}

.btn-small:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-danger:hover:not(:disabled) {
    background: #fca5a5;
}

.loading-state,
.empty-state {
    padding: 16px 8px;
    color: #94a3b8;
    text-align: center;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
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
</style>
