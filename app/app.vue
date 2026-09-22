<template>
    <div class="app-layout" :class="{ 'is-resizing': isResizing }">
        <!-- SideNav (Left) -->
        <SideNav :sidenav-width="sidenavWidth" :is-collapsed="isCollapsed" :universes="universes"
            :editing-universe-id="editingUniverseId" @toggle-collapse="toggleCollapse" @start-resize="startResize"
            @open-add-modal="openAddUniverseModal" @open-edit-modal="openEditUniverseModal"
            @open-delete-modal="openDeleteUniverseModal" @set-active-universe="setActiveUniverse" />

        <!-- Main Content Area (Right) -->
        <main class="main-panel">
            <header class="main-header">
                <h2>Roblox DataStore Dashboard</h2>
                <div v-if="activeUniverse" class="active-universe-badge">
                    <span class="status-pulse"></span>
                    <span>Active: <strong>{{ activeUniverse.name || 'Unnamed' }}</strong> ({{ activeUniverse.universe_id
                    }})</span>
                </div>
            </header>

            <!-- Dashboard Content when active universe is available -->
            <div v-if="hasCredentials" class="container">
                <!-- DataStores Column -->
                <DataStoresList :datastores="datastores" :loading-ds="loadingDs" :selected-ds="selectedDs"
                    @refresh="fetchDataStores" @select-ds="fetchKeys" @delete-ds="deleteDataStore" />

                <!-- Keys Column -->
                <KeysList :selected-ds="selectedDs" :keys="keys" :loading-keys="loadingKeys" :selected-key="selectedKey"
                    v-model:key-search-query="keySearchQuery" @select-key="fetchData" @delete-key="deleteKey" />

                <!-- Data Editor Column -->
                <DataEditor :selected-key="selectedKey" :loading-data="loadingData" :selected-data="selectedData"
                    v-model:editor-mode="editorMode" v-model:json-text-data="jsonTextData" v-model:gui-data="guiData"
                    :saving-data="savingData" :save-data-message="saveDataMessage" @save-data="saveData" />
            </div>

            <!-- Empty Credentials State -->
            <div v-else class="empty-credentials-state">
                <div class="empty-card">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                        style="margin-bottom: 12px; color: #94a3b8;">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                    </svg>
                    <h3>No Active Universe Selected</h3>
                    <p>Please select an existing Universe or add a new one from the sidebar.</p>
                    <button class="btn btn-primary" @click="openAddUniverseModal">+ Add Universe</button>
                </div>
            </div>
        </main>

        <!-- Universe Form Modal (Add / Edit) -->
        <UniverseModal :show="showUniverseModal" :editing-universe-id="editingUniverseId"
            v-model:settings-form="settingsForm" v-model:show-api-key="showApiKey" :saving="saving"
            :save-message="saveMessage" @close="closeUniverseModal" @save="saveUniverseFromModal" />

        <!-- Delete Confirmation Modal -->
        <DeleteUniverseModal :show="showDeleteUniverseModal" :universe-to-delete="universeToDelete"
            :deleting-universe="deletingUniverse" @close="closeDeleteUniverseModal" @confirm="confirmDeleteUniverse" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// SideNav State & Resizing
const sidenavWidth = ref(280);
const isCollapsed = ref(false);
const isResizing = ref(false);

const startResize = () => {
    isResizing.value = true;
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
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
};

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    if (!isCollapsed.value && sidenavWidth.value < 180) {
        sidenavWidth.value = 280;
    }
};

// Universe Modals State
const showUniverseModal = ref(false);
const showDeleteUniverseModal = ref(false);
const universeToDelete = ref(null);
const deletingUniverse = ref(false);

const saving = ref(false);
const saveMessage = ref('');
const settingsForm = ref({ name: '', universe_id: '', api_key: '' });
const editingUniverseId = ref(null);
const showApiKey = ref(false);

const universes = ref([]);
const activeUniverse = ref(null);

const hasCredentials = computed(() => !!activeUniverse.value);

// DataStores & Keys State
const datastores = ref([]);
const loadingDs = ref(false);
const selectedDs = ref('');

