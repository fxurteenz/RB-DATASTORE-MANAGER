<template>
    <aside class="sidenav" :class="{ collapsed: isCollapsed }"
        :style="{ width: isCollapsed ? '60px' : `${sidenavWidth}px` }">
        <div class="sidenav-header">
            <div v-if="!isCollapsed" class="sidenav-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                </svg>
                <span>Universes</span>
            </div>
            <button class="btn-icon btn-toggle-sidenav" @click="toggleCollapse"
                :title="isCollapsed ? 'Expand SideNav' : 'Collapse SideNav'">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path v-if="!isCollapsed" d="m15 18-6-6 6-6" />
                    <path v-else d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>

        <!-- Add Button -->
        <div class="sidenav-actions">
            <button class="btn btn-add-universe" @click="$emit('openAddModal')"
                :title="isCollapsed ? 'Add Universe' : ''">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                </svg>
                <span v-if="!isCollapsed">Add Universe</span>
            </button>
        </div>

        <!-- Saved Universes List -->
        <div class="sidenav-list">
            <ul v-if="universes.length">
                <li v-for="u in universes" :key="u.id" :class="{ active: u.is_active === 1 }"
                    @click="$emit('selectUniverse', u.id)"
                    :title="isCollapsed ? `${u.name || 'Unnamed'} (${u.universe_id})` : ''">

                    <div class="universe-item-content">
                        <span class="active-dot" :class="{ is_active: u.is_active === 1 }"></span>
                        <div v-if="!isCollapsed" class="universe-details">
                            <span class="universe-name">{{ u.name || 'Unnamed' }}</span>
                            <span class="universe-id">ID: {{ u.universe_id }}</span>
                        </div>
                    </div>

                    <div v-if="!isCollapsed" class="universe-item-actions">
                        <button class="btn-icon" @click.stop="$emit('openEditModal', u)" title="Edit Universe">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </button>
                        <button class="btn-icon btn-icon-danger" @click.stop="$emit('openDeleteModal', u)"
                            title="Delete Universe">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>
            <div v-else class="sidenav-empty">
                <span v-if="!isCollapsed">No Universes saved.</span>
            </div>
        </div>

        <!-- Resize Handle -->
        <div class="resizer-handle" @mousedown="startResize" title="Drag to resize SideNav"></div>
    </aside>
</template>

<script setup>
const props = defineProps({
    universes: { type: Array, default: () => [] }
});

const emit = defineEmits([
    'selectUniverse',
    'openAddModal',
    'openEditModal',
    'openDeleteModal',
    'resizingState'
]);

const sidenavWidth = ref(280);
const isCollapsed = ref(false);
const isResizing = ref(false);

const startResize = (e) => {
    isResizing.value = true;
    emit('resizingState', true);
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
};

const handleResize = (e) => {
    if (!isResizing.value) return;
    const newWidth = e.clientX;
    if (newWidth < 140) {
        isCollapsed.value = true;
    } else {
        isCollapsed.value = false;
        sidenavWidth.value = Math.max(180, Math.min(newWidth, 480));
    }
};

const stopResize = () => {
    isResizing.value = false;
    emit('resizingState', false);
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
};

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    if (!isCollapsed.value && sidenavWidth.value < 180) {
        sidenavWidth.value = 280;
    }
};
</script>

<style scoped>
.sidenav {
    height: 100%;
    background: #0f172a;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.05s ease-out;
    position: relative;
}

.sidenav.collapsed {
    width: 60px !important;
}

.sidenav-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #1e293b;
}

.sidenav-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 16px;
    color: #f8fafc;
    white-space: nowrap;
}

.btn-toggle-sidenav {
    color: #94a3b8;
    background: transparent;
}

.btn-toggle-sidenav:hover {
    color: white;
    background: #1e293b;
}

.sidenav-actions {
    padding: 12px;
}

.btn-add-universe {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #2563eb;
    color: white;
    padding: 10px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
}

.btn-add-universe:hover {
    background: #1d4ed8;
}

.sidenav-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.sidenav-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidenav-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;
    color: #cbd5e1;
    transition: all 0.15s ease;
}

.sidenav-list li:hover {
    background: #1e293b;
    color: white;
}

.sidenav-list li.active {
    background: #1e293b;
    color: #60a5fa;
    border-left: 3px solid #3b82f6;
}

.universe-item-content {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
}

.active-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #475569;
    flex-shrink: 0;
}

.active-dot.is_active {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.universe-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.universe-name {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.universe-id {
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.universe-item-actions {
    display: flex;
    gap: 4px;
    opacity: 0.7;
}

.sidenav-list li:hover .universe-item-actions {
    opacity: 1;
}

.sidenav-empty {
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
}

.resizer-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 20;
}

.resizer-handle:hover {
    background: #3b82f6;
}

.btn-icon {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.btn-icon-danger:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
}
</style>
