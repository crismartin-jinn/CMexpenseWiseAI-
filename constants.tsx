
import React from 'react';
import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#ef4444', // red-500
  [Category.TRANSPORT]: '#f59e0b', // amber-500
  [Category.UTILITIES]: '#06b6d4', // cyan-500
  [Category.ENTERTAINMENT]: '#8b5cf6', // violet-500
  [Category.SHOPPING]: '#ec4899', // pink-500
  [Category.HEALTH]: '#10b981', // emerald-500
  [Category.HOUSING]: '#6366f1', // indigo-500
  [Category.EDUCATION]: '#3b82f6', // blue-500
  [Category.OTHER]: '#64748b', // slate-500
};

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.FOOD]: <i className="fa-solid fa-utensils"></i>,
  [Category.TRANSPORT]: <i className="fa-solid fa-car"></i>,
  [Category.UTILITIES]: <i className="fa-solid fa-bolt"></i>,
  [Category.ENTERTAINMENT]: <i className="fa-solid fa-clapperboard"></i>,
  [Category.SHOPPING]: <i className="fa-solid fa-cart-shopping"></i>,
  [Category.HEALTH]: <i className="fa-solid fa-heart-pulse"></i>,
  [Category.HOUSING]: <i className="fa-solid fa-house"></i>,
  [Category.EDUCATION]: <i className="fa-solid fa-graduation-cap"></i>,
  [Category.OTHER]: <i className="fa-solid fa-circle-question"></i>,
};