const keys = ref([]);
const keySearchQuery = ref('');
const loadingKeys = ref(false);
const selectedKey = ref('');

// Data Editor State
const selectedData = ref(null);
const loadingData = ref(false);
const editorMode = ref('json');
const jsonTextData = ref('');
const guiData = ref(null);
const savingData = ref(false);
const saveDataMessage = ref('');

// Universe Handlers
const openAddUniverseModal = () => {
    editingUniverseId.value = null;
    settingsForm.value = { name: '', universe_id: '', api_key: '' };
    saveMessage.value = '';
    showUniverseModal.value = true;
};

const openEditUniverseModal = (u) => {
    editingUniverseId.value = u.id;
    settingsForm.value = {
        name: u.name || '',
        universe_id: u.universe_id || '',
        api_key: u.api_key || '',
    };
    saveMessage.value = '';
    showUniverseModal.value = true;
};

const closeUniverseModal = () => {
    showUniverseModal.value = false;
    editingUniverseId.value = null;
    settingsForm.value = { name: '', universe_id: '', api_key: '' };
    saveMessage.value = '';
};

const openDeleteUniverseModal = (u) => {
    universeToDelete.value = u;
    showDeleteUniverseModal.value = true;
};

const closeDeleteUniverseModal = () => {
    showDeleteUniverseModal.value = false;
    universeToDelete.value = null;
};

const confirmDeleteUniverse = async () => {
    if (!universeToDelete.value) return;
    deletingUniverse.value = true;
    try {
        await $fetch('/api/settings', {
            method: 'POST',
            body: { action: 'delete', id: universeToDelete.value.id }
        });
        closeDeleteUniverseModal();
        await loadSettings();
    } catch {
        alert("เกิดข้อผิดพลาดในการลบ Universe");
    } finally {
        deletingUniverse.value = false;
    }
};

const saveUniverseFromModal = async () => {
    if (!settingsForm.value.universe_id) {
        saveMessage.value = 'กรุณากรอก Universe ID';
        return;
    }
    saving.value = true;
    saveMessage.value = '';
    try {
        if (editingUniverseId.value) {
            await $fetch('/api/settings', {
                method: 'POST',
                body: {
                    action: 'update',
                    id: editingUniverseId.value,
                    ...settingsForm.value
                }
            });
            saveMessage.value = 'บันทึกการแก้ไขสำเร็จ!';
            editingUniverseId.value = null;
            closeUniverseModal();
        } else {
            if (!settingsForm.value.api_key) {
                saveMessage.value = 'กรุณากรอก API Key';
                saving.value = false;
                return;
            }
            await $fetch('/api/settings', {
                method: 'POST',
                body: { action: 'add', ...settingsForm.value }
            });
            saveMessage.value = 'เพิ่มสำเร็จ!';
            closeUniverseModal();
        }
        settingsForm.value = { name: '', universe_id: '', api_key: '' };
        await loadSettings();
    } catch (err) {
        saveMessage.value = 'เกิดข้อผิดพลาดในการบันทึก: ' + (err.data?.message || err.message);
    } finally {
        saving.value = false;
        setTimeout(() => saveMessage.value = '', 3500);
    }
};

const loadSettings = async () => {
    try {
        const res = await $fetch('/api/settings');
        if (res) {
            universes.value = res.universes || [];
            activeUniverse.value = res.active_universe || null;

            if (hasCredentials.value) {
                fetchDataStores();
            }
        }
    } catch (err) {
        console.error('Failed to load settings', err);
    }
};

const setActiveUniverse = async (id) => {
    await $fetch('/api/settings', { method: 'POST', body: { action: 'set_active', id } });
    await loadSettings();
};

const fetchDataStores = async () => {
    loadingDs.value = true;
    try {
        const res = await $fetch('/api/datastores');
        datastores.value = res.datastores || [];
    } catch {
        alert("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบ API Key");
    } finally {
        loadingDs.value = false;
    }
};

