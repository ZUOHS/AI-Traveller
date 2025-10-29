import OpenAI from 'openai';
import { EXPENSE_CATEGORIES } from '@ai-traveller/common';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let openai = null;
let responsesApiSupported = true;

if (env.llmApiKey) {
  openai = new OpenAI({
    apiKey: env.llmApiKey,
    baseURL: env.llmApiUrl || undefined
  });
  logger.info('OpenAI-compatible client initialised');
} else {
  logger.warn('LLM API key missing. AI responses will use static fallback data.');
}

const buildItineraryPrompt = (request) => `
You are AI Traveller, a multilingual travel planning assistant.
Generate a detailed itinerary in JSON for the following request:
${JSON.stringify(request, null, 2)}

Respond strictly as JSON matching this schema:
{
  "summary": "short overview",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "items": [
        {
          "time": "09:00",
          "title": "string",
          "category": "交通 | 住宿 | 景点 | 餐饮",
          "description": "string",
          "location": "string",
          "lat": null,
          "lng": null,
          "tips": ["string"]
        }
      ]
    }
  ],
  "transportation": ["string"],
  "accommodation": ["string"],
  "notes": ["string"]
}

Important requirements:
- 每天的items中必须覆盖交通、景点、餐饮，并在需要入住/退房的日期包含住宿安排。
- transportation数组列出交通方式（机场往返、城际交通、城市内出行等），accommodation数组提供住宿区域或酒店类型建议。
- 保持中文输出，与输入语境一致。
`;

const buildBudgetPrompt = (request) => `
You are AI Traveller's budgeting assistant.
Estimate a travel budget breakdown based on this context:
${JSON.stringify(request, null, 2)}

Respond strictly as JSON matching:
{
  "currency": "CNY",
  "total": 1234,
  "breakdown": [
    {"category": "住宿", "amount": 500, "notes": "string"}
  ],
  "dailyAverage": 400,
  "tips": ["string"]
}
`;

const parseJsonResponse = (content) => {
  if (!content) {
    throw new Error('Empty AI response');
  }
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Response did not contain JSON');
  }
  const jsonString = content.slice(start, end + 1);
  return JSON.parse(jsonString);
};

const fallbackItinerary = (request) => {
  const startDate = request.startDate ?? new Date().toISOString().slice(0, 10);
  const nights = request.tripLength ?? request.days ?? 5;
  const destination = request.destination ?? '目的地';

  return {
    summary: `${nights} 天 ${destination} 家庭旅行示例行程`,
    days: Array.from({ length: nights }).map((_, index) => ({
      day: index + 1,
      date: startDate,
      theme: `探索 ${destination}`,
      items: [
        {
          time: '09:00',
          title: '抵达与市内交通',
          category: '交通',
          description: `建议搭乘地铁或机场快线前往${destination}市区，购买交通卡更方便。`,
          location: destination,
          lat: null,
          lng: null,
          tips: ['提前下载当地出行 App', '预留换乘时间']
        },
        {
          time: '11:00',
          title: `${destination} 经典景点`,
          category: '景点',
          description: '参观标志性景点，安排拍照与亲子互动时间。',
          location: `${destination} 热门景点`,
          lat: null,
          lng: null,
          tips: ['提前预约门票', '关注天气变化']
        },
        {
          time: '13:00',
          title: '地道午餐',
          category: '餐饮',
          description: '品尝当地特色料理，可选择家庭友好型餐厅。',
          location: `${destination} 美食街`,
          lat: null,
          lng: null,
          tips: ['店内可能需排队，建议避开高峰']
        },
        {
          time: '20:00',
          title: '入住酒店与夜间散步',
          category: '住宿',
          description: '办理入住手续，可在酒店周边散步熟悉环境。',
          location: `${destination} 酒店区`,
          lat: null,
          lng: null,
          tips: ['确认次日早餐时间', '规划次日交通']
        }
      ]
    })),
    transportation: ['使用公共交通或包车，长距离视预算选择高铁或航班。'],
    accommodation: ['选择靠近地铁站的家庭友好型酒店或公寓，方便早晚出行。'],
    notes: [
      '以上为示例行程，请在提供 API Key 后重新生成真实行程。',
      '建议结合 Gaode 地图查看实时交通。'
    ]
  };
};

