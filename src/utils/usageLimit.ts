import { ContractorSettings } from '../types';

export const DAILY_FREE_VOICE_LIMIT = 4;

const getTodayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export interface DailyUsageStatus {
  usedToday: number;
  remainingToday: number;
  limit: number;
  isPro: boolean;
  canUse: boolean;
}

export const getDailyVoiceUsageStatus = (settings?: ContractorSettings): DailyUsageStatus => {
  const isPro = settings?.subscriptionTier === 'pro' || settings?.subscriptionTier === 'elite';
  
  if (typeof window === 'undefined') {
    return {
      usedToday: 0,
      remainingToday: DAILY_FREE_VOICE_LIMIT,
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: !!isPro,
      canUse: true
    };
  }

  try {
    const raw = localStorage.getItem('tcp_daily_voice_usage');
    let count = 0;
    const today = getTodayDateString();

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        count = Number(parsed.count) || 0;
      } else {
        // Reset on new day
        localStorage.setItem('tcp_daily_voice_usage', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('tcp_daily_voice_usage', JSON.stringify({ date: today, count: 0 }));
    }

    const remaining = Math.max(0, DAILY_FREE_VOICE_LIMIT - count);
    const canUse = isPro || remaining > 0;

    return {
      usedToday: count,
      remainingToday: remaining,
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: !!isPro,
      canUse
    };
  } catch {
    return {
      usedToday: 0,
      remainingToday: DAILY_FREE_VOICE_LIMIT,
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: !!isPro,
      canUse: true
    };
  }
};

export const incrementDailyVoiceUsage = (): DailyUsageStatus => {
  if (typeof window === 'undefined') {
    return {
      usedToday: 1,
      remainingToday: DAILY_FREE_VOICE_LIMIT - 1,
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: false,
      canUse: true
    };
  }

  try {
    const today = getTodayDateString();
    const raw = localStorage.getItem('tcp_daily_voice_usage');
    let count = 0;

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        count = Number(parsed.count) || 0;
      }
    }

    const updated = count + 1;
    localStorage.setItem('tcp_daily_voice_usage', JSON.stringify({ date: today, count: updated }));

    return {
      usedToday: updated,
      remainingToday: Math.max(0, DAILY_FREE_VOICE_LIMIT - updated),
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: false,
      canUse: updated < DAILY_FREE_VOICE_LIMIT
    };
  } catch {
    return {
      usedToday: 1,
      remainingToday: DAILY_FREE_VOICE_LIMIT - 1,
      limit: DAILY_FREE_VOICE_LIMIT,
      isPro: false,
      canUse: true
    };
  }
};

export const resetDailyVoiceUsage = (): void => {
  if (typeof window !== 'undefined') {
    const today = getTodayDateString();
    try {
      localStorage.setItem('tcp_daily_voice_usage', JSON.stringify({ date: today, count: 0 }));
    } catch {}
  }
};

