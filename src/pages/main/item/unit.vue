<template>
    <div class="unit">
        <h1>单元管理</h1>
        <el-row :gutter="16">
            <el-col v-for="block in blocks" :key="block" :span="6">
                <el-card>
                    <template #header>{{ block }}区单元</template>
                    <div class="grid">
                        <el-tooltip
                            v-for="num in unitNumbers"
                            :key="num"
                            :content="unitTooltip(block, num)"
                            placement="top"
                        >
                            <el-button
                                :type="unitType(block, num)"
                                size="small"
                                class="cell-btn"
                                @click="selectUnit(block, num)"
                            >{{ num }}</el-button>
                        </el-tooltip>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <br>

        <el-row :gutter="16">
            <el-col :span="24">
                <el-card>
                    <template #header>单元信息与操作</template>

                    <template v-if="selectedUnit">
                        <div class="unit-info">
                            <span class="unit-name">{{ selectedUnit.block }}区 {{ selectedUnit.num }} 单元</span>
                            <el-switch v-model="powerOn" active-text="供电" inactive-text="断电" />
                        </div>

                        <el-table :data="appliances" border>
                            <el-table-column prop="name" label="用电器" />
                            <el-table-column prop="power" label="使用功率 (W)" />
                        </el-table>

                        <el-descriptions title="电费账单" :column="3" border class="bill">
                            <el-descriptions-item label="账户余额">￥{{ bill.balance }}</el-descriptions-item>
                            <el-descriptions-item label="已使用电量">{{ bill.usedEnergy }} kWh</el-descriptions-item>
                            <el-descriptions-item label="本月电费">￥{{ bill.monthFee }}</el-descriptions-item>
                        </el-descriptions>

                        <div class="actions">
                            <el-button type="primary" @click="confirmOperation">确认操作</el-button>
                        </div>
                    </template>
                    <el-empty v-else description="请点击上方单元按钮查看详情" />
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const blocks = ['A', 'B', 'C', 'D']

const unitNumbers = (() => {
    const numbers = []
    // 13 层楼，每层 2 个单元（房号 01、02），从高层到低层排列
    for (let floor = 13; floor >= 1; floor--) {
        const floorStr = String(floor).padStart(2, '0')
        numbers.push(`${floorStr}01`, `${floorStr}02`)
    }
    return numbers
})()

// 每个区随机 1~4 个异常单元（warning 或 danger）
const abnormalUnits = (() => {
    const result = {}
    blocks.forEach((block) => {
        result[block] = {}
        const count = 1 + Math.floor(Math.random() * 4)
        const shuffled = [...unitNumbers].sort(() => Math.random() - 0.5)
        for (let i = 0; i < count; i++) {
            result[block][shuffled[i]] = Math.random() < 0.5 ? 'warning' : 'danger'
        }
    })
    return result
})()

function unitType(block, num) {
    return abnormalUnits[block]?.[num] || 'success'
}

const statusText = {
    warning: '电费欠缴',
    danger: '单元电力异常',
    success: '一切正常',
}

function unitTooltip(block, num) {
    return `${block}区 ${num} 单元 - ${statusText[unitType(block, num)]}`
}

// 当前选中的单元
const selectedUnit = ref(null)

// 用电器及使用功率（静态数据）
const appliances = [
    { name: '空调', power: 1500 },
    { name: '冰箱', power: 200 },
    { name: '洗衣机', power: 500 },
    { name: '电视', power: 150 },
    { name: '照明', power: 100 },
    { name: '电脑', power: 300 },
    { name: '热水器', power: 2000 },
    { name: '厨房插头A', power: 800 },
    { name: '厨房插头B', power: 500 },
    { name: '客厅插头A', power: 600 },
    { name: '房间插头A', power: 300 },
    { name: '房间插头B', power: 200 },
    { name: '房间插头C', power: 150 },
    { name: '房间插头D', power: 400 },
]

// 电费账单（静态数据）
const bill = {
    balance: 320.5,
    usedEnergy: 156.8,
    monthFee: 89.6,
}

// 电力开关
const powerOn = ref(true)

function selectUnit(block, num) {
    selectedUnit.value = { block, num }
}

function confirmOperation() {
    ElMessage.success('操作已确认')
}
</script>

<style scoped>
.unit {
    padding: 16px;
}

.unit h1 {
    margin: 0 0 16px;
    font-size: 20px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.cell-btn {
    width: 100%;
    height: 24px;
    padding: 0;
}

.unit-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.unit-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.bill {
    margin-top: 16px;
}

.actions {
    margin-top: 16px;
    text-align: right;
}
</style>