const buildTripExtractionPrompt = (description) => `
You are an expert travel planner. Extract structured trip planning fields from the traveller narrative below.

Description:
${description}

Return strictly as JSON:
{
  "destination": "string",
  "startDate": "YYYY-MM-DD | null",
  "endDate": "YYYY-MM-DD | null",
  "budget": 12345,
  "currency": "CNY",
  "travelers": 2,
  "preferences": {
    "interests": ["string"]
  },
  "notes": "string"
}

Guidelines:
- Convert日期到ISO格式，如仅提及月份则返回null并在notes说明。
- 预算提取为数字，处理“1万左右”此类表述（估算为10000）。
- 人数转换为整数，如“夫妻”、“全家三口”等。
- interests提炼关键信息（美食、亲子、徒步、文化、自然、购物、夜生活等）。
- notes保留无法结构化的补充、限制或特殊需求。
`;

const fallbackExtraction = (description) => {
  const text = description ?? '';
  const travelersMatch = text.match(/(\d+)\s*(人|位|名)/);
  const travelers =
    travelersMatch && Number.parseInt(travelersMatch[1], 10) > 0
      ? Number.parseInt(travelersMatch[1], 10)
      : text.includes('夫妻') || text.includes('两人')
        ? 2
        : text.includes('一家三口') || text.includes('三人')
          ? 3
          : 2;

  const budgetMatch = text.match(/(\d+\.?\d*)\s*(万|千)?\s*(元|块|人民币)?/);
  let budget = null;
  if (budgetMatch) {
    const value = Number.parseFloat(budgetMatch[1]);
    if (Number.isFinite(value)) {
      const unit = budgetMatch[2];
      budget = unit === '万' ? value * 10000 : unit === '千' ? value * 1000 : value;
    }
  }

  const interestKeywords = ['美食', '亲子', '探险', '徒步', '自然', '文化', '购物', '夜生活', '温泉', '滑雪', '海岛'];
  const interests = interestKeywords.filter((keyword) => text.includes(keyword));

  return {
    destination: '',
    startDate: null,
    endDate: null,
    budget,
    currency: 'CNY',
    travelers,
    preferences: {
      interests
    },
    notes: text.trim()
  };
};

const fallbackBudget = (request) => {
  const total = request.budget ?? 10000;
  return {
    currency: request.currency ?? 'CNY',
    total,
    breakdown: [
      {
        category: '交通',
        amount: total * 0.3,
        notes: '含往返机票与市内交通'
      },
      {
        category: '住宿',
        amount: total * 0.25,
        notes: '家庭房或公寓式酒店'
      },
      {
        category: '餐饮',
        amount: total * 0.2,
        notes: '结合当地特色美食'
      },
      {
        category: '景点门票',
        amount: total * 0.15,
        notes: '热门景点提前购票可优惠'
      },
      {
        category: '购物与其他',
        amount: total * 0.1,
        notes: '预留应急与礼品预算'
      }
    ],
    dailyAverage: total / (request.tripLength ?? 5),
    tips: [
      '到手后可通过语音记录实时开销。',
      '使用费用管理功能同步家庭成员支出。'
    ]
  };
};

const completeWithChat = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: env.llmModel,
    messages: [
      {
        role: 'system',
        content: 'You are an advanced travel planning assistant that outputs JSON only.'
      },
      { role: 'user', content: prompt }
    ]
  });
  return response?.choices?.[0]?.message?.content ?? '';
};

const complete = async (prompt) => {
  if (!openai) {
    return null;
  }

  if (!responsesApiSupported || typeof openai.responses?.create !== 'function') {
    return completeWithChat(prompt);
  }

  try {
    const response = await openai.responses.create({
      model: env.llmModel,
      input: prompt
    });
    return (
      response?.output?.[0]?.content?.[0]?.text ??
      response?.choices?.[0]?.message?.content ??
      ''
    );
  } catch (error) {
    responsesApiSupported = false;
    logger.warn('OpenAI responses API unavailable, falling back to chat.completions', {
      error: error.message
    });
    return completeWithChat(prompt);
  }
};

