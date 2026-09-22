<template>
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-box modal-box-sm">
            <div class="modal-header">
                <h4>⚠️ Confirm Deletion</h4>
                <button class="btn-icon" @click="$emit('close')">✕</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this saved universe?</p>
                <div v-if="universeToDelete" class="delete-info-card">
                    <strong>{{ universeToDelete.name || 'Unnamed' }}</strong>
                    <div class="text-sub">Universe ID: {{ universeToDelete.universe_id }}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="$emit('close')" :disabled="deletingUniverse">Cancel</button>
                <button class="btn btn-danger" @click="$emit('confirm')" :disabled="deletingUniverse">
                    {{ deletingUniverse ? 'Deleting...' : 'Delete Universe' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    universeToDelete: {
        type: Object,
        default: null
    },
    deletingUniverse: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close', 'confirm']);
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
    max-width: 400px;
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

.modal-body p {
    margin: 0 0 12px 0;
    color: #334155;
    font-size: 14px;
}

.delete-info-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 6px;
    color: #0f172a;
}

.text-sub {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
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

.btn-secondary {
    background: #e2e8f0;
    color: #334155;
}

.btn-secondary:hover:not(:disabled) {
    background: #cbd5e1;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #dc2626;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
