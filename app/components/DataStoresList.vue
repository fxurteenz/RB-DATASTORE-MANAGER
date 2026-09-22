<template>
    <div class="box">
        <h3>DataStores <button @click="$emit('refresh')" class="btn-small">รีเฟรช</button></h3>
        <ul v-if="datastores.length">
            <li v-for="ds in datastores" :key="ds.name" :class="{ active: selectedDs === ds.name }">
                <div @click="$emit('selectDataStore', ds.name)" style="flex:1">{{ ds.name }}</div>
                <button @click.stop="$emit('deleteDataStore', ds.name)" class="btn-small btn-danger"
                    title="Delete DataStore">🗑️</button>
            </li>
        </ul>
        <div v-else-if="loadingDs" class="loading-state">Loading DataStores...</div>
        <div v-else class="empty-state">No DataStores found.</div>
    </div>
</template>

<script setup>
defineProps({
    datastores: { type: Array, default: () => [] },
    selectedDs: { type: String, default: '' },
    loadingDs: { type: Boolean, default: false }
});

defineEmits(['refresh', 'selectDataStore', 'deleteDataStore']);
</script>

<style scoped>
.box {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

h3 {
    margin-top: 0;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    color: #1e293b;
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
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.1s ease;
}

li:hover {
    background: #f8fafc;
}

li.active {
    background: #eff6ff;
    font-weight: 600;
    color: #2563eb;
}

.btn-small {
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    background: #e2e8f0;
    color: #334155;
}

.btn-small:hover {
    background: #cbd5e1;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.loading-state,
.empty-state {
    padding: 24px 12px;
    color: #94a3b8;
    text-align: center;
    font-size: 14px;
}
</style>
