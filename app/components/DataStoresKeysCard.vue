<template>
    <div class="card-panel" :style="{ width: `${panelWidth}px` }">
        <!-- Top Section: DataStoresList -->
        <div class="section-top" :style="topSectionStyle">
            <DataStoresList :datastores="datastores" :loading-ds="loadingDs" :loading-keys="loadingKeys"
                :selected-ds="selectedDs" :is-collapsed="isDsCollapsed" :limit="dsLimit"
                :next-page-token="dsNextPageToken" :has-prev-page="dsHasPrevPage" :page-number="dsPageNumber"
                @refresh="$emit('refresh-ds')" @select-data-store="$emit('select-ds', $event)"
                @delete-data-store="$emit('delete-ds', $event)" @toggle-collapse="toggleDsCollapse"
                @update:limit="$emit('update:dsLimit', $event)" @next-page="$emit('nextDsPage')"
                @prev-page="$emit('prevDsPage')" />
        </div>

        <!-- Vertical Resizer Handle (Between DataStores & Keys) -->
        <div v-if="!isDsCollapsed" class="height-resizer" @mousedown="startHeightResize"
            title="Drag to resize DataStores height">
            <div class="resizer-line"></div>
        </div>

        <!-- Bottom Section: KeysList -->
        <div class="section-bottom">
            <KeysList :selected-ds="selectedDs" :keys="keys" :loading-keys="loadingKeys" :loading-data="loadingData"
                :selected-key="selectedKey" :key-search-query="keySearchQuery" :limit="keyLimit"
                :next-page-token="keyNextPageToken" :has-prev-page="keyHasPrevPage" :page-number="keyPageNumber"
                @update:key-search-query="$emit('update:keySearchQuery', $event)"
                @select-key="$emit('select-key', $event)" @delete-key="$emit('delete-key', $event)"
                @update:limit="$emit('update:keyLimit', $event)" @next-page="$emit('nextKeyPage')"
                @prev-page="$emit('prevKeyPage')" />
        </div>

        <!-- Horizontal Resizer Handle (Card Width) -->
        <div class="width-resizer" @mousedown="startWidthResize" title="Drag to resize card width"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

defineProps({
    datastores: { type: Array, default: () => [] },
    loadingDs: { type: Boolean, default: false },
    loadingKeys: { type: Boolean, default: false },
    loadingData: { type: Boolean, default: false },
    selectedDs: { type: String, default: '' },
    keys: { type: Array, default: () => [] },
    selectedKey: { type: String, default: '' },
    keySearchQuery: { type: String, default: '' },
    dsLimit: { type: Number, default: 10 },
    dsNextPageToken: { type: String, default: null },
    dsHasPrevPage: { type: Boolean, default: false },
    dsPageNumber: { type: Number, default: 1 },
    keyLimit: { type: Number, default: 10 },
    keyNextPageToken: { type: String, default: null },
    keyHasPrevPage: { type: Boolean, default: false },
    keyPageNumber: { type: Number, default: 1 }
});

defineEmits([
    'refresh-ds',
    'select-ds',
    'delete-ds',
    'update:keySearchQuery',
    'select-key',
    'delete-key',
    'update:dsLimit',
    'nextDsPage',
    'prevDsPage',
    'update:keyLimit',
    'nextKeyPage',
    'prevKeyPage'
]);

// Layout & Resizing States
const panelWidth = ref(340);
const isWidthResizing = ref(false);

const dsHeightPercent = ref(30); // Default 30% top, 70% bottom
const isDsCollapsed = ref(false);
const isHeightResizing = ref(false);

const topSectionStyle = computed(() => {
    if (isDsCollapsed.value) {
        return { height: 'auto', flex: 'none' };
    }
    return { height: `${dsHeightPercent.value}%` };
});

const toggleDsCollapse = () => {
    isDsCollapsed.value = !isDsCollapsed.value;
};

// --- Height Resizing Logic ---
let containerInitialY = 0;
let containerInitialHeight = 0;

const startHeightResize = (e) => {
    isHeightResizing.value = true;
    const cardEl = e.target.closest('.card-panel');
    if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        containerInitialY = rect.top;
        containerInitialHeight = rect.height;
    }
    window.addEventListener('mousemove', handleHeightResize);
    window.addEventListener('mouseup', stopHeightResize);
};

const handleHeightResize = (e) => {
    if (!isHeightResizing.value || containerInitialHeight <= 0) return;
    const relativeY = e.clientY - containerInitialY;
    let newPercent = (relativeY / containerInitialHeight) * 100;
    newPercent = Math.max(15, Math.min(newPercent, 75)); // Limit between 15% and 75%
    dsHeightPercent.value = Math.round(newPercent);
};

const stopHeightResize = () => {
    isHeightResizing.value = false;
    window.removeEventListener('mousemove', handleHeightResize);
    window.removeEventListener('mouseup', stopHeightResize);
};

// --- Width Resizing Logic ---
let startX = 0;
let initialWidth = 0;

const startWidthResize = (e) => {
    isWidthResizing.value = true;
    startX = e.clientX;
    initialWidth = panelWidth.value;
    window.addEventListener('mousemove', handleWidthResize);
    window.addEventListener('mouseup', stopWidthResize);
};

const handleWidthResize = (e) => {
    if (!isWidthResizing.value) return;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(240, Math.min(initialWidth + deltaX, 600)); // Limit between 240px and 600px
    panelWidth.value = newWidth;
};

const stopWidthResize = () => {
    isWidthResizing.value = false;
    window.removeEventListener('mousemove', handleWidthResize);
    window.removeEventListener('mouseup', stopWidthResize);
};
</script>

<style scoped>
.card-panel {
    background: #f8fafc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    gap: 6px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
}

.section-top {
    min-height: 40px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.height-resizer {
    height: 8px;
    margin: 2px 0;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.resizer-line {
    width: 36px;
    height: 4px;
    background: #cbd5e1;
    border-radius: 2px;
    transition: background 0.15s ease;
}

.height-resizer:hover .resizer-line {
    background: #3b82f6;
}

.section-bottom {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.width-resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    transition: background 0.15s ease;
}

.width-resizer:hover {
    background: rgba(59, 130, 246, 0.4);
}
</style>
