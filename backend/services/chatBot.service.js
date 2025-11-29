const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const Doctor = require("../models/doctor");
const Invoice = require("../models/invoice");
const Prescription = require("../models/prescription");
const DoctorPatient = require("../models/doctorPatient");
const ChatBotInteraction = require("../chatBot/chatBot.model");
const IPD = require("../models/ipd");
const mongoose = require("mongoose");

// Initialize Gemini with the best model for chatbots
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get patient IDs for a doctor
const getDoctorPatientIds = async (doctorId) => {
  const doctorPatients = await DoctorPatient.find({ doctorId: doctorId });
  return doctorPatients.map((dp) => dp.patientId);
};

// Function to format time from 24-hour to 12-hour format
const formatTime = (time24) => {
  if (!time24) return "Unknown";

  try {
    // Assuming time24 is in format "HH:MM" or "HH:MM:SS"
    const parts = time24.split(":");
    let hours = parseInt(parts[0]);
    const minutes = parts[1] || "00";

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    return time24; // Return original if parsing fails
  }
};

// Function to format date with timezone conversion
const formatDate = (date) => {
  if (!date) return "Unknown";
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return date;
  }
};

// Function to format datetime with timezone conversion
const formatDateTime = (date) => {
  if (!date) return "Unknown";
  try {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    return date;
  }
};

