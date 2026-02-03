import { zh } from './zh';
import { en } from './en';

export type Lang = 'zh' | 'en';

export const TRANSLATIONS = { zh, en };

export type TranslationDict = typeof zh;
