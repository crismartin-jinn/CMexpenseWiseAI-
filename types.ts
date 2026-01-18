
export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health & Wellness',
  HOUSING = 'Housing',
  EDUCATION = 'Education',
  OTHER = 'Other'
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: Category;
  description: string;
  createdAt: number;
}

export interface SpendingInsight {
  summary: string;
  suggestions: string[];
  topSpendingCategory: string;
}

export interface ParsedExpense {
  amount?: number;
  category?: Category;
  description?: string;
  date?: string;
}
