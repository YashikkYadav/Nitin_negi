<template>
    <v-dialog v-model="isModalOpen" max-width="700px">
        <v-card class="popup-card">
            <v-card-title class="popup-title">Past Prescription</v-card-title>
            <v-card-text class="popup-detail">
                <div v-if="prescriptionData">
                    <section class="section">
                        <h4>Vitals</h4>
                        <p><strong>Blood Pressure:</strong> {{ prescriptionData?.bloodPressure }}</p>
                        <p><strong>Pulse:</strong> {{ prescriptionData?.pulse }}</p>
                        <p><strong>Height:</strong> {{ prescriptionData?.height }} cm</p>
                        <p><strong>Weight:</strong> {{ prescriptionData?.weight }} kg</p>
                        <p><strong>Temperature:</strong> {{ prescriptionData?.temperature }}°C</p>
                        <p><strong>Pain Score:</strong> {{ prescriptionData?.painScore }}</p>
                    </section>

                    <section class="section">
                        <h4>Complaints</h4>
                        <ul>
                            <li v-for="(item, index) in prescriptionData?.complaints"
                                :style="{ display: index === prescriptionData?.complaints.length - 1 ? 'none' : '' }">
                                {{ item }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>History</h4>
                        <ul>
                            <li v-for="(item, index) in prescriptionData?.history" :key="index" :style="{ display: index === prescriptionData?.history.length - 1 ? 'none' : '' }">{{ item }}</li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Drug History</h4>
                        <ul>
                            <li v-for="(drug, index) in prescriptionData?.drugHistory" :key="drug?._id">
                                {{ drug?.name }} - {{ drug?.details || 'No details provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Drug Allergy</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.drugAllergy" :key="allergy?._id">
                                {{ allergy?.name }} - {{ allergy?.details || 'No details provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Antiplatelet/Anticogulant</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.antiplatlet" :key="allergy?._id">
                                {{ allergy?.name }} - {{ allergy?.details || 'No details provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Previous Surgery</h4>
                        <ul>
                            <li>{{ prescriptionData?.previousSurgery }}</li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Physical Examination</h4>
                        <ul>
                            <li v-for="(item, index) in prescriptionData?.physicalExamination" :key="index" :style="{ display: index === prescriptionData?.physicalExamination.length - 1 ? 'none' : '' }">{{ item }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Provisional Diagnosis</h4>
                        <ul>
                            <li>{{ prescriptionData?.provisional }}</li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Diagnosis</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.diagnosis" :key="allergy?._id">
                                {{ allergy?.type }} - {{ allergy?.details || 'No details provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Investigation Advice</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.investigationsAdviced" :key="allergy?._id">
                                {{ allergy?.name }} - {{ allergy?.details || 'No details provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Medications</h4>
                        <ul>
                            <li v-for="(med, index) in prescriptionData?.medications" :key="med._id">
                                {{ med?.name }} - {{ med?.dosage }}, {{ med?.frequency }} for {{ med?.duration }} ({{
                                med?.composition }})
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Advice</h4>
                        <ul>
                            <li v-for="(adv, index) in prescriptionData?.advice" :key="index" :style="{ display: index === prescriptionData?.advice.length - 1 ? 'none' : '' }">{{ adv }}</li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Follow-up</h4>
                        <p><strong>Days:</strong> {{ prescriptionData?.followUp?.days }}</p>
                        <p><strong>Date:</strong> {{ prescriptionData?.followUp?.date }}</p>
                    </section>

                    <section class="section">
                        <h4>Any Implant</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.implant" :key="allergy?._id">
                                {{ allergy?.name }} - {{ allergy?.removalDate || 'No removalDate provided' }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Referred To</h4>
                        <ul>
                            <li v-for="(allergy, index) in prescriptionData?.referredTo" :key="allergy?._id">
                                {{ allergy?.name }} - {{ allergy?.speciality || 'No speciality provided' }} - {{ allergy?.phoneNumber }}
                            </li>
                        </ul>
                    </section>

                    <section class="section">
                        <h4>Referred By</h4>
                        <p><strong>Name:</strong> {{ prescriptionData?.referredBy?.name }}</p>
                        <p><strong>Speciality:</strong> {{ prescriptionData?.referredBy?.speciality }}</p>
                    </section>

                    <section class="section">
                        <h4>Surgery Advised</h4>
                        <p><strong>Name:</strong> {{ prescriptionData?.surgeryAdvice?.name }}</p>
                        <p><strong>Speciality:</strong> {{ prescriptionData?.surgeryAdvice?.date }}</p>
                    </section>

                    <section class="section">
                        <h4>Category</h4>
                        <ul>
                            <li>{{ prescriptionData?.tags }}</li>
                        </ul>
                    </section>

                </div>
            </v-card-text>
            <v-card-actions class="popup-action">
                <v-btn class="saaro-btn" @click="sharePrescription('WhatsApp/SMS')">WhatsApp</v-btn>
                <v-btn class="saaro-btn" @click="printPrescription(prescriptionData)">Print</v-btn>
                <v-btn class="saaro-btn" text @click="$emit('close-dialog')">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="1000px">
        <v-card class="print-popup w-75 max-1400">
            <v-card-title class="headline">Save Prescription</v-card-title>
            <v-card-text class="d-flex pr-0 pb-0 pt-0 pl-16">
                <v-row class="w-75 max-1100">
                    <v-col class="v-col-12 m-0" style="height: 60vh;">
                        <div v-if="prescriptionUrl" style="border: 1px solid #ccc; height: 100%; overflow: hidden;">
                            <iframe :src="prescriptionUrl" width="100%" height="100%" style="border: none;"></iframe>
                        </div>
                        <div v-else class="d-flex align-center justify-center" style="height: 100%;">
                            <p>This prescription is too out-dated. Please generate a new one or access newly generated prescriptions only.</p>
                        </div>
                    </v-col>
                </v-row>
                <v-row class="justify-center">
                    <v-col class="v-col-10">
                        <div class="text-center pb-10">
                            <v-text-field variant="outlined" v-model="emailInput" label="Email" outlined></v-text-field>
                            <v-btn class="saaro-btn margin-none" @click="sharePrescription('Email')">Email</v-btn>
                        </div>
                        <div class="text-center">
                            <v-text-field variant="outlined" v-model="phoneInput" label="Phone Number"
                                outlined></v-text-field>
                            <v-btn class="saaro-btn margin-none"
                                @click="sharePrescription('WhatsApp/SMS')">WhatsApp/SMS</v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closePopup" class="mr-12 px-15 saaro-btn">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "PastPrescriptionModel",
    props: {
        commonModel: Boolean,
        data: Object
    },
    data() {
        return {
            dialog: false,
            prescriptionUrl: "",
            emailInput: "",
            phoneInput: ""
        };
    },
    computed: {
        isModalOpen() {
            return this.commonModel;
        },
        prescriptionData() {
            return this.data;
        }
    },
    methods: {
        sharePrescription(method) {
            console.log(`Sharing via ${method}`);
        },
        printPrescription(prescription) {
            this.prescriptionUrl = `${import.meta.env.VITE_SERVER_URL}/public/prescriptions/prescription_${prescription._id}.pdf`;
            this.$emit('close-dialog');
            this.dialog = true;
        },
        closePopup() {
            this.dialog = false;
            window.location.reload();
        }
    }
};
</script>

<style scoped>
ul {
    list-style-position: inside;
}

.popup-card {
    padding: 16px;
}

.popup-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
}

.popup-detail {
    max-height: 500px;
    overflow-y: auto;
}

.section {
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.section h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}
</style>
