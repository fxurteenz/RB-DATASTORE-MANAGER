<template>
    <div class="box data-box">
        <h3>Data for "{{ selectedKey || '...' }}"</h3>
        <div v-if="loadingData" class="loading-state">Loading data...</div>
        <div v-else-if="selectedKey" class="editor-wrapper">
            <!-- Tab Selector -->
            <div class="editor-tabs">
                <button @click="$emit('update:editorMode', 'json')" :class="{ active: editorMode === 'json' }">
                    📝 JSON Editor
                </button>
                <button @click="$emit('update:editorMode', 'gui')" :class="{ active: editorMode === 'gui' }">
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
                    <textarea ref="textareaRef" :value="jsonTextData"
                        @input="$emit('update:jsonTextData', $event.target.value)" class="code-textarea"
                        spellcheck="false" placeholder="Enter JSON here..." @scroll="syncScroll"
                        @keydown.tab.prevent="insertTab"></textarea>
                </div>

                <!-- Read-only Highlighted Preview -->
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
                            <input v-if="typeof val === 'number'" type="number" :value="guiData[key]"
                                @input="updateGuiFieldValue(key, Number($event.target.value))" class="gui-input">
                            <input v-else-if="typeof val === 'boolean'" type="checkbox" :checked="guiData[key]"
                                @change="updateGuiFieldValue(key, $event.target.checked)" class="gui-checkbox">
                            <input v-else-if="typeof val === 'string'" type="text" :value="guiData[key]"
                                @input="updateGuiFieldValue(key, $event.target.value)" class="gui-input">
                            <textarea v-else-if="typeof val === 'object'" :value="JSON.stringify(val)"
                                @change="e => updateObjectField(key, e.target.value)" class="gui-textarea"
                                rows="2"></textarea>
                            <input v-else type="text" :value="guiData[key]"
                                @input="updateGuiFieldValue(key, $event.target.value)" class="gui-input">
                        </div>
                        <button @click="deleteGuiField(key)" class="btn-small btn-danger field-delete-btn"
                            title="Delete field">✕</button>
                    </div>

                    <!-- Add new property row -->
                    <div class="gui-add-row">
                        <h5>+ เพิ่ม Property ใหม่</h5>
                        <div class="add-inputs">
                            <input v-model="newField.key" type="text" placeholder="Key name" class="gui-input-small">
                            <select v-model="newField.type" class="gui-select">
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                            </select>
                            <input v-if="newField.type === 'number'" v-model.number="newField.value" type="number"
                                placeholder="0" class="gui-input-small">
                            <select v-else-if="newField.type === 'boolean'" v-model="newField.value" class="gui-select">
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
                    <input type="text" :value="guiData" @input="$emit('update:guiData', $event.target.value)"
                        class="gui-input">
                </div>
            </div>

            <!-- Save Action Button -->
            <div class="editor-actions">
                <button @click="$emit('save-data')" class="btn btn-primary btn-save"
                    :disabled="savingData || (editorMode === 'json' && !jsonValidation.valid)">
                    {{ savingData ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล (Save Data)' }}
                </button>
                <span v-if="saveDataMessage" class="save-status-msg">{{ saveDataMessage }}</span>
            </div>
        </div>
        <div v-else class="empty-state">Select a Key to view and edit data</div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const props = defineProps({
    selectedKey: {
        type: String,
        default: ''
    },
    loadingData: {
        type: Boolean,
        default: false
    },
    selectedData: {
        type: null,
        default: null
    },
    editorMode: {
        type: String,
        default: 'json'
    },
    jsonTextData: {
        type: String,
        default: ''
    },
    guiData: {
        type: null,
        default: null
    },
    savingData: {
        type: Boolean,
        default: false
    },
    saveDataMessage: {
        type: String,
        default: ''
    }
});

const emit = defineEmits([
    'update:editorMode',
    'update:jsonTextData',
    'update:guiData',
    'save-data'
]);

const jsonViewMode = ref('editor'); // 'editor' | 'preview'
const textareaRef = ref(null);
const preRef = ref(null);

const newField = ref({ key: '', type: 'string', value: '' });

const isObjectData = computed(() => props.guiData !== null && typeof props.guiData === 'object' && !Array.isArray(props.guiData));

// Real-time JSON validation
const jsonValidation = computed(() => {
    if (!props.jsonTextData.trim()) return { valid: true, error: '' };
    try {
        JSON.parse(props.jsonTextData);
        return { valid: true, error: '' };
    } catch (err) {
        return { valid: false, error: err.message };
    }
});

// JSON Syntax Highlighting Tokenizer
const highlightedJson = computed(() => {
    const text = props.jsonTextData;
    if (!text) return '';

    const htmlEscaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

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
            if (/true|false/.test(match)) return `<span class="hl-bool">${match}</span>`;
            if (/null/.test(match)) return `<span class="hl-null">${match}</span>`;
            if (/^-?\d/.test(match)) return `<span class="hl-number">${match}</span>`;
            if (/[{}[\],:]/.test(match)) return `<span class="hl-punct">${match}</span>`;
            return match;
        }
    );
});

const syncScroll = () => {
    if (textareaRef.value && preRef.value) {
        preRef.value.scrollTop = textareaRef.value.scrollTop;
        preRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
};

const insertTab = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const spaces = '    ';
    const updated = props.jsonTextData.substring(0, start) + spaces + props.jsonTextData.substring(end);
    emit('update:jsonTextData', updated);
    nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        syncScroll();
    });
};