const deleteDataStore = async (dsName) => {
    if (confirm(`คุณต้องการลบ DataStore "${dsName}" หรือไม่?\n(ระบบจะกำหนดตารางเวลาลบถาวรใน 30 วันและไม่สามารถเข้าถึงได้ระหว่างนี้)`)) {
        try {
            await $fetch(`/api/datastores/${encodeURIComponent(dsName)}`, { method: 'DELETE' });
            alert(`DataStore "${dsName}" ถูกกำหนดเวลาลบเรียบร้อยแล้ว`);
            fetchDataStores();
        } catch {
            alert("ไม่สามารถลบ DataStore ได้");
        }
    }
};

const fetchKeys = async (dsName) => {
    selectedDs.value = dsName;
    selectedKey.value = '';
    selectedData.value = null;
    keySearchQuery.value = '';
    keys.value = [];
    loadingKeys.value = true;
    try {
        const res = await $fetch(`/api/datastores/${encodeURIComponent(dsName)}/keys`);
        keys.value = res.keys || [];
    } catch {
        alert("Failed to load keys");
    } finally {
        loadingKeys.value = false;
    }
};

const deleteKey = async (keyName) => {
    if (confirm(`คุณต้องการลบ Key "${keyName}" หรือไม่?`)) {
        try {
            await $fetch(`/api/datastores/${encodeURIComponent(selectedDs.value)}/${encodeURIComponent(keyName)}`, { method: 'DELETE' });
            alert("ลบ Key สำเร็จแล้ว");
            if (selectedKey.value === keyName) selectedKey.value = '';
            fetchKeys(selectedDs.value);
        } catch {
            alert("ไม่สามารถลบ Key ได้");
        }
    }
};

const fetchData = async (keyName) => {
    selectedKey.value = keyName;
    selectedData.value = null;
    loadingData.value = true;
    saveDataMessage.value = '';
    try {
        const res = await $fetch(`/api/datastores/${encodeURIComponent(selectedDs.value)}/${encodeURIComponent(keyName)}`);
        selectedData.value = res;
        jsonTextData.value = JSON.stringify(res, null, 4);
        guiData.value = typeof res === 'object' && res !== null ? JSON.parse(JSON.stringify(res)) : res;
    } catch {
        alert("Failed to load data");
    } finally {
        loadingData.value = false;
    }
};

const saveData = async () => {
    savingData.value = true;
    saveDataMessage.value = '';
    try {
        let payloadToSave;
        if (editorMode.value === 'json') {
            payloadToSave = JSON.parse(jsonTextData.value);
            guiData.value = typeof payloadToSave === 'object' && payloadToSave !== null
                ? JSON.parse(JSON.stringify(payloadToSave))
                : payloadToSave;
        } else {
            payloadToSave = guiData.value;
            jsonTextData.value = JSON.stringify(payloadToSave, null, 4);
        }

        await $fetch(`/api/datastores/${encodeURIComponent(selectedDs.value)}/${encodeURIComponent(selectedKey.value)}`, {
            method: 'POST',
            body: { data: payloadToSave }
        });
        saveDataMessage.value = '✅ บันทึกข้อมูลสำเร็จแล้ว!';
        selectedData.value = payloadToSave;
        setTimeout(() => saveDataMessage.value = '', 3500);
    } catch (err) {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (err.data?.message || err.message));
    } finally {
        savingData.value = false;
    }
};

onMounted(() => {
    loadSettings();
});
</script>

<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f8fafc;
    color: #1e293b;
}

.app-layout.is-resizing {
    user-select: none;
}

.main-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.main-header {
    height: 60px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
}

.main-header h2 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    font-weight: 700;
}

.active-universe-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 9999px;
    color: #334155;
}

.status-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.container {
    flex: 1;
    display: grid;
    grid-template-columns: 260px 280px 1fr;
    gap: 16px;
    padding: 16px;
    overflow-y: auto;
}

.empty-credentials-state {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
}

.empty-card {
    text-align: center;
    background: white;
    padding: 40px 60px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    max-width: 400px;
}

.empty-card h3 {
    margin: 0 0 8px 0;
    color: #0f172a;
}

.empty-card p {
    color: #64748b;
    font-size: 14px;
    margin-bottom: 20px;
}

.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: #2563eb;
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
}
</style>
