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
            <div class="form-group">
                <label>Universe ID:</label>
                <input v-model="settingsForm.universe_id" type="text" placeholder="ตัวเลข Universe ID">
            </div>
            <div class="form-group">
                <label>API Key:</label>
                <input v-model="settingsForm.api_key" type="password" placeholder="ใส่ Roblox Open Cloud API Key">
            </div>
            <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
            </button>
            <p v-if="saveMessage" class="msg">{{ saveMessage }}</p>
        </div>

        <hr v-if="hasCredentials">

        <!-- ส่วนแสดงผล DataStore -->
        <div v-if="hasCredentials && !showSettings" class="container">
            <div class="box">
                <h3>DataStores <button @click="fetchDataStores" class="btn-small">รีเฟรช</button></h3>
                <ul v-if="datastores.length">
                    <li v-for="ds in datastores" :key="ds.name" @click="fetchKeys(ds.name)"
                        :class="{ active: selectedDs === ds.name }">
                        {{ ds.name }}
                    </li>
                </ul>
                <div v-else-if="loadingDs">Loading...</div>
                <div v-else>No DataStores found.</div>
            </div>

            <div class="box">
                <h3>Keys in "{{ selectedDs || '...' }}"</h3>
                <ul v-if="keys.length">
                    <li v-for="k in keys" :key="k.key" @click="fetchData(k.key)"
                        :class="{ active: selectedKey === k.key }">
                        {{ k.key }}
                    </li>
                </ul>
                <div v-else-if="loadingKeys">Loading keys...</div>
                <div v-else-if="!selectedDs">Select a DataStore first</div>
                <div v-else>No keys found.</div>
            </div>

            <div class="box data-box">
                <h3>Data for "{{ selectedKey || '...' }}"</h3>
                <div v-if="loadingData">Loading data...</div>
                <pre v-else-if="selectedData">{{ formattedData }}</pre>
                <div v-else>Select a Key to view data</div>
            </div>
        </div>
    </div>
</template>

<script setup>
// import { ref, computed, onMounted } from 'vue';

// --- State ตั้งค่าระบบ ---
const showSettings = ref(false);
const saving = ref(false);
const saveMessage = ref('');
const settingsForm = ref({ universe_id: '', api_key: '' });
const hasCredentials = computed(() => !!settingsForm.value.universe_id && !!settingsForm.value.api_key);

// --- State DataStore ---
const datastores = ref([]);
const keys = ref([]);
const selectedDs = ref('');
const selectedKey = ref('');
const selectedData = ref(null);
const loadingDs = ref(false);
const loadingKeys = ref(false);
const loadingData = ref(false);

const formattedData = computed(() => JSON.stringify(selectedData.value, null, 4));

// 1. โหลดการตั้งค่าจาก SQLite เมื่อเปิดเว็บ
const loadSettings = async () => {
    try {
        const res = await $fetch('/api/settings');
        if (res) {
            settingsForm.value.universe_id = res.universe_id || '';
            settingsForm.value.api_key = res.api_key || '';

            // ถ้ามีข้อมูลครบแล้ว ให้ดึง DataStore ทันที
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

// 2. บันทึกการตั้งค่าลง SQLite
const saveSettings = async () => {
    saving.value = true;
    saveMessage.value = '';
    try {
        await $fetch('/api/settings', {
            method: 'POST',
            body: settingsForm.value
        });
        saveMessage.value = 'บันทึกสำเร็จ!';
        showSettings.value = false; // ซ่อนหน้าตั้งค่า
        fetchDataStores(); // โหลดข้อมูลใหม่
    } catch (err) {
        saveMessage.value = 'เกิดข้อผิดพลาดในการบันทึก';
    } finally {
        saving.value = false;
        setTimeout(() => saveMessage.value = '', 3000);
    }
};

// 3. ฟังก์ชันดึง DataStore
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

// (ฟังก์ชัน fetchKeys และ fetchData เหมือนเดิม)
const fetchKeys = async (dsName) => {
    selectedDs.value = dsName;
    selectedKey.value = '';
    selectedData.value = null;
    keys.value = [];
    loadingKeys.value = true;
    try {
        const res = await $fetch(`/api/datastores/${encodeURIComponent(dsName)}/keys`);
        keys.value = res.keys || [];
    } catch (err) { alert("Failed to load keys"); } finally { loadingKeys.value = false; }
};

const fetchData = async (keyName) => {
    selectedKey.value = keyName;
    selectedData.value = null;
    loadingData.value = true;
    try {
        const res = await $fetch(`/api/datastores/${encodeURIComponent(selectedDs.value)}/${encodeURIComponent(keyName)}`);
        selectedData.value = res;
    } catch (err) { alert("Failed to load data"); } finally { loadingData.value = false; }
};

// ทำงานตอนโหลดหน้าเว็บ
onMounted(() => {
    loadSettings();
});
</script>

<style scoped>
/* สไตล์เดิม เพิ่มเติมส่วนของปุ่มและฟอร์ม */
.dashboard {
    font-family: Arial, sans-serif;
    margin: 20px;
    background: #f4f4f9;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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