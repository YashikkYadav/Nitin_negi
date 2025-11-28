<template>
  <div class="my-6">
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">IPD Category Distribution</h2>
          </div>
          <apexchart type="bar" :options="barOptions" :series="barSeries" height="250" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Payment Method Distribution</h2>
          </div>
          <apexchart type="pie" :options="pieOptions" :series="pieSeries" height="250" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Admissions Trend</h2>
          </div>
          <apexchart type="line" :options="lineOptions" :series="lineSeries" height="250" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

export default {
  name: 'IPDBarGraphs',
  components: { apexchart: VueApexCharts },
  props: {
    metrics: Object,
  },
  setup(props) {
    const barOptions = { 
      chart: { 
        id: 'bar',
        toolbar: { show: false }
      }, 
      xaxis: { categories: ['Preop', 'Postop', 'Conservative'] },
      colors: ['#1976d2', '#8e24aa'], // Theme primary and accent (no green)
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: { enabled: false },
      stroke: { colors: ['transparent'], width: 2 },
      grid: { borderColor: '#f1f1f1' },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " patients";
          }
        }
      }
    };
    
    const barSeries = computed(() => [{ 
      name: 'Patients', 
      data: [
        props.metrics.preop || 0, 
        props.metrics.postop || 0, 
        props.metrics.conservative || 0
      ] 
    }]);
    
    const pieOptions = { 
      labels: ['Cash', 'TPA', 'RGHS', 'CGHS'], 
      colors: ['#385D7E', '#a6c6e0', '#9ca3af', '#6b7280'],
      legend: {
        position: 'bottom'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " patients";
          }
        }
      }
    };
    
    const pieSeries = computed(() => [
      props.metrics.cash || 0, 
      props.metrics.tpa || 0, 
      props.metrics.rghs || 0, 
      props.metrics.cghs || 0
    ]);
    
    const lineOptions = { 
      chart: { 
        id: 'line',
        toolbar: { show: false }
      }, 
      xaxis: { 
        categories: props.metrics.trendCategories || ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      colors: ['#385D7E'],
      stroke: { 
        curve: 'smooth', 
        colors: ['#385D7E'], 
        width: 3 
      },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f1f1' },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " admissions";
          }
        }
      },
      markers: {
        size: 5,
        colors: ['#385D7E'],
        strokeColors: '#ffffff',
        strokeWidth: 2
      }
    };
    
    const lineSeries = computed(() => [{ 
      name: 'Admissions', 
      data: props.metrics.trendData || [0, 0, 0, 0, 0, 0, 0] 
    }]);

    const implantsBarOptions = {
      chart: {
        id: 'implants-bar',
        toolbar: { show: false }
      },
      xaxis: { categories: ['Removed', 'Not Removed'] },
      colors: ['#1976d2', '#8e24aa'], // Theme primary and accent
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          distributed: true // Ensure each bar uses the next color
        },
      },
      dataLabels: { enabled: false },
      stroke: { colors: ['transparent'], width: 2 },
      grid: { borderColor: '#f1f1f1' },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " implants";
          }
        }
      }
    };
    const implantsBarSeries = computed(() => [{
      name: 'Implants',
      data: [
        props.metrics.implantsRemovedThisMonth || 0,
        props.metrics.implantsNotRemovedThisMonth || 0
      ]
    }]);
    
    return { barOptions, barSeries, pieOptions, pieSeries, lineOptions, lineSeries, implantsBarOptions, implantsBarSeries };
  },
};
</script>

<style scoped>
.kpi-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.all-details {
  padding: 1rem;
}
</style> 