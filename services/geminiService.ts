
import { GoogleGenAI } from "@google/genai";

// AI 서비스 모음: 명절 인사말 생성 및 선물 추천 기능
export const generateGreetingMessage = async (clientName: string, company: string, position: string, holiday: string) => {
  // Always use a named parameter and obtain the API key exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    거래처 담당자에게 보낼 ${holiday} 감사 인사말을 작성해줘.
    수신자 정보: ${company} ${position} ${clientName}님.
    비즈니스적으로 예의 바르면서도 너무 딱딱하지 않은 한국어 톤앤매너로 작성해줘.
    결과는 JSON 형식이 아닌 일반 텍스트로 바로 사용할 수 있게 줘.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use .text property directly to extract output.
    return response.text;
  } catch (error) {
    console.error("AI Message Generation Error:", error);
    return "감사 인사를 생성하는 중 오류가 발생했습니다. 직접 입력해 주세요.";
  }
};

export const suggestGift = async (category: string, holiday: string) => {
  // Always use a named parameter and obtain the API key exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    비즈니스 거래처(${category} 등급)를 위한 ${holiday} 선물 아이템 5가지를 추천해줘.
    각 아이템별로 대략적인 가격대와 추천 이유를 포함해줘.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use .text property directly to extract output.
    return response.text;
  } catch (error) {
    console.error("AI Gift Suggestion Error:", error);
    return "선물 추천을 불러올 수 없습니다.";
  }
};
