<template>
    <div class="energy">
        <h1>能耗分析</h1>
        <el-row :gutter="16">
            <el-col v-for="area in areas" :key="area" :span="12">
                <el-card>
                    <template #header>{{ area }}区能耗</template>
                    <div :ref="(el) => setChartRef(el, area)" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>

        <h2>昨日能耗分析</h2>
        <el-row :gutter="16">
            <el-col v-for="area in areas" :key="area" :span="12">
                <el-card>
                    <template #header>{{ area }}区昨日能耗</template>
                    <div :ref="(el) => setYesterdayChartRef(el, area)" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>

        <h2>各区能耗占比</h2>
        <el-card>
            <div ref="pieChartRef" class="chart"></div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const areas = ['A', 'B', 'C', 'D']
const chartEls = {}
const charts = {}

const weekLabels = []
const areaData = {}

// 昨日能耗分析（每个区一份）
const yesterdayChartEls = {}
const yesterdayCharts = {}

const yesterdayHours = []
const yesterdayAreaData = {}

// 各区能耗占比（饼图）
const pieChartRef = ref(null)
let pieChart = null
const areaTotals = {}

function setChartRef(el, area) {
    if (el) chartEls[area] = el
}

function setYesterdayChartRef(el, area) {
    if (el) yesterdayChartEls[area] = el
}

// 按周记录各区能耗数据（kWh），静态数据，结合季节用电规律（南方夏季用电高峰）
function generateData() {
    const WEEKS = 52
    const base = 1100
    // 各区规模系数，使能耗占比有明显偏倚
    const areaScale = { A: 1.4, B: 1.0, C: 0.75, D: 0.55 }

    for (let i = 0; i < WEEKS; i++) {
        weekLabels.push(`第${i + 1}周`)
    }

    areas.forEach((area) => {
        areaData[area] = []
        for (let i = 0; i < WEEKS; i++) {
            const week = i + 1
            // 以第 28 周（7 月中旬）为夏季峰值，用电量最高
            const factor = 1 + 0.5 * Math.cos((2 * Math.PI * (week - 28)) / 52)
            const value = base * areaScale[area] * factor * (0.85 + Math.random() * 0.3)
            areaData[area].push(Math.round(value))
        }
        areaTotals[area] = areaData[area].reduce((sum, v) => sum + v, 0)
    })
}

function createOption(name, data) {
    return {
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, top: 30, bottom: 30 },
        xAxis: {
            type: 'category',
            data: weekLabels,
            axisLabel: { interval: 4 },
        },
        yAxis: {
            type: 'value',
            name: 'kWh',
        },
        series: [
            {
                type: 'bar',
                name,
                data,
                barMaxWidth: 24,
            },
        ],
    }
}

// 昨日分时基础负荷（kWh/h），早晚高峰、深夜低谷，符合实际用电规律
function hourlyBase(h) {
    if (h < 6) return 40
    if (h < 9) return 90
    if (h < 12) return 120
    if (h < 14) return 90
    if (h < 18) return 130
    if (h < 22) return 170
    return 80
}

function generateYesterdayData() {
    for (let h = 0; h < 24; h++) {
        yesterdayHours.push(`${h}时`)
    }

    // 各区规模系数，A 区较大、D 区较小
    const areaScale = { A: 1.2, B: 1.0, C: 0.9, D: 0.8 }

    areas.forEach((area) => {
        yesterdayAreaData[area] = []
        for (let h = 0; h < 24; h++) {
            yesterdayAreaData[area].push(
                Math.round(hourlyBase(h) * areaScale[area] * (0.85 + Math.random() * 0.3))
            )
        }
    })
}

function createYesterdayOption(area) {
    return {
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, top: 30, bottom: 30 },
        xAxis: { type: 'category', data: yesterdayHours },
        yAxis: { type: 'value', name: 'kWh' },
        series: [
            {
                type: 'line',
                name: `${area}区昨日分时能耗`,
                data: yesterdayAreaData[area],
                smooth: true,
                showSymbol: false,
                areaStyle: { opacity: 0.1 },
                lineStyle: { width: 2 },
            },
        ],
    }
}

function createPieOption() {
    return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} kWh ({d}%)' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                type: 'pie',
                radius: '60%',
                center: ['55%', '50%'],
                data: areas.map((area) => ({ name: `${area}区`, value: areaTotals[area] })),
                label: { formatter: '{b}: {d}%' },
            },
        ],
    }
}

function handleResize() {
    areas.forEach((area) => charts[area]?.resize())
    areas.forEach((area) => yesterdayCharts[area]?.resize())
    pieChart?.resize()
}

onMounted(() => {
    generateData()

    areas.forEach((area) => {
        charts[area] = echarts.init(chartEls[area])
        charts[area].setOption(createOption(`${area}能耗`, areaData[area]))
    })

    generateYesterdayData()
    areas.forEach((area) => {
        yesterdayCharts[area] = echarts.init(yesterdayChartEls[area])
        yesterdayCharts[area].setOption(createYesterdayOption(area))
    })

    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption(createPieOption())

    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    areas.forEach((area) => charts[area]?.dispose())
    areas.forEach((area) => yesterdayCharts[area]?.dispose())
    pieChart?.dispose()
})
</script>

<style scoped>
.energy {
    padding: 16px;
}

.energy h1 {
    margin: 0 0 16px;
    font-size: 20px;
}

.energy h2 {
    margin: 24px 0 16px;
    font-size: 18px;
}

.chart {
    height: 320px;
    width: 100%;
}
</style>
