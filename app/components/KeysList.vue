<template>
    <div class="box">
        <h3>
            <span>Keys in "{{ selectedDs || '...' }}"</span>
            <span v-if="keys.length" class="count-badge">
                {{ keySearchQuery ? `${filteredKeys.length}/${keys.length}` : keys.length }}
            </span>
        </h3>

        <!-- Search Box -->
        <div v-if="selectedDs && keys.length" class="search-box">
            <input :value="keySearchQuery" @input="$emit('update:keySearchQuery', $event.target.value)" type="text"
                placeholder="🔍 ค้นหา Key..." class="search-input">
            <button v-if="keySearchQuery" @click="$emit('update:keySearchQuery', '')" class="btn-clear"
                title="ล้างคำค้นหา">✕</button>
        </div>

        <ul v-if="filteredKeys.length">
            <li v-for="k in filteredKeys" :key="k.key" :class="{ active: selectedKey === k.key }">
                <div @click="$emit('select-key', k.key)" style="flex:1; word-break: break-all;">
                    <span v-html="highlightMatch(k.key, keySearchQuery)"></span>
                </div>
                <button @click.stop="$emit('delete-key', k.key)" class="btn-small btn-danger"
                    title="Delete Key">🗑️</button>
            </li>
        </ul>
        <div v-else-if="loadingKeys" class="loading-state">Loading keys...</div>
        <div v-else-if="!selectedDs" class="empty-state">Select a DataStore first</div>
        <div v-else-if="keys.length && !filteredKeys.length" class="empty-state">
            ไม่พบ Key ที่ตรงกับ "{{ keySearchQuery }}"
        </div>
        <div v-else class="empty-state">No keys found.</div>
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
    selectedKey: {
        type: String,
        default: ''
    },
    keySearchQuery: {
        type: String,
        default: ''
    }
});

defineEmits(['update:keySearchQuery', 'select-key', 'delete-key']);

const filteredKeys = computed(() => {
    if (!props.keySearchQuery.trim()) return props.keys;
    const q = props.keySearchQuery.toLowerCase().trim();
    return props.keys.filter(k => k.key.toLowerCase().includes(q));
});

const highlightMatch = (text, query) => {
    if (!query || !query.trim()) return text;
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="highlight-text">$1</mark>');
};
</script>

<style scoped>
.box {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
}

h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 16px;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    margin-bottom: 12px;
}

.search-input {
    width: 100%;
    padding: 8px 32px 8px 12px;
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
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 50%;
}

.btn-clear:hover {
    color: #475569;
    background: #f1f5f9;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 500px;
    overflow-y: auto;
}

li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
}

li:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
}

li.active {
    border-color: #3b82f6;
    background: #eff6ff;
    font-weight: 600;
}

.btn-small {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-danger:hover {
    background: #fca5a5;
}

.loading-state,
.empty-state {
    color: #64748b;
    font-size: 14px;
    text-align: center;
    padding: 20px 0;
}

:deep(.highlight-text) {
    background-color: #fef08a;
    color: #854d0e;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
}
</style>
