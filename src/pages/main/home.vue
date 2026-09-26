<template>
    <div class="home">
        <h1>首页</h1>
        <el-row :gutter="16">
            <el-col :span="12">
                <el-card>
                    <template #header>通知</template>
                    <el-timeline>
                        <el-timeline-item v-for="item in notices" :key="item.id" :timestamp="item.time"
                            :type="item.type">
                            {{ item.content }}
                        </el-timeline-item>
                    </el-timeline>
                </el-card>
            </el-col>

            <el-col :span="12">
                <el-card>
                    <template #header>快捷操作</template>
                    <div class="switches">
                        <h2>电力开关</h2>
                        <div v-for="area in areas" :key="area" class="switch-item">
                            <span>{{ area }}区电力开关</span>
                            <el-switch v-model="areaPower[area]" />
                        </div>
                        <div class="switch-item">
                            <span class="total-label">总闸开关</span>
                            <el-switch v-model="mainSwitch" active-text="合闸" inactive-text="分闸" />
                        </div>
                    </div>
                    <el-divider />
                    <h2>电费账单</h2>
                    <el-table :data="billData" border show-summary>
                        <el-table-column prop="area" label="区域" />
                        <el-table-column prop="balance" label="账户余额 (￥)" />
                        <el-table-column prop="usedEnergy" label="已使用电量 (kWh)" />
                        <el-table-column prop="monthFee" label="本月电费 (￥)" />
                    </el-table>
                    <el-button type="primary" class="bill-btn" @click="goBill">跳转电费账单</el-button>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const areas = ['A', 'B', 'C', 'D']

// 各区电力开关
const areaPower = reactive({ A: true, B: true, C: true, D: true })

// 总闸开关
const mainSwitch = ref(true)

// 各区电费账单（静态数据）
const billData = [
    { area: 'A区', balance: 320.5, usedEnergy: 156.8, monthFee: 89.6 },
    { area: 'B区', balance: 210.3, usedEnergy: 132.4, monthFee: 76.2 },
    { area: 'C区', balance: 150.0, usedEnergy: 98.6, monthFee: 55.4 },
    { area: 'D区', balance: 88.2, usedEnergy: 71.3, monthFee: 40.8 },
]

function goBill() {
    ElMessageBox.alert('我不是说这是纯前端项目吗，哪儿来的电费账单😅', '提示', {
        confirmButtonText: '确定',
    })
}

const notices = [
    { id: 1, time: '2026-09-26 09:30', type: 'danger', content: 'A区 1301 单元电力异常，请及时处理' },
    { id: 2, time: '2026-09-26 08:15', type: 'warning', content: 'B区 0502 单元电费欠缴，请尽快缴费' },
    { id: 3, time: '2026-09-26 07:42', type: 'info', content: '完成全楼每日例行用电巡检' },
    { id: 4, time: '2026-09-25 22:10', type: 'success', content: 'C区备用电源切换测试通过' },
    { id: 5, time: '2026-09-25 18:05', type: 'warning', content: 'D区本月能耗已超过预警阈值' },
    { id: 6, time: '2026-09-25 12:00', type: 'info', content: '本月电费账单已生成，可前往查看' },
    { id: 7, time: '2026-09-24 16:48', type: 'danger', content: '主变压器温度过高告警（85℃）' },
    { id: 8, time: '2026-09-24 09:20', type: 'success', content: 'A区线路检修完成并恢复供电' },
    { id: 9, time: '2026-09-23 14:30', type: 'warning', content: 'B区用电负荷持续偏高，请关注' },
    { id: 10, time: '2026-09-23 11:15', type: 'info', content: '新增用电单元已接入系统' },
    { id: 11, time: '2026-09-22 10:00', type: 'danger', content: 'C区接地故障保护动作' },
    { id: 12, time: '2026-09-21 20:36', type: 'info', content: '系统固件已升级至 v2.3.1' },
    { id: 13, time: '2026-09-20 08:00', type: 'success', content: '全部设备运行状态正常' },
]
</script>

<style scoped>
.home {
    padding: 16px;
}

.home h1 {
    margin: 0 0 16px;
    font-size: 20px;
}

.switches {
    padding: 4px 0;
}

.switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    color: #303133;
}

.total-label {
    font-weight: 600;
}

.bill-btn {
    width: 100%;
    margin-top: 16px;
}
</style>
