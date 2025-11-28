<template>
    <v-card class="kpi-card remove-lines">
        <div class="all-details">
            <h2 class="card-title">Invoices</h2>
            <div class="d-flex">
                <h1 class="dashboard-title">{{ invoice12MonthSum }}</h1>
                <p class="tag">+42%</p>
            </div>
        </div>
        <div>
            <apexchart type="area" :options="invoiceMonthOptions" :series="invoiceMonthSeries" height="120"></apexchart>
        </div>
    </v-card>
</template>

<script>
import { checkAuth, getLast12Months } from '@/lib/utils/utils';
import { useDashboardStore } from '@/store/DashboardStore';

export default {
    name: "Last30DaysInvoice",
    data() {
        return {
            invoice12Month: [],
            invoice12MonthSum: "",
            invoiceMonthSeries: [{
                name: 'invoice',
                data: []
            }],
            invoiceMonthOptions: {
                chart: {
                    type: 'area',
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false,
                        allowMouseWheelZoom: false,
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    colors: ['#385D7E'],
                    width: 2
                },
                colors: ['#a6c6e0'],
                xaxis: {
                    type: 'datetime',
                    "categories": [],
                    labels: {
                        show: false
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                yaxis: {
                    labels: {
                        show: false
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                labels: {
                    formatter: function (value) {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                    }
                },
                tooltip: {
                    x: {
                        format: 'MM/yyyy'
                    },
                },
            },
        };
    },
    mounted() {
        const auth = checkAuth(this.$router);
        if (auth) {
            this.fetch12MonthInvoice();
            this.invoiceMonthOptions.xaxis.categories = getLast12Months();
        }
    },
    methods: {
        async fetch12MonthInvoice() {
            const res = await useDashboardStore().getLast30DaysInvoiceApiCall()

            if (res) {
                this.invoice12Month = [...res.invoices];
                const sum = res.invoices.reduce((acc, val) => acc + val, 0);
                this.invoice12MonthSum = sum;
            }
        },
    },
    watch: {
        invoice12Month: {
            handler(newVal) {
                this.invoiceMonthSeries = [{ name: "invoice", data: newVal }];
            },
            deep: true,
            immediate: true,
        },
    }
};
</script>