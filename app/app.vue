<template>
    <div class="dashboard">
        <div class="header">
            <h2>Roblox DataStore Dashboard</h2>
            <button @click="showSettings = !showSettings" class="btn">
                {{ showSettings ? 'ปิดตั้งค่า' : 'ตั้งค่า API' }}
            </button>
        </div>

        <!-- ฟอร์มตั้งค่า API (จะแสดงเมื่อกดปุ่ม) -->
        <div v-if="showSettings || !hasCredentials" class="settings-box">
            <h3>ตั้งค่าระบบ (SQLite)</h3>

            <div class="universe-list" v-if="universes.length">
                <h4>Saved Universes</h4>
                <ul>
                    <li v-for="u in universes" :key="u.id" :class="{ active: u.is_active === 1 }">
                        <div>
                            <strong>{{ u.name || 'Unnamed' }}</strong> ({{ u.universe_id }})
                        </div>
                        <div class="actions">
                            <button v-if="u.is_active !== 1" @click="setActiveUniverse(u.id)"
                                class="btn-small btn-primary">Set Active</button>
                            <span v-else class="active-badge">Active</span>
                            <button @click="deleteUniverse(u.id)" class="btn-small btn-danger">Delete</button>
                        </div>
                    </li>
                </ul>
            </div>

            <hr>
            <h4>Add New Universe</h4>
            <div class="form-group">
                <label>Name (Optional):</label>
                <input v-model="settingsForm.name" type="text" placeholder="My Game">
            </div>
            <div class="form-group">
                <label>Universe ID:</label>
                <input v-model="settingsForm.universe_id" type="text" placeholder="ตัวเลข Universe ID">
            </div>
            <div class="form-group">
                <label>API Key:</label>
                <input v-model="settingsForm.api_key" type="password" placeholder="ใส่ Roblox Open Cloud API Key">
            </div>
            <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'กำลังบันทึก...' : 'เพิ่มและตั้งเป็น Active' }}
            </button>
            <p v-if="saveMessage" class="msg">{{ saveMessage }}</p>
        </div>

        <hr v-if="hasCredentials">

        <!-- ส่วนแสดงผล DataStore -->
        <div v-if="hasCredentials && !showSettings" class="container">
            <!-- กล่อง DataStores -->
            <div class="box">
                <h3>DataStores <button @click="fetchDataStores" class="btn-small">รีเฟรช</button></h3>
                <ul v-if="datastores.length">
                    <li v-for="ds in datastores" :key="ds.name" :class="{ active: selectedDs === ds.name }">
                        <div @click="fetchKeys(ds.name)" style="flex:1">{{ ds.name }}</div>
                        <button @click.stop="deleteDataStore(ds.name)" class="btn-small btn-danger"
                            title="Delete DataStore">🗑️</button>
                    </li>
                </ul>
                <div v-else-if="loadingDs" class="loading-state">Loading DataStores...</div>
                <div v-else class="empty-state">No DataStores found.</div>
            </div>

            <!-- กล่อง Keys -->
            <div class="box">
                <h3>
                    <span>Keys in "{{ selectedDs || '...' }}"</span>
                    <span v-if="keys.length" class="count-badge">
                        {{ keySearchQuery ? `${filteredKeys.length}/${keys.length}` : keys.length }}
                    </span>
                </h3>

                <!-- กล่องค้นหา Key -->
                <div v-if="selectedDs && keys.length" class="search-box">
                    <input v-model="keySearchQuery" type="text" placeholder="🔍 ค้นหา Key..." class="search-input">
                    <button v-if="keySearchQuery" @click="keySearchQuery = ''" class="btn-clear"
                        title="ล้างคำค้นหา">✕</button>
                </div>

                <ul v-if="filteredKeys.length">
                    <li v-for="k in filteredKeys" :key="k.key" :class="{ active: selectedKey === k.key }">
                        <div @click="fetchData(k.key)" style="flex:1; word-break: break-all;">
                            <span v-html="highlightMatch(k.key, keySearchQuery)"></span>
                        </div>
                        <button @click.stop="deleteKey(k.key)" class="btn-small btn-danger"
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

            <!-- กล่อง Data Editor -->
            <div class="box data-box">
                <h3>Data for "{{ selectedKey || '...' }}"</h3>
                <div v-if="loadingData" class="loading-state">Loading data...</div>
                <div v-else-if="selectedKey" class="editor-wrapper">
                    <!-- Tab Selector -->
                    <div class="editor-tabs">
                        <button @click="editorMode = 'json'" :class="{ active: editorMode === 'json' }">
                            📝 JSON Editor
                        </button>
                        <button @click="editorMode = 'gui'" :class="{ active: editorMode === 'gui' }">
                            📋 GUI Form
                        </button>
                    </div>

                    <!-- JSON Editor View with Syntax Highlighting -->
                    <div v-if="editorMode === 'json'" class="editor-content">
                        <!-- Toolbar -->
                        <div class="json-toolbar">
                            <div class="toolbar-left">
                                <button class="btn-tool" @click="formatJson" title="Format JSON (Indent 4 spaces)">
                                    ✨ Format
                                </button>
                                <button class="btn-tool" @click="minifyJson" title="Minify JSON">
                                    📦 Minify
                                </button>
                                <button class="btn-tool" @click="copyJson" title="Copy to clipboard">
                                    📋 Copy
                                </button>
                                <button class="btn-tool" :class="{ active: jsonViewMode === 'preview' }"
                                    @click="toggleJsonViewMode">
                                    {{ jsonViewMode === 'editor' ? '👁️ Preview' : '✏️ Edit' }}
                                </button>
                            </div>
                            <div class="toolbar-right">
                                <span v-if="jsonValidation.valid" class="badge-valid">
                                    ✅ Valid JSON
                                </span>
                                <span v-else class="badge-invalid" :title="jsonValidation.error">
                                    ⚠️ Syntax Error
                                </span>
                            </div>
                        </div>

                        <!-- Error Banner if invalid -->
                        <div v-if="!jsonValidation.valid" class="syntax-error-banner">
                            {{ jsonValidation.error }}
                        </div>

                        <!-- Editable Code Area with Syntax Highlighting Overlay -->
                        <div v-show="jsonViewMode === 'editor'" class="code-editor-container">
                            <pre ref="preRef" class="code-highlight"
                                aria-hidden="true"><code v-html="highlightedJson + '\n'"></code></pre>
                            <textarea ref="textareaRef" v-model="jsonTextData" class="code-textarea" spellcheck="false"
                                placeholder="Enter JSON here..." @scroll="syncScroll"
                                @keydown.tab.prevent="insertTab"></textarea>
                        </div>

                        <!-- Read-only Highlighted Preview with Line Numbers -->
                        <div v-show="jsonViewMode === 'preview'" class="code-preview-container">
                            <pre class="code-preview"><code v-html="highlightedJson"></code></pre>
                        </div>
                    </div>

                    <!-- GUI Form View -->
                    <div v-if="editorMode === 'gui'" class="editor-content gui-editor">
                        <div v-if="isObjectData" class="gui-fields">
                            <div v-for="(val, key) in guiData" :key="key" class="gui-field-row">
                                <div class="field-info">
                                    <label class="field-key">{{ key }}</label>
                                    <span class="field-type-badge">{{ typeof val }}</span>
                                </div>
                                <div class="field-input-wrapper">
                                    <input v-if="typeof val === 'number'" type="number" v-model.number="guiData[key]"
                                        class="gui-input">
                                    <input v-else-if="typeof val === 'boolean'" type="checkbox" v-model="guiData[key]"
                                        class="gui-checkbox">
                                    <input v-else-if="typeof val === 'string'" type="text" v-model="guiData[key]"
                                        class="gui-input">
                                    <textarea v-else-if="typeof val === 'object'" :value="JSON.stringify(val)"
                                        @change="e => updateObjectField(key, e.target.value)" class="gui-textarea"
                                        rows="2"></textarea>
                                    <input v-else type="text" v-model="guiData[key]" class="gui-input">
                                </div>
                                <button @click="deleteGuiField(key)" class="btn-small btn-danger field-delete-btn"
                                    title="Delete field">✕</button>
                            </div>

                            <!-- Add new property row -->
                            <div class="gui-add-row">
                                <h5>+ เพิ่ม Property ใหม่</h5>
                                <div class="add-inputs">
                                    <input v-model="newField.key" type="text" placeholder="Key name"
                                        class="gui-input-small">
                                    <select v-model="newField.type" class="gui-select">
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                    <input v-if="newField.type === 'number'" v-model.number="newField.value"
                                        type="number" placeholder="0" class="gui-input-small">
                                    <select v-else-if="newField.type === 'boolean'" v-model="newField.value"
                                        class="gui-select">
                                        <option :value="true">true</option>
                                        <option :value="false">false</option>
                                    </select>
                                    <input v-else v-model="newField.value" type="text" placeholder="Value"
                                        class="gui-input-small">
                                    <button @click="addGuiField" class="btn-small btn-primary">Add</button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="gui-simple">
                            <label>Primitive Value ({{ typeof guiData }}):</label>
                            <input type="text" v-model="guiData" class="gui-input">
                        </div>
                    </div>

                    <!-- Save Action Button -->
                    <div class="editor-actions">
                        <button @click="saveData" class="btn btn-primary btn-save"
                            :disabled="savingData || (editorMode === 'json' && !jsonValidation.valid)">
                            {{ savingData ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล (Save Data)' }}
                        </button>
                        <span v-if="saveDataMessage" class="save-status-msg">{{ saveDataMessage }}</span>
                    </div>
                </div>
                <div v-else class="empty-state">Select a Key to view and edit data</div>
            </div>
        </div>
    </div>
</template>

<script setup>
const showSettings = ref(false);
const saving = ref(false);
const saveMessage = ref('');
const settingsForm = ref({ name: '', universe_id: '', api_key: '' });
const universes = ref([]);
const activeUniverse = ref(null);

const hasCredentials = computed(() => !!activeUniverse.value);

const datastores = ref([]);
const keys = ref([]);
const keySearchQuery = ref('');
const selectedDs = ref('');
const selectedKey = ref('');
const selectedData = ref(null);

const filteredKeys = computed(() => {
    if (!keySearchQuery.value.trim()) return keys.value;
    const q = keySearchQuery.value.toLowerCase().trim();
    return keys.value.filter(k => k.key.toLowerCase().includes(q));
});

const highlightMatch = (text, query) => {
    if (!query || !query.trim()) return text;
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="highlight-text">$1</mark>');
};

// Editor states
const editorMode = ref('json');
const jsonViewMode = ref('editor'); // 'editor' | 'preview'
const jsonTextData = ref('');
const guiData = ref(null);
const savingData = ref(false);
const saveDataMessage = ref('');

const textareaRef = ref(null);
const preRef = ref(null);

const newField = ref({ key: '', type: 'string', value: '' });

const loadingDs = ref(false);
const loadingKeys = ref(false);
const loadingData = ref(false);

const isObjectData = computed(() => guiData.value !== null && typeof guiData.value === 'object' && !Array.isArray(guiData.value));

// Real-time JSON validation
const jsonValidation = computed(() => {
    if (!jsonTextData.value.trim()) return { valid: true, error: '' };
    try {
        JSON.parse(jsonTextData.value);
        return { valid: true, error: '' };
    } catch (err) {
        return { valid: false, error: err.message };
    }
});

// JSON Syntax Highlighting Tokenizer
const highlightedJson = computed(() => {
    const text = jsonTextData.value;
    if (!text) return '';

    // Escape HTML special characters
    const htmlEscaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Regex tokenizer for JSON elements
    return htmlEscaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g,
        (match) => {
            if (/^"/.test(match)) {
                if (/:$/.test(match.trim())) {
                    const colonIndex = match.lastIndexOf(':');
                    const keyPart = match.slice(0, colonIndex);
                    const colonPart = match.slice(colonIndex);
                    return `<span class="hl-key">${keyPart}</span><span class="hl-punct">${colonPart}</span>`;
                }
                return `<span class="hl-string">${match}</span>`;
            }
            if (/true|false/.test(match)) {
                return `<span class="hl-bool">${match}</span>`;
            }
            if (/null/.test(match)) {
                return `<span class="hl-null">${match}</span>`;
            }
            if (/^-?\d/.test(match)) {
                return `<span class="hl-number">${match}</span>`;
            }
            if (/[{}[\],:]/.test(match)) {
                return `<span class="hl-punct">${match}</span>`;
            }
            return match;
        }
    );
});

// Synchronize scroll between textarea and highlighted <pre>
const syncScroll = () => {
    if (textareaRef.value && preRef.value) {
        preRef.value.scrollTop = textareaRef.value.scrollTop;
        preRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
};

// Handle Tab key inside textarea
const insertTab = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const spaces = '    ';
    jsonTextData.value = jsonTextData.value.substring(0, start) + spaces + jsonTextData.value.substring(end);
    nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        syncScroll();
    });
};

