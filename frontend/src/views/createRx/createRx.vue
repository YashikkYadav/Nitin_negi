<template class="create-rx-page">
    <v-container fluid>
        <!-- Search Bar and Add Patient Button -->
        <v-row class="align-center mb-4">
            <v-col cols="12" md="8" class="mt-2 mt-md-4">
                <v-text-field
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    label="Name,Phone,UID"
                    variant="solo"
                    density="comfortable"
                    max-width="350"
                    rounded="pill"
                    class="rounded-xl"
                    @change="filterData"
                ></v-text-field>
            </v-col>

            <v-col cols="12" md="4" class="text-md-end mb-2">
                <v-btn className="saaro-btn"
                       color="#8f6cb4"
                       @click="openDialog"
                       large
                       block>
                    Register Patient
                </v-btn>
            </v-col>
        </v-row>

        <!-- Category Tabs -->
        <v-tabs v-model="categoryFilter" class="mb-4" @update:model-value="filterByCategory">
            <v-tab value="all">All Patients</v-tab>
            <v-tab value="New">New</v-tab>
            <v-tab value="Followup">Followup</v-tab>
        </v-tabs>

        <!-- Data Table -->
        <v-card title="Patients" flat>
            <v-data-table-server
                :headers="headers"
                :items="filteredPatients"
                :search="search"
                class="table grey-head"
                :page.sync="currentPageNumber"
                :items-length="totalPatients"
                :items-per-page="limit"
                density="compact"
                @update:page="pageUpdateFunction"
                :options.sync="options"
                @update:items-per-page="perPageUpdateFunction">
                <template v-if="isLoading" v-slot:body>
                    <tr v-for="n in 6" :key="n">
                        <td v-for="header in headers" :key="header.key">
                            <v-skeleton-loader type="text"></v-skeleton-loader>
                        </td>
                    </tr>
                </template>
                <template v-slot:[`item.Tags`]="{ item }">
                    <v-chip v-if="item.Tags" :color="getTagColor(item.Tags)" size="small">
                        {{ item.Tags }}
                    </v-chip>
                </template>
                <template v-slot:[`item.PaymentCategory`]="{ item }">
                    <v-chip v-if="item.PaymentCategory" size="small">
                        {{ item.PaymentCategory }}
                    </v-chip>
                </template>

                <template v-slot:[`item.action`]="{ item }">
                    <router-link :to="`/${item.id}/consult`" style="text-decoration: none; color: inherit;">
                        <v-btn class="saaro-btn" color="#8f6cb4" size="small">
                            Consult
                        </v-btn>
                    </router-link>
                </template>
            </v-data-table-server>
        </v-card>
    </v-container>
    <patient-add-edit-model
        :dialog="dialog"
        :isEditModel="false"
        :patientId="null"
        @close-dialog="dialog = false"
        @fetch-patients="fetchPatients" />
</template>

<script>
import { debounce } from "lodash";
import { checkAuth } from '@/lib/utils/utils';
import { usePatientStore } from '@/store/PatientStore';
import PatientAddEditModel from '@/components/PatientAddEditModel.vue';

export default {
    name: "CreateRx",
    components: {
        PatientAddEditModel
    },
    data() {
        return {
            search: "",
            dialog: false,
            moreOptions: false,
            isLoading: true,
            patients: [], // All patients
            filteredPatients: [], // Filtered patients
            currentPageNumber: 1,
            limit: 25,
            totalPatients: 0,
            options: {
                page: 1,
                itemsPerPage: 25,
            },
            headers: [
                { key: "UID", title: "UID" },
                { key: "Name", title: "Name" },
                { key: "Phone", title: "Phone" },
                { key: "Date", title: "Last Visit" },
                { key: "Tags", title: "Category" },
                { key: "PaymentCategory", title: "Payment Category" },
                { key: "action", title: "Action", sortable: false },
            ],
            debouncedSearch: null,
            categoryFilter: "all", // Add category filter
        };
    },
    mounted() {
        const auth = checkAuth(this.$router);
        if (auth) {
            this.fetchPatients();
        }
        this.debouncedSearch = debounce(this.filterData, 500);
        // Reduce items per page on small screens for better readability
        if (window.innerWidth < 600) {
            this.limit = 10;
            this.options.itemsPerPage = 10;
        }
    },
    methods: {
        async fetchPatients() {
            const res = await usePatientStore().getAllPatientApiCall(this.currentPageNumber, this.limit, this.search)
            if (res) {
                this.isLoading = false;
                // console.log("Patient data from API:", res); // Add logging
                this.patients = res.patient.map((patient) => ({
                    id: patient.patientId?._id,
                    UID: patient.patientId?.uid,
                    Name: patient.patientId?.fullName,
                    Phone: patient.patientId?.phoneNumber,
                    Date: new Date(patient?.updatedAt).toLocaleDateString('en-GB'),
                    Tags: patient.patientId?.tags,
                    PaymentCategory: patient.patientId?.paymentCategory,
                    Action: "",
                }));
                // console.log("Mapped patients:", this.patients); // Add logging

                // Apply category filter
                this.applyCategoryFilter();

                if (res.pagination) {
                    this.totalPatients = res.pagination.totalPatients || 0;
                }
            }
        },
        // Apply category filter to patients
        applyCategoryFilter() {
            if (this.categoryFilter === "all") {
                this.filteredPatients = this.patients;
            } else {
                this.filteredPatients = this.patients.filter(patient => patient.Tags === this.categoryFilter);
            }
        },
        // Get color based on tag value
        getTagColor(tag) {
            switch(tag) {
                case 'New':
                    return 'green';
                case 'Followup':
                    return 'orange';
                default:
                    return 'red';
            }
        },
        openDialog() {
            this.dialog = true;
        },
        pageUpdateFunction(newPageNumber) {
            this.currentPageNumber = newPageNumber;
            this.fetchPatients();
        },
        perPageUpdateFunction(newPageNumber) {
            this.limit = newPageNumber;
            this.fetchPatients();
        },
        filterData() {
            this.currentPageNumber = 1;
            this.fetchPatients();
        },
        // Add method to filter by category
        filterByCategory() {
            this.applyCategoryFilter();
        }
    },
    watch: {
        search: {
            handler(newVal) {
                this.debouncedSearch();
            },
            immediate: false
        },
        options: {
            handler() {
                this.limit = this.options.itemsPerPage;
                this.currentPageNumber = this.options.page;
                this.fetchPatients();
            },
            deep: true
        }
    }
};
</script>