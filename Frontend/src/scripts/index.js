import axiosClient from "../utils/axiosClient";

export async function generateMockInterviewQuestions(payload) {
  const { data } = await axiosClient.post("/ai/mock-interview/questions", payload);
  return Array.isArray(data?.questions) ? data.questions : [];
}

export async function generateMockInterviewFeedback(payload) {
  const { data } = await axiosClient.post("/ai/mock-interview/feedback", payload);
  return data?.feedback || null;
}
