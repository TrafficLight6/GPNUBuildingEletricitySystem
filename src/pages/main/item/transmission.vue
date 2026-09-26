<template>
    <div class="transmission">
        <h2>实时输电监控</h2>
        <el-row :gutter="16">
            <el-col :span="12">
                <el-card>
                    <template #header>交流电压 (V)</template>
                    <div ref="voltageChartRef" class="chart"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>交流频率 (Hz)</template>
                    <div ref="frequencyChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>
        <br>
        <el-row :gutter="16">
            <el-col :span="12">
                <el-card>
                    <template #header>交流电流 (A)</template>
                    <div ref="currentChartRef" class="chart"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>有功功率 (kW)</template>
                    <div ref="powerChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>

        <h2>历史平均数据</h2>
        <el-row :gutter="16">
            <el-col :span="12">
                <el-card>
                    <template #header>平均电压 (V)</template>
                    <div ref="historyVoltageChartRef" class="chart"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>平均频率 (Hz)</template>
                    <div ref="historyFrequencyChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>

        <h2>通知</h2>
        <el-card>
            <el-timeline>
                <el-timeline-item
                    v-for="item in notices"
                    :key="item.id"
                    :timestamp="item.time"
                    :type="item.type"
                >
                    {{ item.content }}
                </el-timeline-item>
            </el-timeline>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getACVoltage, getACFrequency, getACCurrent, getACPower } from '../../../lib/data/InputElectricity.js'

// 实时监控
const voltageChartRef = ref(null)
const frequencyChartRef = ref(null)
const currentChartRef = ref(null)
const powerChartRef = ref(null)

let voltageChart = null
let frequencyChart = null
let currentChart = null
let powerChart = null
let timer = null

const MAX_POINTS = 30
const timeData = []
const voltageData = []
const frequencyData = []
const currentData = []
const powerData = []

// 历史平均数据
const historyVoltageChartRef = ref(null)
const historyFrequencyChartRef = ref(null)

let historyVoltageChart = null
let historyFrequencyChart = null

const historyDates = []
const historyVoltageData = []
const historyFrequencyData = []

// 通知（模拟数据）
const notices = [
    { id: 1, time: '2026-09-26 09:30', type: 'warning', content: 'A区输电电压监测值 218.6V，低于正常阈值 219V' },
    { id: 2, time: '2026-09-26 08:15', type: 'info', content: '完成输电线路例行巡检' },
    { id: 3, time: '2026-09-26 07:42', type: 'danger', content: 'B区3号输电线路电流瞬时越限' },
    { id: 4, time: '2026-09-25 22:10', type: 'success', content: '备用输电线路切换测试通过' },
    { id: 5, time: '2026-09-25 18:05', type: 'warning', content: 'C区输电频率波动超过 ±0.3Hz' },
    { id: 6, time: '2026-09-25 12:00', type: 'info', content: '输电保护装置定值已更新' },
    { id: 7, time: '2026-09-24 16:48', type: 'danger', content: '主变压器温度过高告警（85℃）' },
    { id: 8, time: '2026-09-24 09:20', type: 'info', content: '月度输电损耗报表已生成' },
    { id: 9, time: '2026-09-23 14:30', type: 'success', content: 'A区输电线路检修完成并恢复供电' },
    { id: 10, time: '2026-09-23 11:15', type: 'warning', content: 'D区输电线路负载率达到 85%，请关注' },
    { id: 11, time: '2026-09-22 10:00', type: 'info', content: '新增输电回路已并网投运' },
    { id: 12, time: '2026-09-21 20:36', type: 'danger', content: 'B区输电线路接地故障保护动作' },
    { id: 13, time: '2026-09-20 08:00', type: 'success', content: '全部输电线路运行状态正常' },
]

function formatTime(d) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function createOption(name, data, yAxis = {}) {
    return {
        tooltip: { trigger: 'axis' },
        grid: { left: 60, right: 20, top: 30, bottom: 30 },
        xAxis: {
            type: 'category',
            data: timeData,
            boundaryGap: false,
        },
        yAxis: {
            type: 'value',
            ...yAxis,
        },
        series: [
            {
                type: 'line',
                name,
                data,
                smooth: true,
                showSymbol: false,
                areaStyle: { opacity: 0.1 },
                lineStyle: { width: 2 },
            },
        ],
    }
}