// Function to format the AI response by converting markdown to plain text with line breaks
const formatAIResponse = (text) => {
  // Remove markdown bold formatting (**text**)
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "$1");

  // Convert markdown headings to capitalized sections with spacing
  formattedText = formattedText.replace(/^### (.*$)/gim, "\n$1\n");
  formattedText = formattedText.replace(/^## (.*$)/gim, "\n$1\n");
  formattedText = formattedText.replace(/^# (.*$)/gim, "\n$1\n");

  // Add extra spacing after sentences for better readability
  formattedText = formattedText.replace(/\. (?=[A-Z])/g, ".\n\n");

  // Remove extra newlines (more than 2 in a row)
  formattedText = formattedText.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace
  formattedText = formattedText.trim();

  return formattedText;
};

// Chatbot service to handle queries using Gemini
const chatBotQueryService = async (doctorId, query) => {
  try {
    // Convert doctorId to ObjectId if it's a string
    const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId)
      ? new mongoose.Types.ObjectId(doctorId)
      : doctorId;

    // Get doctor data
    const doctor = await Doctor.findById(doctorObjectId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Get doctor's patients, appointments, invoices, prescriptions, and IPD data
    const patientIds = await getDoctorPatientIds(doctorObjectId);
    const patients = await Patient.find({ _id: { $in: patientIds } });

    // For appointments and prescriptions, we can populate patient data
    const appointments = await Appointment.find({
      doctorId: doctorObjectId,
    }).populate({
      path: "patientId",
      select: "fullName phoneNumber",
      strictPopulate: false,
    });

    const prescriptions = await Prescription.find({
      doctorId: doctorObjectId,
    }).populate({
      path: "patientId",
      select: "fullName phoneNumber",
      strictPopulate: false,
    });

    // For invoices, we cannot populate patient data since there's no patientId field
    const invoices = await Invoice.find({ doctorId: doctorObjectId });

    // For IPD, populate patient data
    const ipds = await IPD.find({}).populate({
      path: "patientId",
      select: "fullName phoneNumber",
      strictPopulate: false,
    });

    // Create context for Gemini with doctor's data
    const context = `
      You are a medical assistant for Dr. ${doctor.name || "Doctor"}.
      
      You have access to the following complete database collections:
      
      Patient Data (complete collection for this doctor's patients):
      ${JSON.stringify(
        patients.map((p) => {
          // Create a copy of the patient object without sensitive fields
          const { password, secret, __v, ...patientData } = p._doc || p;
          return {
            ...patientData,
            createdAt: formatDateTime(patientData.createdAt),
            updatedAt: formatDateTime(patientData.updatedAt),
          };
        }),
        null,
        2
      )}
      
      Appointment Data (complete collection for this doctor):
      ${JSON.stringify(
        appointments.map((a) => ({
          patientName: a.patientId?.fullName || "Unknown",
          patientPhone: a.patientId?.phoneNumber || "Unknown",
          date: formatDate(a.date),
          time: formatTime(a.time),
          location: a.location,
          type: a.type,
          status: a.status,
          mode: a.mode,
          markComplete: a.markComplete,
          source: a.source,
          reason: a.reason,
          email: a.email,
          createdAt: formatDateTime(a.createdAt),
          updatedAt: formatDateTime(a.updatedAt),
        })),
        null,
        2
      )}
      
      Invoice Data (complete collection for this doctor):
      ${JSON.stringify(
        invoices.map((i) => ({
          invoiceNumber: i.invoiceId,
          date: formatDate(i.createdAt),
          amount: i.totalAmount,
          status: i.paymentStatus,
          items: i.items,
          clinicName: i.clinicName,
          name: i.name,
          uid: i.uid,
          phone: i.phone,
          privateNote: i.privateNote,
          additionalDiscountAmount: i.additionalDiscountAmount,
          paymentMode: i.paymentMode,
          patientNote: i.patientNote,
          createdAt: formatDateTime(i.createdAt),
          updatedAt: formatDateTime(i.updatedAt),
        })),
        null,
        2
      )}
      
      Prescription Data (complete collection for this doctor):
      ${JSON.stringify(
        prescriptions.map((p) => ({
          patientName: p.patientId?.fullName || "Unknown",
          patientPhone: p.patientId?.phoneNumber || "Unknown",
          date: formatDate(p.consultationDate),
          diagnosis: p.diagnosis,
          medicines: p.medications,
          followUpDate: p.followUp,
          vitals: {
            bloodPressure: p.bloodPressure,
            pulse: p.pulse,
            height: p.height,
            weight: p.weight,
            temperature: p.temperature,
            painScore: p.painScore,
          },
          complaints: p.complaints,
          pastHistory: p.history,
          surgicalHistory: p.previousSurgery,
          drugAllergy: p.drugAllergy,
          physicalExamination: p.physicalExamination,
          tests: p.investigationsAdviced,
          advice: p.advice,
          drugHistory: p.drugHistory,
          antiplatlet: p.antiplatlet,
          provisional: p.provisional,
          referredTo: p.referredTo,
          referredBy: p.referredBy,
          implant: p.implant,
          surgeryAdvice: p.surgeryAdvice,
          tags: p.tags,
          status: p.status,
          additionalVitals: p.additionalVitals,
          consultationType: p.consultationType,
          notes: p.notes,
          createdAt: formatDateTime(p.createdAt),
          updatedAt: formatDateTime(p.updatedAt),
        })),
        null,
        2
      )}
      
      IPD (In-Patient Department) Data (complete collection for this doctor's patients):
      ${JSON.stringify(
        ipds.map((i) => ({
          patientName: i.patientId?.fullName || "Unknown",
          patientPhone: i.patientId?.phoneNumber || "Unknown",
          dateOfAdmission: formatDate(i.dateOfAdmission),
          category: i.category,
          operativeStatus: i.operativeStatus ? "Operative" : "Non-Operative",
          paymentMethod: i.paymentMethod,
          paymentAmount: i.paymentAmount,
          donationAmount: i.donationAmount,
          diagnosis: i.diagnosis,
          surgeon: i.surgeon,
          wardRoomNo: i.wardRoomNo,
          notes: i.notes,
          createdAt: formatDateTime(i.createdAt),
          updatedAt: formatDateTime(i.updatedAt),
        })),
        null,
        2
      )}
      
      Answer the following query: ${query}
      
      Provide a concise, helpful response. You have access to complete collections of all patient data, appointments, 
      invoices, prescriptions, and IPD records for this doctor. Use this comprehensive data to provide detailed and 
      accurate responses. If the query is unclear, ask for clarification.
      
      Format your response with clear line breaks instead of markdown. Use simple text formatting.
      Do not use ** for bold text. Instead, use clear section breaks and line spacing.
      Place emphasized content on a new line for better readability.
    `;

    // Use Gemini 2.5 Flash model which supports up to 1 million tokens
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // working with this
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    // Format the response to remove markdown and improve readability
    const formattedText = formatAIResponse(text);

    // Log the interaction
    try {
      const interaction = new ChatBotInteraction({
        doctorId: doctorObjectId,
        query: query,
        response: formattedText,
        model: "gemini-2.5-flash",
      });
      await interaction.save();
    } catch (logError) {
      console.error("Failed to log chatbot interaction:", logError);
    }

    return {
      message: formattedText,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  chatBotQueryService,
};
