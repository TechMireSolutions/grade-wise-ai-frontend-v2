import { create } from "zustand";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useAuthStore from "./authStore.js";
import {
  fetchOverviewAPI,
  fetchAssessmentsAPI,
  fetchPerformanceAPI,
  fetchRecommendationsAPI,
  fetchAssessmentDetailsAPI,
  fetchReportAPI,
  fetchAssessmentQuestionsAPI,
} from "../api/studentAnalytics.api.js";

const useStudentAnalyticsStore = create((set) => ({
   assessments: [],
  selectedAssessment: null,
  analytics: null,
  performance: [],
  recommendations: null,
  selectedAssessmentDetails: null,
  loading: false,
  error: null,
  questions: [],
questionsLoading: false,


fetchAssessments: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetchAssessmentsAPI();
      set({ assessments: res.data.data || [] });
    } catch (err) {
      set({ assessments: [], error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedAssessment: (id) => set({ selectedAssessment: id }),


  fetchOverview: async () => {
    try {
      set({ loading: true });
      const res = await fetchOverviewAPI();
      set({ analytics: res.data.data });
    } catch (err) {
    } finally {
      set({ loading: false });
    }
  },

  fetchPerformance: async (timeRange = "month") => {
    try {
      set({ loading: true });
      const res = await fetchPerformanceAPI(timeRange);
      set({ performance: res.data.data.performance_data || [] });
    } catch (err) {
    } finally {
      set({ loading: false });
    }
  },

  fetchRecommendations: async () => {
    try {
      set({ loading: true });
      const res = await fetchRecommendationsAPI();
      set({ recommendations: res.data.data });
    } catch (err) {
    } finally {
      set({ loading: false });
    }
  },

  fetchAssessmentDetails: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetchAssessmentDetailsAPI(id);
      if (res.data.success) {
        set({ selectedAssessmentDetails: res.data.data });
      } else {
        throw new Error(res.data.message || "Failed to load details");
      }
    } catch (err) {
      set({ error: err.message || "Failed to load assessment details" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAssessmentQuestions: async (assessmentId) => {
    try {
      set({ questionsLoading: true });
      const res = await fetchAssessmentQuestionsAPI(assessmentId);
      const processedQuestions = (res.data.data || []).map((q) => {
        let parsedOptions = q.options;
        if (typeof q.options === "string") {
          try {
            parsedOptions = JSON.parse(q.options);
          } catch (e) {
            console.error("Error parsing options for question:", q.id, e);
          }
        }
        return { ...q, options: parsedOptions };
      });
      set({ questions: processedQuestions });
    } catch (err) {
      set({ error: err.message || "Failed to fetch questions" });
    } finally {
      set({ questionsLoading: false });
    }
  },


  downloadReport: async (assessmentId) => {
    try {
      set({ loading: true });
      const res = await fetchReportAPI(assessmentId);
      const details = res.data.data;
      const { user } = useAuthStore.getState();

      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      // Header
      doc.setFillColor(67, 24, 255); // Brand Purple
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Gradewise AI - Performance Report", 15, 25);

      // Assessment Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(`Assessment: ${details.assessment_title}`, 15, 55);
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Student: ${user?.name || "Student"} (${user?.email})`, 15, 65);
      doc.text(`Date: ${new Date(details.generated_at).toLocaleDateString()}`, 15, 72);

      // Summary Table
      autoTable(doc, {
        startY: 85,
        head: [["Metric", "Value"]],
        body: [
          ["Score Achieved", `${details.student_score} / ${details.total_marks}`],
          ["Percentage", `${details.score}%`],
          ["Total Questions", details.total_questions],
          ["Correct Answers", details.correct_answers],
          ["Incorrect Answers", details.incorrect_answers],
          ["Time Taken", `${Math.floor(details.time_taken / 60)}m ${details.time_taken % 60}s`],
        ],
        headStyles: { fillColor: [67, 24, 255] },
      });

      // AI Recommendations
      if (details.recommendations) {
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(16);
        doc.setTextColor(67, 24, 255);
        doc.text("AI Learning Recommendations", 15, finalY);

        const recs = details.recommendations.weak_areas || [];
        const body = recs.map((r) => [r.topic, `${r.performance}%`, r.suggestion]);

        autoTable(doc, {
          startY: finalY + 10,
          head: [["Topic", "Current Performance", "AI Suggestion"]],
          body: body.length > 0 ? body : [["General", "N/A", "Keep practicing all topics to maintain performance."]],
          headStyles: { fillColor: [34, 197, 94] }, // Green for growth
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} - Generated by Gradewise AI`,
          105,
          290,
          { align: "center" }
        );
      }

      doc.save(`Gradewise_Report_${details.assessment_title.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Report generation error:", err);
      // toast is not imported here, using alert as fallback for now or assuming toast exists in context
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStudentAnalyticsStore;