// Format / Prettify JSON
const formatJson = () => {
    try {
        const parsed = JSON.parse(jsonTextData.value);
        jsonTextData.value = JSON.stringify(parsed, null, 4);
        nextTick(syncScroll);
    } catch (err) {
        alert("ไม่สามารถจัดรูปแบบได้: ไวยากรณ์ JSON ไม่ถูกต้อง\n" + err.message);
    }
};

// Minify JSON
const minifyJson = () => {
    try {
        const parsed = JSON.parse(jsonTextData.value);
        jsonTextData.value = JSON.stringify(parsed);
        nextTick(syncScroll);
    } catch (err) {
        alert("ไม่สามารถย่อได้: ไวยากรณ์ JSON ไม่ถูกต้อง\n" + err.message);
    }
};

// Copy JSON to clipboard
const copyJson = async () => {
    try {
        await navigator.clipboard.writeText(jsonTextData.value);
        alert("คัดลอก JSON เรียบร้อยแล้ว!");
    } catch {
        alert("ไม่สามารถคัดลอกได้");
    }
};

const toggleJsonViewMode = () => {
    jsonViewMode.value = jsonViewMode.value === 'editor' ? 'preview' : 'editor';
    if (jsonViewMode.value === 'editor') {
        nextTick(syncScroll);
    }
};