function createHistoryOption(name, data, yAxis = {}) {
    return {
        tooltip: { trigger: 'axis' },
        grid: { left: 60, right: 20, top: 30, bottom: 30 },
        xAxis: {
            type: 'category',
            data: historyDates,
        },
        yAxis: {
            type: 'value',
            ...yAxis,
        },
        series: [
            {
                type: 'line',
                name,
                data,
                smooth: true,
                showSymbol: true,
                areaStyle: { opacity: 0.1 },
                lineStyle: { width: 2 },
            },
        ],
    }
}

function updateData() {
    timeData.push(formatTime(new Date()))
    voltageData.push(getACVoltage())
    frequencyData.push(getACFrequency())
    currentData.push(getACCurrent())
    powerData.push(getACPower())

    if (timeData.length > MAX_POINTS) {
        timeData.shift()
        voltageData.shift()
        frequencyData.shift()
        currentData.shift()
        powerData.shift()
    }

    voltageChart?.setOption({ xAxis: { data: timeData }, series: [{ data: voltageData }] })
    frequencyChart?.setOption({ xAxis: { data: timeData }, series: [{ data: frequencyData }] })
    currentChart?.setOption({ xAxis: { data: timeData }, series: [{ data: currentData }] })
    powerChart?.setOption({ xAxis: { data: timeData }, series: [{ data: powerData }] })
}

// 生成过去 10 天的平均数据，其中随机一天电压低于 219V
function generateHistoryData() {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const lowIndex = Math.floor(Math.random() * 10)

    for (let i = 9; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        historyDates.push(`${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)

        if (i === lowIndex) {
            historyVoltageData.push(Math.round((218 + Math.random() * 0.9) * 10) / 10)
        } else {
            historyVoltageData.push(Math.round((220 + Math.random()) * 10) / 10)
        }
        historyFrequencyData.push(Math.round((49.8 + Math.random() * 0.4) * 100) / 100)
    }
}

function handleResize() {
    voltageChart?.resize()
    frequencyChart?.resize()
    currentChart?.resize()
    powerChart?.resize()
    historyVoltageChart?.resize()
    historyFrequencyChart?.resize()
}

onMounted(() => {
    voltageChart = echarts.init(voltageChartRef.value)
    frequencyChart = echarts.init(frequencyChartRef.value)
    currentChart = echarts.init(currentChartRef.value)
    powerChart = echarts.init(powerChartRef.value)
    historyVoltageChart = echarts.init(historyVoltageChartRef.value)
    historyFrequencyChart = echarts.init(historyFrequencyChartRef.value)

    voltageChart.setOption(createOption('交流电压', voltageData, { min: 0, max: 400 }))
    frequencyChart.setOption(createOption('交流频率', frequencyData, { min: 0, max: 100 }))
    currentChart.setOption(createOption('交流电流', currentData, { min: 0, max: 100 }))
    powerChart.setOption(createOption('有功功率', powerData, { scale: true }))

    generateHistoryData()
    historyVoltageChart.setOption(createHistoryOption('平均电压', historyVoltageData, { scale: true }))
    historyFrequencyChart.setOption(createHistoryOption('平均频率', historyFrequencyData, { min: 0, max: 100 }))

    updateData()
    timer = setInterval(updateData, 1000)
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    voltageChart?.dispose()
    frequencyChart?.dispose()
    currentChart?.dispose()
    powerChart?.dispose()
    historyVoltageChart?.dispose()
    historyFrequencyChart?.dispose()
})
</script>

<style scoped>
.transmission {
    padding: 16px;
}

.transmission h2 {
    margin: 0 0 16px;
    font-size: 18px;
}

.transmission h2:not(:first-child) {
    margin-top: 24px;
}

.chart {
    height: 320px;
    width: 100%;
}
</style>