export const generateItineraryPlan = async (request) => {
  if (!openai) {
    return fallbackItinerary(request);
  }

  const content = await complete(buildItineraryPrompt(request));
  return parseJsonResponse(content);
};

export const generateBudgetPlan = async (request) => {
  if (!openai) {
    return fallbackBudget(request);
  }

  const content = await complete(buildBudgetPrompt(request));
  return parseJsonResponse(content);
};

export const extractTripDetails = async (description) => {
  if (!description || !description.trim()) {
    throw new Error('描述不能为空');
  }

  if (!openai) {
    return fallbackExtraction(description);
  }

  const content = await complete(buildTripExtractionPrompt(description));
  try {
    return parseJsonResponse(content);
  } catch (error) {
    logger.warn('Failed to parse trip extraction response, using fallback', {
      error: error.message
    });
    return fallbackExtraction(description);
  }
};

const buildExpenseExtractionPrompt = (description) => `
You are an AI finance assistant helping travellers log expenses.
Extract structured expense data from the following description:
${description}

Return strictly as JSON:
{
  "title": "string",
  "category": "string",
  "amount": 123.45,
  "currency": "CNY",
  "notes": "string"
}

Guidelines:
- Title should be concise (6-12 characters) describing the spending, e.g. "午餐" or "地铁票".
- Category must align with these options: ${JSON.stringify(EXPENSE_CATEGORIES)}. Pick the best match.
- Amount must be numeric (float) without currency symbols. If uncertain, estimate based on context.
- Notes should retain any additional details.
- Always output中文文本 when the input is中文.
`;

const fallbackExpenseExtraction = (description) => {
  const text = description ?? '';
  const amountMatch = text.match(/(\d+(?:\.\d+)?)(?=\s*(万|千|元|块|人民币|rmb|cny)?)/i);
  let amount = null;
  if (amountMatch) {
    const value = Number.parseFloat(amountMatch[1]);
    if (Number.isFinite(value)) {
      const unit = (amountMatch[2] ?? '').toLowerCase();
      if (unit === '万') {
        amount = value * 10000;
      } else if (unit === '千') {
        amount = value * 1000;
      } else {
        amount = value;
      }
    }
  }

  const keywordMappings = [
    { keywords: ['餐', '饭', '午餐', '晚餐', '早餐', '餐厅', '美食'], category: '餐饮' },
    { keywords: ['车', '交通', '打车', '出租', '地铁', '公交', '高铁', '机票'], category: '交通' },
    { keywords: ['酒店', '住宿', '民宿', '房费'], category: '住宿' },
    { keywords: ['门票', '景点', '博物馆', '乐园'], category: '门票' },
    { keywords: ['购物', '纪念品', '礼物'], category: '购物' }
  ];

  const defaultCategory = EXPENSE_CATEGORIES.includes('其他')
    ? '其他'
    : EXPENSE_CATEGORIES[0];

  const detectedCategory =
    EXPENSE_CATEGORIES.find((category) => text.includes(category)) ??
    keywordMappings.reduce((matched, mapping) => {
      if (matched) return matched;
      const hasKeyword = mapping.keywords.some((keyword) => text.includes(keyword));
      if (hasKeyword && EXPENSE_CATEGORIES.includes(mapping.category)) {
        return mapping.category;
      }
      return matched;
    }, null) ??
    defaultCategory;

  const clauses = text.split(/[,，。；;]/).map((part) => part.trim()).filter(Boolean);
  const title = clauses[0]?.slice(0, 12) || '费用';

  return {
    title,
    category: detectedCategory,
    amount,
    currency: 'CNY',
    notes: text.trim()
  };
};

export const extractExpenseDetails = async (description) => {
  if (!description || !description.trim()) {
    throw new Error('描述不能为空');
  }

  if (!openai) {
    return fallbackExpenseExtraction(description);
  }

  const content = await complete(buildExpenseExtractionPrompt(description));
  try {
    return parseJsonResponse(content);
  } catch (error) {
    logger.warn('Failed to parse expense extraction response, using fallback', {
      error: error.message
    });
    return fallbackExpenseExtraction(description);
  }
};