// GUI Form Helpers
const deleteGuiField = (key) => {
    if (confirm(`ลบฟิลด์ "${key}" หรือไม่?`)) {
        delete guiData.value[key];
        jsonTextData.value = JSON.stringify(guiData.value, null, 4);
    }
};

const addGuiField = () => {
    if (!newField.value.key.trim()) return;
    let val = newField.value.value;
    if (newField.value.type === 'number') val = Number(val) || 0;
    if (newField.value.type === 'boolean') val = Boolean(val);
    guiData.value[newField.value.key.trim()] = val;
    jsonTextData.value = JSON.stringify(guiData.value, null, 4);
    newField.value = { key: '', type: 'string', value: '' };
};

const updateObjectField = (key, text) => {
    try {
        guiData.value[key] = JSON.parse(text);
        jsonTextData.value = JSON.stringify(guiData.value, null, 4);
    } catch {
        // keep as is
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
            } else {
                showSettings.value = true;
            }
        }
    } catch (err) {
        console.error('Failed to load settings');
    }
};

const saveSettings = async () => {
    if (!settingsForm.value.universe_id || !settingsForm.value.api_key) {
        saveMessage.value = 'กรุณากรอกข้อมูลให้ครบ';
        return;
    }
    saving.value = true;
    saveMessage.value = '';
    try {
        await $fetch('/api/settings', {
            method: 'POST',
            body: { action: 'add', ...settingsForm.value }
        });
        saveMessage.value = 'เพิ่มสำเร็จ!';
        settingsForm.value = { name: '', universe_id: '', api_key: '' };
        await loadSettings();
    } catch (err) {
        saveMessage.value = 'เกิดข้อผิดพลาดในการบันทึก';
    } finally {
        saving.value = false;
        setTimeout(() => saveMessage.value = '', 3000);
    }
};

