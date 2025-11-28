<template>
  <div class="my-6">
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Implant Removals Today</h2>
            <div class="kpi-value">{{ metrics.implantsRemovedToday || 0 }}</div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Implants This Month: Removed vs Not Removed</h2>
          </div>
          <apexchart type="bar" :options="implantBarOptions" :series="implantBarSeries" height="250" />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Procedure Type Distribution</h2>
          </div>
          <apexchart type="bar" :options="barOptions" :series="barSeries" height="250" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Implant vs Removal</h2>
          </div>
          <apexchart type="pie" :options="pieOptions" :series="pieSeries" height="250" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="kpi-card">
          <div class="all-details">
            <h2 class="card-title">Procedures Trend</h2>
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
  name: 'ProcedureMetrics',
  components: { apexchart: VueApexCharts },
  props: {
    metrics: Object,
  },
  setup(props) {
    console.log(props.metrics)
    const barOptions = { 
      chart: { 
        id: 'procedure-bar',
        toolbar: { show: false }
      }, 
      xaxis: { categories: ['DJ Stent Removal', 'Dressing Removal', 'Sutures Removal'] },
      colors: ['#385D7E', '#a6c6e0', '#9ca3af'],
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
            return val + " procedures";
          }
        }
      }
    };
    
    const barSeries = computed(() => [{ 
      name: 'Procedures', 
      data: [
        props.metrics.djStentRemoval || 0, 
        props.metrics.dressingRemoval || 0, 
        props.metrics.suturesRemoval || 0
      ] 
    }]);
    
    const pieOptions = { 
      labels: ['Implants', 'Removals'], 
      colors: ['#385D7E', '#a6c6e0'],
      legend: {
        position: 'bottom'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " procedures";
          }
        }
      }
    };
    
    const pieSeries = computed(() => [
      props.metrics.implants || 0, 
      props.metrics.removals || 0
    ]);
    
    const lineOptions = { 
      chart: { 
        id: 'procedure-line',
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
            return val + " procedures";
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
      name: 'Procedures', 
      data: props.metrics.trendData || [0, 0, 0, 0, 0, 0, 0] 
    }]);

    // New chart for Implants This Month: Removed vs Not Removed
    const implantBarOptions = {
      chart: { id: 'implant-bar', toolbar: { show: false } },
      xaxis: { categories: ['Removed', 'Not Removed'] },
      colors: ['#4CAF50', '#F44336'],
      plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 5 } },
      dataLabels: { enabled: true },
      grid: { borderColor: '#f1f1f1' },
      tooltip: { y: { formatter: val => val + ' implants' } },
    };
    const implantBarSeries = computed(() => [{
      name: 'Implants',
      data: [props.metrics.implantsRemovedThisMonth || 0, props.metrics.implantsNotRemovedThisMonth || 0]
    }]);
    
    return { barOptions, barSeries, pieOptions, pieSeries, lineOptions, lineSeries, implantBarOptions, implantBarSeries };
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

.kpi-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #385D7E;
  text-align: center;
  margin-top: 1.5rem;
}
</style> 