const formatJson = () => {
    try {
        const parsed = JSON.parse(props.jsonTextData);
        emit('update:jsonTextData', JSON.stringify(parsed, null, 4));
        nextTick(syncScroll);
    } catch (err) {
        alert("ไม่สามารถจัดรูปแบบได้: ไวยากรณ์ JSON ไม่ถูกต้อง\n" + err.message);
    }
};

const minifyJson = () => {
    try {
        const parsed = JSON.parse(props.jsonTextData);
        emit('update:jsonTextData', JSON.stringify(parsed));
        nextTick(syncScroll);
    } catch (err) {
        alert("ไม่สามารถย่อได้: ไวยากรณ์ JSON ไม่ถูกต้อง\n" + err.message);
    }
};

const copyJson = async () => {
    try {
        await navigator.clipboard.writeText(props.jsonTextData);
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

const updateGuiFieldValue = (key, value) => {
    const updated = { ...props.guiData, [key]: value };
    emit('update:guiData', updated);
    emit('update:jsonTextData', JSON.stringify(updated, null, 4));
};

const deleteGuiField = (key) => {
    if (confirm(`ลบฟิลด์ "${key}" หรือไม่?`)) {
        const updated = { ...props.guiData };
        delete updated[key];
        emit('update:guiData', updated);
        emit('update:jsonTextData', JSON.stringify(updated, null, 4));
    }
};

const addGuiField = () => {
    if (!newField.value.key.trim()) return;
    let val = newField.value.value;
    if (newField.value.type === 'number') val = Number(val) || 0;
    if (newField.value.type === 'boolean') val = Boolean(val);

    const updated = { ...props.guiData, [newField.value.key.trim()]: val };
    emit('update:guiData', updated);
    emit('update:jsonTextData', JSON.stringify(updated, null, 4));
    newField.value = { key: '', type: 'string', value: '' };
};

const updateObjectField = (key, text) => {
    try {
        const parsedObj = JSON.parse(text);
        const updated = { ...props.guiData, [key]: parsedObj };
        emit('update:guiData', updated);
        emit('update:jsonTextData', JSON.stringify(updated, null, 4));
    } catch {
        // preserve current input
    }
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
}

.editor-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.editor-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
}

.editor-tabs button {
    padding: 6px 14px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.editor-tabs button.active {
    background: #2563eb;
    color: white;
}

.json-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    background: #f8fafc;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

.toolbar-left {
    display: flex;
    gap: 6px;
}

.btn-tool {
    padding: 4px 8px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    color: #334155;
    transition: all 0.15s ease;
}

.btn-tool:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
}

.btn-tool.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #2563eb;
}

.badge-valid {
    color: #16a34a;
    font-size: 12px;
    font-weight: 600;
}

.badge-invalid {
    color: #dc2626;
    font-size: 12px;
    font-weight: 600;
}

.syntax-error-banner {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    margin-bottom: 8px;
}

.code-editor-container,
.code-preview-container {
    position: relative;
    height: 360px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    overflow: hidden;
    background: #0f172a;
}

.code-highlight,
.code-textarea,
.code-preview {
    margin: 0;
    padding: 12px;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 13px;
    line-height: 1.5;
    tab-size: 4;
    white-space: pre-wrap;
    word-break: break-all;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
}

.code-highlight {
    position: absolute;
    top: 0;
    left: 0;
    color: #f8fafc;
    pointer-events: none;
    overflow: auto;
    background: transparent;
}

.code-textarea {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    color: transparent;
    caret-color: #38bdf8;
    resize: none;
    border: none;
    outline: none;
    overflow: auto;
}

.code-preview {
    color: #f8fafc;
    overflow: auto;
    background: #0f172a;
}

/* Syntax Highlighting Colors */
:deep(.hl-key) {
    color: #38bdf8;
    font-weight: 600;
}

:deep(.hl-string) {
    color: #4ade80;
}

:deep(.hl-number) {
    color: #facc15;
}

:deep(.hl-bool) {
    color: #f472b6;
    font-weight: 600;
}

:deep(.hl-null) {
    color: #94a3b8;
    font-style: italic;
}

:deep(.hl-punct) {
    color: #94a3b8;
}

/* GUI Editor */
.gui-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.gui-field-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
}

.field-info {
    width: 140px;
    display: flex;
    flex-direction: column;
}

.field-key {
    font-weight: 600;
    font-size: 13px;
    color: #334155;
    word-break: break-all;
}

.field-type-badge {
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
}

.field-input-wrapper {
    flex: 1;
}

.gui-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 13px;
}

.gui-textarea {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
}

.gui-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.gui-add-row {
    margin-top: 12px;
    padding: 12px;
    background: #f1f5f9;
    border-radius: 6px;
}

.gui-add-row h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #334155;
}

.add-inputs {
    display: flex;
    gap: 8px;
    align-items: center;
}

.gui-input-small,
.gui-select {
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 12px;
}

.editor-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
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

.btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.save-status-msg {
    font-size: 13px;
    color: #16a34a;
    font-weight: 500;
}

.loading-state,
.empty-state {
    color: #64748b;
    font-size: 14px;
    text-align: center;
    padding: 20px 0;
}
</style>