const setActiveUniverse = async (id) => {
    await $fetch('/api/settings', { method: 'POST', body: { action: 'set_active', id } });
    await loadSettings();
};

const deleteUniverse = async (id) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Universe นี้?")) {
        await $fetch('/api/settings', { method: 'POST', body: { action: 'delete', id } });
        await loadSettings();
    }
};

const fetchDataStores = async () => {
    loadingDs.value = true;
    try {
        const res = await $fetch('/api/datastores');
        datastores.value = res.datastores || [];
    } catch (err) {
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
        } catch (err) {
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
    } catch (err) {
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
        } catch (err) {
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
        nextTick(syncScroll);
    } catch (err) {
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
            if (!jsonValidation.value.valid) {
                alert("กรุณาแก้ไขไวยากรณ์ JSON ให้ถูกต้องก่อนบันทึก:\n" + jsonValidation.value.error);
                savingData.value = false;
                return;
            }
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
.dashboard {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 20px;
    background: #f4f4f9;
    min-height: 100vh;
    color: #333;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 24px;
    color: #1a202c;
}

.settings-box {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    max-width: 400px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.btn {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #6c757d;
    color: white;
}

.btn-primary {
    background: #007bff;
}

.btn:hover {
    opacity: 0.9;
}

.btn-small {
    padding: 3px 8px;
    font-size: 12px;
    float: right;
}

.msg {
    color: green;
    margin-top: 10px;
}

hr {
    border: 0;
    border-top: 1px solid #ddd;
    margin: 20px 0;
}

.container {
    display: flex;
    gap: 20px;
}

.box {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    flex: 1;
    height: 75vh;
    overflow-y: auto;
}

.data-box {
    flex: 2;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
}

li:hover {
    background: #e0f7fa;
}

li.active {
    background: #b2ebf2;
    font-weight: bold;
}

h3 {
    margin-top: 0;
    border-bottom: 2px solid #007bff;
    padding-bottom: 5px;
}

pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    white-space: pre-wrap;
}
</style>