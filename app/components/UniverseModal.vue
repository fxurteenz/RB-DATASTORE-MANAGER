<template>
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-box">
            <div class="modal-header">
                <h4>{{ editingUniverseId ? '✏️ Edit Universe' : '➕ Add Universe' }}</h4>
                <button class="btn-icon" @click="$emit('close')">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Name (Optional):</label>
                    <input :value="settingsForm.name" @input="updateFormField('name', $event.target.value)" type="text"
                        placeholder="My Game" class="modal-input">
                </div>
                <div class="form-group">
                    <label>Universe ID: <span class="required">*</span></label>
                    <input :value="settingsForm.universe_id"
                        @input="updateFormField('universe_id', $event.target.value)" type="text"
                        placeholder="ตัวเลข Universe ID" class="modal-input">
                </div>
                <div class="form-group">
                    <label>API Key: <span v-if="!editingUniverseId" class="required">*</span></label>
                    <div class="password-input-wrapper">
                        <input :value="settingsForm.api_key" @input="updateFormField('api_key', $event.target.value)"
                            :type="showApiKey ? 'text' : 'password'"
                            :placeholder="editingUniverseId ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยน API Key' : 'ใส่ Roblox Open Cloud API Key'"
                            class="api-key-input modal-input">
                        <button type="button" class="btn-eye" title="กดคลิกค้างไว้เพื่อดู API Key"
                            @mousedown="$emit('update:showApiKey', true)" @mouseup="$emit('update:showApiKey', false)"
                            @mouseleave="$emit('update:showApiKey', false)"
                            @touchstart.passive="$emit('update:showApiKey', true)"
                            @touchend="$emit('update:showApiKey', false)"
                            @touchcancel="$emit('update:showApiKey', false)">
                            <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                                <path
                                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                                <line x1="2" y1="2" x2="22" y2="22" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p v-if="saveMessage" class="modal-msg">{{ saveMessage }}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="$emit('close')" :disabled="saving">Cancel</button>
                <button class="btn btn-primary" @click="$emit('save')" :disabled="saving">
                    {{ saving ? 'Saving...' : (editingUniverseId ? 'Save Changes' : 'Add Universe') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    editingUniverseId: {
        type: [Number, String, null],
        default: null
    },
    settingsForm: {
        type: Object,
        default: () => ({ name: '', universe_id: '', api_key: '' })
    },
    saving: {
        type: Boolean,
        default: false
    },
    saveMessage: {
        type: String,
        default: ''
    },
    showApiKey: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'close',
    'save',
    'update:settingsForm',
    'update:showApiKey'
]);

const updateFormField = (field, val) => {
    emit('update:settingsForm', { ...props.settingsForm, [field]: val });
};
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-box {
    background: white;
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h4 {
    margin: 0;
    font-size: 16px;
    color: #0f172a;
    font-weight: 700;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
}

.required {
    color: #ef4444;
}

.modal-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

.password-input-wrapper {
    position: relative;
}

.password-input-wrapper .api-key-input {
    padding-right: 40px;
}

.btn-eye {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
}

.btn-eye:hover {
    color: #0f172a;
    background: #f1f5f9;
}

.btn-icon {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px 8px;
    border-radius: 4px;
}

.btn-icon:hover {
    color: #0f172a;
    background: #f1f5f9;
}

.modal-msg {
    margin-top: 12px;
    font-size: 13px;
    color: #ef4444;
}

.modal-footer {
    padding: 12px 20px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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

.btn-secondary {
    background: #e2e8f0;
    color: #334155;
}

.btn-secondary:hover:not(:disabled) {
    background: #cbd5e1;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
