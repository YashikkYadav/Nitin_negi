<template>
  <div ref="wrap">
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <apexchart type="bar" :options="barOptions" :series="barSeries" :height="chartHeight" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <apexchart type="pie" :options="pieOptions" :series="pieSeries" :height="chartHeight" />
      </v-col>
      <v-col cols="12" sm="12" md="4">
        <apexchart type="line" :options="lineOptions" :series="lineSeries" :height="chartHeight" />
      </v-col>
    </v-row>
    <v-data-table :items="ipdData" :headers="headers" class="mt-4">
      <template #item.actions="{ item }">
        <v-btn icon @click="$emit('edit-entry', item)"><v-icon>mdi-pencil</v-icon></v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

export default {
  name: 'IPDDashboard',
  components: { apexchart: VueApexCharts },
  props: {
    ipdData: Array,
    metrics: Object,
  },
  setup(props) {
    const headers = [
      { text: 'Patient Name', value: 'patientName' },
      { text: 'Age', value: 'age' },
      { text: 'Gender', value: 'gender' },
      { text: 'Date of Admission', value: 'dateOfAdmission' },
      { text: 'Category', value: 'category' },
      { text: 'Operative', value: 'operativeStatus' },
      { text: 'Payment Method', value: 'paymentMethod' },
      { text: 'Payment (₹)', value: 'paymentAmount' },
      { text: 'Donation (₹)', value: 'donationAmount' },
      { text: 'Diagnosis', value: 'diagnosis' },
      { text: 'Surgeon', value: 'surgeon' },
      { text: 'Ward/Room', value: 'wardRoomNo' },
      { text: 'Notes', value: 'notes' },
      { text: 'Actions', value: 'actions', sortable: false },
    ];

    // Responsive sizing
    const windowWidth = ref(window.innerWidth);
    const chartHeight = computed(() => {
      if (windowWidth.value < 600) return 240;
      if (windowWidth.value < 960) return 280;
      return 320;
    });
    const onResize = () => { windowWidth.value = window.innerWidth; };

    onMounted(() => {
      window.addEventListener('resize', onResize);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
    });

    // Chart options (reactive)
    const barOptions = ref({
      chart: { id: 'ipd-bar', toolbar: { show: false } },
      xaxis: { categories: ['Preop', 'Postop', 'Conservative'] },
      legend: { position: 'bottom' },
      responsive: [
        { breakpoint: 960, options: { legend: { position: 'bottom' } } },
        { breakpoint: 600, options: { plotOptions: { bar: { columnWidth: '55%' } } } }
      ]
    });

    const pieOptions = ref({
      chart: { id: 'ipd-pie' },
      labels: ['Cash', 'TPA', 'RGHS', 'CGHS'],
      legend: { position: 'bottom' },
      responsive: [
        { breakpoint: 960, options: { chart: { width: '100%' } } },
        { breakpoint: 600, options: { legend: { fontSize: '11px' } } }
      ]
    });

    const lineOptions = ref({
      chart: { id: 'ipd-line', toolbar: { show: false } },
      stroke: { curve: 'smooth' },
      xaxis: { categories: [] },
      markers: { size: 4 },
      yaxis: { labels: { formatter: v => Math.round(v) } }
    });

    // Series computations
    const barSeries = computed(() => [{
      name: 'Patients',
      data: [
        props.metrics?.preop || 0,
        props.metrics?.postop || 0,
        props.metrics?.conservative || 0
      ]
    }]);

    const pieSeries = computed(() => [
      props.metrics?.cash || 0,
      props.metrics?.tpa || 0,
      props.metrics?.rghs || 0,
      props.metrics?.cghs || 0
    ]);

    const lineSeries = computed(() => [{
      name: 'Admissions',
      data: (props.metrics?.trendData && props.metrics.trendData.length)
        ? props.metrics.trendData
        : []
    }]);

    // Sync line categories with metrics
    watch(
      () => props.metrics,
      (m) => {
        lineOptions.value.xaxis.categories = m?.trendCategories || [];
      },
      { immediate: true, deep: true }
    );

    return {
      headers,
      barOptions,
      barSeries,
      pieOptions,
      pieSeries,
      lineOptions,
      lineSeries,
      chartHeight
    };
  },
};
</script>